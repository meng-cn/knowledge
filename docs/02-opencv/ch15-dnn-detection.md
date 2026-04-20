# 第十五章 · DNN 目标检测

## 15.1 DNN 模块概述

OpenCV 的 DNN 模块是一个**通用的深度学习推理引擎**，支持加载多种框架训练的模型：

```
支持的后端：
  • Caffe (.caffemodel + .prototxt)
  • TensorFlow (.pb + .pbtxt)
  • TensorFlow Lite (.tflite)
  • ONNX (.onnx)  ← 推荐 ✅
  • Torch/PyTorch (.pth → ONNX)
  • Darknet (.weights + .cfg)

支持的后端运行引擎：
  • CPU (默认，使用 OpenCV 内置的 DNN 运行时)
  • OpenCV DNN (默认后端)
  • OpenVINO (Intel CPU/GPU/NPU)
  • CUDA (NVIDIA GPU)
  • OpenCL (GPU 加速)
  • Vulkan
  • NCNN (腾讯)
```

## 15.2 加载模型

### 15.2.1 ONNX 模型（推荐 ✅）

```python
import cv2

# ---- 加载 ONNX 模型 ----
net = cv2.dnn.readNetFromONNX('model.onnx')

# 指定后端（可选）
# CPU
net.setPreferableBackend(cv2.dnn.DNN_TARGET_CPU)
# OpenVINO
# net.setPreferableBackend(cv2.dnn.DNN_BACKEND_INFERENCE_ENGINE)
# CUDA
# net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
# OpenCL
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCL)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_OPENCL)
```

### 15.2.2 其他框架

```python
# Caffe
net = cv2.dnn.readNetFromCaffe('deploy.prototxt', 'model.caffemodel')

# TensorFlow
net = cv2.dnn.readNetFromTensorflow('model.pb', 'model.pbtxt')

# Darknet (YOLO)
net = cv2.dnn.readNetFromDarknet('yolov4.cfg', 'yolov4.weights')
# 或 ONNX 导出后的 YOLO
net = cv2.dnn.readNetFromONNX('yolov4.onnx')

# Torch (PyTorch) — 先导出为 ONNX
# python -c "import torch; torch.onnx.export(model, img, 'model.onnx')"
net = cv2.dnn.readNetFromONNX('model.onnx')
```

### 15.2.3 设置计算后端（性能调优）

```python
# OpenVINO（Intel CPU 最快）
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_INFERENCE_ENGINE)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)  # 或 DNN_TARGET_MYRIAD, DNN_TARGET_VPU

# CUDA（NVIDIA GPU）
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)

# OpenCL（通用 GPU）
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCL)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_OPENCL)

# 自动选择最快后端
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_DEFAULT)
```

## 15.3 YOLO 目标检测

### 15.3.1 完整推理流程

```python
import cv2
import numpy as np

# ---- 参数 ----
CONF_THRESHOLD = 0.5    # 置信度阈值
NMS_THRESHOLD = 0.4     # NMS IoU 阈值
IMG_SIZE = (416, 416)  # 输入尺寸

# ---- 加载模型 ----
net = cv2.dnn.readNetFromONNX('yolov8.onnx')
# 或 YOLOv4: net = cv2.dnn.readNetFromDarknet('yolov4.cfg', 'yolov4.weights')

# ---- 预处理 ----
img = cv2.imread('image.jpg')
h, w = img.shape[:2]

# 缩放并填充
blob = cv2.dnn.blobFromImage(
    img,
    scalefactor=1.0 / 255.0,  # 归一化到 [0, 1]
    size=IMG_SIZE,
    mean=(0, 0, 0),           # 减均值（如果模型已归一化，设为 0）
    swapRB=True,               # BGR → RGB
    crop=False,
    ddepth=cv2.CV_32F
)

# ---- 推理 ----
net.setInput(blob)
output = net.forward()
# output shape: [1, num_boxes, 4 + num_classes] 或 [1, 84, 8400]（YOLOv8）

# ---- 后处理 ----
boxes = []
confidences = []
class_ids = []

# YOLOv8 格式
num_classes = output.shape[2] - 5
for i in range(output.shape[1]):
    scores = output[0, i, 5:]
    class_id = np.argmax(scores)
    confidence = scores[class_id]

    if confidence > CONF_THRESHOLD:
        # 解码边界框（如果是中心点格式则转换）
        cx, cy = output[0, i, 0], output[0, i, 1]
        bw, bh = output[0, i, 2], output[0, i, 3]

        # 还原到原图尺寸
        x = int((cx - bw/2) * w / IMG_SIZE[0])
        y = int((cy - bh/2) * h / IMG_SIZE[1])
        box_w = int(bw * w / IMG_SIZE[0])
        box_h = int(bh * h / IMG_SIZE[1])

        boxes.append([x, y, box_w, box_h])
        confidences.append(float(confidence))
        class_ids.append(class_id)

# ---- NMS ----
indices = cv2.dnn.NMSBoxes(
    boxes, confidences, CONF_THRESHOLD, NMS_THRESHOLD
)

# ---- 可视化 ----
for i in indices.flatten():
    x, y, bw, bh = boxes[i]
    cv2.rectangle(img, (x, y), (x + bw, y + bh), (0, 255, 0), 2)
    label = f'{class_names[class_ids[i]]}: {confidences[i]:.2f}'
    cv2.putText(img, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
```

### 15.3.2 NMS（非极大值抑制）

```python
# OpenCV 内置 NMS
# indices = cv2.dnn.NMSBoxes(boxes, scores, score_threshold, nms_threshold)
# boxes: [[x,y,w,h], ...] 格式
# scores: 对应置信度列表
# 返回值: 保留的索引（从原始 boxes 中选取）
```

## 15.4 SSD（Single Shot MultiBox Detector）

```python
# SSD 模型加载
net = cv2.dnn.readNetFromCaffe('ssd_infer.prototxt', 'ssd_infer.caffemodel')

# 输入预处理（SSD 通常需要固定尺寸）
img = cv2.imread('image.jpg')
blob = cv2.dnn.blobFromImage(
    img, 0.007843, (300, 300),  # scale, size, mean
    mean=(127.5, 127.5, 127.5),
    swapRB=True,
    crop=False
)
net.setInput(blob)
detections = net.forward()
# detections shape: [1, 1, N, 7]
# 格式: [batch_id, class_id, confidence, x1, y1, x2, y2]

for i in range(detections.shape[2]):
    confidence = detections[0, 0, i, 2]
    if confidence > CONF_THRESHOLD:
        x1 = int(detections[0, 0, i, 3] * img.shape[1])
        y1 = int(detections[0, 0, i, 4] * img.shape[0])
        x2 = int(detections[0, 0, i, 5] * img.shape[1])
        y2 = int(detections[0, 0, i, 6] * img.shape[0])
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
```

## 15.5 常用预训练模型来源

| 模型 | 格式 | 用途 | 链接 |
|------|--|--|--|
| **YOLOv8** | ONNX | 通用目标检测 | ultralytics |
| **YOLOv4/v5/v7/v11** | ONNX/Darknet | 目标检测 | github.com/ultralytics |
| **SSD MobileNet** | Caffe/TFLite | 轻量检测 | tensorflow/models |
| **ResNet-50** | ONNX | 图像分类 | onnx/models |
| **MobileNet V3** | ONNX | 轻量分类 | onnx/models |
| **EfficientNet** | ONNX | 高精度分类 | onnx/models |
| **FaceDetection** | ONNX | 人脸检测 | github.com/opencv/opencv |

## 15.6 模型导出（PyTorch → ONNX）

```python
import torch
import cv2

# 导出 PyTorch 模型为 ONNX
model = torch.load('model.pth')
model.eval()

dummy_input = torch.randn(1, 3, 416, 416)
torch.onnx.export(
    model,
    dummy_input,
    'model.onnx',
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}},
    opset_version=11,
    do_constant_folding=True
)

# 验证 ONNX 模型
net = cv2.dnn.readNetFromONNX('model.onnx')
print(net)
# 输出模型层信息，验证加载成功
```

## 15.7 DNN 推理性能调优

```python
# ---- 1. 减小输入尺寸 ----
blob = cv2.dnn.blobFromImage(img, 1.0/255.0, (320, 320), ...)  # 从 416→320
# 速度提升 2-4x，精度略有下降

# ---- 2. 使用 OpenVINO（Intel CPU） ----
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_INFERENCE_ENGINE)

# ---- 3. 使用 ONNX Runtime 后端 ----
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_ONNXRUNTIME)

# ---- 4. 批量推理 ----
blobs = np.stack([preprocess(img) for img in images])
blob_batch = cv2.dnn.blobFromImages(blobs, ...)
net.setInput(blob_batch)
outputs = net.forward()

# ---- 5. 模型量化 ----
# INT8 量化模型比 FP32 快 2-4x
# 使用 OpenVINO Model Optimizer 或 ONNX Runtime quantization
```

## 15.8 DNN 推理延迟测试

```python
import time

# 预热（首次推理慢）
for _ in range(10):
    net.setInput(blob)
    net.forward()

# 正式测试
N = 100
t0 = time.time()
for _ in range(N):
    net.setInput(blob)
    net.forward()
latency = (time.time() - t0) / N * 1000  # ms

print(f"Average latency: {latency:.2f} ms")
print(f"FPS: {1000/latency:.1f}")
```

---

> 下一章：[第十六章 · 光流与运动分析](ch16-optical-flow.md) →
