# 第二十章 · PnP 与位姿估计

## 20.1 问题定义

PnP（Perspective-n-Point） = 从已知的 2D-3D 点对中估计相机姿态（旋转 R 和平移 t）。

```
已知：                    求解：
3D 世界点 {P₁, P₂, ..., Pₙ}   相机位姿 [R|t]
2D 图像点 {p₁, p₂, ..., pₙ}

约束：pᵢ = P(K, R, t, Pᵢ)  （投影方程）
```

典型应用：AR 叠加、机器人定位、SLAM、相机位姿跟踪。

## 20.2 solvePnP 基本用法

```python
import cv2
import numpy as np

# 已知 3D 点（在物体坐标系下）
obj_3d = np.array([
    [-1, -1, 0],   # 左下角
    [ 1, -1, 0],   # 右下角
    [ 1,  1, 0],   # 右上角
    [-1,  1, 0],   # 左上角
    [ 0,  0, 1],   # 中心上方（增加稳定性）
], dtype=np.float64)

# 对应的 2D 图像点（通过检测/标注获得）
obj_2d = np.array([
    [100, 200], [300, 200], [300, 350], [100, 350], [200, 280]
], dtype=np.float64)

# 相机内参
camera_matrix = np.array([[fx, 0, cx],
                          [0, fy, cy],
                          [0,  0,  1]], dtype=np.float64)

dist_coeffs = np.array([k1, k2, p1, p2, k3, k4, k5, k6])

# ---- solvePnP ----
# objectPoints: 3D 点
# imagePoints: 2D 点
# cameraMatrix: 内参
# distCoeffs: 畸变系数
# flags: 求解方法
# rvec, tvec: 输出（旋转向数和平移向量）
# useExtrinsicGuess: 是否使用初始估计
# flags = cv2.SOLVEPNP_ITERATIVE: 默认（迭代优化）
#       = cv2.SOLVEPNP_EPNP: 快速近似（推荐 ✅）
#       = cv2.SOLVEPNP_P3P: 最少 4 点
#       = cv2.SOLVEPNP_DLS: 最小二乘
#       = cv2.SOLVEPNP_UPNP: 单位正交约束
#       = cv2.SOLVEPNP_APRILTAG: AprilTag 专用

_, rvec, tvec, inliers = cv2.solvePnPRansac(
    obj_3d, obj_2d, camera_matrix, dist_coeffs,
    flags=cv2.SOLVEPNP_EPNP,  # 或 cv2.SOLVEPNP_ITERATIVE
    reprojectionError=5.0,     # RANSAC 重投影误差
    confidence=0.99,
    maxIters=1000
)

print(f"旋转 (旋转向量): {rvec.ravel()}")
print(f"平移: {tvec.ravel()}")
```

### 20.2.1 旋转向量 ↔ 旋转矩阵

```python
# 旋转向量 → 旋转矩阵
R, _ = cv2.Rodrigues(rvec)

# 旋转矩阵 → 旋转向量
rvec2, _ = cv2.Rodrigues(R)

# 旋转矩阵 → 欧拉角（ZYX 顺序）
euler = cv2.Rodrigues(R)[0]
cosy = np.sqrt(R[0,0]**2 + R[1,0]**2)
beta = np.arctan2(-R[2,0], cosy)
alpha = np.arctan2(R[2,1], R[2,2])
gamma = np.arctan2(R[1,0], R[0,0])
# alpha = Yaw (偏航), beta = Pitch (俯仰), gamma = Roll (翻滚)
```

## 20.3 solvePnPRansac（鲁棒估计）

```python
# RANSAC 版本 — 自动过滤误匹配
_, rvec, tvec, inliers = cv2.solvePnPRansac(
    obj_3d, obj_2d, camera_matrix, dist_coeffs,
    flags=cv2.SOLVEPNP_EPNP,
    reprojectionError=3.0,
    confidence=0.995,
    maxIters=1000
)
# inliers: 内点索引（None 或非 RANSAC 方法时为空）

# 内点重投影误差评估
if inliers is not None:
    obj_3d_inliers = obj_3d[inliers]
    obj_2d_inliers = obj_2d[inliers]
    obj_2d_reproj, _ = cv2.projectPoints(obj_3d_inliers, rvec, tvec, camera_matrix, dist_coeffs)
    error = cv2.norm(obj_2d_inliers, obj_2d_reproj, cv2.NORM_L2) / len(inliers)
    print(f"内点平均重投影误差: {error:.3f} px")
```

## 20.4 projectPoints（投影验证）

```python
# 将 3D 点投影到图像平面
projected, _ = cv2.projectPoints(obj_3d, rvec, tvec, camera_matrix, dist_coeffs)
# projected: (N, 1, 2) 的二维坐标

# 可视化验证
img_vis = img.copy()
for pt in projected:
    x, y = pt.ravel()
    cv2.circle(img_vis, (int(x), int(y)), 3, (0, 255, 0), -1)
    cv2.putText(img_vis, f'({int(x)},{int(y)})', (int(x)+5, int(y)+5),
                 cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0, 0, 255), 1)
cv2.imshow('Projection', img_vis)
```

## 20.5 AR 叠加（位姿估计 → 3D 立方体）

```python
def draw_cube(img, obj_3d, rvec, tvec, camera_matrix, dist_coeffs, color=(0, 255, 0)):
    """在图像上叠加 3D 立方体"""
    # 定义立方体的 12 条边
    cube_edges = [
        (0, 1), (1, 2), (2, 3), (3, 0),  # 底面
        (4, 5), (5, 6), (6, 7), (7, 4),  # 顶面
        (0, 4), (1, 5), (2, 6), (3, 7),  # 垂直边
    ]

    # 立方体的 8 个顶点（在物体坐标系下）
    cube_verts = np.array([
        [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1],
        [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1],
    ]) * 0.5  # 缩放到合理尺寸

    # 投影
    projected, _ = cv2.projectPoints(cube_verts, rvec, tvec, camera_matrix, dist_coeffs)

    # 画边
    for start, end in cube_edges:
        p1 = projected[start].ravel()
        p2 = projected[end].ravel()
        cv2.line(img, (int(p1[0]), int(p1[1])), (int(p2[0]), int(p2[1])), color, 2)

    return img

# 使用
img_with_cube = draw_cube(img.copy(), obj_3d, rvec, tvec, camera_matrix, dist_coeffs)
```

## 20.6 相机位姿跟踪

```python
# 连续跟踪相机位姿（实时 AR / 机器人定位）
def track_pose(obj_3d, obj_2d_list, camera_matrix, dist_coeffs, prev_rvec=None):
    """连续帧位姿跟踪"""
    rvec, tvec = None, None

    for obj_2d in obj_2d_list:
        if prev_rvec is not None:
            # 使用上一帧结果作为初始估计
            _, rvec, tvec, inliers = cv2.solvePnP(
                obj_3d, obj_2d, camera_matrix, dist_coeffs,
                rvec=prev_rvec, tvec=prev_tvec,
                flags=cv2.SOLVEPNP_ITERATIVE
            )
        else:
            _, rvec, tvec, inliers = cv2.solvePnP(
                obj_3d, obj_2d, camera_matrix, dist_coeffs,
                flags=cv2.SOLVEPNP_EPNP
            )

        prev_rvec, prev_tvec = rvec, tvec
        yield rvec, tvec
```

## 20.7 位姿估计速查表

| 需求 | 方法 |
|------|--|
| 标准 PnP | `solvePnP(EVPNP)` |
| 含误匹配 | `solvePnPRansac` |
| 最少 4 点 | `solvePnP(P3P)` |
| 快速 | `solvePnP(EPNP)` ✅ |
| 最小误差 | `solvePnP(ITERATIVE)` |
| 有初值 | 传入 `rvec/tvec` 参数 |
| AprilTag | `solvePnP(APRILTAG)` |
| 投影验证 | `projectPoints` |

---

**Part V · 相机与三维**（第 18–20 章）全部完成 ✅

累计进度：

```
Part I  ✅ 基础篇 (4章)
Part II ✅ 图像处理 (5章)
Part III ✅ 特征与匹配 (4章)
Part IV ✅ 目标检测与跟踪 (4章)
Part V  ✅ 相机与三维 (3章)
Part VI   🔲 机器学习 (3章)
Part VII  🔲 高级与实战 (5章)
Part VIII 🔲 附录 (4章)
───────────────────────
已完成 20/32 章
```

继续 Part VI（机器学习，第 21–23 章）？
