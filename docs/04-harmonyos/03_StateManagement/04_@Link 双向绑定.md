# @Link 双向绑定

> @Link 实现父子双向数据同步，是 ArkTS 中最重要的状态管理装饰器之一。

---

## 1. @Link 基本用法

### 1.1 父子双向绑定

```typescript
// 子组件
@Component
struct AgeInput {
    @Link age: number  // 双向绑定

    build() {
        Column() {
            Text('年龄: ')
            TextInput({ placeholder: '请输入年龄' })
                .type(InputType.Number)
                .onChange((value: string) => {
                    this.age = parseInt(value) || 0  // 双向同步到父
                })
        }
    }
}

// 父组件
@Entry
@Component
struct Index {
    @State age: number = 0  // @Link 要求父变量是 @State

    build() {
        Column() {
            Text(`当前年龄: ${this.age}`)
            AgeInput({ age: this.age })
        }
    }
}
```

### 1.2 数据流

```
父组件 @State age = 25
    ↓ @Link（初始化时复制）
子组件 @Link age = 25

子组件修改 age = 30
    ↓
双向同步到父组件
    ↓
父组件 @State age = 30  ← 自动更新！
    ↓
所有使用 age 的组件自动刷新
```

---

## 2. @Link vs @Prop 对比

| 特性 | @Prop | @Link |
|---|---|-|
| 数据流 | 单向（父→子） | 双向（父↔子） |
| 传递方式 | 深拷贝 | 引用 |
| 子组件可修改 | ❌ | ✅ |
| 复杂对象性能 | 差（深拷贝） | 好（引用） |
| 适用场景 | 只读数据 | 需要双向同步 |

---

## 3. @Link 的使用规则

### 3.1 父组件变量必须是 @State 或 @Link

```typescript
// ✅ 正确：@State
@State userName: string = '小明'
ChildComponent({ name: this.userName })

// ✅ 正确：从更外层 @Link 来的
@Link childName: string
ChildComponent({ name: this.childName })

// ❌ 错误：普通变量
userName: string = '小明'  // ❌
ChildComponent({ name: this.userName })
```

### 3.2 传递方式

```typescript
// ✅ 正确：变量直接传递
Child({ value: this.myValue })

// ❌ 错误：常量传递
Child({ value: 42 })  // 编译错误
Child({ value: 'hello' })  // 编译错误
```

---

## 4. @Link 的实际应用

### 4.1 表单双向绑定

```typescript
// 子组件：表单输入
@Component
struct FormInput {
    @Link value: string
    @Prop placeholder: string = ''

    build() {
        TextInput({ placeholder: this.placeholder })
            .onChange((val: string) => {
                this.value = val  // 自动同步到父
            })
    }
}

// 父组件
@Entry
@Component
struct Index {
    @State username: string = ''
    @State email: string = ''
    @State password: string = ''

    build() {
        Column() {
            FormInput({
                value: this.username,
                placeholder: '用户名'
            })
            FormInput({
                value: this.email,
                placeholder: '邮箱'
            })
            FormInput({
                value: this.password,
                placeholder: '密码'
            })
            Button('提交')
                .onClick(() => {
                    console.log(this.username, this.email, this.password)
                })
        }
    }
}
```

### 4.2 Toggle/Switch 双向绑定

```typescript
@Component
struct ToggleComponent {
    @State checked: boolean = false
    @Link value: boolean  // 双向绑定

    build() {
        Row() {
            Switch({
                type: SwitchType.CIRCLE,
                selected: this.value  // 双向
            })
            .onChange((v: boolean) => {
                this.value = v  // 同步到父
            })
            Text(this.value ? '开启' : '关闭')
        }
    }
}
```

---

## 5. @Link 与 @State 的关系

```
@Link 本质上是对 @State 的"代理引用"

父组件: @State count = 0  →  真实的源数据
    ↓ @Link
子组件: @Link count = 0  →  代理引用（指向父组件的 @State）

修改任一端的值 → 另一端自动同步
```

---

## 6. 常见陷阱

### 6.1 @Link 不能用于局部变量

```typescript
// ❌ 错误
function test() {
    let localValue = 0
    Child({ value: localValue })  // ❌ localValue 不是 @State
}

// ✅ 正确
@State localValue: number = 0
Child({ value: this.localValue })
```

### 6.2 @Link 在组件中的正确声明

```typescript
// ✅ 正确：@Link 声明
@Component
struct Child {
    @Link value: number

    build() {
        Text(`${this.value}`)
    }
}

// ❌ 错误：@Link 不能和普通变量混用在不合适的位置
@Component
struct Child {
    value: number = 0  // ❌ 没有 @Link 装饰
    build() { ... }
}
```

---

## 7. 面试高频考点

### Q1: @Link 的作用？

**回答**：实现父子双向数据绑定。修改子组件值会自动同步到父组件，反之亦然。父组件的变量必须是 @State。

### Q2: @Link vs @Prop 的区别？

**回答**：@Prop 单向拷贝（父→子），适合只读数据；@Link 双向引用（父↔子），适合需要双向同步的数据。复杂对象建议用 @Link 避免深拷贝开销。

### Q3: @Link 要求父组件变量是什么类型？

**回答**：必须是 @State 或 @Link。不能用普通变量。

---

> 🐱 **小猫提示**：@Link 记住 **"双向引用、父必须是@State、复杂对象优先"**。面试中与 @Prop 对比是必考点。
