# 第二十四章 · DNN 模块深入

## 24.1 DNN 推理流程详解

### 24.1.1 标准推理管线

```python
import cv2
import numpy as np

def dnn_inference_pipeline(net, img, input_name=None):
    """DNN 推理标准流程"""

    # 1. 预处理：blobFromImage
    blob = cv2.dnn.blobFromImage(
        img,
        scalefactor=1.0 / 255.0,  # 归一化
        size=(input_size, input_size),  # 输入尺寸
        mean=(123.675, 116.28, 103.53),  # ImageNet 均值
        swapRB=True,               # BGR → RGB
        crop=False
    )
    # 不同模型需要不同的预处理（需查模型文档）

    # 2. 设置输入
    if input_name:
        net.setInput(blob, input_name)
    else:
        net.setInput(blob)

    # 3. 前向推理
    output = net.forward()  # 默认输出第一个输出层

    # 4. 后处理（根据模型类型自定义）
    result = postprocess(output)

    return result
```

### 24.1.2 blobFromImage 参数详解

```python
blob = cv2.dnn.blobFromImage(
    image,           # 输入图像
    scalefactor=1.0/255.0,  # 缩放因子（归一化到 [0,1]）
    size=(w, h),    # 目标输入尺寸
    mean=(0, 0, 0), # 减均值（通常用 ImageNet 均值）
    swapRB=False,   # True=BGR→RGB, False=不交换
    crop=False,     # 中心裁剪
    ddepth=cv2.CV_32F  # 输出深度（必须 float32）
)
# 输出形状: (1, C, H, W) — batch=1
```

## 24.2 图像分类

### 24.2.1 经典分类模型推理

```python
import cv2

# ---- 加载分类模型 ----
net = cv2.dnn.readNetFromONNX('mobilenet_v3.onnx')

# ---- 推理 ----
img = cv2.imread('test.jpg')
blob = cv2.dnn.blobFromImage(img, 1.0/255.0, (224, 224),
                                mean=(123.675, 116.28, 103.53),
                                swapRB=True, crop=False)
net.setInput(blob)
output = net.forward()  # (1, 1000) — ImageNet 1000 类概率

# ---- 取 top-5 ----
top5 = np.argsort(output.flatten())[-5:][::-1]
probabilities = output.flatten()[top5]

# ImageNet class labels (1000 classes)
with open('imagenet_classes.txt') as f:
    classes = f.read().strip().split('\n')

for cls_id, prob in zip(top5, probabilities):
    print(f'{classes[cls_id]}: {prob:.4f}')
```

### 24.2.2 常用预训练分类模型

| 模型 | 输入尺寸 | 精度 | 速度 | 适用场景 |
|------|--|--|--|--|
| MobileNet V3 | 224×224 | ★★★ | ⚡⚡⚡ | 移动端 ✅ |
| EfficientNet B0 | 224×224 | ★★★★ | ⚡⚡ | 平衡 ✅ |
| ResNet-50 | 224×224 | ★★ | ⚡ | 高精度 |
| VGG-16 | 224×224 | ★★★★ | ⚡ | 经典 |
| NASNet-Mobile | 331×331 | ★★ | ⚡⚡ | 移动端 |

## 24.3 语义分割

### 24.3.1 DeepLab / PSPNet 推理

```python
import cv2
import numpy as np

# DeepLab V3+ 语义分割
net = cv2.dnn.readNetFromONNX('deeplabv3.onnx')

img = cv2.imread('test.jpg')
h, w = img.shape[:2]

blob = cv2.dnn.blobFromImage(
    img, 1.0/255.0, (513, 513),
    mean=(123.675, 116.28, 103.53),
    swapRB=True,
    crop=False
)
net.setInput(blob)
output = net.forward()  # (1, N, 513, 513) — N 个类别

# 后处理：argmax → 语义标签图
seg_map = np.argmax(output[0], axis=0)  # (513, 513)

# 上采样到原图尺寸
seg_map_resized = cv2.resize(seg_map, (w, h), interpolation=cv2.INTER_NEAREST)

# 着色可视化
color_seg = apply_colormap(seg_map_resized)  # 自定义 colormap
overlay = cv2.addWeighted(img, 0.5, color_seg, 0.5, 0)
```

### 24.3.2 常用 Colormap

```python
def apply_colormap(sem_seg):
    """将语义分割图转为彩色图"""
    h, w = sem_seg.shape
    colored = np.zeros((h, w, 3), dtype=np.uint8)
    color_palette = get_color_palette()  # 21×3 的调色板

    for i in range(21):
        mask = sem_seg == i
        colored[mask] = color_palette[i]
    return colored

# Cityscapes 常用配色
def get_color_palette():
    # 21 类 Cityscapes colormap
    palette = [
        [128, 64, 128], [244, 35, 232], [70, 70, 70], [102, 102, 156],
        [190, 153, 153], [180, 165, 180], [150, 100, 100], [150, 120, 90],
        [153, 153, 153], [153, 153, 153], [250, 170, 30], [220, 220, 0],
        [107, 142, 35], [152, 251, 152], [70, 130, 180], [220, 20, 60],
        [255, 0, 0], [0, 0, 142], [0, 0, 70], [0, 60, 100], [0, 80, 100]
    ]
    return np.array(palette)
```

## 24.4 人脸识别（OpenCV 内置）

```python
import cv2

# ---- 加载预训练模型 ----
face_detector = cv2.dnn.readNetFromTorch('res10_300x300_ssd_iter_140000.caffemodel',
                                            'deploy.prototxt')
# 或 ONNX 格式
# face_detector = cv2.dnn.readNetFromONNX('face_detection.onnx')

# ---- 人脸检测 ----
img = cv2.imread('test.jpg')
blob = cv2.dnn.blobFromImage(img, 1.0/255.0, (300, 300), mean=(104, 177, 123))
face_detector.setInput(blob)
detections = face_detector.forward()  # (1, 1, N, 7)

for i in range(detections.shape[2]):
    confidence = detections[0, 0, i, 2]
    if confidence > 0.5:
        x1 = int(detections[0, 0, i, 3] * img.shape[1])
        y1 = int(detections[0, 0, i, 4] * img.shape[0])
        x2 = int(detections[0, 0, i, 5] * img.shape[1])
        y2 = int(detections[0, 0, i, 6] * img.shape[0])
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
```

### 24.4.1 人脸对齐 + 识别

```python
import cv2
import numpy as np

# 1. 人脸检测
faces = detect_faces(img)

for face in faces:
    x, y, w, h = face

    # 2. 面部关键点检测（5 点或 68 点）
    keypoints = detect_landmarks(face_roi)  # (5, 2) 或 (68, 2)

    # 3. 仿射变换对齐
    # 标准面部关键点（用于对齐）
    src_pts = keypoints
    dst_pts = np.array([  # 标准位置
        [w*0.3, h*0.38],
        [w*0.7, h*0.38],
        [w*0.5, h*0.7],
        [w*0.55, h*0.85],
        [w*0.45, h*0.85],
    ], dtype=np.float32)

    M = cv2.getAffineTransform(src_pts, dst_pts)
    aligned = cv2.warpAffine(face_roi, M, (112, 112))  # 对齐到 112×112

    # 4. 人脸识别（与 face_recognition 库或 DNN 模型结合）
    # emb = face_recognition_model.forward(aligned)
```

## 24.5 姿态估计（Pose Estimation）

```python
# OpenPose / HRNet 风格姿态估计
net = cv2.dnn.readNetFromONNX('pose.onnx')

img = cv2.imread('test.jpg')
blob = cv2.dnn.blobFromImage(img, 1.0/255.0, (368, 368), mean=(0, 0, 0), swapRB=True)
net.setInput(blob)
output = net.forward()  # (1, N, H/4, W/4) — N 个人体部位的概率图

# 后处理：argmax → 关键点位置
N = output.shape[1]
H, W = output.shape[2], output.shape[3]

keypoints = np.zeros((N, 2), dtype=np.int32)
for n in range(N):
    prob_map = output[0, n]
    max_idx = np.unravel_index(np.argmax(prob_map), prob_map.shape)
    keypoints[n] = [max_idx[1] * 4, max_idx[0] * 4]  # 上采样

# 人体部位连接
body_parts = [
    ('nose', 'left_eye'), ('left_eye', 'right_eye'),
    ('left_eye', 'left_shoulder'), ('right_eye', 'right_shoulder'),
    ('left_shoulder', 'right_shoulder'),
    ('left_shoulder', 'left_elbow'), ('right_shoulder', 'right_elbow'),
    ('left_elbow', 'left_wrist'), ('right_elbow', 'right_wrist'),
    ('left_shoulder', 'left_hip'), ('right_shoulder', 'right_hip'),
    ('left_hip', 'right_hip'), ('left_hip', 'left_knee'),
    ('right_hip', 'right_knee'), ('left_knee', 'left_ankle'),
    ('right_knee', 'right_ankle')
]

img_pose = img.copy()
for part1, part2 in body_parts:
    idx1 = get_keypoint_index(part1)
    idx2 = get_keypoint_index(part2)
    p1 = keypoints[idx1]
    p2 = keypoints[idx2]
    if p1[0] > 0 and p2[0] > 0:
        cv2.line(img_pose, (int(p1[0]), int(p1[1])),
                  (int(p2[0]), int(p2[1])), (0, 255, 0), 2)
```

## 24.6 文字检测（OCR 基础）

### 24.6.1 EAST 文字检测

```python
# EAST 文字检测器
net = cv2.dnn.readNetFromTorch('frozen_east_text_detection.pb')

img = cv2.imread('test.jpg')
h, w = img.shape[:2]

blob = cv2.dnn.blobFromImage(img, 1.0, (320, 320), mean=(123.68, 116.78, 103.94),
                                swapRB=True, crop=False)
net.setInput(blob)
scores, geometry = net.forward(['feature_fusion/Decision_934', 'feature_fusion/Conv_7/Sigmoid'])

# 后处理：非极大值抑制检测文字框
boxes, confidences = detect_text_boxes(scores, geometry, w, h, conf_threshold=0.5)
```

---

> 下一章：[第二十五章 · 视频处理](ch25-video-processing.md) →
