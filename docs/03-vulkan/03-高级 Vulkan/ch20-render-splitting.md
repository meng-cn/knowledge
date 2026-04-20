# 第十九章 · 渲染分割 (Render Splitting)

## 19.1 渲染模式对比

```
渲染分割 = 将渲染任务分成多个 Pass，每个 Pass 处理不同的渲染任务

三种主要渲染模式:
┌───────────────────────────────┐
│ 前向渲染 (Forward Rendering)   │
│ 最亮的物体在最前              │
│ 每个像素计算所有光源          │
└───────────────────────────────┘
┌───────────────────────────────┐
│ 延迟渲染 (Deferred Rendering) │
│ 先渲染 G-Buffer              │
│ 再对每个像素计算所有光源      │
└───────────────────────────────┘
┌───────────────────────────────┐
│ Clustered/Forward+ Rendering  │
│ 将空间分簇，每簇计算部分光源  │
│ 前向的改进版                  │
└───────────────────────────────┘
```

## 19.2 前向渲染 (Forward Rendering)

```
前向渲染 = 传统渲染模式

流程:
1. 按深度排序物体（近到远）
2. 对每个物体：
   - 设置 Uniform（模型、视角、光照）
   - 渲染物体（绘制调用）
3. 后处理

优点:
  - 实现简单
  - 对少量光源高效
  - 透明物体处理简单

缺点:
  - 光源多时性能差（O(N光源 × N物体)）
  - 重复计算（相同光照被多个物体重新计算）
```

### 19.2.1 前向渲染管线

```python
def forward_render(scene, camera):
    # 1. 渲染不透明物体（按深度排序）
    opaque_objects = sorted(scene.objects, 
                          key=lambda o: distance(camera.pos, o.pos))
    
    for obj in opaque_objects:
        update_ubo(camera, obj)
        bind_pipeline(obj.material)
        bind_descriptor_sets(obj.material)
        draw(obj.mesh)
    
    # 2. 渲染透明物体（从后往前）
    transparent_objects = sorted(scene.transparent_objects, 
                                key=lambda o: distance(camera.pos, o.pos), 
                                reverse=True)
    
    for obj in transparent_objects:
        enable_blending()
        update_ubo(camera, obj)
        bind_pipeline(obj.material)
        draw(obj.mesh)
    
    # 3. 后处理
    render_pass_post_process()
```

## 19.3 延迟渲染 (Deferred Rendering)

```
延迟渲染 = 先渲染几何信息，再计算光照

Pass 1: Geometry Pass (G-Buffer)
  ┌──────┐ ┌───┐ ┌───┐ ┌──────┐
  │ Pos   │ │ Norm│ │ Col │ │ Depth │
  └───────┘ └───┘ └───┘ └──────┘
  所有物体渲染到 G-Buffer（4 个纹理附件）

Pass 2: Lighting Pass
  ┌────────┐ ┌───────┐ ┌───────┐
  │ PointLight1 → G-Buffer → 计算所有光源 │
  │ PointLight2 → G-Buffer → 每个像素计算所有光源 │
  │ DirectionalLight → G-Buffer → 高效！ │
  └───────┘ └───────┘ └───────┘

优点:
  - 光源数量不影响性能（O(光源) = O(像素)）
  - 无重复计算

缺点:
  - MSAA 困难
  - 透明物体处理复杂
  - 内存带宽要求高
```

### 19.3.1 G-Buffer 创建

```python
# --- 创建 G-Buffer ---
g_buffer_attachments = [
    # 位置
    create_render_target(device, width, height, vkbottle.Format.R32G32B32_SFLOAT),
    # 法线
    create_render_target(device, width, height, vkbottle.Format.R16G16B16A16_SFLOAT),
    # 颜色/材质
    create_render_target(device, width, height, vkbottle.Format.R16G16B16A16_SFLOAT),
    # 深度
    create_depth_image(device, width, height),
]
```

### 19.3.2 光照 Pass

```python
# 光照 Pass 只渲染一个全屏四边形
# Shader 从 G-Buffer 读取信息并计算光照
def lighting_pass(device, command_buffer, g_buffer, lights, viewport):
    # 1. 开始 Render Pass（使用 G-Buffer 作为附件）
    render_pass_begin_info = vkbottle.RenderPassBeginInfo(
        renderPass=g_buffer_render_pass,
        framebuffer=g_buffer_framebuffer,
        renderArea=vkbottle.Rect2D(offset=(0, 0), extent=viewport),
    )
    
    # 2. 绑定全屏四边形管线
    command_buffer.bind_pipeline_graphics(light_pipeline)
    
    # 3. 绑定 G-Buffer 描述符
    command_buffer.bind_descriptor_sets(
        vkbottle.PipelineBindPoint.GRAPHICS,
        light_pipeline_layout,
        [g_buffer_descriptor_set],
    )
    
    # 4. 绑定光源 Uniform
    command_buffer.bind_descriptor_sets(
        vkbottle.PipelineBindPoint.GRAPHICS,
        light_pipeline_layout,
        [light_descriptor_set],
    )
    
    # 5. 绘制全屏四边形
    command_buffer.draw(vertexCount=3, instanceCount=1, 
                       firstVertex=0, firstInstance=0)
    
    # 6. 结束
    command_buffer.end_render_pass()
```

## 19.4 Clustered/Forward+ Rendering

```
Clustered Rendering = 空间分簇 + 前向渲染

1. 将相机视锥体分簇（3D grid）
2. 对每个光源，确定它影响的簇
3. 对每个簇，只渲染影响该簇的光源

优点:
  - 前向的性能
  - 延迟的扩展性
  - 混合两种模式的优点

复杂度:
  - 高（需要 GPU 计算着色器）
  - 需要 Cluster 分配
  - 需要 Cluster 感知的光源查询
```

## 19.5 多 Pass 渲染流程

```
多 Pass 渲染通用流程:

Pass 1: Scene → G-Buffer/RT1
Pass 2: RT1 → RT2 (后处理)
Pass 3: RT2 → Screen (呈现)

每个 Pass 需要:
  1. 新的 Render Pass（或复用）
  2. 新的 Framebuffer
  3. 同步屏障（确保数据就绪）
  4. 切换 Pipeline
  5. 切换描述符
```

---

| 16-18 | ✅ |
| **19. 渲染分割** | ✅ |
| 20-25 | 🔲 |