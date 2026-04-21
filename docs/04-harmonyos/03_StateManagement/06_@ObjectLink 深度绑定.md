# @ObjectLink 深度绑定

> 解决 @State 无法检测嵌套对象属性变化的问题。

---

## 1. 问题背景

```
@State 的局限性：
├─ ✅ 能检测：数组增删
├─ ✅ 能检测：对象引用变化
├─ ❌ 不能检测：嵌套对象属性变化
└─ ❌ 不能检测：数组索引赋值
```

```typescript
@Component
struct Index {
    @State user: User = { name: '小明', address: { city: '北京' } }

    // ✅ @State 能检测 name 变化
    changeName() {
        this.user = { ...this.user, name: '小红' }  // 新引用
    }

    // ❌ @State 不能检测 city 变化
    changeCity() {
        this.user.address.city = '上海'  // ❌ 不会触发 UI 刷新！
    }
}
```

---

## 2. @Observed + @ObjectLink 方案

### 2.1 @Observed — 标记需要深度观察的类

```typescript
import { Observed, ObjectLink } from '@kit.ArkUI'

// 被观察的类（标记 @Observed）
@Observed
class Address {
    city: string = '北京'
    street: string = '长安街'
}

@Observed
class User {
    name: string = '小明'
    address: Address = new Address()
}
```

### 2.2 @ObjectLink — 接收 @Observed 对象

```typescript
// 子组件
@Component
struct UserCard {
    @ObjectLink user: User  // 深度绑定

    build() {
        Column() {
            Text(`姓名: ${this.user.name}`)
                .fontSize(18fp)
            Text(`城市: ${this.user.address.city}`)
                .fontSize(16fp)
                .fontColor(Color.Gray)
        }
    }
}

// 父组件
@Entry
@Component
struct Index {
    @State user: User = new User()

    build() {
        Column() {
            UserCard({ user: this.user })

            Button('修改城市')
                .onClick(() => {
                    // ✅ 现在可以触发 UI 刷新！
                    this.user.address.city = '上海'
                })
        }
    }
}
```

---

## 3. @ObjectLink 的工作原理

```
@Observed 类实例
    ↓
Proxy 拦截属性变化
    ↓
@ObjectLink 检测到变化
    ↓
标记关联组件为脏节点
    ↓
UI 线程执行 build()
```

---

## 4. 深层嵌套示例

### 4.1 多层嵌套

```typescript
@Observed
class Address {
    city: string = '北京'
    zipCode: string = '100000'
}

@Observed
class UserProfile {
    name: string = '小明'
    age: number = 25
    address: Address = new Address()
}

@Observed
class AppData {
    users: UserProfile[] = []
    currentUser: UserProfile = new UserProfile()
}
```

```typescript
// 子组件
@Component
struct AddressCard {
    @ObjectLink address: Address

    build() {
        Text(`城市: ${this.address.city}, 邮编: ${this.address.zipCode}`)
    }
}

// 孙组件
@Component
struct UserDetail {
    @ObjectLink user: UserProfile

    build() {
        Column() {
            Text(`姓名: ${this.user.name}`)
            AddressCard({ address: this.user.address })
        }
    }
}
```

---

## 5. @ObjectLink 的限制

| 限制 | 说明 |
|---|-|
| 必须配合 @Observed | @ObjectLink 只能接收 @Observed 装饰的类 |
| 性能开销 | 每层属性都经过 Proxy 拦截 |
| 初始化 | @Observed 类必须用 new 实例化 |
| 兼容性 | API 10+ 支持 |

---

## 6. 替代方案

### 6.1 不可变赋值（不推荐，性能差）

```typescript
// 通过创建新对象触发更新
this.user = {
    ...this.user,
    address: {
        ...this.user.address,
        city: '上海'
    }
}
```

### 6.2 @ObjectLink（推荐）

```typescript
// 性能更好，代码更简洁
this.user.address.city = '上海'  // ✅ 直接修改
```

---

## 7. 面试高频考点

### Q1: 为什么 @State 不能检测嵌套对象属性变化？

**回答**：@State 只检测对象引用变化，不追踪对象内部属性的变化。嵌套对象的属性变化需要 @Observed + @ObjectLink 方案。

### Q2: @Observed + @ObjectLink 的原理？

**回答**：@Observed 类使用 Proxy 拦截属性变化，@ObjectLink 接收 @Observed 对象并监听其变化，变化时标记关联组件为脏节点。

### Q3: @ObjectLink 和 @ObjectLinkV2/@Trace 的区别？

**回答**：V1 的 @ObjectLink 需要 @Observed 装饰类，V2（API 12+）使用 @Trace 可以直接深度监听，无需 @ObjectLink。

---

> 🐱 **小猫提示**：@ObjectLink 记住 **"嵌套对象用 @Observed + @ObjectLink，直接修改属性即可触发刷新"**。
