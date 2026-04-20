# 第二十六章 · 内存管理进阶

## 26.1 内存类型 vs 内存堆

```
Vulkan 内存层次结构:
────────────────────────────
Physical Device
├── Memory Heaps (内存堆)
│   ├── Heap 0: 16 GB GPU Local (显存)
│   ├── Heap 1: 8 GB GPU Local (显存)
│   ├── Heap 2: 4 GB Host Visible (系统内存)
│   └── Heap 3: ...
│
└── Memory Types (内存类型)
    ├── Type 0: Heap 0, DEVICE_LOCAL | HOST_VISIBLE
    ├── Type 1: Heap 0, DEVICE_LOCAL
    ├── Type 2: Heap 1, DEVICE_LOCAL
    ├── Type 3: Heap 2, HOST_VISIBLE | HOST_COHERENT
    └── Type 4: Heap 2, HOST_VISIBLE | HOST_COHERENT | HOST_NON_COHERENT
```

## 26.2 内存属性标志

```python
# 内存属性
DEVICE_LOCAL = vkbottle.MemoryPropertyFlag.DEVICE_LOCAL       # GPU 本地
DEVICE_VISIBLE = vkbottle.MemoryPropertyFlag.DEVICE_VISIBLE    # GPU 可访问
HOST_VISIBLE = vkbottle.MemoryPropertyFlag.HOST_VISIBLE        # CPU 可映射
HOST_COHERENT = vkbottle.MemoryPropertyFlag.HOIST_COHERENT     # 自动同步
HOST_CACHED = vkbottle.MemoryPropertyFlag.HOIST_CACHED         # CPU 缓存
LAZILY_ALLOCATED = vkbottle.MemoryPropertyFlag.LAZY_ALLOCATED   # 延迟分配
PROTECTED = vkbottle.MemoryPropertyFlag.PROTECTED              # 保护内存

# 选择内存类型的策略:
# 1. Buffer 上传 → HOST_VISIBLE + HOST_COHERENT (CPU 映射)
# 2. Buffer 使用 → DEVICE_LOCAL (GPU 本地，最快)
# 3. Uniform → DEVICE_LOCAL + HOST_VISIBLE (需要更新)
# 4. Image → DEVICE_LOCAL (几乎总是)
```

## 26.3 内存分配流程

### 26.3.1 查询内存类型

```python
# 查询可用内存类型
mem_props = device.get_physical_device().get_memory_properties()

def find_memory_type_index(mem_props, type_bits, property_flags):
    """查找满足条件的内存类型索引"""
    for i in range(mem_props.memory_type_count):
        if (type_bits & (1 << i)) and \
           (mem_props.memory_types[i].propertyFlags & property_flags) == property_flags:
            return i
    raise RuntimeError("No suitable memory type found!")

# 示例: 找 DEVICE_LOCAL 内存
mem_type_idx = find_memory_type_index(
    mem_props,
    0xFFFFFFFF,  # 所有类型都匹配
    vkbottle.MemoryPropertyFlag.DEVICE_LOCAL
)

# 示例: 找 HOST_VISIBLE 内存
mem_type_idx = find_memory_type_index(
    mem_props,
    0xFFFFFFFF,
    vkbottle.MemoryPropertyFlag.HOST_VISIBLE | vkbottle.MemoryPropertyFlag.HOIST_COHERENT
)
```

### 26.3.2 内存分配

```python
# 分配内存
mem_alloc = vkbottle.MemoryAllocateInfo(
    allocationSize=buffer_requirements.size,
    memoryTypeIndex=mem_type_idx,  # 从 find_memory_type_index 获得
)
device_memory = device.allocate_memory(mem_alloc)

# 绑定内存
device.bind_buffer_memory(buffer, device_memory, 0)
```

## 26.4 内存对齐要求

```python
# Buffer 大小对齐
# 1. Buffer 大小必须是 256 字节倍数（UBO 对齐）
# 2. Buffer 对齐要求
align = buffer_requirements.alignment
padded_size = (size + align - 1) & ~(align - 1)

# 3. Memory Type 的最大对齐
mem_type = mem_props.memory_types[mem_type_idx]
max_align = mem_type.alignment

# 4. 绑定时的偏移对齐
offset = 0  # 通常对齐为 0
```

## 26.5 Aliasing（内存别名）

```python
# 多个 Buffer 可以共享同一块物理内存
# 前提: 它们不重叠

# 示例:
# Buffer 1: 0-1024 bytes
# Buffer 2: 1024-2048 bytes
# 可以绑定到同一块 Device Memory

# 检查重叠
if buffer1_offset + buffer1_size <= buffer2_offset:
    # 不重叠，可以共享内存
    pass

# 绑定到同一块内存
device.bind_buffer_memory(buffer1, shared_memory, buffer1_offset)
device.bind_buffer_memory(buffer2, shared_memory, buffer2_offset)
```

## 26.6 Mapped Memory（映射内存）

```python
# 映射内存到 CPU 地址
# 需要 MEMORY_PROPERTY.HOST_VISIBLE
mapped_ptr = device.map_memory(device_memory, 0, size)

# 写入数据
mapped_ptr.data = src_data  # 直接写入

# 解除映射
device.unmap_memory(device_memory)

# 非相干内存需要手动同步
if not (mem_prop.memory_types[mem_type_idx].propertyFlags & 
        vkbottle.MemoryPropertyFlag.HOIST_COHERENT):
    # 非相干 → 需要内存屏障
    device.flush_mapped_memory_ranges([
        vkbottle.MappedMemoryRange(
            memory=device_memory,
            offset=0,
            size=size,
        )
    ])
```

## 26.7 内存分配策略速查

| 用途 | 推荐内存类型 | 原因 |
| **Vertex Buffer** | DEVICE_LOCAL | GPU 高速访问 |
| **Index Buffer** | DEVICE_LOCAL | GPU 高速访问 |
| **Uniform Buffer** | DEVICE_LOCAL | GPU 高速访问 |
| **Staging Buffer** | HOST_VISIBLE | CPU 上传数据 |
| **Texture** | DEVICE_LOCAL | GPU 纹理缓存 |
| **Compute Buffer** | DEVICE_LOCAL | GPU 计算 |
| **Debug Data** | HOST_VISIBLE | CPU 读取 |

## 26.8 内存管理进阶速查

| 概念 | 说明 |
| Memory Type | 物理设备定义的内存类型 |
| Memory Heap | 内存堆（物理存储池）|
| Memory Allocation | 从 Heap 分配内存 |
| Memory Binding | 将内存绑定到 Buffer/Image |
| Memory Mapped | CPU 可访问的内存映射 |
| Memory Aliasing | 多个资源共享内存 |
| Memory Alignment | 对齐要求（Buffer/Image/Memory） |
| Memory Synchronization | 相干/非相干同步 |

---

| **26. 内存管理进阶** | ✅ |
| 27-30 | 🔲 |