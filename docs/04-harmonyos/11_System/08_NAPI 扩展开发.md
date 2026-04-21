# NAPI 扩展开发

## 1. NAPI 概述

```
NAPI（Native API）是 ArkTS 与 C/C++ 交互的桥梁：

┌──────────────────────────────────────────────────┐
│  应用层（ArkTS）                                   │
│  └── import { nativeLib } from 'libnative.so'    │
├──────────────────────────────────────────────────┤
│  ArkBridge                                       │
│  └── ArkTS ↔ NAPI 桥接层                          │
├──────────────────────────────────────────────────┤
│  NAPI 接口层                                      │
│  ├── napi_addon_register    — 模块注册            │
│  ├── napi_create_function   — 创建函数            │
│  ├── napi_create_object     — 创建对象            │
│  ├── napi_set_named_property — 设置属性          │
│  └── napi_call_function     — 调用函数            │
├──────────────────────────────────────────────────┤
│  C/C++ 实现层                                     │
│  └── .so 动态库（编译为 Native 代码）              │
└──────────────────────────────────────────────────┘
```

## 2. NAPI 开发流程

### 2.1 C++ 端：编写 Native 模块

```cpp
// native_module.cpp

#include <napi/native_api.h>

// 1. 定义暴露给 ArkTS 的 C++ 函数
static napi_value Add(napi_env env, napi_callback_info info) {
  // 获取参数
  napi_value args[2];
  size_t argc = 2;
  napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

  // 读取参数值
  int32_t a, b;
  napi_get_value_int32(env, args[0], &a);
  napi_get_value_int32(env, args[1], &b);

  // 创建返回值
  napi_value result;
  napi_create_int32(env, a + b, &result);
  return result;
}

// 2. 定义模块初始化函数
static napi_value Init(napi_env env, napi_value exports) {
  napi_property_descriptor desc[] = {
    {"add", nullptr, Add, nullptr, nullptr, nullptr, napi_default, nullptr}
  };
  napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
  return exports;
}

// 3. 注册模块
NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
```

### 2.2 ArkTS 端：调用 Native 模块

```arkts
// 导入 .so 模块
import { Add, AddAsync } from 'libnative.so';

// 1. 同步调用
let result = Add(3, 5);
console.log('Add: ' + result); // 8

// 2. 异步调用（推荐，避免阻塞主线程）
async function asyncCall() {
  const result = await AddAsync(10, 20);
  console.log('Async Add: ' + result);
}

// 3. 对象方法调用
import { MyClass } from 'libnative.so';

const obj = new MyClass();
obj.init();
const data = obj.getData();
obj.close();
```

## 3. NAPI 核心 API

### 3.1 数据类型转换

```cpp
// NAPI 数据类型映射：
// napi_value (ArkTS 侧)  ↔  C/C++ 基础类型

// 基本类型
napi_create_int32(env, value, &result);      // number (32-bit)
napi_create_double(env, value, &result);     // number (float64)
napi_create_string_utf8(env, str, &result);  // string
napi_get_value_int32(env, jsVal, &cVal);    // 读取 int32
napi_get_value_double(env, jsVal, &cVal);   // 读取 double
napi_get_value_string_utf8(env, jsVal, buf, &len); // 读取 string

// 对象
napi_create_object(env, &result);
napi_set_named_property(env, obj, "name", value);
napi_get_named_property(env, obj, "name", &value);

// 数组
napi_create_array(env, &result);
napi_set_element(env, arr, index, value);
napi_get_element(env, arr, index, &value);
napi_get_array_length(env, arr, &len);

// ArrayBuffer（二进制数据）
napi_create_arraybuffer(env, size, &buffer, &data);
// 用于图片/文件/网络数据的高效传递（零拷贝）
```

### 3.2 异步 NAPI

```cpp
// 异步调用（避免阻塞主线程）

// 1. 定义异步工作项
static void AsyncWork(napi_env env, void* data) {
  // 工作线程执行耗时操作
  MyWorker* worker = (MyWorker*)data;
  worker->doWork();
}

// 2. 定义完成回调
static void AsyncComplete(napi_env env, napi_status status, void* data) {
  MyWorker* worker = (MyWorker*)data;
  // 回调通知 ArkTS 端结果
}

// 3. 定义 ArkTS 端回调
static napi_value AsyncCall(napi_env env, napi_callback_info info) {
  napi_value callback;
  napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

  // 创建工作项
  napi_value promise;
  napi_create_promise(env, &deferred, &promise);

  napi_submit_async_work(env, deferred, "my-work", AsyncWork, AsyncComplete, data);
  return promise;
}
```

```arkts
// ArkTS 端使用异步 NAPI
import { fetchData } from 'libnative.so';

// 使用 Promise
const result = await fetchData(url);
console.log(result);

// 或使用 callback
fetchData(url, (err: Error | null, data: string) => {
  if (err) console.error(err);
  else console.log(data);
});
```

### 3.3 对象生命周期管理

```cpp
// napi_ref 管理（类似 GC 引用计数）

// 1. 创建持久化引用（不随函数返回被释放）
napi_value globalRef;
napi_create_reference(env, jsValue, 1, &globalRef); // refcount=1

// 2. 增加引用计数
napi_add_ref(env, globalRef); // refcount = 2

// 3. 减少引用计数
napi_release_ref(env, globalRef, &refCount); // refcount = 1

// 4. 获取引用的值
napi_value value;
napi_get_reference_value(env, globalRef, &value);

// 5. 删除引用
napi_delete_reference(env, globalRef);
```

## 4. NAPI 模块打包

### 4.1 build-profile.json5 配置

```json5
// build-profile.json5
{
  "app": {
    "signingConfigs": [],
    "products": [
      {
        "name": "default",
        "signingConfig": "default"
      }
    ]
  },
  "modules": [
    {
      "name": "entry",
      "srcEntry": "./ets entry/entry.ets",
      "destPath": "./entry"
    },
    {
      "name": "native_module",  // NAPI 模块
      "srcEntry": "./cpp/native_module.cpp",
      "destPath": "./native_module",
      "compileOption": {
        "sharable": false,
        "externalCompileFiles": [
          "./cpp/CMakeLists.txt"
        ],
        "ndk": {
          " cppFlags": "-std=c++17 -fPIC",
          "abiFilters": ["arm64-v8a", "armeabi-v7a"],
          "cppLibs": []
        }
      },
      "nativeLib": {
        "so": ["libnative_module.so"]
      }
    }
  ]
}
```

### 4.2 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.10.0)
project(native_module)

add_library(native_module SHARED
    native_module.cpp
)

# 链接 NAPI 库
find_library(hilog-lib hilog)
target_link_libraries(native_module
    ${hilog-lib}
    napi
)
```

### 4.3 目录结构

```
entry/
├── cpp/
│   ├── native_module.cpp    ← NAPI 实现
│   ├── CMakeLists.txt        ← 编译配置
│   └── build/                ← 编译输出（.so 文件）
├── libs/
│   └── arm64-v8a/
│       └── libnative_module.so  ← 编译产物
├── native_module.ets       ← ArkTS 导入封装
└── build-profile.json5     ← 模块配置
```

## 5. NAPI 编写指南

### 5.1 最佳实践

```
✅ 最佳实践：
├── 同步 NAPI 仅用于快速操作（< 1ms）
├── 耗时操作使用异步 NAPI
├── 使用 napi_ref 管理长生命周期对象
├── 错误处理使用 napi_throw_error
├── 使用 napi_get_last_error_info 获取错误信息
├── 避免在 NAPI 中分配大量内存（优先复用缓冲）
└── 线程安全：多线程环境下使用 mutex

❌ 避免：
├── 在 NAPI 中直接操作 UI 线程
├── 使用裸指针传递对象（用 napi_ref）
├── 忘记释放 napi_ref（导致内存泄漏）
└── 在回调中访问已被释放的 napi_value
```

### 5.2 错误处理

```cpp
// 错误处理示例
static napi_value SafeAdd(napi_env env, napi_callback_info info) {
  napi_value args[2];
  size_t argc = 2;
  napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

  int32_t a, b;
  if (napi_get_value_int32(env, args[0], &a) != napi_ok) {
    napi_throw_error(env, nullptr, "First argument must be a number");
    return nullptr;
  }
  if (napi_get_value_int32(env, args[1], &b) != napi_ok) {
    napi_throw_error(env, nullptr, "Second argument must be a number");
    return nullptr;
  }

  napi_value result;
  napi_create_int32(env, a + b, &result);
  return result;
}
```

## 6. 🎯 面试高频考点

### Q1: NAPI 的作用是什么？与 Android NDK/JNI 对比？

**答要点**：
- NAPI 是 ArkTS 与 C/C++ 交互的桥梁，类似 Android 的 JNI
- NAPI 更轻量：接口简化，无需注册 JNI 函数名
- NAPI 支持 Promise/Async 异步，JNI 需要手动线程管理
- NAPI 模块打包通过 CMake，JNI 通过 gradle ndkBuild
- NAPI 使用 napi_ref 管理引用，JNI 使用 NewGlobalRef/DeleteGlobalRef

### Q2: 什么时候需要使用 NAPI？

**答要点**：
- 高性能计算：加密/编解码/图像处理
- 复用已有 C/C++ 库
- 调用系统底层 API
- 跨平台库复用（Android/iOS/鸿蒙统一 C++ 库）
- 需要直接操作内存/硬件的场景

### Q3: NAPI 同步和异步怎么选？

**答要点**：
- 同步：操作 < 1ms，无网络/磁盘 I/O
- 异步：操作 > 1ms，涉及网络/文件/数据库
- 主线程阻塞会导致 ANR，耗时的同步调用必须改为异步
- 异步通过 Promise 传递给 ArkTS 端
- 线程安全：异步 NAPI 的工作线程与主线程独立

---

> **💡 面试提示**：掌握 **NAPI 模块打包流程**、**同步/异步 NAPI 区别**、**napi_ref 生命周期管理**。对比 JNI 时强调 **更简化的接口** 和 **Promise 支持**。
