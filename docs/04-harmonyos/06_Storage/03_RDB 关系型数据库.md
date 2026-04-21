# RDB 关系型数据库

> RDB 基于 SQLite，提供关系型数据存储能力。

---

## 1. RDB 概述

### 1.1 核心特性

| 特性 | 说明 |
|---|-|
| **底层引擎** | SQLite |
| **数据类型** | 关系型（表 + 行 + 列） |
| **适用场景** | 结构化数据、复杂查询 |
| **事务支持** | ✅ BEGIN/COMMIT/ROLLBACK |
| **ORM 替代** | Room（Android）→ 无官方 ORM，需手动建表 |

### 1.2 适用与不适用场景

```
✅ 适合：
├─ 结构化数据（用户表、订单表、日志表）
├─ 复杂查询（关联查询、聚合、排序）
├─ 大量数据存储（万级~百万级记录）
└─ 需要事务保证数据一致性

❌ 不适合：
├─ 简单配置 → 用 Preferences
├─ 分布式同步 → 用 KV-Store
└─ 缓存 → 用 KV-Store 或内存缓存
```

---

## 2. 基本用法

### 2.1 创建数据库

```typescript
import { relationalStore } from '@kit.ArkData';

// 数据库配置
let storeConfig: relationalStore.StoreConfig = {
    name: 'myDatabase.db',       // 数据库名
    path: '/data/storage/el2/base/com.example.app/rdb',  // 存储路径
    securityLevel: relationalStore.SecurityLevel.S1  // 安全级别
};

// 创建 RdbStore 实例
let rdbStore = await relationalStore.getRdbStore(context, storeConfig);

// 创建表
await rdbStore.executeSql(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        email TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

await rdbStore.executeSql(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productName TEXT,
        price REAL,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
    )
`);

console.log('数据库和表创建成功');
```

### 2.2 插入数据

```typescript
// 插入单条数据
let values: relationalStore.ValuesBucket = {
    name: '小明',
    age: 25,
    email: 'xiaoming@test.com'
};

let insertedId = await rdbStore.insert('users', values);
console.log('插入成功，ID:', insertedId);

// 插入多条数据（批量）
let users: Array<relationalStore.ValuesBucket> = [
    { name: '小红', age: 22, email: 'xiaohong@test.com' },
    { name: '小刚', age: 30, email: 'xiaogang@test.com' },
    { name: '小李', age: 28, email: 'xiaoli@test.com' }
];

for (let user of users) {
    await rdbStore.insert('users', user);
}
```

### 2.3 查询数据

```typescript
// 查询所有
let pred = new relationalStore.RdbPredicates('users');
let resultSet = await rdbStore.query(pred);

while (resultSet.goToNextRow()) {
    let id = resultSet.getLong(resultSet.getColumnIndex('id'));
    let name = resultSet.getString(resultSet.getColumnIndex('name'));
    let age = resultSet.getLong(resultSet.getColumnIndex('age'));
    let email = resultSet.getString(resultSet.getColumnIndex('email'));
    console.log(`用户: ${name}, ${age}岁, ${email}`);
}
resultSet.close();

// 条件查询
let pred2 = new relationalStore.RdbPredicates('users')
    .equalTo('age', 25)
    .or()
    .equalTo('name', '小红');

let resultSet2 = await rdbStore.query(pred2, ['id', 'name', 'age']);

// 排序 + 分页
let pred3 = new relationalStore.RdbPredicates('users')
    .orderByAsc('age')
    .limit(10)
    .offset(0);  // 分页

// 模糊查询
let pred4 = new relationalStore.RdbPredicates('users')
    .like('name', '%小%');  // 模糊匹配

// 聚合查询
let pred5 = new relationalStore.RdbPredicates('users')
    .avg('age')  // 平均年龄
    .count();    // 总数
```

### 2.4 更新数据

```typescript
// 更新单条
let updateValues: relationalStore.ValuesBucket = {
    age: 26
};

let updatedRows = await rdbStore.update(
    updateValues,
    new relationalStore.RdbPredicates('users').equalTo('id', 1)
);
console.log('更新行数:', updatedRows);
```

### 2.5 删除数据

```typescript
// 删除条件
let deleteRows = await rdbStore.delete(
    new relationalStore.RdbPredicates('users')
        .equalTo('id', 1)
);
console.log('删除行数:', deleteRows);

// 删除所有
await rdbStore.delete(new relationalStore.RdbPredicates('users'));
```

---

## 3. 事务管理

### 3.1 事务操作

```typescript
// 开始事务
await rdbStore.beginTransaction();

try {
    // 插入用户
    let userIdValues: relationalStore.ValuesBucket = {
        name: '小明',
        age: 25,
        email: 'xiaoming@test.com'
    };
    let userId = await rdbStore.insert('users', userIdValues);

    // 插入订单
    let orderValues: relationalStore.ValuesBucket = {
        userId: userId,
        productName: '手机',
        price: 5999,
        status: 'pending'
    };
    await rdbStore.insert('orders', orderValues);

    // 提交事务
    await rdbStore.commit();
    console.log('事务提交成功');
} catch (err) {
    // 回滚事务
    await rdbStore.rollBack();
    console.error('事务失败，已回滚:', err.message);
}
```

---

## 4. 数据库升级

### 4.1 使用 RdbOpenCallback

```typescript
import { RdbOpenCallback, relationalStore } from '@kit.ArkData';

class MyDatabaseCallback implements RdbOpenCallback {
    onCreate(rdbStore: relationalStore.RdbStore): void {
        console.log('数据库创建');
        rdbStore.executeSql(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT
            )
        `);
        rdbStore.executeSql(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                productName TEXT
            )
        `);
    }

    onUpgrade(rdbStore: relationalStore.RdbStore, oldVersion: number, newVersion: number): void {
        console.log(`数据库升级: ${oldVersion} → ${newVersion}`);

        if (oldVersion < 2) {
            // V1 → V2：添加 age 列
            rdbStore.executeSql('ALTER TABLE users ADD COLUMN age INTEGER');
        }

        if (oldVersion < 3) {
            // V2 → V3：新建 orders 表（如果不存在）
            rdbStore.executeSql(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER,
                    productName TEXT
                )
            `);
        }

        if (oldVersion < 4) {
            // V3 → V4：添加新表
            rdbStore.executeSql(`
                CREATE TABLE IF NOT EXISTS addresses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER,
                    address TEXT
                )
            `);
        }
    }

    onConfigure(rdbStore: relationalStore.RdbStore): void {
        // 数据库配置
        rdbStore.executeSql('PRAGMA journal_mode=WAL');  // WAL 模式提升并发性能
    }
}

// 使用回调
let rdbStore = await relationalStore.getRdbStore(context, {
    name: 'myDatabase.db',
    path: '/data/storage/el2/base/com.example.app/rdb',
    securityLevel: relationalStore.SecurityLevel.S1,
    callback: new MyDatabaseCallback()
}, 4);  // 数据库版本
```

---

## 5. 性能优化

### 5.1 优化策略

```
✅ 数据库优化：
├─ 使用索引（索引加速查询）
├─ 批量插入（事务包裹）
├─ WAL 模式（并发写入）
├─ 避免在 UI 线程查询大量数据
├─ 使用 LIMIT 分页查询
└─ 及时关闭 ResultSet
```

### 5.2 索引优化

```typescript
// 创建索引
rdbStore.executeSql('CREATE INDEX idx_user_name ON users(name)');
rdbStore.executeSql('CREATE INDEX idx_user_email ON users(email)');
rdbStore.executeSql('CREATE INDEX idx_order_user ON orders(userId)');

// 删除索引
rdbStore.executeSql('DROP INDEX IF EXISTS idx_user_name');

// 使用索引查询（自动利用）
let pred = new relationalStore.RdbPredicates('users')
    .equalTo('name', '小明')
    .orderByAsc('created_at');
```

---

## 6. 面试高频考点

### Q1: RDB 的开发流程？

**回答**：1. 定义 StoreConfig；2. 获取 RdbStore；3. executeSql 建表；4. insert/query/update/delete 操作；5. 使用 Predicates 构建查询条件；6. 事务管理保证一致性。

### Q2: 数据库升级怎么做？

**回答**：在 RdbOpenCallback 的 onUpgrade 回调中，根据版本号执行 ALTER TABLE 语句或创建新表。

### Q3: RDB vs Preferences 如何选择？

**回答**：RDB 适合结构化数据、复杂查询、大量数据；Preferences 适合简单配置、小型 K-V。

---

> 🐱 **小猫提示**：RDB 记住 **"SQL 建表、executeSql、Predicates 查询、事务保证一致性、onUpgrade 升级"**。
