# @State 本地状态

> @State 是最基础的状态装饰器，管理组件内部私有状态。

---

## 1. @State 基本用法

```typescript
@Component
struct Counter {
    @State count: number = 0
    @State name: string = 'Hello'
    @State items: string[] = ['a', 'b', 'c']
    @State isVisible: boolean = true

    build() {
        Column() {
            Text(`计数: ${this.count}`)
                .fontSize(24fp)

            Button('增加')
                .onClick(() => {
                    this.count++  // ✅ 触发 UI 更新
                })
        }
    }
}
```

---

## 2. @State 的底层原理

```
@State 变量
    ↓
ArkUI Proxy 代理（拦截 getter/setter）
    ↓
变化检测
    ↓
创建变更记录
    ↓
标记关联组件为脏节点
    ↓
调度 UI 线程执行 build()
```

### 关键点

1. **Proxy 拦截**：@State 的 get/set 被 ArkUI 的代理对象拦截
2. **严格相等比较**：`oldValue !== newValue` 判断是否变化
3. **引用检测**：数组和对象检测的是引用，不是内容

---

## 3. @State 的触发条件

### ✅ 触发更新的情况

```typescript
// 1. 简单类型赋值
this.count = 42          // ✅ number 类型

// 2. 字符串赋值
this.name = 'New Name'   // ✅ string 类型

// 3. 布尔值赋值
this.isVisible = true    // ✅ boolean 类型

// 4. 数组增删
this.items.push('d')     // ✅ 数组操作
this.items.pop()         // ✅ 数组操作

// 5. 不可变赋值
this.user = { ...this.user, name: 'New' }  // ✅ 新引用

// 6. 数组不可变赋值
this.items = [...this.items, 'd']  // ✅ 新数组引用
```

### ❌ 不触发更新的情况

```typescript
// 1. 数组索引赋值（不触发！）
this.items[0] = 'x'      // ❌ 不触发更新

// 2. 对象属性直接修改（不触发！）
this.user.name = 'New'   // ❌ 不触发更新

// 3. 值未变化（不触发！）
this.count = this.count  // ❌ 值相同，不触发更新

// 4. build 中修改状态（不推荐）
build() {
    this.count = 10  // ❌ build 中不应修改状态
}
```

---

## 4. @State 的私有性

```typescript
@Component
struct Counter {
    @State private count: number = 0  // 私有状态

    increment() {
        this.count++
    }
}

// 父组件无法直接访问 this.count
// 只能通过 @Prop / @Link 传递
```

---

## 5. @State 的常见使用场景

| 场景 | 示例 |
|---|-|
| 计数器 | `@State count: number = 0` |
| 输入值 | `@State input: string = ''` |
| 布尔状态 | `@State isLoading: boolean = false` |
| 列表数据 | `@State items: string[] = []` |
| 选中状态 | `@State selectedIndex: number = -1` |
| 弹窗显示 | `@State showPopup: boolean = false` |

---

## 6. 性能注意事项

### 6.1 状态粒度

```typescript
// ❌ 状态过大 → 更新时影响范围广
@State pageData: {
    user: User
    posts: Post[]
    comments: Comment[]
    loading: boolean
    error: string
} = { ... }

// ✅ 拆分状态 → 局部更新
@State user: User = { ... }
@State posts: Post[] = []
@State loading: boolean = false
```

### 6.2 避免在 build 中创建新对象

```typescript
// ❌ 每次 build 都创建新数组 → 可能触发不必要的更新
build() {
    ForEach(this.getItems(), (item) => { ... })
}

// ✅ 状态中管理
@State items: Item[] = [...]
build() {
    ForEach(this.items, (item) => { ... })
}
```

---

## 7. 面试高频考点

### Q1: @State 的作用和原理？

**回答**：@State 装饰组件内部的私有状态变量。底层通过 ArkUI Proxy 拦截 getter/setter，变化时检测新旧值不等则标记脏节点，调度 UI 线程执行 build() 更新。

### Q2: @State 能检测到数组内部变化吗？

**回答**：只能检测数组的增删（push/pop/splice），不能检测索引赋值（arr[0] = 'x'）。嵌套对象的属性变化需要用 @Observed + @ObjectLink。

### Q3: @State 的触发条件是什么？

**回答**：Proxy 拦截到 set 操作，且新旧值严格不等（!==）。数组检测引用变化，简单类型检测值变化。

---

> 🐱 **小猫提示**：@State 记住三个关键词——**"私有状态、Proxy拦截、引用检测"**。面试必考。
