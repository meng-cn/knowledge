# 第二十五章 · 视频处理

## 25.1 视频读写

### 25.1.1 读取视频

```python
import cv2

# ---- 读取视频文件 ----
cap = cv2.VideoCapture('video.mp4')

# ---- 从摄像头 ----
cap = cv2.VideoCapture(0)  # 默认摄像头
cap = cv2.VideoCapture(1)  # 第二路摄像头
cap = cv2.VideoCapture('rtsp://...')  # RTSP 流
cap = cv2.VideoCapture('http://...')  # HTTP 流

# 检查是否成功
assert cap.isOpened(), "视频打开失败"

# 获取视频信息
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))   # 宽度
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))  # 高度
fps = cap.get(cv2.CAP_PROP_FPS)                   # 帧率
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))  # 总帧数
fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))        # 编解码器

print(f"分辨率: {width}x{height}, FPS: {fps}, 总帧: {total_frames}")

# 读取帧
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # 处理 frame...
    cv2.imshow('Video', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

### 25.1.2 视频编码参数

```python
# 获取支持的编解码器
fourcc_codes = [
    cv2.VideoWriter_fourcc(*'XVID'),    # XVID（AVI，通用 ✅）
    cv2.VideoWriter_fourcc(*'MP4V'),    # MP4V（MP4）
    cv2.VideoWriter_fourcc(*'X264'),    # H.264（MP4，推荐 ✅）
    cv2.VideoWriter_fourcc(*'avc1'),     # H.264（MP4，Apple 兼容）
    cv2.VideoWriter_fourcc(*'MJPEG'),    # MJPEG（高质量，文件大）
    cv2.VideoWriter_fourcc(*'H265'),    # H.265（HEVC，压缩率最高）
    cv2.VideoWriter_fourcc(*'FLV1'),    # Flash
    cv2.VideoWriter_fourcc(*'AVC1'),    # H.264
]

# 写视频
out = cv2.VideoWriter(
    'output.avi',
    cv2.VideoWriter_fourcc(*'XVID'),
    fps,
    (width, height)
)
```

### 25.1.3 写视频完整示例

```python
import cv2

cap = cv2.VideoCapture('input.mp4')
out = cv2.VideoWriter(
    'output.mp4',
    cv2.VideoWriter_fourcc(*'H264'),
    cap.get(cv2.CAP_PROP_FPS),
    (int(cap.get(3)), int(cap.get(4)))
)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # 处理帧
    result = process_frame(frame)

    out.write(result)

cap.release()
out.release()
```

## 25.2 视频捕获优化

```python
# ---- 优化摄像头性能 ----
cap = cv2.VideoCapture(0)

# 设置关键参数（某些摄像头可能不支持全部参数）
cap.set(cv2.CAP_PROP_FPS, 30)
cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # 减少延迟

# 检查参数是否设置成功
print(f"FPS: {cap.get(cv2.CAP_PROP_FPS)}")
print(f"Resolution: {cap.get(cv2.CAP_PROP_FRAME_WIDTH)}x{cap.get(cv2.CAP_PROP_FRAME_HEIGHT)}")
```

## 25.3 视频帧操作

### 25.3.1 帧间差分运动检测

```python
cap = cv2.VideoCapture(0)
prev_gray = None

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    if prev_gray is not None:
        diff = cv2.absdiff(prev_gray, gray)
        _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)

        # 清理噪点
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # 检测运动对象
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            if cv2.contourArea(cnt) > 1000:
                x, y, w, h = cv2.boundingRect(cnt)
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

    prev_gray = gray
    cv2.imshow('Motion', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

### 25.3.2 视频加速/减速

```python
import time

fps = cap.get(cv2.CAP_PROP_FPS)
target_fps = 30
delay_ms = int(1000 / target_fps)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow('Video', frame)
    time.sleep(1.0 / fps)  # 按原速播放
    # time.sleep(0.5 / fps)  # 2x 加速
    # time.sleep(2.0 / fps)  # 0.5x 减速
```

## 25.4 视频编解码

### 25.4.1 常用编解码器

| 编解码 | FOURCC | 格式 | 压缩率 | 质量 |
|------|------|--|--|--|
| **XVID** | `'XVID'` | AVI | 中 | 好 |
| **H264** | `'H264'/'avc1'` | MP4 | 高 | 好 ✅ |
| **H265** | `'H265'/'HEV1'` | MP4 | 最高 | 好 |
| **MJPG** | `'MJPG'` | AVI | 低 | 最高（有损）|
| **FLV1** | `'FLV1'` | FLV | 中 | 中 |
| **WMV2** | `'WMV2'` | WMV | 中 | 中 |

### 25.4.2 OpenCV 支持的编解码器检查

```python
def check_fourcc_support(fourcc):
    """检查系统是否支持指定编解码器"""
    cap = cv2.VideoCapture(0)
    ret = cap.set(cv2.CAP_PROP_FOURCC, fourcc)
    cap.release()
    return ret

# 测试各编解码器
for codec in ['XVID', 'H264', 'MJPG', 'HEV1']:
    supported = check_fourcc_support(cv2.VideoWriter_fourcc(*codec))
    print(f'{codec}: {"✅" if supported else "❌"}')
```

## 25.5 视频处理管线

```python
def video_processing_pipeline(input_file, output_file):
    """视频处理完整管线"""
    cap = cv2.VideoCapture(input_file)
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    out = cv2.VideoWriter(output_file, cv2.VideoWriter_fourcc(*'H264'), fps, (w, h))

    prev_gray = None
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 1. 预处理
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        # 2. 特征检测（每 N 帧）
        if frame_count % 30 == 0:
            corners = cv2.goodFeaturesToTrack(blur, 100, 0.01, 10)

        # 3. 运动检测
        if prev_gray is not None:
            diff = cv2.absdiff(prev_gray, blur)
            _, motion = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
            motion = cv2.morphologyEx(motion, cv2.MORPH_OPEN,
                                       cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5,5)))

        # 4. 后处理
        processed = cv2.addWeighted(frame, 0.7, blur, 0.3, 0)
        out.write(processed)

        prev_gray = blur
        frame_count += 1

    cap.release()
    out.release()
```

---
