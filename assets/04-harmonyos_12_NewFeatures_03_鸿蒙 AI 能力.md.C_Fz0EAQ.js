import{_ as n,o as a,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const u=JSON.parse('{"title":"鸿蒙 AI 能力","description":"","frontmatter":{},"headers":[],"relativePath":"04-harmonyos/12_NewFeatures/03_鸿蒙 AI 能力.md","filePath":"04-harmonyos/12_NewFeatures/03_鸿蒙 AI 能力.md"}'),l={name:"04-harmonyos/12_NewFeatures/03_鸿蒙 AI 能力.md"};function i(t,s,c,o,r,d){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="鸿蒙-ai-能力" tabindex="-1">鸿蒙 AI 能力 <a class="header-anchor" href="#鸿蒙-ai-能力" aria-label="Permalink to &quot;鸿蒙 AI 能力&quot;">​</a></h1><h2 id="_1-鸿蒙-ai-生态概述" tabindex="-1">1. 鸿蒙 AI 生态概述 <a class="header-anchor" href="#_1-鸿蒙-ai-生态概述" aria-label="Permalink to &quot;1. 鸿蒙 AI 生态概述&quot;">​</a></h2><h3 id="_1-1-ai-在鸿蒙中的定位" tabindex="-1">1.1 AI 在鸿蒙中的定位 <a class="header-anchor" href="#_1-1-ai-在鸿蒙中的定位" aria-label="Permalink to &quot;1.1 AI 在鸿蒙中的定位&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>鸿蒙 AI 架构：</span></span>
<span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用层 AI 组件                                    │</span></span>
<span class="line"><span>│  ├── ArkAI 组件库（语音/图像/文本）                │</span></span>
<span class="line"><span>│  ├── AI 推荐引擎                                   │</span></span>
<span class="line"><span>│  └── AI 搜索                                      │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  端侧 AI 推理框架                                  │</span></span>
<span class="line"><span>│  ├── mindspore-lite（端侧推理引擎）               │</span></span>
<span class="line"><span>│  ├── Ascend NPU 驱动                              │</span></span>
<span class="line"><span>│  ├── CPU/GPU 通用推理                              │</span></span>
<span class="line"><span>│  └── AI 模型管理（加载/部署/卸载）                 │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  系统级 AI 服务                                    │</span></span>
<span class="line"><span>│  ├── 小艺（Celia）AI 助手                          │</span></span>
<span class="line"><span>│  ├── AI 输入法                                     │</span></span>
<span class="line"><span>│  ├── AI 相机（场景识别/美颜）                      │</span></span>
<span class="line"><span>│  ├── AI 音频（降噪/语音识别）                      │</span></span>
<span class="line"><span>│  └── AI 系统（智能调度/能耗优化）                  │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  云侧 AI 服务                                      │</span></span>
<span class="line"><span>│  ├── AGC AI 服务（云侧大模型）                     │</span></span>
<span class="line"><span>│  ├── AI 模型训练                                   │</span></span>
<span class="line"><span>│  └── AI 知识更新                                   │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="_2-端侧-ai-推理" tabindex="-1">2. 端侧 AI 推理 <a class="header-anchor" href="#_2-端侧-ai-推理" aria-label="Permalink to &quot;2. 端侧 AI 推理&quot;">​</a></h2><h3 id="_2-1-mindspore-lite" tabindex="-1">2.1 MindSpore Lite <a class="header-anchor" href="#_2-1-mindspore-lite" aria-label="Permalink to &quot;2.1 MindSpore Lite&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MindSpore Lite 是鸿蒙的端侧 AI 推理框架：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────┐</span></span>
<span class="line"><span>│  MindSpore Lite                       │</span></span>
<span class="line"><span>│  ├── 模型格式：.om（MindSpore 优化格式）│</span></span>
<span class="line"><span>│  ├── 推理引擎：CPU / GPU / NPU        │</span></span>
<span class="line"><span>│  ├── 支持框架：PyTorch / TensorFlow / ONNX │</span></span>
<span class="line"><span>│  ├── 量化支持：INT8 / FP16 / BF16     │</span></span>
<span class="line"><span>│  └── 硬件适配：Kirin NPU / CPU / GPU  │</span></span>
<span class="line"><span>└──────────────────────────────────────┘</span></span></code></pre></div><h3 id="_2-2-端侧-ai-模型使用" tabindex="-1">2.2 端侧 AI 模型使用 <a class="header-anchor" href="#_2-2-端侧-ai-模型使用" aria-label="Permalink to &quot;2.2 端侧 AI 模型使用&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 1. 加载 AI 模型</span></span>
<span class="line"><span>import { aiModel } from &#39;@kit.AiKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function loadModel() {</span></span>
<span class="line"><span>  const model = await aiModel.loadModel({</span></span>
<span class="line"><span>    modelPath: &#39;/data/user/0/com.example/models/resnet50.om&#39;,</span></span>
<span class="line"><span>    provider: aiModel.Provider.MINDSPORE,</span></span>
<span class="line"><span>    config: {</span></span>
<span class="line"><span>      deviceTypes: [aiModel.DeviceType.NPU], // 优先使用 NPU</span></span>
<span class="line"><span>      quantization: aiModel.QuantizationType.INT8</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  return model;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 创建推理会话</span></span>
<span class="line"><span>async function createSession(model: aiModel.Model) {</span></span>
<span class="line"><span>  const session = await model.createSession({</span></span>
<span class="line"><span>    inputShape: [1, 224, 224, 3],  // NCHW 格式</span></span>
<span class="line"><span>    outputShape: [1, 1000],</span></span>
<span class="line"><span>    maxMemorySize: 1024 * 1024 * 64 // 64MB</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  return session;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 执行推理</span></span>
<span class="line"><span>async function predict(session: aiModel.Session, input: ArrayBuffer): Promise&lt;Float32Array&gt; {</span></span>
<span class="line"><span>  // 创建输入 Tensor</span></span>
<span class="line"><span>  const inputTensor = await aiModel.createTensor({</span></span>
<span class="line"><span>    type: aiModel.TensorType.FLOAT32,</span></span>
<span class="line"><span>    shape: [1, 224, 224, 3],</span></span>
<span class="line"><span>    data: input</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 执行推理</span></span>
<span class="line"><span>  const outputTensors = await session.predict([inputTensor]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 获取结果</span></span>
<span class="line"><span>  const result = outputTensors[0].getData() as Float32Array;</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_2-3-端侧模型优化" tabindex="-1">2.3 端侧模型优化 <a class="header-anchor" href="#_2-3-端侧模型优化" aria-label="Permalink to &quot;2.3 端侧模型优化&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>端侧模型优化策略：</span></span>
<span class="line"><span>├── 模型量化：FP32 → INT8，减少 75% 内存，加速 2-3x</span></span>
<span class="line"><span>├── 模型剪枝：去除不重要的神经元</span></span>
<span class="line"><span>├── 知识蒸馏：大模型 → 小模型</span></span>
<span class="line"><span>├── 算子融合：减少内核启动开销</span></span>
<span class="line"><span>├── NPU 加速：利用 Kirin NPU 硬件加速</span></span>
<span class="line"><span>├── 动态图优化：编译期优化计算图</span></span>
<span class="line"><span>└── 缓存：复用中间结果</span></span></code></pre></div><h2 id="_3-ai-组件集成" tabindex="-1">3. AI 组件集成 <a class="header-anchor" href="#_3-ai-组件集成" aria-label="Permalink to &quot;3. AI 组件集成&quot;">​</a></h2><h3 id="_3-1-语音识别组件" tabindex="-1">3.1 语音识别组件 <a class="header-anchor" href="#_3-1-语音识别组件" aria-label="Permalink to &quot;3.1 语音识别组件&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 语音识别</span></span>
<span class="line"><span>import { speech } from &#39;@kit.AiKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class SpeechService {</span></span>
<span class="line"><span>  private recognizer: speech.Recognizer | null = null;</span></span>
<span class="line"><span>  private isListening: boolean = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async startRecognition() {</span></span>
<span class="line"><span>    this.recognizer = await speech.createRecognizer({</span></span>
<span class="line"><span>      language: &#39;zh-CN&#39;,</span></span>
<span class="line"><span>      sampleRate: 16000,</span></span>
<span class="line"><span>      format: speech.AudioFormat.PCM</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.recognizer.on(&#39;result&#39;, (text: string) =&gt; {</span></span>
<span class="line"><span>      console.log(&#39;识别结果: &#39; + text);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.recognizer.on(&#39;error&#39;, (err: Error) =&gt; {</span></span>
<span class="line"><span>      console.error(&#39;识别错误: &#39; + err.message);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.isListening = true;</span></span>
<span class="line"><span>    await this.recognizer.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async stopRecognition() {</span></span>
<span class="line"><span>    if (this.recognizer &amp;&amp; this.isListening) {</span></span>
<span class="line"><span>      this.isListening = false;</span></span>
<span class="line"><span>      await this.recognizer.stop();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-2-图像识别组件" tabindex="-1">3.2 图像识别组件 <a class="header-anchor" href="#_3-2-图像识别组件" aria-label="Permalink to &quot;3.2 图像识别组件&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 图像识别（物体检测/场景识别）</span></span>
<span class="line"><span>import { vision } from &#39;@kit.AiKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class VisionService {</span></span>
<span class="line"><span>  private detector: vision.ObjectDetector | null = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async init() {</span></span>
<span class="line"><span>    this.detector = await vision.createObjectDetector({</span></span>
<span class="line"><span>      modelPath: &#39;/models/object_detection.om&#39;,</span></span>
<span class="line"><span>      provider: vision.Provider.MINDSPORE</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async detect(image: PixelMap): Promise&lt;vio.Object[]&gt; {</span></span>
<span class="line"><span>    if (!this.detector) throw new Error(&#39;Detector not initialized&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const results = await this.detector.detect(image, {</span></span>
<span class="line"><span>      confidenceThreshold: 0.7,</span></span>
<span class="line"><span>      maxResults: 10</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return results.map(r =&gt; ({</span></span>
<span class="line"><span>      label: r.label,</span></span>
<span class="line"><span>      confidence: r.confidence,</span></span>
<span class="line"><span>      boundingBox: r.boundingBox</span></span>
<span class="line"><span>    }));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_3-3-ai-推荐组件" tabindex="-1">3.3 AI 推荐组件 <a class="header-anchor" href="#_3-3-ai-推荐组件" aria-label="Permalink to &quot;3.3 AI 推荐组件&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// AI 推荐</span></span>
<span class="line"><span>import { recommend } from &#39;@kit.AiKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class RecommendationService {</span></span>
<span class="line"><span>  private recommender: recommend.Recommender | null = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async init() {</span></span>
<span class="line"><span>    this.recommender = await recommend.createRecommender({</span></span>
<span class="line"><span>      modelPath: &#39;/models/recommend.om&#39;,</span></span>
<span class="line"><span>      userFeatures: [&#39;age&#39;, &#39;gender&#39;, &#39;history&#39;],</span></span>
<span class="line"><span>      itemFeatures: [&#39;category&#39;, &#39;price&#39;, &#39;tags&#39;]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async recommend(userId: string, count: number = 10): Promise&lt;recommend.Recommendation[]&gt; {</span></span>
<span class="line"><span>    const recommendations = await this.recommender!.recommend(</span></span>
<span class="line"><span>      { userId: userId },</span></span>
<span class="line"><span>      count</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    return recommendations;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  async updateFeedback(userId: string, itemId: string, rating: number) {</span></span>
<span class="line"><span>    await this.recommender!.updateFeedback(userId, itemId, rating);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_4-端云协同-ai" tabindex="-1">4. 端云协同 AI <a class="header-anchor" href="#_4-端云协同-ai" aria-label="Permalink to &quot;4. 端云协同 AI&quot;">​</a></h2><h3 id="_4-1-端云协同架构" tabindex="-1">4.1 端云协同架构 <a class="header-anchor" href="#_4-1-端云协同架构" aria-label="Permalink to &quot;4.1 端云协同架构&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>端云协同策略：</span></span>
<span class="line"><span>┌───────────────────────┬───────────────────┐</span></span>
<span class="line"><span>│      端侧 (On-Device) │   云侧 (Cloud)     │</span></span>
<span class="line"><span>├───────────────────────┼───────────────────┤</span></span>
<span class="line"><span>│ 轻量模型推理           │  大模型推理          │</span></span>
<span class="line"><span>│ 隐私数据处理           │  大数据训练          │</span></span>
<span class="line"><span>│ 离线可用               │  模型更新/训练       │</span></span>
<span class="line"><span>│ 低延迟 (&lt; 100ms)      │  高复杂度计算        │</span></span>
<span class="line"><span>│ 节省带宽               │  知识更新            │</span></span>
<span class="line"><span>└───────────────────────┴───────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>协同策略：</span></span>
<span class="line"><span>├── 简单任务 → 端侧（离线、低延迟、隐私）</span></span>
<span class="line"><span>├── 复杂任务 → 云端（大模型、高准确度）</span></span>
<span class="line"><span>├── 反馈循环 → 端侧结果反馈到云端（模型优化）</span></span>
<span class="line"><span>└── 模型同步 → 云端更新推送到端侧</span></span></code></pre></div><h3 id="_4-2-端云协同示例" tabindex="-1">4.2 端云协同示例 <a class="header-anchor" href="#_4-2-端云协同示例" aria-label="Permalink to &quot;4.2 端云协同示例&quot;">​</a></h3><div class="language-arkts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">arkts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 端云协同推理</span></span>
<span class="line"><span>import { aiInference } from &#39;@kit.AiKit&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function smartInference(image: PixelMap): Promise&lt;InferenceResult&gt; {</span></span>
<span class="line"><span>  // 1. 先尝试端侧推理</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    const onDeviceResult = await aiInference.onDevicePredict(image);</span></span>
<span class="line"><span>    if (onDeviceResult.confidence &gt; 0.8) {</span></span>
<span class="line"><span>      return onDeviceResult;  // 端侧置信度高，直接使用</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } catch (e) {</span></span>
<span class="line"><span>    // 端侧推理失败</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 2. 端侧置信度低，切换到云端</span></span>
<span class="line"><span>  const cloudResult = await aiInference.cloudPredict(image);</span></span>
<span class="line"><span>  return cloudResult;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 结果反馈（用于模型优化）</span></span>
<span class="line"><span>async function feedbackResult(result: InferenceResult) {</span></span>
<span class="line"><span>  if (result.isCloudResult) {</span></span>
<span class="line"><span>    // 云端推理结果反馈到云端，用于模型优化</span></span>
<span class="line"><span>    await aiInference.sendFeedback({</span></span>
<span class="line"><span>      image: result.imageHash,</span></span>
<span class="line"><span>      prediction: result.prediction,</span></span>
<span class="line"><span>      confidence: result.confidence</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_5-ai-应用场景" tabindex="-1">5. AI 应用场景 <a class="header-anchor" href="#_5-ai-应用场景" aria-label="Permalink to &quot;5. AI 应用场景&quot;">​</a></h2><h3 id="_5-1-ai-相机" tabindex="-1">5.1 AI 相机 <a class="header-anchor" href="#_5-1-ai-相机" aria-label="Permalink to &quot;5.1 AI 相机&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AI 相机能力：</span></span>
<span class="line"><span>├── 场景识别：自动识别场景（风景/人像/美食）</span></span>
<span class="line"><span>├── 美颜：AI 美颜/瘦脸/大眼</span></span>
<span class="line"><span>├── HDR：AI 多帧合成 HDR</span></span>
<span class="line"><span>├── 夜景：AI 夜景增强</span></span>
<span class="line"><span>├── 物体检测：自动对焦/测光到物体</span></span>
<span class="line"><span>├── 文字识别：OCR 实时识别</span></span>
<span class="line"><span>└── 生成式 AI：AI 消除/AI 扩图</span></span></code></pre></div><h3 id="_5-2-ai-输入法" tabindex="-1">5.2 AI 输入法 <a class="header-anchor" href="#_5-2-ai-输入法" aria-label="Permalink to &quot;5.2 AI 输入法&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AI 输入法能力：</span></span>
<span class="line"><span>├── 语音转文字：实时语音识别</span></span>
<span class="line"><span>├── 智能预测：基于上下文的词组预测</span></span>
<span class="line"><span>├── 跨语言翻译：实时翻译</span></span>
<span class="line"><span>├── 手写识别：手写转文字</span></span>
<span class="line"><span>└── 表情推荐：根据语境推荐表情</span></span></code></pre></div><h3 id="_5-3-ai-系统" tabindex="-1">5.3 AI 系统 <a class="header-anchor" href="#_5-3-ai-系统" aria-label="Permalink to &quot;5.3 AI 系统&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AI 系统优化：</span></span>
<span class="line"><span>├── 智能调度：AI 调度 CPU/GPU/NPU 资源</span></span>
<span class="line"><span>├── 能耗优化：AI 预测用户习惯，优化功耗</span></span>
<span class="line"><span>├── 内存优化：AI 预测内存需求，预加载</span></span>
<span class="line"><span>├── 存储优化：AI 预测访问模式，预加载数据</span></span>
<span class="line"><span>└── 网络优化：AI 预测网络需求，预加载内容</span></span></code></pre></div><h2 id="_6-ai-开发指南" tabindex="-1">6. AI 开发指南 <a class="header-anchor" href="#_6-ai-开发指南" aria-label="Permalink to &quot;6. AI 开发指南&quot;">​</a></h2><h3 id="_6-1-开发流程" tabindex="-1">6.1 开发流程 <a class="header-anchor" href="#_6-1-开发流程" aria-label="Permalink to &quot;6.1 开发流程&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AI 应用开发流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. 模型选择/训练                                  │</span></span>
<span class="line"><span>│     → 云端训练大模型 → 导出 .om 格式               │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  2. 模型优化                                      │</span></span>
<span class="line"><span>│     → 量化（FP32 → INT8）                          │</span></span>
<span class="line"><span>│     → 剪枝/蒸馏                                    │</span></span>
<span class="line"><span>│     → 算子融合                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  3. 端侧部署                                      │</span></span>
<span class="line"><span>│     → 模型打包到应用                               │</span></span>
<span class="line"><span>│     → MindSpore Lite 加载                          │</span></span>
<span class="line"><span>│     → NPU/CPU/GPU 适配                            │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  4. 推理集成                                      │</span></span>
<span class="line"><span>│     → 创建推理会话                                 │</span></span>
<span class="line"><span>│     → 输入预处理                                   │</span></span>
<span class="line"><span>│     → 执行推理                                     │</span></span>
<span class="line"><span>│     → 结果后处理                                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  5. 性能优化                                      │</span></span>
<span class="line"><span>│     → NPU 硬件加速                                │</span></span>
<span class="line"><span>│     → 模型缓存                                    │</span></span>
<span class="line"><span>│     → 批量推理                                    │</span></span>
<span class="line"><span>│     → 异步推理                                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_6-2-模型格式" tabindex="-1">6.2 模型格式 <a class="header-anchor" href="#_6-2-模型格式" aria-label="Permalink to &quot;6.2 模型格式&quot;">​</a></h3><table tabindex="0"><thead><tr><th>格式</th><th>说明</th><th>适用场景</th></tr></thead><tbody><tr><td><strong>.om</strong></td><td>MindSpore 优化模型</td><td>鸿蒙端侧（推荐）</td></tr><tr><td><strong>.onnx</strong></td><td>ONNX 通用模型</td><td>跨平台推理</td></tr><tr><td><strong>.tflite</strong></td><td>TensorFlow Lite</td><td>Android/iOS</td></tr><tr><td><strong>.pt</strong></td><td>PyTorch 模型</td><td>训练阶段</td></tr><tr><td><strong>.pb</strong></td><td>TensorFlow 模型</td><td>训练/转换阶段</td></tr></tbody></table><h2 id="_7-🎯-面试高频考点" tabindex="-1">7. 🎯 面试高频考点 <a class="header-anchor" href="#_7-🎯-面试高频考点" aria-label="Permalink to &quot;7. 🎯 面试高频考点&quot;">​</a></h2><h3 id="q1-鸿蒙端侧-ai-推理的工作原理" tabindex="-1">Q1: 鸿蒙端侧 AI 推理的工作原理？ <a class="header-anchor" href="#q1-鸿蒙端侧-ai-推理的工作原理" aria-label="Permalink to &quot;Q1: 鸿蒙端侧 AI 推理的工作原理？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li>使用 mindspore-lite 端侧推理引擎</li><li>模型格式为 .om（MindSpore 优化格式）</li><li>支持 NPU/CPU/GPU 多种硬件加速</li><li>支持 INT8/FP16 量化，减少内存和加速推理</li><li>通过 @kit.AiKit 加载、创建会话、执行推理</li><li>与云端协同：简单任务端侧，复杂任务云端</li></ul><h3 id="q2-端云协同-ai-的优势" tabindex="-1">Q2: 端云协同 AI 的优势？ <a class="header-anchor" href="#q2-端云协同-ai-的优势" aria-label="Permalink to &quot;Q2: 端云协同 AI 的优势？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>延迟</strong>：端侧推理低延迟（&lt; 100ms），适合实时场景</li><li><strong>隐私</strong>：隐私数据在端侧处理，不上传云端</li><li><strong>离线</strong>：端侧无需网络，离线可用</li><li><strong>成本</strong>：端侧推理减少云端计算成本</li><li><strong>准确度</strong>：云端大模型提供高准确度</li><li><strong>自适应</strong>：根据置信度自动选择端侧或云端</li></ul><h3 id="q3-端侧模型如何优化" tabindex="-1">Q3: 端侧模型如何优化？ <a class="header-anchor" href="#q3-端侧模型如何优化" aria-label="Permalink to &quot;Q3: 端侧模型如何优化？&quot;">​</a></h3><p><strong>答要点</strong>：</p><ul><li><strong>量化</strong>：FP32 → INT8，减少 75% 内存，加速 2-3x</li><li><strong>剪枝</strong>：去除不重要的神经元</li><li><strong>知识蒸馏</strong>：大模型 → 小模型</li><li><strong>算子融合</strong>：减少内核启动开销</li><li><strong>NPU 加速</strong>：利用 Kirin NPU 硬件加速</li><li><strong>缓存</strong>：复用中间结果和输出</li></ul><hr><blockquote><p><strong>💡 面试提示</strong>：鸿蒙 AI 是前沿方向。重点掌握 <strong>端侧推理框架（mindspore-lite）</strong>、<strong>端云协同策略</strong>、<strong>模型优化方法</strong>。展示对鸿蒙 AI 生态的理解。</p></blockquote>`,47)])])}const g=n(l,[["render",i]]);export{u as __pageData,g as default};
