# LocalStorage 页面级存储

> LocalStorage 是页面或 UIAbility 级的状态存储，用于多窗口数据隔离。

---

## 1. LocalStorage 基本用法

```typescript
// 创建 LocalStorage 实例
let localStorage = new LocalStorage()

// 设置值
localStorage.setOrCreate('pageTheme', 'light')
localStorage.setOrCreate('currentPage', 1)

// 获取值
let theme = localStorage.get<string>('pageTheme')  // 'light'

// 删除
localStorage.delete('currentPage')
```

---

## 2. @LocalProp / @LocalLink

### 2.1 @LocalProp — 单向绑定

```typescript
@Component
struct PageHeader {
    @LocalProp pageTheme: string = 'light'

    build() {
        Text(`页面主题: ${this.pageTheme}`)
    }
}
```

### 2.2 @LocalLink — 双向绑定

```typescript
@Component
struct PageFooter {
    @LocalLink currentPage: number = 1

    build() {
        Row() {
            Button('-')
                .onClick(() => {
                    this.currentPage--
                })
            Text(`${this.currentPage}`)
            Button('+')
                .onClick(() => {
                    this.currentPage++
                })
        }
    }
}
```

---

## 3. LocalStorage 的应用场景

### 3.1 多窗口数据隔离

```
UIAbility (窗口1)                    UIAbility (窗口2)
┌───────────────────┐              ┌───────────────────┐
│ LocalStorage       │              │ LocalStorage       │
│ pageTheme: light   │              │ pageTheme: dark    │
│ currentPage: 1     │              │ currentPage: 3     │
│                    │              │                    │
│ 独立状态 ✅        │              │ 独立状态 ✅        │
└───────────────────┘              └───────────────────┘
```

### 3.2 页面状态恢复

```typescript
@Entry
@Component
struct Index {
    private localStorage = new LocalStorage({ pageName: 'Index' })

    @LocalProp pageTheme: string = 'light'
    @LocalLink currentPage: number = 1

    aboutToAppear() {
        // 从 LocalStorage 恢复页面状态
        this.currentPage = this.localStorage.get<number>('currentPage') || 1
    }

    build() {
        Column() {
            Text(`第 ${this.currentPage} 页`)
            // ...
        }
    }
}
```

---

## 4. 使用决策

```
需要全局共享？
├─ 是 → AppStorage（所有 UIAbility 共享）
└─ 否 → 需要多窗口隔离？
    ├─ 是 → LocalStorage（每个窗口独立）
    └─ 否 → @State（组件内部私有）
```

---

## 5. 面试高频考点

### Q1: LocalStorage 的作用？

**回答**：页面级或 UIAbility 级的状态存储，用于多窗口数据隔离。每个窗口有独立的 LocalStorage。

### Q2: AppStorage vs LocalStorage 的区别？

**回答**：AppStorage 是应用全局（所有 UIAbility 共享），LocalStorage 是页面/Ability 级（多窗口隔离）。

---

> 🐱 **小猫提示**：LocalStorage 记住 **"页面级、多窗口隔离、@LocalProp/@LocalLink"**。
