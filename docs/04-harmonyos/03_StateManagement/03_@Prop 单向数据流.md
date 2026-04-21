# @Prop 单向数据流

> @Prop 实现父子单向数据传递，是组件间通信的基础方式之一。

---

## 1. @Prop 基本用法

```typescript
// 子组件
@Component
struct UserInfo {
    @Prop name: string = '未知'
    @Prop age: number = 0
    @Prop isActive: boolean = false

    build() {
        Row() {
            Text(this.name)
                .fontSize(18fp)
                .fontWeight(FontWeight.Bold)
            Text(` (${this.age}岁)`)
                .fontColor(Color.Gray)
            Text(this.isActive ? ' 🟢' : ' ⚫')
        }
    }
}

// 父组件
@Entry
@Component
struct Index {
    @State user: { name: string; age: number; isActive: boolean } = {
        name: '小明',
        age: 25,
        isActive: true
    }

    build() {
        Column() {
            UserInfo({
                name: this.user.name,
                age: this.user.age,
                isActive: this.user.isActive
            })
            Button('修改名字')
                .onClick(() => {
                    this.user = {
                        ...this.user,
                        name: '小红'
                    }
                })
        }
    }
}
```

---

## 2. @Prop 的核心特性

| 特性 | 说明 |
|---|-|
| **数据流方向** | 单向（父 → 子） |
| **传递方式** | 深拷贝（Deep Copy） |
| **子组件可修改** | ❌ 不允许 |
| **父子更新** | 父更新 → 子自动更新 |
| **性能** | 简单类型好，复杂对象差 |

---

## 3. @Prop 的深拷贝问题

### 3.1 简单类型（没问题）

```typescript
// @Prop 传递简单类型 = 值拷贝，没问题
@Component
struct Child {
    @Prop count: number  // ✅ 值拷贝，性能 OK
    @Prop name: string   // ✅ 值拷贝，性能 OK
    @Prop visible: boolean  // ✅ 值拷贝，性能 OK
}
```

### 3.2 复杂对象（性能差！）

```typescript
// ❌ @Prop 传递复杂对象 = 深拷贝，性能差
@Component
struct Child {
    @Prop userData: {  // 深拷贝！
        name: string
        address: {
            city: string
            street: string
            zip: string
        }
        preferences: Record<string, any>
    }
}

// 父组件每次变化都深拷贝一次 → 性能下降
// 对象越大，拷贝耗时越长
```

---

## 4. @Prop 的替代方案

### 当 @Prop 性能不够时

```
@Prop（深拷贝）
    ↓
性能不够（复杂对象/大数据）
    ↓
改用 → @Link（引用传递）或 @ObjectLink（深度绑定）
```

### @Link 替代（推荐）

```typescript
// 子组件：用 @Link 代替 @Prop
@Component
struct Child {
    @Link userData: UserData  // 引用传递，无拷贝开销
}

// 父组件
@Entry
@Component
struct Index {
    @Link userData: UserData = new UserData()

    build() {
        Column() {
            Child({ userData: this.userData })
        }
    }
}
```

---

## 5. @Prop 的默认值

```typescript
@Component
struct Card {
    @Prop title: string = '默认标题'  // 默认值
    @Prop count: number = 0
    @Prop visible: boolean = true
    @Prop color: Color = Color.Blue

    build() {
        Text(this.title)
            .fontSize(20fp)
            .fontColor(this.color)
    }
}

// 父组件可以不传某些 @Prop
Card({
    title: '我的卡片'
    // count 用默认值 0
    // visible 用默认值 true
})
```

---

## 6. @Prop 的限制

### 6.1 不允许在子组件中修改

```typescript
@Component
struct Child {
    @Prop count: number = 0

    build() {
        Button('增加')
            .onClick(() => {
                // ❌ 编译错误！不允许修改 @Prop
                this.count++
            })
    }
}
```

### 6.2 父组件的值必须是 @State

```typescript
// ✅ 正确：父组件的变量是 @State
@State userName: string = '小明'
Child({ name: this.userName })

// ❌ 错误：父组件的变量不是 @State
userName: string = '小明'  // ❌
Child({ name: this.userName })
```

---

## 7. 面试高频考点

### Q1: @Prop 的传递方式？

**回答**：@Prop 通过深拷贝传递数据（父 → 子）。简单类型性能好，复杂对象因为深拷贝性能差。

### Q2: @Prop 的子组件可以修改吗？

**回答**：不可以。@Prop 是单向数据流，子组件只能读取，不能修改。需要双向同步用 @Link。

### Q3: @Prop 性能差的场景？

**回答**：传递复杂对象时，因为 @Prop 是深拷贝，对象越大拷贝耗时越长。应改用 @Link（引用传递）或 @ObjectLink（深度绑定）。

---

> 🐱 **小猫提示**：@Prop 记住 **"单向拷贝、简单类型好、复杂对象改用 @Link"**。面试常考和 @Link 的对比。
