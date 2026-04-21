# @Watch 状态监听

> @Watch 装饰器监听状态变量变化，在变化时执行自定义回调函数。

---

## 1. @Watch 基本用法

```typescript
@Component
struct Index {
    @Watch('onCountChange')  // 监听 count 变化
    @State count: number = 0

    @Watch('onNameChange')  // 监听 name 变化
    @State name: string = 'Hello'

    // 回调函数
    onCountChange(oldValue: number, newValue: number): void {
        console.log(`count 变化: ${oldValue} → ${newValue}`)
        // 可以在这里执行副作用逻辑
    }

    onNameChange(oldValue: string, newValue: string): void {
        console.log(`name 变化: ${oldValue} → ${newValue}`)
    }

    build() {
        Column() {
            Text(`计数: ${this.count}`)
            Button('增加')
                .onClick(() => {
                    this.count++  // 触发 onCountChange
                })
        }
    }
}
```

---

## 2. @Watch 的回调函数签名

```typescript
// 标准签名
function onNameChange(oldValue: T, newValue: T): void {
    // oldValue: 变化前的值
    // newValue: 变化后的值
}
```

### 回调中可以做什麼

| 可以做 | 不可以做 |
|---|-|
| 发起网络请求 | 修改 UI 状态（避免循环） |
| 日志记录 | 在 build() 中 |
| 数据转换/计算 | 触发其他 @State 变化 |
| 发送事件通知 | 同步阻塞操作 |

---

## 3. 实际应用场景

### 3.1 数据变化时自动请求

```typescript
@Component
struct SearchPage {
    @Watch('onKeywordChange')
    @State keyword: string = ''
    @State results: SearchResult[] = []

    // 关键词变化时自动搜索
    onKeywordChange(oldValue: string, newValue: string): void {
        if (newValue.length >= 2) {
            this.search(newVal)
        }
    }

    async search(keyword: string) {
        const response = await http.get(`/api/search?q=${keyword}`)
        this.results = response.data
    }

    build() {
        Column() {
            TextInput({ placeholder: '搜索' })
                .onChange((value: string) => {
                    this.keyword = value
                })
            ForEach(this.results, (item: SearchResult) => {
                Text(item.title)
            })
        }
    }
}
```

### 3.2 权限监听

```typescript
@Component
struct CameraPage {
    @Watch('onCameraPermissionChange')
    @State hasCameraPermission: boolean = false

    onCameraPermissionChange(oldValue: boolean, newValue: boolean): void {
        if (!newValue) {
            // 权限被拒绝，跳转设置页
            console.log('相机权限被拒绝')
        }
    }

    build() {
        if (this.hasCameraPermission) {
            CameraView()
        } else {
            Text('请授予相机权限')
        }
    }
}
```

### 3.3 数据同步

```typescript
@Component
struct SyncPage {
    @Watch('onNetworkChange')
    @State isOnline: boolean = true
    @State pendingData: any[] = []

    onNetworkChange(oldValue: boolean, newValue: boolean): void {
        if (newValue && this.pendingData.length > 0) {
            // 网络恢复，同步待上传数据
            this.uploadPendingData()
        }
    }

    async uploadPendingData() {
        for (const data of this.pendingData) {
            await http.post('/api/sync', data)
        }
        this.pendingData = []
    }

    build() {
        Text(this.isOnline ? '在线' : '离线')
    }
}
```

---

## 4. @Watch 的限制

### 4.1 回调函数必须是同步的

```typescript
// ✅ 正确：同步回调
@Watch('onChange')
@State value: string = ''

onChange(oldValue: string, newValue: string): void {
    console.log(newValue)  // 同步处理
}

// ❌ 错误：async 函数（@Watch 不支持）
@Watch('onChange')
@State value: string = ''

async onChange(oldValue: string, newValue: string): void {
    await fetchData()  // ❌ @Watch 回调不支持 async
}
```

### 4.2 避免循环触发

```typescript
// ❌ 循环触发！
@Watch('onAChange')
@State a: number = 0

@Watch('onBChange')
@State b: number = 0

onAChange(oldValue: number, newValue: number): void {
    this.b = newValue + 1  // 触发 onBChange
}

onBChange(oldValue: number, newValue: number): void {
    this.a = newValue + 1  // 触发 onAChange → 死循环！
}
```

---

## 5. 状态管理方案总结

| 装饰器 | 作用 | 场景 |
|---|-|-|
| `@State` | 本地状态 | 组件内部私有状态 |
| `@Prop` | 单向传参 | 父→子只读数据 |
| `@Link` | 双向绑定 | 父↔子双向同步 |
| `@ObjectLink` | 深度绑定 | 嵌套对象监听 |
| `@Provide` | 跨树提供 | 祖父→后代数据传递 |
| `@Consume` | 跨树消费 | 后代获取祖父数据 |
| `@Watch` | 变化监听 | 状态变化时触发副作用 |
| `@Observed` | 类标记 | 配合 @ObjectLink 深度监听 |

---

## 6. 面试高频考点

### Q1: @Watch 的作用？

**回答**：监听 @State 状态变量的变化，在变化时执行自定义回调函数。可用于自动请求、数据同步、权限监听等场景。

### Q2: @Watch 回调的限制？

**回答**：回调必须是同步函数，不能是 async；不能在回调中修改其他 @State 避免循环触发；不能在 build() 中执行。

---

> 🐱 **小猫提示**：@Watch 记住 **"状态变化→执行回调→做副作用（请求/同步/日志）"**。
