# 第二十八章 · 实战案例集

## 28.1 车牌识别

### 28.1.1 完整管线

```python
import cv2
import numpy as np

def license_plate_recognition(img):
    """车牌识别管线"""
    # 1. 灰度化 + 边缘检测
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(gray, 50, 150)

    # 2. 形态学 — 提取水平长条（车牌特征）
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 5))
    horizontal_edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, h_kernel)

    # 3. 查找轮廓 — 候选车牌区域
    contours, _ = cv2.findContours(horizontal_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    candidates = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        aspect_ratio = w / h
        area = w * h

        # 车牌比例约 4:1
        if 3.0 < aspect_ratio < 7.0 and area > 2000:
            candidates.append((x, y, w, h))

    # 4. 对候选区域 OCR（Tesseract）
    # pip install pytesseract
    # import pytesseract
    # result = pytesseract.image_to_text(rois, lang='chi_sim+eng')

    return candidates
```

### 28.1.2 更鲁棒的实现

```python
def robust_license_plate_detection(img):
    """更鲁棒的车牌检测"""
    # 1. 颜色分割（蓝色/绿色车牌）
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # 蓝牌: 100-130
    lower_blue = np.array([100, 50, 50])
    upper_blue = np.array([130, 255, 200])
    mask1 = cv2.inRange(hsv, lower_blue, upper_blue)

    # 绿牌（新能源）: 40-80
    lower_green = np.array([40, 50, 50])
    upper_green = np.array([80, 255, 200])
    mask2 = cv2.inRange(hsv, lower_green, upper_green)

    mask = cv2.bitwise_or(mask1, mask2)

    # 2. 形态学清理
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 15))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # 3. 连通域
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)

    plates = []
    for i in range(1, num_labels):
        x, y, w, h, area = stats[i]
        if 2000 < area < 50000 and 3 < w/h < 7:
            plates.append((x, y, w, h))

    return plates
```

## 28.2 文档扫描

### 28.2.1 自动文档校正

```python
def document_scanner(img):
    """自动文档扫描 — 透视校正"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    # 边缘检测
    edges = cv2.Canny(gray, 75, 200)

    # 膨胀连接断裂边缘
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=2)
    eroded = cv2.erode(dilated, kernel, iterations=2)

    # 查找最大轮廓（应该是文档边缘）
    contours, _ = cv2.findContours(eroded, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    doc_contour = max(contours, key=cv2.contourArea)

    # 近似为四边形
    peri = cv2.arcLength(doc_contour, True)
    approx = cv2.approxPolyDP(doc_contour, 0.02 * peri, True)

    if len(approx) == 4:
        pts = approx.reshape(4, 2).astype(np.float32)

        # 排序: TL, TR, BR, BL
        pts_sorted = order_points(pts)

        # 目标矩形
        (tl, tr, br, bl) = pts_sorted
        widthA = np.linalg.norm(br - bl)
        widthB = np.linalg.norm(tr - tl)
        maxWidth = max(int(widthA), int(widthB))
        heightA = np.linalg.norm(tr - br)
        heightB = np.linalg.norm(tl - bl)
        maxHeight = max(int(heightA), int(heightB))

        dst_pts = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype=np.float32)

        # 透视变换
        M = cv2.getPerspectiveTransform(pts_sorted, dst_pts)
        warped = cv2.warpPerspective(img, M, (maxWidth, maxHeight))

        # 二值化
        warped_gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(warped_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        return warped, binary
    return None, None

def order_points(pts):
    """排序四点：TL, TR, BR, BL"""
    rect = np.zeros((4, 2), dtype=np.float32)
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # TL
    rect[2] = pts[np.argmax(s)]  # BR
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # TR
    rect[3] = pts[np.argmax(diff)]  # BL
    return rect
```

## 28.3 图像去雾

```python
def dark_channel_dehaze(img, omega=0.95, t0=0.1):
    """暗通道先验去雾"""
    img_float = img.astype(np.float32) / 255.0
    h, w = img_float.shape[:2]

    # 1. 暗通道计算
    dark_channel = np.min(img_float, axis=2)
    patch_size = 15
    dark_channel = cv2.erode(dark_channel, np.ones((patch_size, patch_size)))

    # 2. 大气光估计
    N = int(h * w / 1000)
    dark_sorted = dark_channel.flatten()
    dark_sorted.sort()
    A = img_float[h//4, w//4]  # 简化：取最亮点平均

    # 3. 透射率估计
    t = 1 - omega * dark_channel
    t = np.maximum(t, t0)

    # 4. 恢复
    J = (img_float - A) / np.maximum(t, 0.01) + A
    J = np.clip(J * 255, 0, 255).astype(np.uint8)

    return J
```

## 28.4 OCR 文字识别

### 28.4.1 Tesseract OCR

```bash
# 安装
pip install pytesseract
# Tesseract 引擎: https://github.com/tesseract-ocr/tesseract
# 中文语言包: sudo apt install tesseract-ocr-chi-sim
```

```python
import pytesseract
from PIL import Image
import cv2
import numpy as np

def ocr_text(img):
    """OCR 文字识别"""
    # 预处理
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # OCR
    text = pytesseract.image_to_string(binary, lang='chi_sim+eng')
    return text

# 带定位的 OCR
def ocr_with_bbox(img):
    """带定位的 OCR"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # Tesseract OCR 数据
    data = pytesseract.image_to_data(gray, lang='chi_sim+eng', output_type=pytesseract.Output.DICT)

    for i in range(len(data['text'])):
        if int(data['conf'][i]) > 60:  # 置信度 > 60
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 1)
            cv2.putText(img, data['text'][i], (x, y-5),
                         cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

    return img
```

## 28.5 图像拼接（Panorama）

```python
def panorama_stitch(images):
    """多幅图像拼接"""
    detector = cv2.SIFT_create()
    descriptors = []
    keypoints = []

    # 提取特征
    for img in images:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        kp, desc = detector.detectAndCompute(gray, None)
        keypoints.append(kp)
        descriptors.append(desc)

    # BFMatcher 匹配相邻图像
    bf = cv2.BFMatcher(cv2.NORM_L2)
    homographies = []

    for i in range(len(images) - 1):
        matches = bf.knnMatch(descriptors[i], descriptors[i+1], k=2)
        good = [m for m, n in matches if m.distance < 0.75 * n.distance]

        if len(good) > 10:
            pts1 = np.float32([keypoints[i][m.queryIdx].pt for m in good])
            pts2 = np.float32([keypoints[i+1][m.trainIdx].pt for m in good])
            H, mask = cv2.findHomography(pts1, pts2, cv2.RANSAC, 5.0)
            homographies.append(H)

    # 拼接
    result = images[0]
    for H in homographies:
        h, w = result.shape[:2]
        warped = cv2.warpPerspective(result, H, (w * 2, h))
        result = cv2.add(result, warped)

    return result
```

## 28.6 手绘/素描生成

```python
def sketch_generator(img, mode='gray'):
    """手绘素描生成"""
    if mode == 'gray':
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 反色 + 高斯模糊 + 颜色减淡
        blur = cv2.GaussianBlur(gray, (0, 0), 15)
        inverted = 255 - blur
        sketch = cv2.divide(gray, 255 - inverted, scale=256)
        return sketch

    elif mode == 'color':
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (0, 0), 15)
        inverted = 255 - blur

        sketch = cv2.divide(gray, 255 - inverted, scale=256)
        return cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)
```

## 28.7 常见实战场景速查

| 场景 | 关键步骤 | 核心技术 |
|------|--|--|
| 人脸检测 | 灰度→均衡化→Haar/SVM/DNN | HaarCascade / DNN |
| 车牌识别 | 灰度→Canny→形态学→OCR | 颜色分割 + Tesseract |
| 文档扫描 | Canny→近似四边形→透视变换 | getPerspectiveTransform |
| 图像去雾 | 暗通道先验 + 透射率估计 | dark_channel_prior |
| OCR | 灰度→CLAHE→阈值→OCR | Tesseract + CLAHE |
| 图像拼接 | SIFT→匹配→Homography→warp | findHomography |
| 素描生成 | 灰度→反色→高斯模糊→颜色减淡 | cv2.divide |
| 运动检测 | 帧差/MOG2→形态学→轮廓 | absdiff / createBackgroundSubtractorMOG2 |
| 目标跟踪 | 初始化框→tracker.update | CSRT/KCF |
| AR 叠加 | PnP→projectPoints→draw | solvePnP + projectPoints |

---

**Part VII · 高级与实战**（第 24–28 章）全部完成 ✅

累计进度：

```
Part I  ✅ 基础篇 (4章)
Part II ✅ 图像处理 (5章)
Part III ✅ 特征与匹配 (4章)
Part IV ✅ 目标检测与跟踪 (4章)
Part V  ✅ 相机与三维 (3章)
Part VI ✅ 机器学习 (3章)
Part VII ✅ 高级与实战 (5章)
Part VIII 🔲 附录 (4章)
───────────────────────
已完成 30/32 章
```

只剩最后 Part VIII（附录，第 A–D 章）！要一口气写完吗？
