# 第二十八章 · 渲染图 (Render Graph)

## 28.1 Render Graph 概述

```
Render Graph = 将渲染 Pass 抽象为有向图

传统 Vulkan:
  手动管理资源、同步、依赖...
  容易出错，难优化

Render Graph:
  PassA → PassB → PassC
  │       │       │
  └─→ Framebuffer ←──┘

资源由 Graph 自动管理:
- 自动生成屏障
- 自动分配内存
- 自动同步
- 自动缓存共享资源
```

## 28.2 渲染图结构

```
Render Graph 示例:

         ┌───────┐
         │ Scene │
         └───┬───┘
             │ color, depth
             ▼
     ┌───────────────┐
     │  Shadow Pass   │
     └───────┬───────┘
             │ shadow map
             ▼
     ┌───────────────┐     ┌──────────┐
     │  Lighting Pass │────▶│  PostFX  │
     └───────┬───────┘     └────┬─────┘
             │ composite         │ screen
             └───────────────────┘

Pass 定义:
  Pass {
    name: "Scene"
    inputs: []
    outputs: [color, depth]
    dependencies: []
  }
  
  Pass {
    name: "Shadow"
    inputs: []
    outputs: [shadow_map]
    dependencies: []
  }
  
  Pass {
    name: "Lighting"
    inputs: [color, depth, shadow_map]
    outputs: [composite]
    dependencies: [Scene, Shadow]
  }
```

## 28.3 渲染图引擎

### 28.3.1 节点定义

```python
class PassNode:
    def __init__(self, name):
        self.name = name
        self.inputs = []   # 输入的附件
        self.outputs = []  # 输出的附件
        self.dependencies = []  # 依赖的 Pass
        self.commands = []  # 命令列表
        self.attachments = {}  # 本地附件

class RenderGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}  # 资源依赖图
        self.executed = False
    
    def add_pass(self, node: PassNode):
        self.nodes[node.name] = node
    
    def add_dependency(self, from_pass, to_pass):
        self.nodes[to_pass].dependencies.append(from_pass)
    
    def compile(self):
        # 1. 拓扑排序
        order = topological_sort(self.nodes)
        
        # 2. 资源分配
        for node in order:
            self.allocate_resources(node)
        
        # 3. 生成屏障
        self.generate_barriers(order)
        
        self.executed = True
        return order
    
    def execute(self, order):
        for node_name in order:
            node = self.nodes[node_name]
            self.execute_node(node)
    
    def allocate_resources(self, node):
        """自动分配资源"""
        for output in node.outputs:
            if output not in self.resource_map:
                self.resource_map[output] = create_render_target(...)
    
    def generate_barriers(self, order):
        """自动生成资源屏障"""
        for i, node_name in enumerate(order):
            node = self.nodes[node_name]
            for input_name in node.inputs:
                prev_node_name = self.find_producer(input_name, order[:i])
                if prev_node_name:
                    prev_node = self.nodes[prev_node_name]
                    self.add_barrier(prev_node, node, input_name)
```

### 28.3.2 渲染图实现

```python
import vkbottle

class SimpleRenderGraph:
    def __init__(self, device, queue, width, height):
        self.device = device
        self.queue = queue
        self.width = width
        self.height = height
        self.passes = []
        self.resources = {}
        self.barriers = {}
    
    def add_pass(self, name, dependencies, inputs, outputs, execute_fn):
        self.passes.append({
            'name': name,
            'dependencies': dependencies,
            'inputs': inputs,
            'outputs': outputs,
            'execute': execute_fn,
        })
    
    def compile(self):
        # 拓扑排序
        visited = set()
        order = []
        
        def visit(name):
            if name in visited:
                return
            visited.add(name)
            node = next(p for p in self.passes if p['name'] == name)
            for dep in node['dependencies']:
                visit(dep)
            order.append(name)
        
        for pass_ in self.passes:
            visit(pass_['name'])
        
        # 生成屏障
        for i, name in enumerate(order):
            node = next(p for p in self.passes if p['name'] == name)
            for output in node['outputs']:
                if output not in self.barriers:
                    self.barriers[output] = []
            for input_ in node['inputs']:
                if input_ in self.barriers:
                    self.barriers[input_].append(name)
        
        return order
    
    def execute(self, cmd_buffer):
        order = self.compile()
        for name in order:
            node = next(p for p in self.passes if p['name'] == name)
            
            # 生成屏障
            for input_ in node['inputs']:
                if input_ in self.barriers:
                    cmd_buffer.pipeline_barrier(
                        srcStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
                        dstStageMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_READ,
                        dependencyFlags=vkbottle.SubpassDependencyFlag.NONE,
                        memoryBarriers=[],
                        bufferMemoryBarriers=[],
                        imageMemoryBarriers=[
                            vkbottle.ImageMemoryBarrier(
                                srcAccessMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_WRITE,
                                dstAccessMask=vkbottle.AccessFlag.COLOR_ATTACHMENT_READ,
                                oldLayout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
                                newLayout=vkbottle.ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
                                srcQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
                                dstQueueFamilyIndex=vkbottle.QFO_TRANSFER_QUEUE_FAMILY_IGNORED,
                                image=self.resources[input_],
                                subresourceRange=vkbottle.ImageSubresourceRange(
                                    aspectMask=vkbottle.ImageAspectFlag.COLOR_BIT,
                                    baseMipLevel=0,
                                    levelCount=1,
                                    baseArrayLayer=0,
                                    layerCount=1,
                                ),
                            ),
                        ],
                    )
            
            # 执行 Pass
            node['execute'](cmd_buffer)
```

## 28.4 渲染图优势

| 传统 Vulkan | Render Graph |
|--|--|
| 手动资源管理 | 自动资源管理 |
| 手动同步 | 自动生成屏障 |
| 手动依赖分析 | 拓扑排序 |
| 难优化 | 可合并 Pass |
| 难调试 | 可视化图结构 |
| 资源复用复杂 | 自动缓存共享资源 |

## 28.5 渲染图速查

| 概念 | 说明 |
| **Pass** | 一个渲染通道 |
| **Node** | Pass 节点（有向图节点）|
| **Edge** | Pass 依赖（有向图边）|
| **Resource** | 共享资源（颜色、深度、纹理）|
| **Barrier** | 自动生成资源屏障 |
| **Compile** | 编译图（拓扑排序+资源分配）|
| **Execute** | 执行图（按拓扑顺序执行 Pass）|

---

| 26-27 | ✅ |
| **28. 渲染图** | ✅ |
| 29-30 | 🔲 |