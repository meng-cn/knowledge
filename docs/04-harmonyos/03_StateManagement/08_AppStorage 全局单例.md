# AppStorage 全局单例

> AppStorage 是应用级的全局状态存储，所有 UIAbility 共享，适合全局配置。

---

## 1. AppStorage 基本用法

```typescript
// 设置值
AppStorage.setOrCreate('theme', 'dark')
AppStorage.setOrCreate('fontSize', 16)
AppStorage.setOrCreate('language', 'zh-CN')

// 获取值
let theme = AppStorage.get<string>('theme')  // 'dark'
let fontSize = AppStorage.get<number>('fontSize')  // 16

// 删除
AppStorage.delete('fontSize')
```

### 类型安全

```typescript
// 设置时指定类型
AppStorage.setOrCreate<string>('theme', 'dark')
AppStorage.setOrCreate<number>('fontSize', 16)
AppStorage.setOrCreate<boolean>('isLogin', false)

// 获取时指定类型
let theme: string = AppStorage.get<string>('theme') ?? 'light'
let fontSize: number = AppStorage.get<number>('fontSize') ?? 14
```

---

## 2. 响应式监听

```typescript
// 监听 AppStorage 值变化
AppStorage.on('theme', (value: string) => {
    console.log('主题变化:', value)
    // 自动更新 UI
})

// 监听 fontSize
AppStorage.on('fontSize', (value: number) => {
    console.log('字体大小变化:', value)
})
```

---

## 3. @StorageProp / @StorageLink

### 3.1 @StorageProp — 单向绑定

```typescript
@Component
struct ThemeIndicator {
    // 单向绑定 AppStorage 的值
    @StorageProp theme: string = 'light'

    build() {
        Text(`当前主题: ${this.theme}`)
            .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
    }
}
```

### 3.2 @StorageLink — 双向绑定

```typescript
@Component
struct ThemeSwitch {
    // 双向绑定 AppStorage
    @StorageLink theme: string = 'light'

    build() {
        Row() {
            Text('主题:')
            Switch({
                selected: this.theme === 'dark',
                type: SwitchType.CIRCLE
            })
            .onChange((selected: boolean) => {
                this.theme = selected ? 'dark' : 'light'
            })
        }
    }
}
```

> ⚠️ **@StorageLink 要求 AppStorage 中必须存在对应的 key**，否则会报错。使用前先确保已 setOrCreate。

---

## 4. AppStorage vs LocalStorage

| 特性 | AppStorage | LocalStorage |
|---|-|-|
| **作用域** | 应用全局（所有 UIAbility） | 页面级/UIAbility 级 |
| **多窗口隔离** | ❌ 不隔离 | ✅ 隔离 |
| **使用场景** | 全局配置、主题 | 页面状态、多窗口数据 |
| **装饰器** | @StorageProp/@StorageLink | @LocalProp/@LocalLink |

---

## 5. 实际应用场景

### 5.1 全局主题管理

```typescript
// 全局主题管理
AppStorage.setOrCreate<string>('appTheme', 'light')
AppStorage.setOrCreate<string>('fontStyle', 'normal')

// 任意页面使用
@Component
struct App {
    @StorageProp theme: string = 'light'
    @StorageLink fontSize: number = 16

    build() {
        Column() {
            Text('应用内容')
                .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
                .fontSize(this.fontSize + fp)
        }
        .backgroundColor(this.theme === 'dark' ? Color.FromRGB(0x1A, 0x1A, 0x2E) : Color.White)
    }
}
```

### 5.2 用户信息全局共享

```typescript
// 登录时设置
AppStorage.setOrCreate<UserInfo>('currentUser', {
    name: '小明',
    token: 'xxx',
    avatar: $r('app.media.avatar')
})

// 任意页面读取
@Component
struct UserProfile {
    @StorageProp currentUser: UserInfo = {}

    build() {
        Row() {
            Image(this.currentUser.avatar).width(48).height(48).borderRadius(24)
            Text(this.currentUser.name).fontSize(18fp)
        }
    }
}
```

---

## 6. 面试高频考点

### Q1: AppStorage 的作用？

**回答**：应用全局单例状态存储，所有 UIAbility 共享。适合全局配置（主题、语言、字体大小）和用户信息。

### Q2: AppStorage vs LocalStorage 的区别？

**回答**：AppStorage 是应用全局（跨 UIAbility），LocalStorage 是页面/Ability 级（多窗口隔离）。

### Q3: @StorageLink 的注意事项？

**回答**：要求 AppStorage 中必须存在对应的 key，使用前需 setOrCreate。否则会报错。

---

> 🐱 **小猫提示**：AppStorage 记住 **"全局单例、跨 UIAbility、适合全局配置"**。@StorageLink 使用前确保 key 存在。
