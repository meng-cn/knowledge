# 第二十一章 · KNN / SVM / 决策树

## 21.1 OpenCV 机器学习模块概述

OpenCV 的 `ml` 模块提供传统机器学习算法，不需要安装 scikit-learn 等第三方库。

```python
import cv2
import numpy as np

# OpenCV ML 模块提供的算法
algorithms = [
    'KNearest',       # K 近邻
    'SVM',            # 支持向量机
    'DTrees',         # 决策树
    'RTrees',         # 随机森林
    'Boost',          # AdaBoost
    'GBTrees',        # 梯度提升树
    'LogReg',         # 逻辑回归
    'NeuralNet',      # 神经网络（已废弃，用 DNN 模块）
    'ANN_MLP',        # 多层感知机（推荐 ✅）
    'NormalBayes',    # 朴素贝叶斯
    'EM',             # 期望最大化
    'ParametricNN',   # 参数神经网络
    'TreeEnsemble',   # 树集成（模型转换用）
    'RTrees',         # 随机森林
    'GBTrees',        # 梯度提升树
]
```

## 21.2 KNN（K 近邻）

### 21.2.1 基础用法

```python
# ---- 训练 ----
knn = cv2.ml.KNearest_create()

# trainData: (N, D) 特征矩阵
# labels: (N, 1) 标签（必须是 float32）
# trainingData = (trainData.astype(np.float32), labels.astype(np.float32))
knn.train(trainData, cv2.ROW_SAMPLE, labels.astype(np.float32))

# ---- 预测 ----
k = 5  # 近邻数
ret, results, neighbors, dist = knn.findNearest(
    testData, k=5
)
# ret: cv2.KNearest 对象
# results: (M,) 预测标签
# neighbors: (M, k) 最近邻的索引
# dist: (M, k) 距离
```

### 21.2.2 KNN 参数

```python
knn = cv2.ml.KNearest_create()
knn.setIsClassifier(True)     # True=分类, False=回归
knn.setAlgorithm(cv2.ml.KNearest_BINARY)  # BINARY 或 CORRELATION
# BINARY: 投票（多数表决）
# CORRELATION: 加权（距离倒数加权）

# 常用 k 值: 3, 5, 7, 9, 11（奇数避免平票）
# k = sqrt(N) 通常是个好的起点
```

## 21.3 SVM（支持向量机）

### 21.3.1 训练与预测

```python
svm = cv2.ml.SVM_create()

# ---- 参数设置 ----
svm.setType(cv2.ml.SVM_C_SVC)              # 分类类型
svm.setKernel(cv2.ml.SVM_LINEAR)            # 核函数
# cv2.ml.SVM_LINEAR, POLY, RBF, SIGMOID, CHI2, INTER

svm.setC(0.01)                               # 惩罚参数 C

# 多项式核参数（仅 POLY 核有效）
svm.setDegree(3)

# RBF/SIGMOID 核参数
svm.setGamma(1.0 / n_features)

# SIGMOID 偏置
svm.setCoef0(0)

# 终止条件
svm.setTermCriteria((cv2.TERM_CRITERIA_MAX_ITER, 1000, 1e-6))

# ---- 训练 ----
svm.train(trainData, cv2.ROW_SAMPLE, labels.astype(np.float32))

# ---- 预测 ----
ret, results = svm.predict(testData)
# ret: SVM 对象
# results: (M,) 预测结果
# 也可以直接用 svm.predict(testData) 直接返回结果

# ---- 保存/加载 ----
svm.save('svm_model.xml')
svm2 = cv2.ml.SVM.load('svm_model.xml')
```

### 21.3.2 SVM 核函数速查

| 核函数 | 公式 | 适用场景 |
|------|--|--|
| **LINEAR** | w·x + b | 高维稀疏（如 HOG）|
| **RBF** | exp(-γ‖x-y‖²) | 通用，推荐 ✅ |
| **POLY** | (γ·x·y + coef0)ᵈ | 多项式关系 |
| **SIGMOID** | tanh(γ·x·y + coef0) | 神经网络替代 |

### 21.3.3 超参数调优建议

```python
# RBF 核推荐参数
svm.setKernel(cv2.ml.SVM_RBF)
svm.setC(1.0)
svm.setGamma(1.0 / (n_features * trainData.std()**2))

# 或用网格搜索
from itertools import product
best_score = 0
best_C, best_gamma = 1, 0.01

for C, gamma in product([0.001, 0.01, 0.1, 1, 10], [0.001, 0.01, 0.1, 1]):
    svm.setC(C)
    svm.setGamma(gamma)
    svm.train(trainData, cv2.ROW_SAMPLE, labels.astype(np.float32))
    score = svm.get_default_grid_param(cv2.ml.SVM_C)  # 评估
    if score > best_score:
        best_score = score
        best_C, best_gamma = C, gamma
```

## 21.4 决策树 / 随机森林

```python
# ---- 决策树 ----
dtree = cv2.ml.DTrees_create()
dtree.setMaxDepth(10)          # 最大深度
dtree.setMinSampleCount(2)     # 叶节点最小样本数
dtree.setUseSurrogates(False)  # 是否使用代理分裂
dtree.setPriors(np.ones(2))    # 类别先验
dtree.setTruncatePrunedTree(False)
dtree.setRegressionAccuracy(0)

dtree.train(trainData, cv2.ROW_SAMPLE, labels.astype(np.float32))
_, results = dtree.predict(testData)

# ---- 随机森林 ----
rf = cv2.ml.RTrees_create()
rf.setMaxDepth(10)
rf.setMinSampleCount(2)
rf.setRegressionAccuracy(0)
rf.setUseSurrogates(False)
rf.setMaxNumOfTrees(10)        # 树的数量
rf.setActiveVarCount(0)        # 0=自动 (sqrt(n_features))

rf.train(trainData, cv2.ROW_SAMPLE, labels.astype(np.float32))
_, results = rf.predict(testData)
```

## 21.5 增强学习 / AdaBoost

```python
# ---- AdaBoost ----
boost = cv2.ml.Boost_create()
boost.setBoostType(cv2.ml.ADABoost_GAUSSIAN)  # GENTLE 或 GAUSSIAN
boost.setWeakCount(100)                        # 弱分类器数量
boost.setWeightTrimRate(0.95)                  # 截断率
boost.setMaxDepth(1)                           # 决策树深度（通常=1，决策桩）

boost.train(trainData, cv2.ROW_SAMPLE, labels.astype(np.float32))
_, results = boost.predict(testData)
```

## 21.6 多层感知机（ANN_MLP）

```python
# ---- 多层感知机 ----
mlp = cv2.ml.ANN_MLP_create()

# 网络结构（层大小）
layer_sizes = np.array([input_dim, 64, 32, output_dim], dtype=np.int32)
mlp.setLayerSizes(layer_sizes)

# 激活函数
mlp.setActivationFunction(cv2.ml.ANN_MLP_SIGMOID_SYM, 1, 1)
# SIGMOID_SYM, GAUSSIAN, RECTLINEAR, IDENTITY

# 训练参数
mlp.setTrainMethod(cv2.ml.ANN_MLP_BACKPROP)  # BACKPROP 或 RPROP
mlp.setBackpropWeightScale(0.1)
mlp.setBackpropMomentumScale(0.1)
mlp.setTermCriteria((cv2.TERM_CRITERIA_MAX_ITER, 1000, 0.001))

# 训练数据预处理
# labels_onehot = cv2.ml.ANN_MLP_SAMPLES_TO_MODEL_INPUT()  # 自动处理

mlp.train(trainData, cv2.ROW_SAMPLE, labels_onehot)
_, results = mlp.predict(testData)
```

## 21.7 算法对比与选择

| 算法 | 速度(训练) | 速度(预测) | 精度 | 适用场景 |
|------|--|--|--|--|
| **KNN** | ⚡⚡⚡ | ⚡ | ★★★ | 小数据集 |
| **SVM** | ⚡⚡ | ⚡⚡⚡ | ★★★★ | 中低维、分类 |
| **DT** | ⚡⚡⚡ | ⚡⚡⚡ | ★★★ | 可解释性 |
| **RF** | ⚡⚡ | ⚡⚡ | ★★★★ | 通用✅ |
| **Boost** | ⚡⚡ | ⚡⚡ | ★★★★ | 需要精确控制 |
| **MLP** | ⚡ | ⚡⚡ | ★★ | 非线性复杂 |

## 21.8 ML 模块速查

| 算法 | 创建 | 类型 | 核/参数 |
|------|--|--|--|
| KNN | `KNearest_create()` | k, 距离度量 |
| SVM | `SVM_create()` | 核函数, C, gamma |
| DT | `DTrees_create()` | maxDepth, minSampleCount |
| RF | `RTrees_create()` | numTrees, maxDepth |
| Boost | `Boost_create()` | weakCount, boostType |
| MLP | `ANN_MLP_create()` | layerSizes, activation |
| NB | `NormalBayes_create()` | 无需调参 |

---

> 下一章：[第二十二章 · K-Means / 图像量化](ch22-kmeans-quantization.md) →
