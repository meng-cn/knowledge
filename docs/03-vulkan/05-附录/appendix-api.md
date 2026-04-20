# 附录 A · API 速查表

## A.1 实例化

| 函数 | 说明 |
| `vkCreateInstance()` | 创建 Vulkan 实例 |
| `vkDestroyInstance()` | 销毁实例 |
| `vkEnumeratePhysicalDevices()` | 枚举物理设备 |
| `vkGetPhysicalDeviceProperties()` | 查询设备属性 |
| `vkGetPhysicalDeviceFeatures()` | 查询设备特性 |
| `vkGetPhysicalDeviceQueueFamilyProperties()` | 查询队列族 |
| `vkGetPhysicalDeviceMemoryProperties()` | 查询内存类型 |
| `vkGetPhysicalDeviceFormatProperties()` | 查询图像格式 |

## A.2 设备

| 函数 | 说明 |
| `vkCreateDevice()` | 创建逻辑设备 |
| `vkDestroyDevice()` | 销毁逻辑设备 |
| `vkGetDeviceQueue()` | 获取队列 |
| `vkGetDeviceFeatures()` | 查询设备特性 |

## A.3 交换链

| 函数 | 说明 |
| `vkCreateSwapchainKHR()` | 创建交换链 |
| `vkDestroySwapchainKHR()` | 销毁交换链 |
| `vkGetSwapchainImagesKHR()` | 获取交换链图像 |
| `vkAcquireNextImageKHR()` | 获取下一帧 |
| `vkQueuePresentKHR()` | 呈现图像 |

## A.4 资源

| 函数 | 说明 |
| `vkCreateBuffer()` | 创建 Buffer |
| `vkDestroyBuffer()` | 销毁 Buffer |
| `vkCreateImage()` | 创建 Image |
| `vkDestroyImage()` | 销毁 Image |
| `vkCreateImageView()` | 创建 Image View |
| `vkDestroyImageView()` | 销毁 Image View |
| `vkCreateSampler()` | 创建 Sampler |
| `vkDestroySampler()` | 销毁 Sampler |

## A.5 内存

| 函数 | 说明 |
| `vkAllocateMemory()` | 分配内存 |
| `vkFreeMemory()` | 释放内存 |
| `vkMapMemory()` | 映射内存 |
| `vkUnmapMemory()` | 解除映射 |
| `vkFlushMappedMemoryRanges()` | 刷新内存 |
| `vkInvalidateMappedMemoryRanges()` | 使内存无效 |
| `vkBindBufferMemory()` | 绑定 Buffer 内存 |
| `vkBindImageMemory()` | 绑定 Image 内存 |

## A.6 命令缓冲

| 函数 | 说明 |
| `vkAllocateCommandBuffers()` | 分配 Command Buffer |
| `vkFreeCommandBuffers()` | 释放 Command Buffer |
| `vkCreateCommandPool()` | 创建 Command Pool |
| `vkDestroyCommandPool()` | 销毁 Command Pool |
| `vkResetCommandPool()` | 重置 Command Pool |
| `vkBeginCommandBuffer()` | 开始记录 |
| `vkEndCommandBuffer()` | 结束记录 |
| `vkQueueSubmit()` | 提交到 Queue |
| `vkQueueWaitIdle()` | 等待队列空闲 |
| `vkDeviceWaitIdle()` | 等待设备空闲 |

## A.7 渲染

| 函数 | 说明 |
| `vkCreateRenderPass()` | 创建 Render Pass |
| `vkDestroyRenderPass()` | 销毁 Render Pass |
| `vkCreateGraphicsPipelines()` | 创建 Graphics Pipeline |
| `vkCreateComputePipelines()` | 创建 Compute Pipeline |
| `vkDestroyPipeline()` | 销毁 Pipeline |
| `vkCreatePipelineCache()` | 创建 Pipeline Cache |
| `vkDestroyPipelineCache()` | 销毁 Pipeline Cache |
| `vkCreatePipelineLayout()` | 创建 Pipeline Layout |
| `vkDestroyPipelineLayout()` | 销毁 Pipeline Layout |
| `vkCreateFramebuffer()` | 创建 Framebuffer |
| `vkDestroyFramebuffer()` | 销毁 Framebuffer |
| `vkCmdBeginRenderPass()` | 开始 Render Pass |
| `vkCmdEndRenderPass()` | 结束 Render Pass |
| `vkCmdBindPipeline()` | 绑定 Pipeline |
| `vkCmdBindDescriptorSets()` | 绑定描述符集 |
| `vkCmdBindVertexBuffers()` | 绑定顶点缓冲 |
| `vkCmdDraw()` | 绘制（顶点） |
| `vkCmdDrawIndexed()` | 绘制（索引） |
| `vkCmdDispatch()` | 执行计算着色器 |
| `vkCmdDispatchIndirect()` | 间接执行计算 |

## A.8 同步

| 函数 | 说明 |
| `vkCreateSemaphore()` | 创建 Semaphore |
| `vkDestroySemaphore()` | 销毁 Semaphore |
| `vkCreateFence()` | 创建 Fence |
| `vkDestroyFence()` | 销毁 Fence |
| `vkCreateEvent()` | 创建 Event |
| `vkDestroyEvent()` | 销毁 Event |
| `vkWaitForFences()` | 等待 Fence |
| `vkResetFences()` | 重置 Fence |
| `vkGetFenceStatus()` | 获取 Fence 状态 |
| `vkGetEventStatus()` | 获取 Event 状态 |
| `vkSetEvent()` | 设置 Event |
| `vkResetEvent()` | 重置 Event |
| `vkCmdPipelineBarrier()` | 添加屏障 |
| `vkCmdMemoryBarrier()` | 内存屏障 |
| `vkCmdBufferMemoryBarrier()` | Buffer 内存屏障 |
| `vkCmdImageMemoryBarrier()` | Image 内存屏障 |

## A.9 描述符

| 函数 | 说明 |
| `vkCreateDescriptorSetLayout()` | 创建描述符集布局 |
| `vkDestroyDescriptorSetLayout()` | 销毁描述符集布局 |
| `vkCreateDescriptorPool()` | 创建描述符池 |
| `vkDestroyDescriptorPool()` | 销毁描述符池 |
| `vkAllocateDescriptorSets()` | 分配描述符集 |
| `vkFreeDescriptorSets()` | 释放描述符集 |
| `vkUpdateDescriptorSets()` | 更新描述符集 |
| `vkUpdateDescriptorSetWithTemplate()` | 更新描述符模板 |

## A.10 Shader

| 函数 | 说明 |
| `vkCreateShaderModule()` | 创建 Shader Module |
| `vkDestroyShaderModule()` | 销毁 Shader Module |

## A.11 Surface

| 函数 | 说明 |
| `vkCreateSurfaceKHR()` | 创建 Surface |
| `vkDestroySurfaceKHR()` | 销毁 Surface |
| `vkGetPhysicalDeviceSurfaceSupportKHR()` | 查询 Surface 支持 |
| `vkGetPhysicalDeviceSurfaceCapabilitiesKHR()` | 查询 Surface 能力 |
| `vkGetPhysicalDeviceSurfaceFormatsKHR()` | 查询 Surface 格式 |
| `vkGetPhysicalDeviceSurfacePresentModesKHR()` | 查询 Surface 呈现模式 |

## A.12 常用命令速查

| 命令 | 说明 |
| `vkCmdBindPipeline()` | 绑定管线 |
| `vkCmdBindDescriptorSets()` | 绑定描述符集 |
| `vkCmdBindVertexBuffers()` | 绑定顶点缓冲 |
| `vkCmdBindIndexBuffer()` | 绑定索引缓冲 |
| `vkCmdDraw()` | 顶点绘制 |
| `vkCmdDrawIndexed()` | 索引绘制 |
| `vkCmdDrawIndirect()` | 间接绘制 |
| `vkCmdDispatch()` | 执行计算着色器 |
| `vkCmdSetViewport()` | 设置视口 |
| `vkCmdSetScissor()` | 设置裁剪 |
| `vkCmdSetLineWidth()` | 设置线宽 |
| `vkCmdSetDepthBias()` | 设置深度偏置 |
| `vkCmdSetBlendConstants()` | 设置混合常量 |
| `vkCmdCopyBuffer()` | 复制 Buffer |
| `vkCmdCopyBufferToImage()` | Buffer 复制到 Image |
| `vkCmdCopyImageToBuffer()` | Image 复制到 Buffer |
| `vkCmdClearColorImage()` | 清颜色图像 |
| `vkCmdClearDepthStencilImage()` | 清深度/模板图像 |
| `vkCmdBlitImage()` | Blit 图像（缩放） |
| `vkCmdResolveImage()` | 解析多重采样 |
| `vkCmdUpdateBuffer()` | 更新 Buffer |
| `vkCmdFillBuffer()` | 填充 Buffer |
| `vkCmdPushConstants()` | 推送常量 |
| `vkCmdWriteTimestamp()` | 写时间戳 |
| `vkCmdBeginQuery()` | 开始查询 |
| `vkCmdEndQuery()` | 结束查询 |
| `vkCmdGetQueryResults()` | 获取查询结果 |
| `vkCmdResetQueryPool()` | 重置查询池 |
| `vkCmdBeginRenderPass()` | 开始 Render Pass |
| `vkCmdEndRenderPass()` | 结束 Render Pass |
| `vkCmdExecuteCommands()` | 执行命令 |

## A.13 错误处理

| 函数 | 说明 |
| `vkResultToString()` | 错误码 → 字符串 |
| `vkResultName()` | 错误码 → 名称 |
| `vkResultString()` | 错误码 → 字符串 |

---

| **A. API 速查** | ✅ |
| B. 枚举对照 | 🔲 |
| C. SDK 安装 | 🔲 |
| D. 资源延伸 | 🔲 |