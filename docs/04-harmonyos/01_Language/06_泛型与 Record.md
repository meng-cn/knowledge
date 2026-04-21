# ArkTS 泛型与 Record

> 泛型是代码复用的核心机制，Record 是构建映射类型的利器。

---

## 1. 泛型的本质

泛型允许在定义函数、类、接口时**不指定具体类型**，而是在使用时再指定。核心目的：**代码复用 + 类型安全**。

```typescript
// 没有泛型：每种类型都要写一个函数
function identityNumber(n: number): number { return n }
function identityString(s: string): string { return s }
function identityBoolean(b: boolean): boolean { return b }

// 使用泛型：一个函数搞定所有类型
function identity<T>(arg: T): T {
    return arg
}
```

---

## 2. 泛型的约束（Type Constraints）

### 2.1 extends 约束

```typescript
// 限制 T 必须具有 length 属性
function getLength<T extends { length: number }>(arg: T): number {
    return arg.length  // ✅ 编译器知道 arg 有 length
}

getLength('hello')    // ✅ number
getLength([1, 2, 3]) // ✅ number
// getLength(42)      // ❌ 编译错误：number 没有 length 属性
```

### 2.2 接口约束

```typescript
interface HasId {
    id: number
}

// T 必须实现 HasId 接口
function processWithId<T extends HasId>(item: T): string {
    return `处理 ID: ${item.id}`  // ✅ 编译器知道 item.id 存在
}

class User implements HasId { id: number; name: string }
class Product implements HasId { id: number; price: number }

processWithId(new User())   // ✅
processWithId(new Product()) // ✅
```

### 2.3 多个约束

```typescript
// T 必须同时满足多个约束
function process<T extends HasId & { name: string }>(item: T): void {
    console.log(item.id, item.name)
}
```

---

## 3. 泛型工具类型

### 3.1 Partial<T>

```typescript
interface User {
    id: number
    name: string
    email: string
}

// 所有属性变为可选
function updateUser(partial: Partial<User>): User {
    return {
        id: 0,
        name: 'Unknown',
        email: '',
        ...partial
    }
}

const user = updateUser({ name: '小明' })  // ✅ 只需传部分字段
```

### 3.2 Required<T>

```typescript
// 所有属性变为必填
interface OptionalUser {
    id?: number
    name?: string
}

const full: Required<OptionalUser> = {
    id: 1,
    name: '小明'
}
```

### 3.3 Pick<T, Keys>

```typescript
interface User {
    id: number
    name: string
    email: string
    age: number
}

// 只选取指定属性
type UserBrief = Pick<User, 'id' | 'name'>
const brief: UserBrief = { id: 1, name: '小明' }
```

### 3.4 Omit<T, Keys>

```typescript
// 排除指定属性
type UserPublic = Omit<User, 'email'>
const pub: UserPublic = { id: 1, name: '小明', age: 25 }
```

### 3.5 Readonly<T>

```typescript
const config: Readonly<User> = {
    id: 1,
    name: '小明',
    email: 'xiaoming@test.com',
    age: 25
}
// config.id = 2  // ❌ 编译错误
```

---

## 4. Record 深度解析

### 4.1 基本语法

```typescript
// Record<Keys, Type>：构建键类型到值类型的映射
type UserMap = Record<string, User>
type NumberMap = Record<number, string>
type BooleanMap = Record<'yes' | 'no', boolean>

// 实际使用
const userMap: UserMap = {
    'user1': { id: 1, name: '小明', email: 'a@b.com', age: 25 },
    'user2': { id: 2, name: '小红', email: 'c@d.com', age: 22 }
}
```

### 4.2 Record 的优势 vs 普通对象

```typescript
// ❌ 普通对象：类型不精确
const obj1: Record<string, any> = {}  // 完全失去类型安全
const obj2 = {}  // 类型是 {}，没有任何类型提示

// ✅ Record：保持类型安全
const obj3: Record<string, User> = {}  // key 是 string，value 是 User
```

### 4.3 Record 的高级用法

```typescript
// 用枚举的 key 构建映射
enum Status {
    Pending = 'pending',
    Active = 'active',
    Inactive = 'inactive'
}

type StatusMap = Record<Status, string>
const statusLabels: StatusMap = {
    [Status.Pending]: '待处理',
    [Status.Active]: '已激活',
    [Status.Inactive]: '已停用'
}

// 用 keyof 构建
type UserKeys = keyof User
type UserDict = Record<UserKeys, any>

// 使用
const userDict: UserDict = {
    id: 1,
    name: '小明',
    email: 'test@test.com',
    age: 25
}
```

---

## 5. 泛型在实战中的应用

### 5.1 通用 API 响应封装

```typescript
interface ApiResponse<T> {
    code: number
    data: T
    message: string
    timestamp: number
}

// 泛型函数：自动推断返回类型
async function request<T>(url: string): Promise<ApiResponse<T>> {
    // ... 网络请求
    return {
        code: 200,
        data: null as unknown as T,
        message: 'OK',
        timestamp: Date.now()
    }
}

// 使用：自动推断 User 类型
const result = await request<User>('/api/user/1')
const name: string = result.data.name  // ✅ 自动推断

// 使用：自动推断数组类型
const list = await request<User[]>('/api/users')
const first: User = list.data[0]  // ✅ 自动推断
```

### 5.2 泛型 Repository 模式

```typescript
interface IRepository<T extends { id: number }> {
    findById(id: number): T | null
    findAll(): T[]
    create(item: T): T
    update(id: number, item: Partial<T>): T | null
    delete(id: number): boolean
}

class UserRepo implements IRepository<User> {
    findById(id: number): User | null { return null }
    findAll(): User[] { return [] }
    create(item: User): User { return item }
    update(id: number, item: Partial<User>): User | null { return null }
    delete(id: number): boolean { return true }
}
```

---

## 6. 面试高频考点

### Q1: Record 相比 Object 有什么优势？

**回答**：Record 提供了更明确的类型约束（键类型和值类型都确定），有利于编译器优化 Hidden Class 的查找效率，比普通的 `{}` 字面量性能更好，IDE 也能提供准确的自动补全。

### Q2: 泛型的约束怎么用？

**回答**：用 `extends` 关键字约束泛型参数的范围。例如 `T extends HasId` 确保 T 必须有 id 属性。可以组合多个约束。

### Q3: Partial / Pick / Omit 的区别？

**回答**：
- `Partial<T>`：所有属性变为可选
- `Pick<T, K>`：只选取 K 指定的属性
- `Omit<T, K>`：排除 K 指定的属性

---

> 🐱 **小猫提示**：泛型是 ArkTS 面试的进阶考点。记住 Record 的核心优势是"明确的类型约束 + Hidden Class 优化"，泛型的核心思想是"代码复用 + 类型安全"。
