# 05_AIDL 跨进程

> **核心摘要**：AIDL（Android Interface Definition Language）是 Android 提供的 IPC 接口定义语言，用于定义 Client 和 Server 之间的通信接口。理解 AIDL 是掌握 Android 跨进程通信的关键。

---

## 一、AIDL 概述

### 1.1 什么是 AIDL

AIDL（Android Interface Definition Language）是 Android 提供的接口定义语言，用于定义 Client 端和 Server 端之间的通信接口。AIDL 文件会被编译成 Java 代码，生成 Stub（服务端）和 Proxy（客户端）类，实现跨进程通信。

**核心特点**：
- **接口定义**：使用类似 Java 接口的语法定义 IPC 接口
- **自动生成**：编译时自动生成 Stub 和 Proxy 代码
- **基于 Binder**：底层使用 Binder 机制实现 IPC
- **类型安全**：支持基本类型、String、List、Map 和 Parcelable

### 1.2 AIDL 的架构位置

```
┌─────────────────────────────────────────────────────────────┐
│                      AIDL 架构位置                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  应用层 (App)                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Client 进程              Server 进程                │    │
│  │  ┌─────────────┐          ┌─────────────┐          │    │
│  │  │   业务代码   │          │   业务代码   │          │    │
│  │  │   (调用)    │          │   (实现)    │          │    │
│  │  └──────┬──────┘          └──────▲──────┘          │    │
│  │         │                        │                   │    │
│  │         ▼                        │                   │    │
│  │  ┌─────────────┐          ┌──────┴──────┐          │    │
│  │  │   Proxy     │          │    Stub     │          │    │
│  │  │  (自动生成)  │          │  (自动生成)  │          │    │
│  │  └──────┬──────┘          └──────▲──────┘          │    │
│  │         │                        │                   │    │
│  │         │     Binder IPC         │                   │    │
│  │         ├────────────────────────┤                   │    │
│  │         │                        │                   │    │
│  └─────────┼────────────────────────┼───────────────────┘    │
│            │                        │                        │
│            ▼                        ▼                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Binder 驱动                        │    │
│  │                  (/dev/binder)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 AIDL vs Binder

| 特性 | AIDL | 纯 Binder |
|------|------|----------|
| 使用方式 | 定义 AIDL 文件，自动生成代码 | 手动继承 Binder 类 |
| 复杂度 | 低（接口清晰） | 高（需要手动实现） |
| 灵活性 | 中（受 AIDL 语法限制） | 高（完全自定义） |
| 适用场景 | 复杂的 IPC 接口 | 简单的 IPC 通信 |
| 编译时检查 | ✅ | ❌ |
| 代码量 | 少（自动生成） | 多（手动实现） |

---

## 二、AIDL 语法

### 2.1 AIDL 文件结构

```aidl
// 1. 包声明
package com.example.service;

// 2. 导入类型
import com.example.data.MyData;
import com.example.data.MyEnum;

// 3. 接口声明
interface IMyService {
    // 4. 方法声明
    void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat,
                    double aDouble, String aString);
    
    // 5. 带返回值的方法
    int add(int a, int b);
    
    // 6. 带自定义类型的方法
    void sendData(MyData data);
    
    // 7. 单向方法（oneway）
    oneway void asyncMethod(String msg);
    
    // 8. 回调接口
    void registerCallback(IMyCallback callback);
    void unregisterCallback(IMyCallback callback);
}
```

### 2.2 支持的数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 基本类型 | Java 基本类型 | int, long, boolean, float, double |
| String | 字符串 | String |
| CharSequence | 字符序列 | CharSequence |
| List | 列表（元素必须是支持类型） | List<String>, List<MyData> |
| Map | 映射（键值必须是支持类型） | Map<String, Integer> |
| Parcelable | 实现 Parcelable 的类 | MyData |
| AIDL 接口 | 其他 AIDL 接口 | IMyCallback |

### 2.3 Parcelable 定义

```aidl
// MyData.aidl
package com.example.data;

parcelable MyData;
```

```java
// MyData.java
package com.example.data;

import android.os.Parcel;
import android.os.Parcelable;

public class MyData implements Parcelable {
    private String name;
    private int value;
    
    public MyData() {}
    
    protected MyData(Parcel in) {
        name = in.readString();
        value = in.readInt();
    }
    
    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(name);
        dest.writeInt(value);
    }
    
    @Override
    public int describeContents() {
        return 0;
    }
    
    public static final Creator<MyData> CREATOR = new Creator<MyData>() {
        @Override
        public MyData createFromParcel(Parcel in) {
            return new MyData(in);
        }
        
        @Override
        public MyData[] newArray(int size) {
            return new MyData[size];
        }
    };
}
```

### 2.4 枚举类型（Android 10+）

```aidl
// MyEnum.aidl
package com.example.data;

enum MyEnum {
    VALUE_A,
    VALUE_B,
    VALUE_C
}
```

---

## 三、AIDL 生成代码分析

### 3.1 生成的 Java 代码结构

AIDL 编译后会生成一个 Java 文件，包含 Stub 抽象类和 Proxy 静态内部类。

```java
// IMyService.java (自动生成)
package com.example.service;

public interface IMyService extends android.os.IInterface {
    
    // ==================== Stub 抽象类 ====================
    
    public static abstract class Stub extends android.os.Binder 
            implements com.example.service.IMyService {
        
        private static final String DESCRIPTOR = "com.example.service.IMyService";
        
        // 事务代码
        static final int TRANSACTION_add = (android.os.IBinder.FIRST_CALL_TRANSACTION + 0);
        static final int TRANSACTION_sendData = (android.os.IBinder.FIRST_CALL_TRANSACTION + 1);
        static final int TRANSACTION_registerCallback = (android.os.IBinder.FIRST_CALL_TRANSACTION + 2);
        
        public Stub() {
            this.attachInterface(this, DESCRIPTOR);
        }
        
        // 获取接口实例
        public static com.example.service.IMyService asInterface(android.os.IBinder obj) {
            if (obj == null) return null;
            
            android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
            if (iin != null && iin instanceof com.example.service.IMyService) {
                return (com.example.service.IMyService) iin;
            }
            return new com.example.service.IMyService.Stub.Proxy(obj);
        }
        
        @Override
        public android.os.IBinder asBinder() {
            return this;
        }
        
        // 服务端处理入口
        @Override
        public boolean onTransact(int code, android.os.Parcel data, 
                android.os.Parcel reply, int flags) throws android.os.RemoteException {
            switch (code) {
                case INTERFACE_TRANSACTION: {
                    reply.writeString(DESCRIPTOR);
                    return true;
                }
                case TRANSACTION_add: {
                    data.enforceInterface(DESCRIPTOR);
                    int _arg0 = data.readInt();
                    int _arg1 = data.readInt();
                    int _result = this.add(_arg0, _arg1);
                    reply.writeNoException();
                    reply.writeInt(_result);
                    return true;
                }
                case TRANSACTION_sendData: {
                    data.enforceInterface(DESCRIPTOR);
                    com.example.data.MyData _arg0;
                    if (data.readInt() != 0) {
                        _arg0 = com.example.data.MyData.CREATOR.createFromParcel(data);
                    } else {
                        _arg0 = null;
                    }
                    this.sendData(_arg0);
                    reply.writeNoException();
                    return true;
                }
                case TRANSACTION_registerCallback: {
                    data.enforceInterface(DESCRIPTOR);
                    com.example.service.IMyCallback _arg0;
                    _arg0 = com.example.service.IMyCallback.Stub.asInterface(
                        data.readStrongBinder());
                    this.registerCallback(_arg0);
                    reply.writeNoException();
                    return true;
                }
            }
            return super.onTransact(code, data, reply, flags);
        }
        
        // ==================== Proxy 静态内部类 ====================
        
        private static class Proxy implements com.example.service.IMyService {
            private android.os.IBinder mRemote;
            
            Proxy(android.os.IBinder remote) {
                mRemote = remote;
            }
            
            @Override
            public android.os.IBinder asBinder() {
                return mRemote;
            }
            
            public java.lang.String getInterfaceDescriptor() {
                return DESCRIPTOR;
            }
            
            @Override
            public int add(int _arg0, int _arg1) throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                int _result;
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    _data.writeInt(_arg0);
                    _data.writeInt(_arg1);
                    boolean _status = mRemote.transact(TRANSACTION_add, _data, _reply, 0);
                    if (!_status && getDefaultImpl() != null) {
                        return getDefaultImpl().add(_arg0, _arg1);
                    }
                    _reply.readException();
                    _result = _reply.readInt();
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
                return _result;
            }
            
            @Override
            public void sendData(com.example.data.MyData _arg0) throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    if (_arg0 != null) {
                        _data.writeInt(1);
                        _arg0.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = mRemote.transact(TRANSACTION_sendData, _data, _reply, 0);
                    if (!_status && getDefaultImpl() != null) {
                        getDefaultImpl().sendData(_arg0);
                        return;
                    }
                    _reply.readException();
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }
            
            @Override
            public void registerCallback(com.example.service.IMyCallback _arg0) 
                    throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    _data.writeStrongBinder(
                        ((_arg0 != null)) ? (_arg0.asBinder()) : (null));
                    boolean _status = mRemote.transact(TRANSACTION_registerCallback, 
                        _data, _reply, 0);
                    if (!_status && getDefaultImpl() != null) {
                        getDefaultImpl().registerCallback(_arg0);
                        return;
                    }
                    _reply.readException();
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }
        }
        
        // 默认实现（用于向后兼容）
        private static volatile com.example.service.IMyService sDefaultImpl;
        
        public static com.example.service.IMyService getDefaultImpl() {
            return sDefaultImpl;
        }
        
        public static boolean setDefaultImpl(com.example.service.IMyService impl) {
            if (sDefaultImpl == null && impl != null) {
                sDefaultImpl = impl;
                return true;
            }
            return false;
        }
    }
    
    // 接口方法声明
    public int add(int a, int b) throws android.os.RemoteException;
    public void sendData(com.example.data.MyData data) throws android.os.RemoteException;
    public void registerCallback(com.example.service.IMyCallback callback) 
            throws android.os.RemoteException;
}
```

### 3.2 关键代码解析

#### 3.2.1 asInterface() 方法

```java
public static com.example.service.IMyService asInterface(android.os.IBinder obj) {
    if (obj == null) return null;
    
    // 1. 检查是否是本地接口
    android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
    
    // 2. 如果是本地，直接返回
    if (iin != null && iin instanceof com.example.service.IMyService) {
        return (com.example.service.IMyService) iin;
    }
    
    // 3. 如果是远程，创建 Proxy
    return new com.example.service.IMyService.Stub.Proxy(obj);
}
```

**作用**：
- 判断 IBinder 是本地对象还是远程代理
- 本地调用：直接返回实现对象（无 IPC 开销）
- 远程调用：返回 Proxy 对象（通过 Binder 通信）

#### 3.2.2 onTransact() 方法

```java
@Override
public boolean onTransact(int code, android.os.Parcel data, 
        android.os.Parcel reply, int flags) throws android.os.RemoteException {
    switch (code) {
        case TRANSACTION_add: {
            // 1. 验证接口 Token
            data.enforceInterface(DESCRIPTOR);
            
            // 2. 读取参数
            int _arg0 = data.readInt();
            int _arg1 = data.readInt();
            
            // 3. 调用实现方法
            int _result = this.add(_arg0, _arg1);
            
            // 4. 写入返回结果
            reply.writeNoException();
            reply.writeInt(_result);
            return true;
        }
    }
    return super.onTransact(code, data, reply, flags);
}
```

**作用**：
- Binder 调用的服务端入口
- 根据事务代码分发到具体方法
- 负责参数序列化和反序列化

#### 3.2.3 Proxy 方法

```java
@Override
public int add(int _arg0, int _arg1) throws android.os.RemoteException {
    android.os.Parcel _data = android.os.Parcel.obtain();
    android.os.Parcel _reply = android.os.Parcel.obtain();
    int _result;
    try {
        // 1. 写入接口 Token
        _data.writeInterfaceToken(DESCRIPTOR);
        
        // 2. 写入参数
        _data.writeInt(_arg0);
        _data.writeInt(_arg1);
        
        // 3. 调用 transact
        boolean _status = mRemote.transact(TRANSACTION_add, _data, _reply, 0);
        
        // 4. 读取返回结果
        _reply.readException();
        _result = _reply.readInt();
    } finally {
        _reply.recycle();
        _data.recycle();
    }
    return _result;
}
```

**作用**：
- Client 端调用入口
- 负责参数序列化
- 通过 Binder.transact() 发起 IPC 调用
- 负责返回结果反序列化

---

## 四、Binder 与 AIDL 关系

### 4.1 关系图

```
┌─────────────────────────────────────────────────────────────┐
│                  Binder 与 AIDL 关系                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AIDL (接口定义层)                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  interface IMyService {                              │    │
│  │      int add(int a, int b);                          │    │
│  │      void sendData(MyData data);                     │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          │ 编译                             │
│                          ▼                                  │
│  生成的 Java 代码                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  class Stub extends Binder {                        │    │
│  │      // 继承 Binder                                  │    │
│  │      // 实现 onTransact()                            │    │
│  │  }                                                   │    │
│  │                                                      │    │
│  │  class Proxy {                                      │    │
│  │      // 使用 IBinder.transact()                      │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          │ 使用                             │
│                          ▼                                  │
│  Binder (IPC 机制层)                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - IBinder 接口                                      │    │
│  │  - Binder 类（Stub 基类）                             │    │
│  │  - BinderProxy 类（Proxy）                           │    │
│  │  - /dev/binder 驱动                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  关系总结：                                                  │
│  - AIDL 是接口定义语言，用于定义 IPC 接口                      │
│  - Binder 是 IPC 机制，AIDL 底层使用 Binder 实现                 │
│  - AIDL 生成的 Stub 继承自 Binder                            │
│  - AIDL 生成的 Proxy 使用 IBinder.transact()                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 对比表

| 特性 | Binder | AIDL |
|------|--------|------|
| 层级 | 底层 IPC 机制 | 上层接口定义 |
| 使用方式 | 继承 Binder 类 | 定义 AIDL 文件 |
| 代码生成 | 手动实现 | 自动生成 |
| 灵活性 | 高 | 中 |
| 易用性 | 低 | 高 |
| 适用场景 | 简单 IPC、系统服务 | 复杂 IPC 接口 |

### 4.3 纯 Binder 实现示例

```java
// 服务端
public class MyBinderService extends Service {
    private final IBinder mBinder = new MyBinder();
    
    public class MyBinder extends Binder {
        public MyService getService() {
            return MyBinderService.this;
        }
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }
}

// 客户端
ServiceConnection mConnection = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        MyBinderService.MyBinder binder = 
            (MyBinderService.MyBinder) service;
        MyBinderService service = binder.getService();
    }
};
```

---

## 五、参数修饰符（in/out/inout）

### 5.1 修饰符说明

AIDL 支持三种参数修饰符，用于指定数据的流向。

| 修饰符 | 数据流向 | 说明 |
|--------|---------|------|
| `in` | Client → Server | 数据从 Client 流向 Server（默认） |
| `out` | Server → Client | 数据从 Server 流向 Client |
| `inout` | Client ↔ Server | 数据双向流动 |

### 5.2 使用示例

```aidl
// IMyService.aidl
interface IMyService {
    // in 修饰（默认，可省略）
    void sendData(in MyData data);
    
    // out 修饰
    void getData(out MyData data);
    
    // inout 修饰
    void modifyData(inout MyData data);
    
    // 基本类型只能是 in
    int add(in int a, in int b);
}
```

### 5.3 修饰符原理

```java
// in 修饰 - 数据从 Client 到 Server
// Client 端
_data.writeInt(1);  // 标记非 null
_arg0.writeToParcel(_data, 0);  // 写入数据

// Server 端
if (data.readInt() != 0) {
    _arg0 = MyData.CREATOR.createFromParcel(data);  // 读取数据
}
this.sendData(_arg0);

// out 修饰 - 数据从 Server 到 Client
// Client 端
_data.writeInt(0);  // 初始为 null（占位）

// Server 端
_arg0 = new MyData();  // 创建新对象
this.getData(_arg0);
if (_arg0 != null) {
    reply.writeInt(1);
    _arg0.writeToParcel(reply, 0);  // 写回数据
}

// inout 修饰 - 双向流动
// Client 端
_data.writeInt(1);
_arg0.writeToParcel(_data, 0);  // 写入初始数据

// Server 端
if (data.readInt() != 0) {
    _arg0 = MyData.CREATOR.createFromParcel(data);  // 读取数据
}
this.modifyData(_arg0);  // 修改数据
reply.writeInt(1);
_arg0.writeToParcel(reply, 0);  // 写回修改后的数据
```

### 5.4 注意事项

1. **基本类型只能是 in**：int、long 等基本类型只能是 in 修饰
2. **out 初始值为 null**：out 修饰的参数在 Server 端初始值为 null
3. **性能考虑**：inout 需要两次序列化，性能较差
4. **推荐使用 in**：尽量使用 in 修饰，通过返回值传递结果

---

## 六、回调接口

### 6.1 回调接口定义

```aidl
// IMyCallback.aidl
interface IMyCallback {
    void onEvent(String event);
    void onProgress(int progress);
    void onComplete(String result);
}

// IMyService.aidl
interface IMyService {
    void registerCallback(IMyCallback callback);
    void unregisterCallback(IMyCallback callback);
    void startTask();
}
```

### 6.2 服务端实现

```java
// MyService.java
public class MyService extends Service {
    private final RemoteCallbackList<IMyCallback> mCallbacks 
            = new RemoteCallbackList<>();
    
    private final IMyService.Stub mBinder = new IMyService.Stub() {
        @Override
        public void registerCallback(IMyCallback callback) {
            mCallbacks.register(callback);
        }
        
        @Override
        public void unregisterCallback(IMyCallback callback) {
            mCallbacks.unregister(callback);
        }
        
        @Override
        public void startTask() {
            new Thread(() -> {
                for (int i = 0; i <= 100; i++) {
                    // 通知所有回调
                    final int progress = i;
                    final int N = mCallbacks.beginBroadcast();
                    for (int j = 0; j < N; j++) {
                        try {
                            mCallbacks.getBroadcastItem(j)
                                .onProgress(progress);
                        } catch (RemoteException e) {
                            // 回调失败
                        }
                    }
                    mCallbacks.finishBroadcast();
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {}
                }
            }).start();
        }
    };
    
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        mCallbacks.kill();
    }
}
```

### 6.3 客户端实现

```java
// ClientActivity.java
public class ClientActivity extends Activity {
    private IMyService mService;
    private IMyCallback mCallback = new IMyCallback.Stub() {
        @Override
        public void onEvent(String event) {
            runOnUiThread(() -> {
                // 处理事件
            });
        }
        
        @Override
        public void onProgress(int progress) {
            runOnUiThread(() -> {
                // 更新进度
            });
        }
        
        @Override
        public void onComplete(String result) {
            runOnUiThread(() -> {
                // 处理完成
            });
        }
    };
    
    private ServiceConnection mConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            mService = IMyService.Stub.asInterface(service);
            try {
                mService.registerCallback(mCallback);
                mService.startTask();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
        
        @Override
        public void onServiceDisconnected(ComponentName name) {
            mService = null;
        }
    };
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mService != null) {
            try {
                mService.unregisterCallback(mCallback);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
    }
}
```

### 6.4 RemoteCallbackList 的优势

| 特性 | RemoteCallbackList | 普通 List |
|------|-------------------|----------|
| 死亡通知 | ✅ 自动处理 | ❌ 需要手动处理 |
| 线程安全 | ✅ | ❌ |
| 广播优化 | ✅ beginBroadcast/finishBroadcast | ❌ |
| 内存泄漏 | ❌ 自动清理 | ✅ 可能泄漏 |

---

## 七、进程间异常处理

### 7.1 RemoteException

AIDL 方法都会抛出 RemoteException，需要妥善处理。

```java
try {
    int result = mService.add(1, 2);
} catch (RemoteException e) {
    // Server 进程崩溃或连接断开
    e.printStackTrace();
}
```

### 7.2 异常类型

| 异常 | 说明 | 处理方式 |
|------|------|---------|
| RemoteException | 通信失败 | 重连或提示用户 |
| SecurityException | 权限不足 | 检查权限 |
| IllegalArgumentException | 参数错误 | 检查参数 |
| DeadObjectException | Server 已死亡 | 重新绑定服务 |

### 7.3 死亡通知

```java
// 注册死亡通知
IBinder binder = mService.asBinder();
try {
    binder.linkToDeath(new IBinder.DeathRecipient() {
        @Override
        public void binderDied() {
            // Server 死亡
            runOnUiThread(() -> {
                // 重新绑定服务
                bindService(new Intent(this, MyService.class), 
                    mConnection, BIND_AUTO_CREATE);
            });
        }
    }, 0);
} catch (RemoteException e) {
    // Server 已经死亡
}

// 取消死亡通知（可选）
binder.unlinkToDeath(deathRecipient, 0);
```

### 7.4 超时处理

```java
// 设置 Binder 调用超时（Android 12+）
Bundle options = new Bundle();
options.putInt(IBinder.EXTRA_BINDER_CALL_TIMEOUT_MS, 5000);

// 使用 withOptions 调用
mService.withOptions(options).startTask();
```

---

## 八、Messenger vs AIDL

### 8.1 Messenger 机制

Messenger 是基于 Message 的 IPC 机制，底层也使用 Binder。

```java
// 服务端
public class MessengerService extends Service {
    private class IncomingHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MSG_SAY_HELLO:
                    // 处理消息
                    break;
            }
        }
    }
    
    final Messenger mMessenger = new Messenger(new IncomingHandler());
    
    @Override
    public IBinder onBind(Intent intent) {
        return mMessenger.getBinder();
    }
}

// 客户端
Messenger mService = null;
boolean mMessengerRegistered = false;

private ServiceConnection mConnection = new ServiceConnection() {
    public void onServiceConnected(ComponentName className, IBinder service) {
        mService = new Messenger(service);
    }
    
    public void onServiceDisconnected(ComponentName className) {
        mService = null;
    }
};

// 发送消息
Message msg = Message.obtain(null, MSG_SAY_HELLO);
msg.replyTo = new Messenger(new Handler());
try {
    mService.send(msg);
} catch (RemoteException e) {
    e.printStackTrace();
}
```

### 8.2 Messenger vs AIDL 对比

| 特性 | Messenger | AIDL |
|------|-----------|------|
| 复杂度 | 低 | 中 |
| 灵活性 | 低（只能传 Message） | 高（自定义接口） |
| 性能 | 中 | 高 |
| 适用场景 | 简单消息传递 | 复杂接口调用 |
| 线程模型 | 单线程处理 | 多线程（Binder 线程池） |
| 代码量 | 少 | 中（AIDL 文件 + 实现） |

### 8.3 选择建议

| 场景 | 推荐 | 理由 |
|------|------|------|
| 简单消息传递 | Messenger | 代码简单，易于维护 |
| 复杂接口定义 | AIDL | 接口清晰，类型安全 |
| 高性能要求 | AIDL | 直接方法调用，无 Message 开销 |
| 跨进程单线程 | Messenger | Handler 机制，天然单线程 |
| 系统服务 | AIDL | Android 标准做法 |

---

## 九、面试考点

### 9.1 基础问题

#### Q1: 什么是 AIDL？

**参考答案**：
AIDL（Android Interface Definition Language）是 Android 提供的接口定义语言，用于定义 Client 端和 Server 端之间的通信接口。AIDL 文件会被编译成 Java 代码，生成 Stub（服务端）和 Proxy（客户端）类，底层使用 Binder 机制实现跨进程通信。AIDL 支持基本类型、String、List、Map 和 Parcelable 类型。

#### Q2: AIDL 支持哪些数据类型？

**参考答案**：
AIDL 支持的数据类型包括：
1. **基本类型**：int、long、boolean、float、double
2. **String** 和 **CharSequence**
3. **List**：元素必须是支持类型，如 List<String>
4. **Map**：键值必须是支持类型，如 Map<String, Integer>
5. **Parcelable**：实现 Parcelable 接口的类
6. **AIDL 接口**：其他 AIDL 定义的接口

注意：List 和 Map 不支持泛型嵌套，自定义类必须实现 Parcelable。

#### Q3: AIDL 中的 in/out/inout 修饰符有什么区别？

**参考答案**：
1. **in**：数据从 Client 流向 Server（默认），Server 可以读取但不能修改（修改不会传回）
2. **out**：数据从 Server 流向 Client，Client 传入的值被忽略，Server 必须赋值
3. **inout**：数据双向流动，Client 传入初始值，Server 修改后传回

基本类型只能是 in 修饰。inout 需要两次序列化，性能较差，建议尽量使用 in 修饰并通过返回值传递结果。

### 9.2 进阶问题

#### Q4: AIDL 生成的 Stub 和 Proxy 分别是什么？

**参考答案**：
AIDL 编译后生成一个 Java 文件，包含：
1. **Stub 抽象类**：
   - 继承自 Binder，实现 IInterface
   - 实现 onTransact() 方法，处理客户端调用
   - 提供 asInterface() 方法，获取接口实例
   - 服务端继承 Stub 实现具体业务逻辑

2. **Proxy 静态内部类**：
   - 实现 IInterface 接口
   - 持有 IBinder 引用（远程对象的代理）
   - 实现接口方法，通过 transact() 发起 IPC 调用
   - 负责参数序列化和返回结果反序列化

**调用流程**：
- Client 调用 Proxy 方法 → 序列化参数 → transact() → Binder 驱动
- Server 端 onTransact() → 反序列化参数 → 调用实现方法 → 返回结果

#### Q5: 如何实现 AIDL 回调？

**参考答案**：
AIDL 回调实现步骤：
1. 定义回调接口 AIDL 文件（如 IMyCallback.aidl）
2. 在主接口中定义 registerCallback/unregisterCallback 方法
3. 服务端使用 RemoteCallbackList 管理回调
4. 服务端调用回调时，使用 beginBroadcast/finishBroadcast
5. 客户端实现回调接口，注册到服务端

**RemoteCallbackList 优势**：
- 自动处理 Binder 死亡
- 线程安全
- 避免内存泄漏
- 提供广播优化

#### Q6: Messenger 和 AIDL 有什么区别？

**参考答案**：
| 特性 | Messenger | AIDL |
|------|-----------|------|
| 机制 | 基于 Message | 基于接口方法 |
| 复杂度 | 低 | 中 |
| 灵活性 | 低 | 高 |
| 线程模型 | 单线程（Handler） | 多线程（Binder 线程池） |
| 适用场景 | 简单消息传递 | 复杂接口调用 |

Messenger 适合简单的消息传递场景，代码简单；AIDL 适合复杂的接口定义，类型安全，性能更好。

### 9.3 深度问题

#### Q7: AIDL 的线程模型是怎样的？

**参考答案**：
AIDL 的线程模型基于 Binder 线程池：
1. **Client 线程**：发起调用的线程，通过 Proxy.transact() 发送请求
2. **Server 线程池**：Server 进程启动时创建，默认 15 个线程
3. **调用分发**：Binder 驱动将请求分发到 Server 线程池中的空闲线程

**注意事项**：
- Server 端方法可能被多个线程并发调用，需要线程同步
- 避免在 AIDL 方法中执行耗时操作（会占用 Binder 线程）
- 耗时操作应放到工作线程，AIDL 方法只负责调度
- Client 端调用会阻塞，直到 Server 返回结果

**代码示例**：
```java
// 服务端 - 线程安全实现
private final Object mLock = new Object();
private int mCount = 0;

@Override
public int getCount() {
    synchronized (mLock) {
        return mCount;
    }
}

@Override
public void increment() {
    synchronized (mLock) {
        mCount++;
    }
}
```

#### Q8: AIDL 如何处理大数据传输？

**参考答案**：
AIDL 传输大数据的限制和优化：
1. **限制**：
   - 单次 Binder 事务限制：1MB（BINDER_REPLY_LIMIT）
   - 超过限制会抛出 TransactionTooLargeException

2. **优化方案**：
   - **分片传输**：将大数据分成多个小块传输
   - **文件描述符**：使用 ParcelFileDescriptor 传递文件
   - **共享内存**：使用 Ashmem 或 MemoryFile
   - **ContentProvider**：通过 ContentProvider 共享数据

**代码示例**：
```aidl
// 使用文件描述符
interface IMyService {
    ParcelFileDescriptor getLargeData();
    void putLargeData(ParcelFileDescriptor fd);
}
```

```java
// 服务端
@Override
public ParcelFileDescriptor getLargeData() {
    File file = new File(getFilesDir(), "large_data.bin");
    return ParcelFileDescriptor.open(file, 
        ParcelFileDescriptor.MODE_READ_ONLY);
}

// 客户端
ParcelFileDescriptor fd = mService.getLargeData();
FileInputStream fis = new FileInputStream(fd.getFileDescriptor());
// 读取数据
```

#### Q9: AIDL 的性能优化有哪些？

**参考答案**：
AIDL 性能优化建议：
1. **减少调用次数**：批量处理，避免频繁调用
2. **减少数据量**：只传输必要数据，使用 in 修饰
3. **避免大对象**：使用文件描述符或共享内存
4. **异步调用**：使用 oneway 方法（单向调用）
5. **线程池优化**：调整 Binder 线程池大小
6. **避免嵌套调用**：Client → Server → Client 会导致死锁

**oneway 方法**：
```aidl
// oneway 方法不阻塞 Client
oneway void logEvent(String event);
```

**注意事项**：
- oneway 方法没有返回值
- oneway 方法不保证执行顺序
- oneway 方法失败不会通知 Client

---

## 十、参考资料

1. [Android 官方文档 - AIDL](https://developer.android.com/guide/components/aidl)
2. [Android 源码 - aidl](https://android.googlesource.com/platform/frameworks/base/+/master/tools/aidl/)
3. [Parcelable 官方指南](https://developer.android.com/reference/android/os/Parcelable)
4. [RemoteCallbackList 源码](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/os/RemoteCallbackList.java)
5. [Binder 性能优化](https://source.android.com/devices/architecture/binder)

---

**本文约 13,000 字，涵盖 AIDL 跨进程通信的核心知识点。建议结合源码深入理解，并在实际项目中实践 AIDL 的使用**。
