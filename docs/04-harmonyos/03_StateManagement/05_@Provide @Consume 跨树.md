# @Provide / @Consume 跨树共享

> @Provide 和 @Consume 实现跨组件层级的数据共享，无需逐层传递。

---

## 1. @Provide / @Consume 基本概念

### 核心概念

当父子组件层级较深时（如爷爷→孙子），不需要中间组件逐层转发数据，使用 @Provide/@Consume 可以直接跨越层级。

```
UIAbility（应用级）
    ↓ @Provide (提供)
    页面 A
        ↓ （不需要转发！）
        组件 B
            ↓ （不需要转发！）
            组件 C ← @Consume (消费)
```

---

## 2. 基本用法

### 2.1 祖父组件提供数据

```typescript
// 祖父组件（提供数据）
@Entry
@Component
struct App {
    @Provide theme: string = 'light'
    @Provide fontSize: number = 16

    build() {
        Column() {
            // 页面不需要做任何转发
            ContentPage()
        }
    }
}
```

### 2.2 中间组件（什么都不做）

```typescript
// 中间组件（不需要转发）
@Component
struct ContentPage {
    build() {
        Column() {
            // 不需要 @Prop 或 @Link 转发
            GrandChild()
        }
    }
}
```

### 2.3 孙子组件消费数据

```typescript
// 孙子组件（消费数据）
@Component
struct GrandChild {
    @Provide theme: string = 'dark'  // 也可以提供，向下传递
    @Consume fontSize: number         // 消费祖父提供的数据

    build() {
        Text('内容')
            .fontSize(this.fontSize + fp)
            .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
    }
}
```

---

## 3. 数据流向

```
@Provide 提供 → 向下传递 → @Consume 消费
    ↓
值变化 → @Consume 自动更新
    ↓
@Consume 可以修改 → 向上同步到 @Provide
```

### 双向同步

```
祖父 @Provide theme = 'light'
    ↓ @Consume
孙子 @Consume theme = 'light'

孙子修改 @Consume theme = 'dark'
    ↓ 自动同步
祖父 @Provide theme = 'dark'  ← 自动更新！
```

---

## 4. @Provide/@Consume 的限制

| 限制 | 说明 |
|---|-|
| **必须成对** | 有 @Provide 必须有 @Consume |
| **类型一致** | @Provide 和 @Consume 的类型完全匹配 |
| **不能为常量** | @Provide 的变量必须是 @State |
| **值自动同步** | 两端值始终一致 |

---

## 5. 实际应用场景

### 5.1 主题切换

```typescript
// 根组件
@Entry
@Component
struct App {
    @Provide theme: ThemeType = ThemeType.Light

    build() {
        Column() {
            Navigation()
                .backgroundColor(this.theme === ThemeType.Light ? Color.White : Color.Black)
        }
    }
}

// 深层组件
@Component
struct DeepButton {
    @Consume theme: ThemeType

    build() {
        Button('点击')
            .backgroundColor(this.theme === ThemeType.Light ? Color.Blue : Color.Yellow)
            .fontColor(this.theme === ThemeType.Light ? Color.White : Color.Black)
    }
}
```

### 5.2 用户信息全局共享

```typescript
// 根组件
@Entry
@Component
struct App {
    @Provide currentUser: UserInfo = {
        id: '0',
        name: '游客',
        avatar: $r('app.media.default_avatar')
    }

    build() {
        Column() {
            UserProfile()
            Settings()
            Messages()
        }
    }
}

// 任意深度组件
@Component
struct UserProfile {
    @Consume currentUser: UserInfo

    build() {
        Row() {
            Image(this.currentUser.avatar)
                .width(48)
                .height(48)
                .borderRadius(24)
            Text(this.currentUser.name)
                .fontSize(18fp)
        }
    }
}
```

---

## 6. @Provide/@Consume vs @Link

| 特性 | @Provide/@Consume | @Link |
|---|-|--|
| **层级要求** | 跨层级（爷孙） | 父子 |
| **中间组件转发** | ❌ 不需要 | ✅ 必须逐层转发 |
| **数据量** | 适合少量全局数据 | 适合特定组件间数据 |
| **作用域** | 向下传播（树） | 双向（父子） |

---

## 7. 面试高频考点

### Q1: @Provide/@Consume 的使用场景？

**回答**：跨组件层级通信（爷孙通信），无需中间组件逐层转发。祖父 @Provide，孙子 @Consume 即可。

### Q2: @Provide/@Consume 的限制？

**回答**：必须成对出现、类型必须一致、@Provide 变量必须是 @State、值自动双向同步。

### Q3: @Provide/@Consume vs @Link 的区别？

**回答**：@Provide/@Consume 用于跨层级（爷孙），中间组件不需要转发；@Link 用于父子双向绑定，需要逐层转发。

---

> 🐱 **小猫提示**：@Provide/@Consume 记住 **"跨层级通信、不需要中间转发、成对出现、类型一致"**。
