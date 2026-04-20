# 第二十六章 · GUI 与交互

## 26.1 图像显示

### 26.1.1 基础显示

```python
import cv2

img = cv2.imread('photo.jpg')

# 显示窗口
cv2.imshow('Window Name', img)

# 等待按键
cv2.waitKey(0)  # 0=无限等待
cv2.waitKey(1)  # 1ms 后继续（视频流畅）

# 关闭所有窗口
cv2.destroyAllWindows()

# 关闭指定窗口
cv2.destroyWindow('Window Name')
```

### 26.1.2 窗口管理

```python
# ---- 创建窗口 ----
cv2.namedWindow('My Window', cv2.WINDOW_NORMAL)
# WINDOW_NORMAL: 可调整大小
# WINDOW_AUTOSIZE: 自动调整（默认）
# WINDOW_FREERATIO: 自由比例
# WINDOW_KEEPRATIO: 保持比例

# ---- 窗口属性 ----
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_ASPECT_RATIO, 1.0)
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_TOP, 100)
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_LEFT, 100)
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_WIDTH, 800)
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_HEIGHT, 600)

# ---- 置顶/取消 ----
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_TOPMOST, 1)  # 置顶
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_TOPMOST, 0)  # 取消

# ---- 全屏 ----
cv2.setWindowProperty('My Window', cv2.WINDOW_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
```

### 26.1.3 显示彩色图 vs 灰度图

```python
# ---- 彩色图 ----
cv2.imshow('Color', img)  # 默认 BGR

# ---- 灰度图 ----
cv2.imshow('Gray', gray)

# ---- 深度图 ----
depth_norm = cv2.normalize(depth, None, 0, 255, cv2.NORM_MINMAX)
cv2.imshow('Depth', depth_norm.astype(np.uint8))

# ---- 使用 colormap ----
depth_colored = cv2.applyColorMap(depth_norm.astype(np.uint8), cv2.COLORMAP_JET)
cv2.imshow('Depth Colored', depth_colored)

# COLORMAP_JET, COLORMAP_HOT, COLORMAP_MAGMA, COLORMAP_VIRIDIS 等
```

## 26.2 鼠标交互

```python
def mouse_callback(event, x, y, flags, param):
    """鼠标事件回调"""
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f'Left click at ({x}, {y})')
    elif event == cv2.EVENT_RBUTTONDOWN:
        print(f'Right click at ({x}, {y})')
    elif event == cv2.EVENT_MBUTTONDOWN:
        print(f'Middle click at ({x}, {y})')
    elif event == cv2.EVENT_LBUTTONDBLCLK:
        print(f'Double click at ({x}, {y})')
    elif event == cv2.EVENT_MOUSEMOVE:
        # 可在此实现拖拽选择等
        pass

# 注册鼠标回调
cv2.namedWindow('Mouse Demo', cv2.WINDOW_AUTOSIZE)
cv2.setMouseCallback('Mouse Demo', mouse_callback)

while True:
    cv2.imshow('Mouse Demo', img)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

### 26.2.1 ROI 选择工具

```python
def roi_selection(img):
    """鼠标拖拽选择 ROI"""
    drawing = False
    pts = []

    def on_mouse(event, x, y, flags, param):
        nonlocal drawing, pts
        if event == cv2.EVENT_LBUTTONDOWN:
            drawing = True
            pts = [(x, y)]
        elif event == cv2.EVENT_MOUSEMOVE and drawing:
            pts.append((x, y))
        elif event == cv2.EVENT_LBUTTONUP:
            drawing = False
            pts.append((x, y))

    cv2.namedWindow('ROI Selection', cv2.WINDOW_AUTOSIZE)
    cv2.setMouseCallback('ROI Selection', on_mouse)

    while True:
        display = img.copy()
        if len(pts) > 1:
            cv2.polylines(display, [np.array(pts, np.int32)], True, (0, 255, 0), 2)

        cv2.imshow('ROI Selection', display)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):  # 退出
            break
        elif key == ord('r'):  # 重置
            pts = []
        elif key == ord(' '):  # 确认选择
            if len(pts) >= 3:
                mask = np.zeros(img.shape[:2], dtype=np.uint8)
                cv2.fillPoly(mask, [np.array(pts, np.int32)], 255)
                return mask

        if key & 0xFF == 27:  # ESC
            break

    cv2.destroyWindow('ROI Selection')
    return None
```

## 26.3 TrackBar（滑动条）

```python
def trackbar_demo():
    """滑动条交互"""
    window = 'Trackbar Demo'
    cv2.namedWindow(window)
    img = cv2.imread('photo.jpg')

    # 创建滑动条
    cv2.createTrackbar('Brightness', window, 0, 255, None)
    cv2.createTrackbar('Contrast', window, 100, 300, None)
    cv2.createTrackbar('Gaussian', window, 1, 31, None)

    while True:
        bright = cv2.getTrackbarPos('Brightness', window)
        contrast = cv2.getTrackbarPos('Contrast', window) / 100.0
        ksize = cv2.getTrackbarPos('Gaussian', window) * 2 + 1

        result = cv2.convertScaleAbs(img, alpha=contrast, beta=bright)
        if ksize > 1:
            result = cv2.GaussianBlur(result, (ksize, ksize), 0)

        cv2.imshow(window, result)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()
```

### 26.3.1 TrackBar 回调函数

```python
def on_trackbar(value):
    """滑动条回调"""
    print(f'Value changed: {value}')

cv2.createTrackbar('Value', 'Window', 0, 100, on_trackbar)
```

## 26.4 键盘交互

```python
while True:
    cv2.imshow('Keyboard Demo', img)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):     # q 退出
        break
    elif key == ord('s'):   # s 保存
        cv2.imwrite('snapshot.jpg', img)
    elif key == ord('c'):   # c 切换模式
        mode = not mode
    elif key == 27:         # ESC
        break

    # 特殊按键
    # cv2.WM_KEYDOWN / WM_KEYUP / WM_CHAR
```

## 26.5 高级 GUI 组件

### 26.5.1 菜单（File/View 等）

```python
# OpenCV 支持窗口菜单（仅 Windows 有效）
# 需要额外安装 opencv-contrib-python
```

### 26.5.2 图像拼接/多图显示

```python
def display_side_by_side(imgs):
    """多图并排显示"""
    h = max(img.shape[0] for img in imgs)
    w = sum(img.shape[1] for img in imgs)
    c = imgs[0].shape[2] if len(imgs[0].shape) == 3 else 1

    canvas = np.zeros((h, w, c), dtype=np.uint8)
    x_off = 0
    for img in imgs:
        h_img = img.shape[0]
        y_off = (h - h_img) // 2
        if len(img.shape) == 2:
            canvas[y_off:y_off+h_img, x_off:x_off+img.shape[1]] = img
        else:
            canvas[y_off:y_off+h_img, x_off:x_off+img.shape[1]] = img
        x_off += img.shape[1]

    cv2.imshow('Comparison', canvas)
    cv2.waitKey(0)
```

## 26.6 GUI 交互速查表

| 功能 | 函数 |
|------|--|
| 显示图像 | `imshow()` |
| 等待按键 | `waitKey(ms)` |
| 关闭窗口 | `destroyAllWindows()` |
| 创建窗口 | `namedWindow()` |
| 窗口属性 | `setWindowProperty()` |
| 鼠标事件 | `setMouseCallback()` |
| 滑动条 | `createTrackbar()` / `getTrackbarPos()` |
| 获取键盘 | `waitKey()` 返回值 |
| 调色板 | `applyColorMap()` |

---

> 下一章：[第二十七章 · CUDA 加速](ch27-cuda-acceleration.md) →
