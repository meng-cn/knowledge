# 第十七章 · 目标跟踪

## 17.1 OpenCV 内置跟踪器

OpenCV 提供了多种目标跟踪器（在 `cv2` 命名空间下，需 `opencv-contrib-python`）：

```bash
pip install opencv-contrib-python
```

### 17.1.1 可用跟踪器列表

```python
# OpenCV 4.x 支持的跟踪器
trackers = {
    'CSRT':              cv2.TrackerCSRT_create,
    'CSRT_KCF':          cv2.TrackerCSRT_KCF_create,
    'EAST':              cv2.TrackerEAST_create,
    'KCF':               cv2.TrackerKCF_create,
    'MedianFlow':        cv2.TrackerMedianFlow_create,
    'MIL':               cv2.TrackerMIL_create,
    'MIL_KCF':           cv2.TrackerMIL_KCF_create,
    'BOOSTING':          cv2.TrackerBoosting_create,
    'MOSSE':             cv2.TrackerMOSSE_create,
}

for name, creator in trackers.items():
    print(f'{name:15s} → {creator.__module__}')
```

### 17.1.2 跟踪器对比

| 跟踪器 | 速度 | 精度 | 尺度变化 | 遮挡 | 说明 |
|--------|--|--|--|--|--|
| **CSRT** | ⚡ | ★★★★★ | ✅ | ❌（中等遮挡） | **精度最高**，推荐 ✅ |
| **KCF** | ⚡⚡ | ★★★★ | ✅ | ✅ | 快速准确，经典之选 |
| **MOSSE** | ⚡⚡⚡ | ★★★ | ✅ | ✅ | **最快**，适合实时 |
| **MedianFlow** | ⚡⚡ | ★★★★ | ❌ | ❌ | 适合匀速运动 |
| **BOOSTING** | ⚡ | ★★★★ | ❌ | ❌ | 经典，已不推荐 |
| **MIL** | ⚡ | ★★★★ | ✅ | ✅ | 旧版本跟踪器 |

## 17.2 CSRT 跟踪器（推荐 ✅）

### 17.2.1 基础用法

```python
import cv2

# 初始化跟踪器
tracker = cv2.TrackerCSRT_create()

# 初始化（需要 ROI 框 [x, y, w, h]）
bbox = cv2.selectROI("Window", frame, False)  # 鼠标选择 ROI
# 或手动指定: bbox = (x, y, w, h)
ok = tracker.init(frame, bbox)  # ok=True 表示初始化成功

# 跟踪
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # 更新跟踪
    ok, bbox = tracker.update(frame)

    if ok:
        # 画框
        x, y, w, h = [int(v) for v in bbox]
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, "Tracking", (x, y-10),
                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    else:
        cv2.putText(frame, "Lost", (x, y-10),
                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    cv2.imshow("Tracking", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

### 17.2.2 CSRT 参数调优

```python
tracker = cv2.TrackerCSRT_create()

# CSRT 内部使用多通道特征 + 稀疏更新策略
# 无公开可调参数，但可通过以下参数优化性能:
# 1. 初始化时选择精准 ROI（边界贴合）
# 2. 降低更新频率（tracker.update 默认每帧更新）
# 3. 初始化时用较大 ROI 框
```

## 17.3 KCF 跟踪器

```python
tracker = cv2.TrackerKCF_create()
ok = tracker.init(frame, bbox)

while True:
    ok, bbox = tracker.update(frame)
    if ok:
        x, y, w, h = [int(v) for v in bbox]
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
    cv2.imshow("KCF Tracking", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

## 17.4 MOSSE 跟踪器（最快）

```python
tracker = cv2.TrackerMOSSE_create()
ok = tracker.init(frame, bbox)

while True:
    ok, bbox = tracker.update(frame)
    if ok:
        x, y, w, h = [int(v) for v in bbox]
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
    cv2.imshow("MOSSE Tracking", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

## 17.5 多目标跟踪

```python
def multi_object_tracking():
    """多目标跟踪 — 对每帧检测 + 跟踪"""
    cap = cv2.VideoCapture(0)
    tracker = cv2.TrackerCSRT_create()

    # 初始检测（用 YOLO/Cascade 等）
    _, frame = cap.read()
    objects = detect_all_objects(frame)  # 返回 [(x,y,w,h), ...]

    if len(objects) > 0:
        tracker.init(frame, objects[0])  # 跟踪第一个目标
        object_ids = [0]  # 目标 ID

    while True:
        _, frame = cap.read()
        ok, bbox = tracker.update(frame)

        if ok:
            x, y, w, h = [int(v) for v in bbox]
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, f'ID:0', (x, y-10),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        cv2.imshow("Multi-Object Tracking", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
```

## 17.6 跟踪器选择建议

```
单目标跟踪，需要最高精度  → CSRT ✅
单目标跟踪，需要实时        → MOSSE ✅
单目标跟踪，平衡            → KCF ✅
匀速直线运动                → MedianFlow ✅
遮挡严重                    → DCF 系列（KCF/MOSSE）
多目标跟踪                  → 检测+跟踪结合（ByteTrack / SORT）
```

## 17.7 跟踪评估指标

```python
def evaluate_tracking(predicted_bbox, ground_truth_bbox):
    """跟踪精度评估"""
    def iou(box_a, box_b):
        x1 = max(box_a[0], box_b[0])
        y1 = max(box_a[1], box_b[1])
        x2 = min(box_a[0] + box_a[2], box_b[0] + box_b[2])
        y2 = min(box_a[1] + box_a[3], box_b[1] + box_b[3])
        intersection = max(0, x2-x1) * max(0, y2-y1)
        area_a = box_a[2] * box_a[3]
        area_b = box_b[2] * box_b[3]
        union = area_a + area_b - intersection
        return intersection / union if union > 0 else 0

    return iou(predicted_bbox, ground_truth_bbox)
# IoU ≥ 0.5 通常视为正确跟踪
```

---

**Part IV · 目标检测与跟踪**（第 14–17 章）全部完成 ✅

当前进度汇总：

```
Part I  ✅ 基础篇 (4章)
Part II ✅ 图像处理 (5章)
Part III ✅ 特征与匹配 (4章)
Part IV ✅ 目标检测与跟踪 (4章)
Part V    🔲 相机与三维 (3章)
Part VI   🔲 机器学习 (3章)
Part VII  🔲 高级与实战 (5章)
Part VIII 🔲 附录 (4章)
───────────────────────
已完成 17/32 章
```

继续 Part V（相机与三维，第 18–20 章）？
