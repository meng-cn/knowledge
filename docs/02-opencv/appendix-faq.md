# 附录 C · 常见问题 FAQ

## C.1 安装问题

### Q: pip install opencv-python 后 import 报错？

```bash
# 可能是 numpy 版本不兼容
pip install numpy>=1.21.0
pip install opencv-python --force-reinstall
```

### Q: 想用 SIFT/SURF 但报 AttributeError？

```bash
# 这些算法在基础包中已移除，需要 contrib 包
pip uninstall opencv-python
pip install opencv-contrib-python
```

### Q: 想用 contrib 包中的模块？

```python
# contrib 模块的函数通常在 cv2 命名空间下
from cv2 import xfeatures2d  # SIFT/SURF
from cv2 import ximgproc    # 引导滤波等
from cv2 import cuda         # CUDA 加速
```

### Q: 服务器无 GUI 环境？

```bash
# 使用 headless 版本
pip install opencv-python-headless

# 或设置环境变量
export OPENCV_HEADLESS=1
```

### Q: macOS 安装失败？

```bash
brew install opencv
# 或在 conda 中:
conda install -c conda-forge opencv
```

## C.2 运行错误

### Q: cv2.error: (-215) ... in function？

最常见的错误 — 通常原因：
1. **输入图像为 None** — 文件路径错误，检查 `img is not None`
2. **输入类型错误** — 如 `threshold` 需要 uint8，传入 float
3. **ROI 越界** — 坐标超出图像范围
4. **矩阵维度不匹配** — 如矩阵乘法时行列不匹配

```python
# 检查图像
assert img is not None, "图像加载失败，检查路径"
assert img.dtype == np.uint8, f"期望 uint8, 实际 {img.dtype}"
```

### Q: cv2.imshow 黑屏/闪退？

```python
# 1. 确保窗口没有关闭
cv2.waitKey(0)  # 必须调用

# 2. 数据类型问题 — 浮点图像无法直接显示
cv2.imshow('Float', img_float)  # ❌
cv2.imshow('U8', img.astype(np.uint8))  # ✅

# 3. 归一化
cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX)
cv2.imshow('Normalized', img.astype(np.uint8))
```

### Q: 图像显示颜色不对？

```python
# matplotlib 显示 OpenCV 图像会反转颜色
plt.imshow(img)  # ❌ 颜色不对

plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))  # ✅
```

## C.3 性能问题

### Q: 处理速度太慢？

```python
# 1. 向量化替代循环
for i in range(h):
    for j in range(w):  # ❌ 极慢
        img[i,j] = ...

img[:] = ...  # ✅ 向量化

# 2. 减少不必要的内存分配
# 避免在循环中创建新数组

# 3. ROI 裁剪 — 只处理感兴趣区域
img_roi = img[100:300, 200:400]

# 4. 缩小分辨率
small = cv2.resize(img, (320, 240))

# 5. 使用 float32 而非 float64
img = img.astype(np.float32)  # 省一半内存

# 6. 多处理
# 大图像用 multiprocessing 分块处理
```

### Q: 内存占用太高？

```python
# 释放大矩阵
del large_matrix
import gc
gc.collect()

# 使用 GpuMat（GPU 内存）
gpu_img = cv2.cuda_GpuMat(img)
```

## C.4 版本兼容

### Q: OpenCV 3.x → 4.x 迁移？

```python
# 主要变化:
# 1. cv2.cv 已移除 → 直接 cv2.
cv2.CV_8U → np.uint8
cv2.CV_32F → np.float32

# 2. goodFeaturesToTrack 参数风格变化
cv2.goodFeaturesToTrack(img, 100, 0.01, 10, blockSize=3)

# 3. 一些模块名变化
cv2.xfeatures2d.SIFT_create() → cv2.SIFT_create()  (基础包)

# 4. SURF 从主包移到 contrib
# pip install opencv-contrib-python
```

### Q: 版本冲突？

```bash
# 查看当前版本
python -c "import cv2; print(cv2.__version__)"

# 查看安装位置
python -c "import cv2; print(cv2.__file__)"

# 清理重装
pip uninstall opencv-python opencv-contrib-python
pip install opencv-contrib-python
```

## C.5 调试技巧

### Q: 如何调试 OpenCV 错误？

```python
# 1. 检查每个函数的返回值
ret, frame = cap.read()
assert ret, "读取帧失败"

# 2. 打印关键变量
print(f"shape: {img.shape}, dtype: {img.dtype}")

# 3. 使用 OpenCV 错误回调
def my_error_handler(errFunc, func, filename, line, msg):
    print(f"[OpenCV Error] {func} at {filename}:{line}: {msg}")

cv2.setErrorHandler(my_error_handler)
```

### Q: 验证处理结果？

```python
# 1. 显示中间结果
cv2.imshow('Step 1', step1)
cv2.waitKey(0)

# 2. 保存中间结果
cv2.imwrite('debug_01.jpg', step1)

# 3. 打印统计信息
print(f"min/max: {img.min()}/{img.max()}")
print(f"mean/std: {img.mean():.2f}/{img.std():.2f}")
print(f"non-zero: {cv2.countNonZero(mask)}")
```

## C.6 编解码器问题

### Q: 视频保存失败？

```bash
# 安装 FFmpeg
# Ubuntu:
sudo apt install ffmpeg libavcodec-extra

# macOS:
brew install ffmpeg

# 测试可用编解码器
python -c "
import cv2
codes = ['XVID', 'H264', 'MJPG', 'MP4V', 'FLV1']
for c in codes:
    cap = cv2.VideoCapture(0)
    ret = cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*c))
    print(f'{c}: {\"OK\" if ret else \"FAIL\"}')
    cap.release()
"
```

### Q: 读取视频失败？

```python
# 检查视频文件
cap = cv2.VideoCapture('video.mp4')
if not cap.isOpened():
    print("视频打开失败")
    # 可能原因:
    # 1. 路径错误
    # 2. 视频格式不支持（尝试用 FFmpeg 转换）
    # 3. 编解码器缺失
    # 4. 文件损坏
```

## C.7 常见问题速查

| 问题 | 解决方案 |
|------|--|
| `img is None` | 检查文件路径/格式 |
| `cv2.imshow` 闪退 | 加 `cv2.waitKey(0)` |
| 颜色不对 | BGR→RGB 转换 |
| 内存不足 | `del` + `gc.collect()` / 缩小 |
| 速度慢 | 向量化 / ROI / 缩小 / GPU |
| SIFT 不可用 | `pip install opencv-contrib-python` |
| 视频保存失败 | 安装 FFmpeg |
| OpenCV 3→4 | 移除 `cv2.cv` / 更新 API |
| 浮点图显示 | `cv2.normalize` + `.astype(uint8)` |
| 版本冲突 | 重装 headless 或 contrib |

---

> 下一章：[附录 D · 资源与延伸阅读](appendix-resources.md) →
