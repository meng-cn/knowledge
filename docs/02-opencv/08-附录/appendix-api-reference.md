# 附录 A · 常用 API 速查表

## A.1 图像处理（imgproc）

| 函数 | 作用 | 一行说明 |
|------|--|------|
| `cv2.cvtColor(img, CODE)` | 色彩空间转换 | BGR↔GRAY/HSV/RGB/Lab |
| `cv2.GaussianBlur(img, ks, σ)` | 高斯滤波 | σ=0 自动计算 |
| `cv2.medianBlur(img, ks)` | 中值滤波 | 去椒盐噪声 |
| `cv2.bilateralFilter(img, d, σc, σs)` | 双边滤波 | 去噪保边 |
| `cv2.erode(img, k, iter)` | 腐蚀 | 缩小前景 |
| `cv2.dilate(img, k, iter)` | 膨胀 | 扩张前景 |
| `cv2.morphologyEx(img, OP, k)` | 形态学操作 | MORPH_OPEN/CLOSE/GRADIENT/... |
| `cv2.resize(img, sz, fx, fy, interp)` | 缩放 | INTER_AREA 缩小推荐 |
| `cv2.warpAffine(img, M, sz)` | 仿射变换 | 平移/旋转/缩放/倾斜 |
| `cv2.warpPerspective(img, H, sz)` | 透视变换 | 3×3 单应性矩阵 |
| `cv2.rotate(img, code)` | 旋转 90° | ROTATE_90/CW/CCW/180 |
| `cv2.flip(img, code)` | 翻转 | 0=垂直, >0=水平, <0 name="both |&#xA;| `cv2.split(img)` | 通道分离 | 返回 (b,g,r) |&#xA;| `cv2.merge([b,g,r])` | 通道合并 | 顺序决定颜色 |&#xA;| `cv2.addWeighted(a, α, b, β, γ)` | 图像混合 | αa+βb+γ |&#xA;| `cv2.bitwise_and/or/xor/not()` | 位运算 | 与 mask 配合 |&#xA;| `cv2.LUT(img, table)` | 查表 | 像素级映射，超快 |&#xA;| `cv2.convertScaleAbs(img, α, β)` | 对比度+亮度 | α=对比度, β=亮度 |&#xA;| `cv2.copyMakeBorder(img, t, b, l, r, type)` | 填充 | BORDER_CONSTANT/REFLECT/REPLICATE |&#xA;| `cv2.add()` | 饱和加法 | 溢出取最大 |&#xA;| `cv2.subtract()` | 饱和减法 | 溢出取 0 |&#xA;| `cv2.filter2D(img, d, k)` | 自定义卷积 | 任何核 |&#xA;| `cv2.Sobel(img, d, dx, dy, k)` | Sobel 边缘 | 一阶导数 |&#xA;| `cv2.Scharr(img, d, dx, dy)` | Scharr 算子 | 更精确的 3×3 |&#xA;| `cv2.Laplacian(img, d, k)` | Laplacian | 二阶导数 |&#xA;| `cv2.Canny(img, t1, t2)` | Canny 边缘 | 多阶段边缘检测 |&#xA;| `cv2.matchTemplate(img, tmpl, method)` | 模板匹配 | TM_CCORR_NORMED 推荐 |&#xA;| `cv2.minMaxLoc(src)` | 最值 | 返回 (min, max, min_loc, max_loc) |&#xA;| `cv2.equalizeHist(img)` | 全局均衡化 | 直方图均衡化 |&#xA;| `cv2.createCLAHE(clip, grid)` | CLAHE | 局部均衡化 |&#xA;| `cv2.calcHist(imgs, ch, mask, sz, ranges)` | 直方图 | N 维直方图 |&#xA;| `cv2.compareHist(h1, h2, method)` | 直方图比较 | CORREL/CHISQR/BHATTACHARYYA |&#xA;| `cv2.applyColorMap(img, map)` | 彩色图 | JET/HOT/MAGMA/... |&#xA;&#xA;## A.2 特征与检测（features2d）&#xA;&#xA;| 函数 | 作用 | 一行说明 |&#xA;|------|--|--|&#xA;| `cv2.goodFeaturesToTrack(img, N, q, d, blk)` | Shi-Tomasi 角点 | 推荐角点检测 |&#xA;| `cv2.cornerHarris(img, b, k, h)` | Harris 角点 | 经典角点 |&#xA;| `cv2.cornerSubPix(img, pts, w, z, crit)` | 亚像素精化 | 相机标定用 |&#xA;| `cv2.ORB_create()` | ORB 检测器 | 免费快速 |&#xA;| `cv2.SIFT_create()` | SIFT 检测器 | 经典高精度 |&#xA;| `cv2.AKAZE_create()` | AKAZE 检测器 | 非线性尺度 |&#xA;| `cv2.FAST_create()` | FAST 检测器 | 极快角点 |&#xA;| `cv2.BRISK_create()` | BRISK 检测器 | 二进制描述符 |&#xA;| `cv2.BFMatcher(norm, crossCheck)` | 暴力匹配 | NORM_HAMMING/L2 |&#xA;| `cv2.FlannBasedMatcher(idx, search)` | FLANN 匹配 | 大规模检索 |&#xA;| `cv2.drawMatches()` | 可视化匹配 | 连线展示 |&#xA;| `cv2.drawKeypoints()` | 可视化特征点 | 圆+方向线 |&#xA;| `cv2.findHomography(pts, method, ransacReproj)` | 单应性矩阵 | RANSAC 过滤 |&#xA;| `cv2.findFundamentalMat(pts, method, prob, ransacReproj)` | 基础矩阵 | 对极几何 |&#xA;| `cv2.estimateAffinePartial2D(src, dst, ransacReproj)` | 仿射矩阵 | 最小 3 点 |&#xA;&#xA;## A.3 相机与三维（calib3d）&#xA;&#xA;| 函数 | 作用 | 一行说明 |&#xA;|------|--|--|&#xA;| `cv2.calibrateCamera(objPts, imgPts, sz, ...)` | 相机标定 | 内参+畸变 |&#xA;| `cv2.undistort(img, K, D)` | 去畸变 | 直接校正 |&#xA;| `cv2.initUndistortRectifyMap(K, D, R, P, sz, d)` | 初始化映射 | reMap 用 |&#xA;| `cv2.remap(img, map1, map2, interp)` | 重映射 | 通用像素映射 |&#xA;| `cv2.getOptimalNewCameraMatrix(K, D, sz, alpha, roi)` | 最优内参 | 去畸变后裁剪 |&#xA;| `cv2.stereoCalibrate(...)` | 双目标定 | R, T, E, F |&#xA;| `cv2.stereoRectify(K1, D1, K2, D2, sz, R, T)` | 极线校正 | R1, R2, P1, P2, Q |&#xA;| `cv2.stereoBM(numD, blk)` | BM 立体匹配 | 快速 |&#xA;| `cv2.StereoSGBM_create(numD, blk, P1, P2)` | SGBM 立体匹配 | 推荐 ✅ |&#xA;| `cv2.reprojectImageTo3D(disp, Q)` | 视差→3D | XYZ 坐标 |&#xA;| `cv2.projectPoints(objPts, r, t, K, D)` | 3D→2D 投影 | PnP 验证 |&#xA;| `cv2.solvePnP(objPts, imgPts, K, D, flags)` | PnP 姿态估计 | EPNP 推荐 |&#xA;| `cv2.solvePnPRansac(objPts, imgPts, K, D)` | RANSAC PnP | 含误匹配 |&#xA;| `cv2.Rodrigues(rvec)` | 旋转向量↔矩阵 | 双向转换 |&#xA;| `cv2fisheye.calibrate(...)` | 鱼眼标定 | 鱼眼相机 |&#xA;| `cv2fisheye.undistortImage(img, K, D)` | 鱼眼去畸变 | 鱼眼专用 |&#xA;&#xA;## A.4 DNN 模块&#xA;&#xA;| 函数 | 作用 | 一行说明 |&#xA;|------|--|--|&#xA;| `cv2.dnn.readNetFromONNX(path)` | 加载 ONNX | 推荐 ✅ |&#xA;| `cv2.dnn.readNetFromCaffe(proto, weight)` | 加载 Caffe | prototxt + caffemodel |&#xA;| `cv2.dnn.readNetFromTensorflow(pb, pbtxt)` | 加载 TensorFlow | pb + pbtxt |&#xA;| `cv2.dnn.readNetFromDarknet(cfg, weight)` | 加载 Darknet | YOLO |&#xA;| `net.setInput(blob)` | 设置输入 | blobFromImage 输出 |&#xA;| `net.forward()` | 前向推理 | 输出结果 |&#xA;| `cv2.dnn.blobFromImage(img, scale, sz, mean, swapRB, crop, ddepth)` | 预处理 | 标准化输入 |&#xA;| `cv2.dnn.blobFromImages(imgs, scale, sz, mean, swapRB, crop, ddepth)` | 批量预处理 | 多图像 |&#xA;| `cv2.dnn.NMSBoxes(boxes, scores, th, nmsTh)` | NMS | 非极大值抑制 |&#xA;| `net.setPreferableBackend(code)` | 设置后端 | CPU/OPENVINO/CUDA/OpenCL |&#xA;| `net.setPreferableTarget(code)` | 设置目标 | CPU/GPU/VPU |&#xA;&#xA;## A.5 视频（video）&#xA;&#xA;| 函数 | 作用 | 一行说明 |&#xA;|------|--|--|&#xA;| `cv2.VideoCapture(file/dev)` | 打开视频 | 文件或摄像头 |&#xA;| `cap.read()` | 读一帧 | (ret, frame) |&#xA;| `cap.set(prop, val)` | 设置属性 | FPS/分辨率/FourCC |&#xA;| `cap.get(prop)` | 获取属性 | 同 prop 枚举 |&#xA;| `cv2.VideoWriter(file, fourcc, fps, sz)` | 写视频 | 输出视频 |&#xA;| `out.write(frame)` | 写一帧 | 写入 frame |&#xA;| `cv2.absdiff(a, b)` | 帧差 | 运动检测 |&#xA;| `cv2.createBackgroundSubtractorMOG2()` | MOG2 背景 | 背景建模 |&#xA;| `cv2.createBackgroundSubtractorKNN()` | KNN 背景 | 含阴影检测 |&#xA;| `cv2.calcOpticalFlowPyrLK(prev, next, pts)` | LK 光流 | 稀疏光流 |&#xA;| `cv2.calcOpticalFlowFarneback(prev, next, pyr_scale, levels, winsize, iterations, poly_n, poly_sigma, flags)` | Farneback | 稠密光流 |&#xA;| `cv2.TrackerCSRT_create()` | CSRT 跟踪器 | 最高精度 ✅ |&#xA;| `cv2.TrackerKCF_create()` | KCF 跟踪器 | 快速准确 |&#xA;| `cv2.TrackerMOSSE_create()` | MOSSE 跟踪器 | 最快 |&#xA;&#xA;## A.6 ML 模块&#xA;&#xA;| 函数 | 作用 | 一行说明 |&#xA;|------|--|--|&#xA;| `cv2.ml.KNearest_create()` | KNN | 小数据集 |&#xA;| `cv2.ml.SVM_create()` | SVM | 分类/回归 |&#xA;| `cv2.ml.DTrees_create()` | 决策树 | 可解释 |&#xA;| `cv2.ml.RTrees_create()` | 随机森林 | 通用 ✅ |&#xA;| `cv2.ml.Boost_create()` | AdaBoost | 弱分类器组合 |&#xA;| `cv2.ml.ANN_MLP_create()` | 多层感知机 | 神经网络 |&#xA;| `cv2.ml.NormalBayes_create()` | 朴素贝叶斯 | 无需调参 |&#xA;| `cv2.ml.EM_create()` | 期望最大化 | 高斯混合模型 |&#xA;| `cv2.kmeans(data, K, criteria, attempts, flags)` | K-Means | 聚类 |&#xA;&#xA;## A.7 常用常量&#xA;&#xA;| 常量 | 说明 |&#xA;|------|--|&#xA;| `cv2.INTER_LINEAR` | 双线性插值（默认） |&#xA;| `cv2.INTER_AREA` | 缩小推荐 |&#xA;| `cv2.INTER_CUBIC` | 放大推荐 |&#xA;| `cv2.INTER_NEAREST` | 最近邻（最快） |&#xA;| `cv2.THRESH_BINARY` | 阈值: ">T→255, ≤T→0 |
| `cv2.THRESH_BINARY_INV` | 反向 |
| `cv2.THRESH_TRUNC` | 截断: >T→T |
| `cv2.THRESH_OTSU` | 自动阈值 |
| `cv2.THRESH_ADAPTIVE` | 自适应 |
| `cv2.THRESH_GAUSSIAN` | 高斯自适应 |
| `cv2.ADAPTIVE_THRESH_MEAN_C` | 均值自适应 |
| `cv2.ADAPTIVE_THRESH_GAUSSIAN_C` | 高斯自适应 |
| `cv2.MORPH_RECT` | 矩形结构元素 |
| `cv2.MORPH_ELLIPSE` | 椭圆结构元素 |
| `cv2.MORPH_CROSS` | 十字结构元素 |
| `cv2.DIST_L2` | L2 距离 |
| `cv2.DIST_L1` | L1 距离 |
| `cv2.DIST_C` | Chebyshev |
| `cv2.DIST_PRECISE` | 精确距离 |
| `cv2.FILLED` | 填充绘制 |
| `cv2.LINE_AA` | 抗锯齿线 |

## A.8 属性枚举

| 属性 | 值 | 说明 |
|------|--|--|
| `CAP_PROP_WIDTH` | 3 | 宽度 |
| `CAP_PROP_HEIGHT` | 4 | 高度 |
| `CAP_PROP_FPS` | 5 | 帧率 |
| `CAP_PROP_FOURCC` | 6 | 编解码器 |
| `CAP_PROP_FRAME_COUNT` | 7 | 总帧数 |
| `CAP_PROP_POS_MSEC` | 0 | 播放位置(ms) |
| `CAP_PROP_POS_FRAMES` | 1 | 播放位置(帧) |
| `CAP_PROP_BUFFERSIZE` | 14 | 缓冲区大小 |

---
