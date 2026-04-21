# XComponent 渲染

> XComponent 是 ArkUI 中用于高性能渲染的容器组件，支持 EGL/OpenGL 直接绘制。

---

## 1. XComponent 概述

XComponent 是 ArkUI 提供的**高性能渲染容器**，允许开发者通过 EGL/OpenGL 直接在 Canvas 上进行渲染。

### 适用场景

- 地图渲染（高德/百度地图）
- 视频播放器
- 3D 场景/游戏
- 数据可视化（图表）
- 图像编辑/处理
- 自定义 Canvas 绘图

---

## 2. 基本用法

### 2.1 ArkTS 端

```typescript
@Entry
@Component
struct Index {
    private controller: XComponentController = new XComponentController()
    @State surfaceId: string = ''

    build() {
        Column() {
            XComponent({
                id: 'canvas',
                type: XComponentType.SURFACE,  // SURFACE/OPENGL
                controller: this.controller
            })
                .width('100%')
                .height(300)
                .onLoad(() => {
                    // 获取 surface ID
                    this.surfaceId = this.controller.getContext()
                    console.log('Surface ID:', this.surfaceId)
                    // 初始化 OpenGL 渲染
                    this.initOpenGL(this.surfaceId)
                })
                .onDestroy(() => {
                    // 销毁 OpenGL 资源
                    this.destroyOpenGL()
                })
        }
        .width('100%')
        .height('100%')
    }

    // 初始化 OpenGL
    initOpenGL(surfaceId: string) {
        // 调用 C++ NAPI 初始化 OpenGL ES
        // ...
    }

    destroyOpenGL() {
        // 清理 OpenGL ES 资源
        // ...
    }
}
```

### 2.2 C++ 端（NAPI）

```cpp
#include <napi/native_api.h>
#include <GLES3/gl3.h>
#include <EGL/egl.h>

// 初始化 EGL + OpenGL ES
extern "C" JNIEXPORT void JNICALL
Java_com_example_MyRenderer_initEGL(JNIEnv* env, jobject thiz, jstring surfaceId) {
    // 1. 创建 EGL 显示
    EGLDisplay display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    eglInitialize(display, nullptr, nullptr);

    // 2. 配置 EGL
    EGLint configAttribs[] = {
        EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT,
        EGL_SURFACE_TYPE, EGL_PBUFFER_BIT,
        EGL_NONE
    };
    EGLConfig config;
    EGLint numConfigs;
    eglChooseConfig(display, configAttribs, &config, 1, &numConfigs);

    // 3. 创建 Surface
    EGLint w, h;
    // 从 surfaceId 创建 EGLSurface

    // 4. 创建 Context
    EGLContext context = eglCreateContext(display, config, EGL_NO_CONTEXT, nullptr);
    eglMakeCurrent(display, surface, surface, context);

    // 5. 初始化 OpenGL
    glViewport(0, 0, w, h);
}
```

---

## 3. XComponent 的类型

| 类型 | 说明 | 适用场景 |
|---|-|---|
| `XComponentType.SURFACE` | 标准 Surface 渲染 | 最常用 |
| `XComponentType.OPENGL` | OpenGL ES 渲染 | 3D 场景 |
| `XComponentType.CANVAS` | Canvas 2D 渲染 | 2D 绘图 |

---

## 4. XComponent + NAPI 架构

```
ArkTS (XComponent)
    ↓ (surfaceId 传递)
NAPI 桥接
    ↓
C++ 层
    ├─ EGL (EGL Display/Surface/Context)
    ├─ OpenGL ES (渲染)
    └─ Canvas 2D (2D 绘图)
    ↓
GPU (硬件加速)
```

---

## 5. 实战示例：自定义 Canvas 绘制

### 5.1 C++ 端绘制逻辑

```cpp
extern "C" JNIEXPORT void JNICALL
Java_com_example_DrawRenderer_draw(JNIEnv* env, jobject thiz) {
    // 清除画布
    glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    // 绘制三角形
    GLfloat vertices[] = {
         0.0f,  0.5f,  0.0f,
        -0.5f, -0.5f,  0.0f,
         0.5f, -0.5f,  0.0f
    };

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, vertices);
    glEnableVertexAttribArray(0);
    glDrawArrays(GL_TRIANGLES, 0, 3);

    // 交换缓冲区
    eglSwapBuffers(display, surface);
}
```

### 5.2 ArkTS 端调用

```typescript
@Entry
@Component
struct CanvasPage {
    private controller: XComponentController = new XComponentController()
    private isDrawing: boolean = false

    build() {
        Column() {
            XComponent({
                id: 'myCanvas',
                type: XComponentType.CANVAS,
                controller: this.controller
            })
                .width('100%')
                .height(400)
                .backgroundColor(Color.Black)

            Row() {
                Button('开始绘制')
                    .onClick(() => {
                        this.isDrawing = true
                        this.controller.startRender(() => {
                            // 启动渲染循环
                            this.renderLoop()
                        })
                    })
                Button('停止')
                    .onClick(() => {
                        this.isDrawing = false
                        this.controller.stopRender()
                    })
            }
        }
        .width('100%')
        .height('100%')
    }

    renderLoop() {
        if (this.isDrawing) {
            // 调用 C++ 绘制
            this.draw()
            // 下一帧
            requestAnimationFrame(() => this.renderLoop())
        }
    }

    draw() {
        // 通过 NAPI 调用 C++ 绘制
    }
}
```

---

## 6. XComponent 的注意事项

### 6.1 生命周期管理

```typescript
// ✅ 必须管理好 EGL/OpenGL 资源的创建和销毁
XComponent()
    .onLoad(() => {
        // 创建 EGL Context
        // 初始化 OpenGL
    })
    .onDestroy(() => {
        // 销毁 OpenGL 资源
        // glDeleteProgram / glDeleteShader / eglDestroyContext
    })
    .onError((error) => {
        console.error('XComponent 错误:', error)
    })
```

### 6.2 内存管理

| 风险 | 解决 |
|---|-|
| EGL Context 泄露 | 在 onDestroy 中销毁 |
| OpenGL Shader 内存 | glDeleteShader |
| OpenGL Program 内存 | glDeleteProgram |
| GL 纹理内存 | glDeleteTextures |

---

## 7. 面试高频考点

### Q1: XComponent 的作用和适用场景？

**回答**：XComponent 是高性能渲染容器，通过 EGL/OpenGL 直接在 Canvas 上绘制。适用场景包括地图、视频播放、3D 场景、数据可视化等。

### Q2: XComponent 的生命周期管理？

**回答**：必须在 onLoad 中创建 EGL Context 和 OpenGL 资源，在 onDestroy 中销毁所有 GL 资源（Shader、Program、Texture、Context），防止内存泄漏。

---

> 🐱 **小猫提示**：XComponent 是高级渲染的必备知识。记住它通过 **NAPI + EGL + OpenGL** 实现高性能绘制，面试中重点说 **"适用场景"和"生命周期管理"** 即可。
