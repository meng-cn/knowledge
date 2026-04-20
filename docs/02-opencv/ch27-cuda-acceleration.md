# 第二十七章 · CUDA 加速

## 27.1 CUDA 模块概述

OpenCV 的 `cv2.cuda` 模块将核心图像处理函数移植到 GPU，适用于大规模并行计算场景。

### 27.1.1 安装要求

```bash
# 需要 OpenCV 的 CUDA 编译版本
# 方式1: 从源码编译 OpenCV + CUDA
# 方式2: 使用 NVIDIA DALI + OpenCV 组合
# 方式3: 使用 pip install opencv-python 但不含 CUDA（需手动编译）

# 检查 CUDA 支持
import cv2
print(cv2.cuda.getCudaEnabledDeviceCount())  # >0 表示支持
print(cv2.getBuildInformation())  # 查看 CUDA 是否编译进去
```

## 27.2 GPU 内存对象

### 27.2.1 GpuMat（GPU 矩阵）

```python
import cv2

# ---- 创建 GpuMat ----
gpu_img = cv2.cuda_GpuMat()

# ---- 上传到 GPU ----
host_img = cv2.imread('image.jpg')
gpu_img.upload(host_img)

# ---- 下载回主机 ----
result_gpu = cv2.cuda_GpuMat()
result_gpu.download()  # → numpy array

# ---- GpuMat 属性 ----
print(gpu_img.rows, gpu_img.cols, gpu_img.channels())
print(gpu_img.empty())
print(gpu_img.type())  # 数据类型
print(gpu_img.step)    # 行步长
```

### 27.2.2 GpuMat 创建方式

```python
# 从 numpy 创建
gpu_img = cv2.cuda_GpuMat(host_img)

# 分配空 GpuMat
gpu_img = cv2.cuda_GpuMat(h, w, cv2.CV_8UC3)

# 从现有 GpuMat 创建子区域（零拷贝）
roi = gpu_img(roi_rect)  # cv2.Rect(x, y, w, h)
```

## 27.3 GPU 图像处理操作

### 27.3.1 常见 GPU 操作

```python
import cv2

# 初始化 CUDA 模块
cv2.cuda.setDevice(0)  # 选择 GPU

# ---- 常用 GPU 操作 ----
gpu_gray = cv2.cuda.cvtColor(gpu_img, cv2.COLOR_BGR2GRAY)

gpu_blur = cv2.cuda.GaussianBlur(gpu_gray, (5, 5), 1.0)
gpu_blur = cv2.cuda.createGaussianFilter(src_type, dst_type, ksize, sigma)

gpu_edge = cv2.cuda.Canny(gpu_gray, 50, 150)

gpu_resize = cv2.cuda.resize(gpu_img, (320, 240))
gpu_resize = cv2.cuda.resize(gpu_img, (320, 240), interpolation=cv2.INTER_AREA)

gpu_equalize = cv2.cuda.equalizeHist(gpu_gray)

gpu_morph = cv2.cuda.morphologyEx(gpu_img, cv2.MORPH_ERODE, kernel)
```

### 27.3.2 GPU 滤波

```python
# ---- 高斯滤波（GPU）----
gpu_blur = cv2.cuda.createGaussianFilter(
    cv2.CV_8UC3, cv2.CV_8UC3, (5, 5), 1.0
)
blurred = gpu_blur.filter(gpu_img)

# 或使用简化接口
blurred = cv2.cuda.GaussianBlur(gpu_img, (5, 5), 1.0)

# ---- 中值滤波（GPU）----
# OpenCV 的 CUDA 中值滤波在 contrib 模块
gpu_median = cv2.cuda.createMedianFilter(cv2.CV_8UC3, 5)
median = gpu_median.filter(gpu_img)

# ---- 双边滤波（GPU）----
gpu_bilateral = cv2.cuda.createBilateralFilter(cv2.CV_8UC3, -1, 75, 75)
bilateral = gpu_bilateral.filter(gpu_img)

# 或使用简化接口
bilateral = cv2.cuda.bilateralFilter(gpu_img, 9, 75, 75)
```

### 27.3.3 GPU 形态学

```python
# 腐蚀/膨胀（GPU）
kernel = cv2.cuda_GpuMat()
kernel.upload(np.ones((3,3), np.uint8) * 255)

eroded = cv2.cuda.erode(gpu_img, kernel)
dilated = cv2.cuda.dilate(gpu_img, kernel)
open_op = cv2.cuda.morphologyEx(gpu_img, cv2.MORPH_OPEN, kernel)
close_op = cv2.cuda.morphologyEx(gpu_img, cv2.MORPH_CLOSE, kernel)
```

### 27.3.4 GPU 颜色空间转换

```python
# 颜色转换（GPU）
gray_gpu = cv2.cuda.cvtColor(gpu_img, cv2.COLOR_BGR2GRAY)
bgr_gpu = cv2.cuda.cvtColor(hsv_gpu, cv2.COLOR_HSV2BGR)
rgb_gpu = cv2.cuda.cvtColor(bgr_gpu, cv2.COLOR_BGR2RGB)
```

## 27.4 GPU 事件与异步处理

### 27.4.1 异步执行（非阻塞）

```python
# OpenCV CUDA 模块默认是同步的
# 如需异步，使用 cudaStream
stream = cv2.cuda_Stream()

# 在流中执行操作
gpu_blur = cv2.cuda.GaussianBlur(gpu_img, (5,5), 1.0, stream=stream)

# 等待流完成
cv2.cuda.streamWait(stream)

# 或用同步下载
result = gpu_blur.download()
cv2.cuda.streamSync(stream)
```

## 27.5 GPU 加速效果对比

### 27.5.1 性能测试

```python
import time
import cv2
import numpy as np

def benchmark_gpu_vs_cpu(img):
    """GPU vs CPU 性能对比"""
    # CPU
    t0 = time.time()
    cpu_blur = cv2.GaussianBlur(img, (51, 51), 0)
    cpu_time = (time.time() - t0) * 1000

    # GPU
    gpu_img = cv2.cuda_GpuMat(img)
    t1 = time.time()
    gpu_blur = cv2.cuda.GaussianBlur(gpu_img, (51, 51), 0)
    gpu_time_upload = (time.time() - t1) * 1000

    t2 = time.time()
    gpu_blur_download = gpu_blur.download()
    gpu_time_download = (time.time() - t2) * 1000

    print(f"CPU:     {cpu_time:.1f} ms")
    print(f"GPU:     {gpu_time_upload + gpu_time_download:.1f} ms (含传输)")
    print(f"GPU纯算: {gpu_time_upload:.1f} ms")
    print(f"加速比:  {cpu_time / gpu_time_upload:.2f}x")

benchmark_gpu_vs_cpu(cv2.imread('large_image.jpg'))
```

### 27.5.2 GPU 加速适用场景

| 场景 | 加速比 | 说明 |
|------|--|--|
| 大核滤波（≥51×51） | 5–20x | GPU 并行优势大 |
| 高分辨率图像（≥1080p） | 2–5x | 数据传输占一定比例 |
| 实时视频（720p/30fps） | 1.5–3x | 含数据传输 |
| 小核滤波（≤15×15） | <2x | CPU SIMD 已足够快 |
| 小图像 | <1x | GPU 数据传输开销 > 计算收益 |

## 27.6 CUDA 编译

### 27.6.1 从源码编译 OpenCV with CUDA

```bash
# 1. 克隆源码
git clone https://github.com/opencv/opencv.git
git clone https://github.com/opencv/opencv_contrib.git

# 2. 编译
cd opencv
mkdir build && cd build
cmake .. \
  -DOPENCV_EXTRA_MODULES_PATH=../../opencv_contrib/modules \
  -DCMAKE_BUILD_TYPE=Release \
  -DWITH_CUDA=ON \
  -DCUDA_ARCH_NAME=Auto \
  -DWITH_CUDNN=ON \
  -DPYTHON3_EXECUTABLE=$(which python3) \
  -DPYTHON3_INCLUDE_DIR=$(python3 -c "import sysconfig; print(sysconfig.get_paths()['include'])") \
  -DPYTHON3_PACKAGES_PATH=$(python3 -c "import sysconfig; print(sysconfig.get_paths()['purelib'])")

make -j$(nproc)
sudo make install
```

## 27.7 GPU 编程注意事项

```
1. 数据传输开销: upload/download 各需 ~10-50ms，批量处理更划算
2. 内存管理: GPU 内存有限，用完及时释放
3. 多 GPU: cv2.cuda.setDevice(id) 选择目标 GPU
4. 异步: 使用 CUDA Stream 实现并发
5. 精度: GPU float32 精度足够，但 float64 需确认支持
```

---

> 下一章：[第二十八章 · 实战案例集](ch28-cases.md) →
