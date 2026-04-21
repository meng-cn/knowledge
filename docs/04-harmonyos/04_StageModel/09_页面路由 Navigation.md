# 页面路由 Navigation

> Navigation 是官方推荐的路由组件，支持分栏、动效、页面栈管理。

---

## 1. Navigation 组件

### 1.1 基本用法

```typescript
@Entry
@Component
struct Index {
    private navPathStack: NavPathStack = new NavPathStack()

    build() {
        Navigation(this.navPathStack) {
            // 首页
            NavDestination() {
                Text('首页')
                    .fontSize(32fp)
                    .fontWeight(FontWeight.Bold)
            }
            .title('首页')
            .navigationBarTitleDisplay(NavigationBarTitleDisplayMode.INTERLEAVE)

            // 详情页（命名路由）
            NavDestination({ type: 'detail' }) {
                Text('详情页')
                    .fontSize(24fp)
            }
            .title('详情')

            // 用户页
            NavDestination({ type: 'user' }) {
                Text('用户中心')
                    .fontSize(24fp)
            }
            .title('用户')
        }
        .width('100%')
        .height('100%')
    }
}
```

### 1.2 页面跳转

```typescript
// 方式1：push 跳转（压入页面栈）
this.navPathStack.pushPath({ name: 'detail' })

// 方式2：push 并传递参数
this.navPathStack.pushPath({
    name: 'detail',
    params: {
        userId: '12345',
        title: '用户详情'
    }
})

// 方式3：replace 替换当前页面
this.navPathStack.replacePath({ name: 'user' })

// 方式4：pop 返回上一页
this.navPathStack.pop()

// 方式5：pop 并指定返回层级
this.navPathStack.pop(2)

// 方式6：清空栈，只保留首页
this.navPathStack.clear()
```

### 1.3 接收参数

```typescript
// 子组件接收参数
@Component
struct DetailPage {
    @Prop title: string = ''
    @Prop userId: string = ''
    @Prop pageName: string = ''

    aboutToAppear() {
        // 页面加载时获取参数
        console.log('收到参数:', this.pageName, this.userId)
    }

    build() {
        Column() {
            Text(`标题: ${this.title}`)
                .fontSize(24fp)
            Text(`用户ID: ${this.userId}`)
                .fontSize(18fp)
        }
    }
}

// 父组件传递参数
NavDestination({ type: 'detail' }) {
    DetailPage({
        title: '用户详情',
        userId: '12345'
    })
}
.title('详情')
```

---

## 2. Navigation 高级用法

### 2.1 分栏导航（折叠屏）

```typescript
@Entry
@Component
struct Index {
    private navPathStack: NavPathStack = new NavPathStack()

    build() {
        Column() {
            // 分栏模式
            SplitPane({ mode: SplitPaneMode.Horizontal }) {
                Navigation(this.navPathStack, SplitPaneSide.Left) {
                    NavDestination() {
                        List() {
                            ListItem() {
                                Text('新闻1')
                                    .onClick(() => {
                                        this.navPathStack.pushPath({ name: 'detail' })
                                    })
                            }
                        }
                    }
                    .title('新闻列表')
                }

                Navigation(this.navPathStack, SplitPaneSide.Right) {
                    NavDestination({ type: 'detail' }) {
                        Text('新闻详情')
                            .fontSize(24fp)
                    }
                    .title('详情')
                }
            }
        }
    }
}
```

### 2.2 导航动画

```typescript
Navigation(this.navPathStack) {
    NavDestination() {
        Text('首页')
    }
    .title('首页')
    // 自定义导航栏动画
    .animation({
        duration: 300,
        curve: Curve.EaseInOut
    })
    .titleBarMode(TitleBarMode.Standard)  // 标准/悬浮
    .navigationBarTitleDisplay(NavigationBarTitleDisplayMode.INTERLEAVE)
}
```

### 2.3 导航栏自定义

```typescript
Navigation(this.navPathStack) {
    NavDestination() {
        Text('首页')
            .fontSize(32fp)
            .fontWeight(FontWeight.Bold)
    }
    .title('首页')
    // 自定义导航栏
    .navDestinationBar()
        .title('自定义标题')
        .titleColor(Color.Blue)
        .backgroundColor(Color.White)
        .leftButton(() => {
            Text('返回')
                .fontColor(Color.Black)
                .onClick(() => this.navPathStack.pop())
        })
        .rightButton(() => {
            Button('更多')
                .onClick(() => {
                    // 更多操作
                })
        })
}
```

---

## 3. NavPathStack 管理

### 3.1 页面栈操作

```typescript
private navPathStack: NavPathStack = new NavPathStack()

// 获取当前页面
let currentPath = this.navPathStack.currentPath
console.log('当前页面:', currentPath)

// 获取页面栈长度
let stackSize = this.navPathStack.pageStack.length
console.log('页面栈:', stackSize)

// 监听页面变化
this.navPathStack.on('pageChange', (path: string, params: Record<string, Object>) => {
    console.log('页面变化:', path, params)
})

// 监听回退
this.navPathStack.on('pop', (path: string) => {
    console.log('回退到:', path)
})

// 页面栈满检查
if (this.navPathStack.pageStack.length < this.navPathStack.maxPageStackCount) {
    this.navPathStack.pushPath({ name: 'next' })
}
```

---

## 4. Navigation vs Router 对比

| 特性 | Navigation | Router |
|---|-|--|
| **推荐程度** | ✅ 官方推荐 | ❌ 旧方案 |
| **组件化** | 是 | 否 |
| **分栏支持** | ✅ | ❌ |
| **动效** | ✅ 自定义 | 有限 |
| **页面管理** | NavPathStack | 简单 API |
| **参数传递** | params 对象 | parameters |
| **折叠屏** | ✅ 分栏 | ❌ |

---

## 5. 面试高频考点

### Q1: 页面路由推荐使用 Router 还是 Navigation？

**回答**：强烈推荐 Navigation。它是组件级路由，支持分栏、动效好、更灵活，是官方主推方案。Router 是旧方案。

### Q2: Navigation 的页面跳转方式？

**回答**：pushPath（压入）、replacePath（替换）、pop（返回）、clear（清空栈）。可传递 params 参数。

### Q3: Navigation 支持分栏吗？

**回答**：支持。通过 SplitPane 实现分栏导航，左侧导航，右侧内容，适合折叠屏/平板。

---

> 🐱 **小猫提示**：Navigation 记住 **"官方推荐、分栏支持、NavPathStack 管理页面栈、push/pop/replace/clear"**。
