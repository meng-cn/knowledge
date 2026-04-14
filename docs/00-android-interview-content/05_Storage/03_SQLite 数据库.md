# SQLite 数据库：Android 关系型数据存储

## 目录

1. [SQLite 概述](#1-sqlite-概述)
2. [SQLiteOpenHelper 详解](#2-sqliteopener-详解)
3. [CRUD 操作详解](#3-crud-操作详解)
4. [事务管理](#4-事务管理)
5. [性能优化](#5-性能优化)
6. [高级功能](#6-高级功能)
7. [最佳实践](#7-最佳实践)
8. [面试考点](#8-面试考点)

---

## 1. SQLite 概述

### 1.1 什么是 SQLite

SQLite 是一种轻量级的、自包含的、无服务器的关系型数据库引擎，Android 系统原生集成。它是 Android 平台最常用的本地数据库解决方案。

```
核心特点：
- 零配置：无需安装和维护
- 自包含：所有数据存储在单个文件中
- 轻量级：适合移动设备
- ACID 事务支持
- SQL 标准兼容
```

### 1.2 SQLite 在 Android 中的位置

```
存储路径：/data/data/<package_name>/databases/

文件命名：数据库名.db 或 数据库名.sqlite

例如：
/data/data/com.example.app/databases/
    ├── app_database.db
    ├── user_data.db
    └── cache.db
```

### 1.3 支持的 SQL 类型

| SQL 类型 | Java/Kotlin 类型 | 说明 |
|---------|---------------|-----|
| NULL | null | 空值 |
| INTEGER | long | 整数（8 字节有符号） |
| REAL | double | 浮点数（8 字节 IEEE 754） |
| TEXT | String | 文本（UTF-8/UTF-16） |
| BLOB | byte[] | 二进制数据 |

### 1.4 SQLite vs 其他方案

| 特性 | SQLite | Room | SharedPreferences |
|-----|-------|-----|-----|
| 类型安全 | 否 | 是 | 弱类型 |
| 学习曲线 | 中等 | 低 | 低 |
| 灵活性 | 高 | 中 | 低 |
| 性能 | 好 | 好（SQLite 封装） | 好（小数据） |
| 适合场景 | 复杂查询 | 类型安全需求 | 简单配置 |

---

## 2. SQLiteOpenHelper 详解

### 2.1 SQLiteOpenHelper 类介绍

SQLiteOpenHelper 是 Android 提供的数据库帮助类，负责：
- 数据库创建
- 版本管理
- 数据库升级

```kotlin
class MyDatabaseHelper(context: Context) : 
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION)
```

### 2.2 构造函数参数

```kotlin
class DatabaseHelper(
    context: Context,
    name: String,          // 数据库名称
    factory: CursorFactory?,  // 游标工厂（通常 null）
    version: Int           // 数据库版本
) : SQLiteOpenHelper(context, name, factory, version)
```

### 2.3 核心方法实现

```kotlin
class UserDatabaseHelper(context: Context) : 
    SQLiteOpenHelper(context, "user_database.db", null, 1) {
    
    // 创建数据库表
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                age INTEGER,
                avatar BLOB,
                created_at INTEGER NOT NULL,
                is_active INTEGER DEFAULT 1
            )
        """.trimIndent())
        
        // 创建索引
        db.execSQL("CREATE INDEX idx_username ON users(username)")
        db.execSQL("CREATE INDEX idx_email ON users(email)")
        
        // 插入初始数据
        db.execSQL("INSERT INTO users (username, email, age, created_at) VALUES ('admin', 'admin@example.com', 25, ?)", 
            arrayOf(System.currentTimeMillis()))
    }
    
    // 数据库升级
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // 方式 1：删除重建（生产环境不推荐）
        if (oldVersion < 2) {
            db.execSQL("DROP TABLE IF EXISTS users")
            onCreate(db)
        }
        
        // 方式 2：增量升级（推荐）
        if (oldVersion < 2) {
            db.execSQL("ALTER TABLE users ADD COLUMN phone TEXT")
        }
        
        if (oldVersion < 3) {
            db.execSQL("CREATE TABLE IF NOT EXISTS orders (...)")
        }
        
        if (oldVersion < 4) {
            // 迁移数据
            db.execSQL("ALTER TABLE users ADD COLUMN updated_at INTEGER")
            db.execSQL("UPDATE users SET updated_at = created_at")
        }
    }
    
    // 数据库降级（通常不实现）
    override fun onDowngrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // 可以删除数据库或抛出异常
        throw IllegalArgumentException("Database downgrade not supported")
    }
    
    // 数据库配置（可选）
    override fun onConfigure(db: SQLiteDatabase) {
        super.onConfigure(db)
        
        // 启用 WAL 模式（Write-Ahead Logging）
        db.executePragma("journal_mode = WAL")
        
        // 禁用同步（提高性能，降低数据安全性）
        db.executePragma("synchronous = NORMAL")
    }
}
```

### 2.4 版本管理策略

```kotlin
class VersionedDatabase(context: Context) : 
    SQLiteOpenHelper(context, "app.db", null, 5) {
    
    companion object {
        const val VERSION_1 = 1  // 初始版本
        const val VERSION_2 = 2  // 添加订单表
        const val VERSION_3 = 3  // 用户表增加字段
        const val VERSION_4 = 4  // 添加索引
        const val VERSION_5 = 5  // 数据清理
    }
    
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        when (oldVersion) {
            VERSION_1 -> migrateToV2(db)
            VERSION_2 -> migrateToV3(db)
            VERSION_3 -> migrateToV4(db)
            VERSION_4 -> migrateToV5(db)
            else -> {
                // 跳过未知版本
            }
        }
    }
    
    private fun migrateToV2(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """.trimIndent())
    }
    
    private fun migrateToV3(db: SQLiteDatabase) {
        db.execSQL("ALTER TABLE users ADD COLUMN phone TEXT")
        db.execSQL("ALTER TABLE users ADD COLUMN address TEXT")
    }
    
    private fun migrateToV4(db: SQLiteDatabase) {
        db.execSQL("CREATE INDEX idx_orders_user_id ON orders(user_id)")
        db.execSQL("CREATE INDEX idx_orders_status ON orders(status)")
    }
    
    private fun migrateToV5(db: SQLiteDatabase) {
        // 清理旧数据
        db.execSQL("DELETE FROM orders WHERE created_at < ? AND status = 'cancelled'",
            arrayOf(System.currentTimeMillis() - 90 * 24 * 60 * 60 * 1000))
    }
}
```

### 2.5 数据库实例单例模式

```kotlin
object DatabaseManager {
    private const val DB_NAME = "app_database.db"
    private const val DB_VERSION = 3
    
    @Volatile
    private var instance: DatabaseHelper? = null
    
    fun getInstance(context: Context): DatabaseHelper {
        return instance ?: synchronized(this) {
            instance ?: DatabaseHelper(context).also {
                instance = it
            }
        }
    }
    
    fun close() {
        instance?.close()
        instance = null
    }
}

// 使用示例
val dbHelper = DatabaseManager.getInstance(context)
val db = dbHelper.writableDatabase
```

---

## 3. CRUD 操作详解

### 3.1 创建（Create）

#### 基础插入

```kotlin
fun insertUser(db: SQLiteDatabase, username: String, email: String): Long {
    val values = ContentValues().apply {
        put("username", username)
        put("email", email)
        put("created_at", System.currentTimeMillis())
    }
    
    // insert 方法返回新插入行的 ID
    return db.insert("users", null, values)
}

// 使用 insertOrThrow（失败时抛出异常）
fun insertUserOrThrow(db: SQLiteDatabase, user: User): Long {
    val values = ContentValues().apply {
        put("username", user.username)
        put("email", user.email)
        put("age", user.age)
        put("created_at", user.createdAt)
    }
    
    return db.insertOrThrow("users", null, values)
}
```

#### 批量插入

```kotlin
fun insertUsersBatch(db: SQLiteDatabase, users: List<User>): Int {
    val count = users.size
    db.beginTransaction()
    
    try {
        for (user in users) {
            val values = ContentValues().apply {
                put("username", user.username)
                put("email", user.email)
                put("age", user.age)
            }
            db.insertOrThrow("users", null, values)
        }
        
        db.setTransactionSuccessful()
        return count
    } finally {
        db.endTransaction()
    }
}
```

#### 使用 SQL 直接插入

```kotlin
fun insertWithSQL(db: SQLiteDatabase, username: String, email: String) {
    // 注意 SQL 注入风险，建议使用参数化查询
    db.execSQL(
        "INSERT INTO users (username, email, created_at) VALUES (?, ?, ?)",
        arrayOf(username, email, System.currentTimeMillis())
    )
}
```

### 3.2 查询（Read）

#### 基础查询

```kotlin
fun queryUser(db: SQLiteDatabase, userId: Long): User? {
    val cursor = db.query(
        "users",                          // 表名
        arrayOf("id", "username", "email", "age"),  // 列名
        "id = ?",                         // WHERE 条件
        arrayOf(userId.toString()),       // WHERE 参数
        null,                             // GROUP BY
        null,                             // HAVING
        "created_at DESC"                 // ORDER BY
    )
    
    return cursor.use { 
        if (it.moveToFirst()) {
            User(
                id = it.getLong(0),
                username = it.getString(1),
                email = it.getString(2),
                age = it.getInt(3)
            )
        } else {
            null
        }
    }
}
```

#### 使用 query() 方法的完整参数

```kotlin
fun advancedQuery(db: SQLiteDatabase): Cursor? {
    return db.query(
        // 1. 表名
        table = "users",
        
        // 2. 返回的列
        columns = arrayOf("id", "username", "email"),
        
        // 3. WHERE 条件（不包含 WHERE 关键字）
        selection = "age > ? AND is_active = ?",
        
        // 4. WHERE 参数
        selectionArgs = arrayOf("18", "1"),
        
        // 5. GROUP BY 列
        groupBy = "age",
        
        // 6. HAVING 条件
        having = "COUNT(*) > 1",
        
        // 7. 排序
        orderBy = "username ASC",
        
        // 8. 限制返回行数
        limit = "10 OFFSET 5"
    )
}
```

#### 使用 rawQuery() 执行原始 SQL

```kotlin
fun rawQueryExample(db: SQLiteDatabase): Cursor {
    // 统计各年龄段的用户数量
    return db.rawQuery("""
        SELECT age, COUNT(*) as count
        FROM users
        WHERE age >= ?
        GROUP BY age
        HAVING COUNT(*) > 1
        ORDER BY count DESC
        LIMIT ?
    """.trimIndent(), arrayOf("18", "10"))
}

fun complexQuery(db: SQLiteDatabase): Cursor {
    // 多表连接查询
    return db.rawQuery("""
        SELECT 
            u.id as user_id,
            u.username,
            u.email,
            COUNT(o.id) as order_count,
            SUM(o.amount) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.is_active = 1
        GROUP BY u.id
        HAVING COUNT(o.id) > 0
        ORDER BY total_spent DESC
        LIMIT 20
    """.trimIndent(), null)
}
```

#### 使用 CursorWrapper 封装

```kotlin
class UserCursorWrapper(cursor: Cursor) : CursorWrapper(cursor) {
    
    fun getUser(): User {
        val position = getPosition()
        val idIndex = getColumnIndex("id")
        val usernameIndex = getColumnIndex("username")
        val emailIndex = getColumnIndex("email")
        val ageIndex = getColumnIndex("age")
        
        return User(
            id = cursor.getLong(idIndex),
            username = cursor.getString(usernameIndex),
            email = cursor.getString(emailIndex),
            age = cursor.getInt(ageIndex)
        )
    }
}

fun queryUsers(db: SQLiteDatabase, minAge: Int): UserCursorWrapper {
    val cursor = db.query(
        "users",
        arrayOf("id", "username", "email", "age"),
        "age >= ?",
        arrayOf(minAge.toString()),
        null, null, "age DESC"
    )
    return UserCursorWrapper(cursor)
}
```

### 3.3 更新（Update）

#### 基础更新

```kotlin
fun updateUser(db: SQLiteDatabase, userId: Long, newName: String): Int {
    val values = ContentValues().apply {
        put("username", newName)
        put("updated_at", System.currentTimeMillis())
    }
    
    // 返回受影响的行数
    return db.update(
        "users",              // 表名
        values,              // 更新的值
        "id = ?",            // WHERE 条件
        arrayOf(userId.toString())  // WHERE 参数
    )
}
```

#### 批量更新

```kotlin
fun updateUsersBatch(db: SQLiteDatabase, updates: Map<Long, User>): Int {
    var total = 0
    db.beginTransaction()
    
    try {
        for ((userId, user) in updates) {
            val values = ContentValues().apply {
                put("username", user.username)
                put("email", user.email)
                put("age", user.age)
            }
            total += db.update("users", values, "id = ?", arrayOf(userId.toString()))
        }
        db.setTransactionSuccessful()
    } finally {
        db.endTransaction()
    }
    
    return total
}
```

#### 条件更新

```kotlin
fun updateWithConditions(db: SQLiteDatabase, userId: Long) {
    val values = ContentValues().apply {
        put("status", "active")
        put("last_login", System.currentTimeMillis())
    }
    
    val count = db.update(
        "users",
        values,
        "id = ? AND status != ?",
        arrayOf(userId.toString(), "active")
    )
    
    Log.d("Update", "Updated $count rows")
}
```

### 3.4 删除（Delete）

#### 基础删除

```kotlin
fun deleteUser(db: SQLiteDatabase, userId: Long): Int {
    return db.delete(
        "users",              // 表名
        "id = ?",            // WHERE 条件
        arrayOf(userId.toString())  // WHERE 参数
    )
}
```

#### 批量删除

```kotlin
fun deleteOldUsers(db: SQLiteDatabase, olderThan: Long): Int {
    return db.delete(
        "users",
        "created_at < ?",
        arrayOf(olderThan.toString())
    )
}

fun deleteUsersByStatus(db: SQLiteDatabase, status: String): Int {
    return db.delete(
        "users",
        "status = ?",
        arrayOf(status)
    )
}
```

#### 软删除

```kotlin
// 使用 is_deleted 字段实现软删除
fun softDeleteUser(db: SQLiteDatabase, userId: Long): Int {
    val values = ContentValues().apply {
        put("is_deleted", 1)
        put("deleted_at", System.currentTimeMillis())
    }
    
    return db.update(
        "users",
        values,
        "id = ? AND is_deleted = 0",
        arrayOf(userId.toString())
    )
}

// 查询时排除已删除
fun queryActiveUsers(db: SQLiteDatabase): Cursor {
    return db.query(
        "users",
        arrayOf("id", "username", "email"),
        "is_deleted = 0",
        null, null, null, "created_at DESC"
    )
}
```

### 3.5 CRUD 封装类

```kotlin
class UserDAO(context: Context) {
    private val dbHelper = DatabaseManager.getInstance(context)
    
    // 插入
    fun insert(user: User): Long {
        val db = dbHelper.writableDatabase
        val values = ContentValues().apply {
            put("username", user.username)
            put("email", user.email)
            put("age", user.age)
            put("created_at", user.createdAt)
        }
        return db.insert("users", null, values)
    }
    
    // 查询单个
    fun getUserById(userId: Long): User? {
        val db = dbHelper.readableDatabase
        return db.use {
            it.queryUser(userId)
        }
    }
    
    // 查询所有
    fun getAllUsers(): List<User> {
        val db = dbHelper.readableDatabase
        return db.use {
            it.queryAllUsers().use { cursor ->
                cursor.toUserList()
            }
        }
    }
    
    // 更新
    fun update(user: User): Int {
        val db = dbHelper.writableDatabase
        val values = ContentValues().apply {
            put("username", user.username)
            put("email", user.email)
            put("age", user.age)
        }
        return db.update("users", values, "id = ?", arrayOf(user.id.toString()))
    }
    
    // 删除
    fun delete(userId: Long): Int {
        val db = dbHelper.writableDatabase
        return db.delete("users", "id = ?", arrayOf(userId.toString()))
    }
    
    // 查找
    fun findByUsername(username: String): User? {
        val db = dbHelper.readableDatabase
        return db.use {
            it.queryByUsername(username)
        }
    }
    
    // 分页查询
    fun getPaginatedUsers(page: Int, pageSize: Int): List<User> {
        val db = dbHelper.readableDatabase
        val offset = (page - 1) * pageSize
        return db.use {
            it.queryPaginated(offset, pageSize).use { cursor ->
                cursor.toUserList()
            }
        }
    }
}

// Cursor 扩展函数
fun Cursor.toUserList(): List<User> {
    val users = mutableListOf<User>()
    
    if (moveToFirst()) {
        do {
            val user = User(
                id = getLong(getColumnIndex("id")),
                username = getString(getColumnIndex("username")),
                email = getString(getColumnIndex("email")),
                age = getInt(getColumnIndex("age"))
            )
            users.add(user)
        } while (moveToNext())
    }
    
    return users
}
```

---

## 4. 事务管理

### 4.1 事务基础

```kotlin
// 事务的基本使用
fun transactionExample(db: SQLiteDatabase) {
    db.beginTransaction()
    
    try {
        // 执行多个操作
        insertUser(db, "user1", "user1@example.com")
        insertUser(db, "user2", "user2@example.com")
        insertUser(db, "user3", "user3@example.com")
        
        // 标记事务成功
        db.setTransactionSuccessful()
    } catch (e: Exception) {
        // 失败时不标记，自动回滚
        Log.e("Transaction", "Error", e)
    } finally {
        db.endTransaction()
    }
}
```

### 4.2 嵌套事务

```kotlin
class NestedTransactionManager(private val dbHelper: DatabaseHelper) {
    
    fun nestedTransactionExample() {
        val db = dbHelper.writableDatabase
        db.beginTransaction()
        
        try {
            // 外层事务
            insertUser(db, "outer_user", "outer@example.com")
            
            // 内层事务（保存点）
            innerTransaction(db)
            
            db.setTransactionSuccessful()
        } catch (e: Exception) {
            Log.e("NestedTransaction", "Error", e)
        } finally {
            db.endTransaction()
        }
    }
    
    private fun innerTransaction(db: SQLiteDatabase) {
        db.beginTransaction()
        try {
            insertOrder(db, "order1")
            insertOrder(db, "order2")
            db.setTransactionSuccessful()
        } catch (e: Exception) {
            // 内层失败不影响外层
            Log.e("InnerTransaction", "Error", e)
        } finally {
            db.endTransaction()
        }
    }
}
```

### 4.3 编译时优化（compile statements）

```kotlin
class OptimizedDAO(context: Context) {
    private val dbHelper = DatabaseManager.getInstance(context)
    
    // 预编译语句
    private var insertStatement: SQLiteDatabase.SQLInsertHelper? = null
    private var updateStatement: SQLiteDatabase.SQLUpdateHelper? = null
    
    init {
        // 预编译插入语句（提高性能）
        insertStatement = dbHelper.writableDatabase.compileStatement(
            "INSERT INTO users (username, email, age, created_at) VALUES (?, ?, ?, ?)"
        )
        
        updateStatement = dbHelper.writableDatabase.compileStatement(
            "UPDATE users SET username = ?, email = ?, age = ? WHERE id = ?"
        )
    }
    
    fun insertOptimized(user: User) {
        insertStatement?.apply {
            bindString(1, user.username)
            bindString(2, user.email)
            bindLong(3, user.age)
            bindLong(4, user.createdAt)
            executeInsert()
        }
    }
    
    fun updateOptimized(user: User) {
        updateStatement?.apply {
            bindString(1, user.username)
            bindString(2, user.email)
            bindLong(3, user.age)
            bindLong(4, user.id)
            execute()
        }
    }
}
```

### 4.4 并发控制

```kotlin
// 读写锁
class ThreadSafeDatabaseHelper(context: Context) : 
    SQLiteOpenHelper(context, "app.db", null, 1) {
    
    private val readLock = ReentrantReadWriteLock().readLock
    private val writeLock = ReentrantReadWriteLock().writeLock
    
    fun readOnly(block: (SQLiteDatabase) -> Unit) {
        readLock.lock()
        try {
            block(readableDatabase)
        } finally {
            readLock.unlock()
        }
    }
    
    fun writeOnly(block: (SQLiteDatabase) -> Unit) {
        writeLock.lock()
        try {
            block(writableDatabase)
        } finally {
            writeLock.unlock()
        }
    }
}
```

### 4.5 事务性能测试

```kotlin
class TransactionPerformanceTest {
    
    fun compareTransactionPerformance(context: Context, iterations: Int = 1000) {
        val dbHelper = DatabaseManager.getInstance(context)
        val db = dbHelper.writableDatabase
        
        // 无事务
        val startTime = System.currentTimeMillis()
        for (i in 1..iterations) {
            db.execSQL("INSERT INTO users (username, email) VALUES ('user_$i', 'user_$i@example.com')")
        }
        val withoutTransactionTime = System.currentTimeMillis() - startTime
        
        // 有事务
        db.beginTransaction()
        val txStartTime = System.currentTimeMillis()
        for (i in 1..iterations) {
            db.execSQL("INSERT INTO users (username, email) VALUES ('tx_user_$i', 'tx_user_$i@example.com')")
        }
        db.setTransactionSuccessful()
        db.endTransaction()
        val withTransactionTime = System.currentTimeMillis() - txStartTime
        
        Log.d("Performance", "Without transaction: ${withoutTransactionTime}ms")
        Log.d("Performance", "With transaction: ${withTransactionTime}ms")
        Log.d("Performance", "Speedup: ${withoutTransactionTime.toDouble() / withTransactionTime}x")
    }
}
```

---

## 5. 性能优化

### 5.1 索引优化

```kotlin
class IndexOptimization(dbHelper: DatabaseHelper) {
    
    // 创建索引
    fun createIndexes(db: SQLiteDatabase) {
        // 单列索引
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_username ON users(username)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_email ON users(email)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_created_at ON users(created_at)")
        
        // 复合索引
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_user_status_created ON users(status, created_at)")
        
        // 唯一索引
        db.execSQL("CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_email ON users(email)")
    }
    
    // 分析索引使用情况
    fun analyzeIndexUsage(db: SQLiteDatabase) {
        // EXPLAIN QUERY PLAN 显示查询计划
        val cursor = db.rawQuery("EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = ?", 
            arrayOf("test@example.com"))
        
        cursor.use {
            while (it.moveToNext()) {
                Log.d("QueryPlan", it.getString(0))
            }
        }
        
        // 删除未使用的索引
        db.execSQL("DROP INDEX IF EXISTS unused_index")
    }
    
    // 索引统计
    fun getIndexStats(db: SQLiteDatabase) {
        val cursor = db.rawQuery("""
            SELECT 
                name, 
                tbl_name, 
                sql 
            FROM sqlite_master 
            WHERE type = 'index'
        """.trimIndent(), null)
        
        cursor.use {
            while (it.moveToNext()) {
                Log.d("Index", "${it.getString(0)} on ${it.getString(1)}")
            }
        }
    }
}
```

### 5.2 查询优化

```kotlin
class QueryOptimization(private val dbHelper: DatabaseHelper) {
    
    // 使用覆盖索引避免回表
    fun useCoveringIndex() {
        val db = dbHelper.readableDatabase
        // 如果索引包含 SELECT 的所有列，可以避免回表
        db.execSQL("CREATE INDEX idx_covering ON users(username, email, created_at)")
        
        val cursor = db.rawQuery(
            "SELECT username, email, created_at FROM users WHERE username = ?",
            arrayOf("test")
        )
    }
    
    // 避免 SELECT *
    fun selectSpecificColumns() {
        val db = dbHelper.readableDatabase
        
        // 不推荐
        // Cursor cursor1 = db.rawQuery("SELECT * FROM users", null)
        
        // 推荐
        val cursor = db.rawQuery(
            "SELECT id, username, email FROM users WHERE id = ?",
            arrayOf("1")
        )
    }
    
    // 使用 LIMIT 限制结果集
    fun useLimit() {
        val db = dbHelper.readableDatabase
        
        // 分页查询
        val cursor = db.rawQuery(
            "SELECT id, username FROM users ORDER BY created_at DESC LIMIT 20 OFFSET 0",
            null
        )
    }
    
    // 避免在 WHERE 子句中使用函数
    fun avoidFunctionsInWhere() {
        val db = dbHelper.readableDatabase
        
        // 不推荐（无法使用索引）
        // val bad = db.rawQuery("SELECT * FROM users WHERE YEAR(created_at) = 2024", null)
        
        // 推荐
        val good = db.rawQuery(
            "SELECT * FROM users WHERE created_at >= ? AND created_at < ?",
            arrayOf("2024-01-01", "2025-01-01")
        )
    }
    
    // 使用 EXISTS 代替 IN
    fun useExistsInsteadOfIn() {
        val db = dbHelper.readableDatabase
        
        // 不推荐（大数据量性能差）
        // val bad = db.rawQuery("SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)", null)
        
        // 推荐
        val good = db.rawQuery(
            "SELECT * FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)",
            null
        )
    }
}
```

### 5.3 WAL 模式

```kotlin
class WALConfiguration(dbHelper: DatabaseHelper) {
    
    fun enableWALMode() {
        val db = dbHelper.writableDatabase
        
        // 启用 WAL 模式
        db.executePragma("journal_mode = WAL")
        
        // 配置 WAL 参数
        db.executePragma("wal_autocheckpoint = 1000") // 每 1000 个页面 checkpoint
        db.executePragma("busy_timeout = 5000") // 等待 5 秒
    }
    
    fun compareJAModePerformance() {
        val db = dbHelper.writableDatabase
        
        // DELETE 模式（默认）
        db.executePragma("journal_mode = DELETE")
        val deleteTime = measurePerformance { /* 写入操作 */ }
        
        // WAL 模式
        db.executePragma("journal_mode = WAL")
        val walTime = measurePerformance { /* 写入操作 */ }
        
        // MEMORY 模式（性能最好，但不持久化）
        db.executePragma("journal_mode = MEMORY")
        val memoryTime = measurePerformance { /* 写入操作 */ }
        
        Log.d("WAL", "DELETE: ${deleteTime}ms, WAL: ${walTime}ms, MEMORY: ${memoryTime}ms")
    }
}
```

### 5.4 连接池

```kotlin
class DatabaseConnectionPool(context: Context) {
    private val dbHelper = DatabaseManager.getInstance(context)
    private val connectionQueue = ArrayBlockingQueue<SQLiteDatabase>(10)
    
    init {
        // 预创建连接
        for (i in 0 until 10) {
            connectionQueue.offer(dbHelper.writableDatabase)
        }
    }
    
    fun getConnection(): SQLiteDatabase {
        return connectionQueue.poll(1, TimeUnit.SECONDS) ?: dbHelper.writableDatabase
    }
    
    fun releaseConnection(db: SQLiteDatabase) {
        connectionQueue.offer(db)
    }
    
    fun <T> withDatabase(block: (SQLiteDatabase) -> T): T {
        val db = getConnection()
        try {
            return block(db)
        } finally {
            releaseConnection(db)
        }
    }
}
```

### 5.5 缓存策略

```kotlin
class DatabaseCache(context: Context) {
    private val dbHelper = DatabaseManager.getInstance(context)
    private val lruCache = object : LruCache<User>(100) {
        override fun sizeOf(key: User, value: User): Int = 1
    }
    
    fun getUser(userId: Long): User? {
        // 1. 检查 LRU 缓存
        var user = lruCache.get(userId)
        
        if (user == null) {
            // 2. 从数据库查询
            val db = dbHelper.readableDatabase
            user = db.queryUser(userId)
            
            if (user != null) {
                // 3. 存入缓存
                lruCache.put(userId, user)
            }
        }
        
        return user
    }
    
    fun updateUser(user: User) {
        // 更新数据库
        val db = dbHelper.writableDatabase
        db.updateUser(user)
        
        // 更新缓存
        lruCache.put(user.id, user)
    }
    
    fun invalidateCache(userId: Long) {
        lruCache.remove(userId)
    }
}
```

---

## 6. 高级功能

### 6.1 全文搜索（FTS）

```kotlin
class FullTextSearch(dbHelper: DatabaseHelper) {
    
    // 创建 FTS 表
    fun createFTSTable() {
        val db = dbHelper.writableDatabase
        
        db.execSQL("""
            CREATE VIRTUAL TABLE IF NOT EXISTS users_fts 
            USING fts5(
                username,
                email,
                content='users',
                content_rowid='id'
            )
        """.trimIndent())
    }
    
    // 同步 FTS 表
    fun syncFTSTable() {
        val db = dbHelper.writableDatabase
        
        // 删除旧的 FTS 条目
        db.execSQL("DELETE FROM users_fts")
        
        // 插入新的
        db.rawQuery("SELECT id, username, email FROM users", null).use { cursor ->
            while (cursor.moveToNext()) {
                db.execSQL(
                    "INSERT INTO users_fts (rowid, username, email) VALUES (?, ?, ?)",
                    arrayOf(
                        cursor.getLong(0),
                        cursor.getString(1),
                        cursor.getString(2)
                    )
                )
            }
        }
    }
    
    // 全文搜索
    fun searchUsers(query: String): List<User> {
        val db = dbHelper.readableDatabase
        
        return db.rawQuery("""
            SELECT u.* FROM users u
            INNER JOIN users_fts fts ON u.rowid = fts.rowid
            WHERE users_fts MATCH ?
            ORDER BY rank
        """.trimIndent(), arrayOf(query)).use { cursor ->
            cursor.toUserList()
        }
    }
}
```

### 6.2 触发器（Triggers）

```kotlin
class DatabaseTriggers(dbHelper: DatabaseHelper) {
    
    fun createTriggers() {
        val db = dbHelper.writableDatabase
        
        // 插入后自动更新时间
        db.execSQL("""
            CREATE TRIGGER IF NOT EXISTS update_user_timestamp
            AFTER UPDATE ON users
            FOR EACH ROW
            BEGIN
                UPDATE users SET updated_at = CURRENT_TIMESTAMP 
                WHERE id = OLD.id;
            END
        """.trimIndent())
        
        // 删除前备份
        db.execSQL("""
            CREATE TRIGGER IF NOT EXISTS backup_deleted_user
            BEFORE DELETE ON users
            FOR EACH ROW
            BEGIN
                INSERT INTO users_backup (id, username, email, deleted_at)
                VALUES (OLD.id, OLD.username, OLD.email, CURRENT_TIMESTAMP);
            END
        """.trimIndent())
        
        // 自动维护统计信息
        db.execSQL("""
            CREATE TRIGGER IF NOT EXISTS update_order_stats
            AFTER INSERT ON orders
            FOR EACH ROW
            BEGIN
                UPDATE users SET order_count = order_count + 1 WHERE id = NEW.user_id;
            END
        """.trimIndent())
    }
}
```

### 6.3 视图（Views）

```kotlin
class DatabaseViews(dbHelper: DatabaseHelper) {
    
    fun createViews() {
        val db = dbHelper.writableDatabase
        
        // 创建视图
        db.execSQL("""
            CREATE VIEW IF NOT EXISTS active_users_with_orders AS
            SELECT 
                u.id,
                u.username,
                u.email,
                COUNT(o.id) as order_count,
                SUM(o.amount) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.is_active = 1
            GROUP BY u.id
        """.trimIndent())
        
        // 使用视图查询
        val cursor = db.rawQuery("SELECT * FROM active_users_with_orders", null)
    }
    
    fun dropView() {
        val db = dbHelper.writableDatabase
        db.execSQL("DROP VIEW IF EXISTS active_users_with_orders")
    }
}
```

### 6.4 临时表

```kotlin
class TempTableExample(dbHelper: DatabaseHelper) {
    
    fun useTempTable() {
        val db = dbHelper.writableDatabase
        
        // 创建临时表
        db.execSQL("""
            CREATE TEMP TABLE IF NOT EXISTS temp_users AS
            SELECT * FROM users WHERE age > 18
        """.trimIndent())
        
        // 查询临时表
        db.rawQuery("SELECT * FROM temp_users", null).use { cursor ->
            // 处理结果
        }
        
        // 临时表在连接关闭后自动删除
    }
}
```

### 6.5 数据库加密

```kotlin
class EncryptedDatabase(context: Context) {
    // 使用 SQLCipher 加密
    // 添加依赖：implementation 'net.zetetic:sqlcipher:4.5.0'
    
    private var database: SQLCipherDatabase? = null
    
    fun openDatabase(password: String) {
        database = SQLiteDatabase.openDatabase(
            context.getDatabasePath("encrypted.db").absolutePath,
            password,
            SQLiteDatabase.OPEN_READWRITE
        )
    }
    
    fun changePassword(oldPassword: String, newPassword: String) {
        val db = database ?: return
        db.beginTransaction()
        try {
            db.execSQL("PRAGMA rekey = ?", arrayOf(newPassword))
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }
}
```

---

## 7. 最佳实践

### 7.1 数据库设计

```kotlin
class DatabaseDesignBestPractices {
    
    // 1. 规范命名
    // 表名：小写字母 + 下划线（users, order_items）
    // 字段名：小写字母 + 下划线（user_id, created_at）
    // 主键：id 或 table_id
    
    // 2. 使用外键约束
    fun createTableWithForeignKeys() {
        db.execSQL("""
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """.trimIndent())
    }
    
    // 3. 添加检查约束
    fun createTableWithConstraints() {
        db.execSQL("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                age INTEGER CHECK(age >= 0 AND age <= 150),
                status TEXT CHECK(status IN ('active', 'inactive', 'suspended')),
                created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
            )
        """.trimIndent())
    }
    
    // 4. 使用 NOT NULL 和 DEFAULT
    // 避免 NULL 值，提供默认值
}
```

### 7.2 错误处理

```kotlin
class ErrorHandlingExample(dbHelper: DatabaseHelper) {
    
    fun safeQuery(query: String, args: Array<String>?): Cursor? {
        val db = dbHelper.readableDatabase
        return try {
            val cursor = db.rawQuery(query, args)
            Log.d("Query", "Success, rows: ${cursor.count}")
            cursor
        } catch (e: SQLException) {
            Log.e("Query", "SQL error: ${e.message}", e)
            null
        } finally {
            // 注意：不要在这里关闭 cursor，让调用者处理
        }
    }
    
    fun safeInsert(tableName: String, values: ContentValues): Long {
        val db = dbHelper.writableDatabase
        return try {
            val result = db.insert(tableName, null, values)
            if (result == -1L) {
                throw SQLException("Insert failed")
            }
            result
        } catch (e: SQLException) {
            Log.e("Insert", "Error: ${e.message}", e)
            -1L
        }
    }
}
```

### 7.3 内存管理

```kotlin
class MemoryManagementExample(dbHelper: DatabaseHelper) {
    
    // 1. 及时关闭 Cursor
    fun properCursorUsage() {
        val db = dbHelper.readableDatabase
        db.rawQuery("SELECT * FROM users", null).use { cursor ->
            while (cursor.moveToNext()) {
                // 处理数据
            }
        } // 自动关闭
    }
    
    // 2. 使用 try-with-resources（Kotlin use 扩展）
    fun useWithResources() {
        val db = dbHelper.readableDatabase
        db.use { database ->
            database.rawQuery("SELECT * FROM users", null).use { cursor ->
                // 处理数据
            }
        }
    }
    
    // 3. 避免在大表中加载所有数据
    fun paginatedLoad(page: Int, pageSize: Int) {
        val db = dbHelper.readableDatabase
        val offset = (page - 1) * pageSize
        
        db.rawQuery(
            "SELECT * FROM users LIMIT ? OFFSET ?",
            arrayOf(pageSize.toString(), offset.toString())
        ).use { cursor ->
            // 处理分页数据
        }
    }
}
```

### 7.4 测试策略

```kotlin
class DatabaseTest {
    private lateinit var helper: DatabaseHelper
    private lateinit var db: SQLiteDatabase
    
    @Before
    fun setup() {
        // 使用临时数据库
        val context = ApplicationProvider.getApplicationContext()
        helper = DatabaseHelper(context)
        db = helper.writableDatabase
    }
    
    @Test
    fun testInsertAndQuery() {
        // 插入
        val userId = db.insert("users", null, 
            ContentValues().apply {
                put("username", "test")
                put("email", "test@example.com")
            }
        )
        
        assertTrue(userId > 0)
        
        // 查询
        db.rawQuery("SELECT * FROM users WHERE username = ?", arrayOf("test")).use { cursor ->
            assertEquals(1, cursor.count)
            cursor.moveToFirst()
            assertEquals("test", cursor.getString(0))
        }
    }
    
    @After
    fun teardown() {
        // 清理测试数据
        db.execSQL("DELETE FROM users")
        helper.close()
    }
}
```

---

## 8. 面试考点

### 考点 1：SQLiteOpenHelper 的作用

**问题：** SQLiteOpenHelper 类的作用是什么？

**答案：**
- 管理数据库创建和版本升级
- 提供 `getWritableDatabase()` 和 `getReadableDatabase()` 方法
- 实现 `onCreate()` 创建表，`onUpgrade()` 处理版本迁移

```kotlin
class MyDBHelper(context: Context) : SQLiteOpenHelper(context, "app.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        // 创建表
    }
    
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // 版本迁移
    }
}
```

### 考点 2：ContentValues 的用途

**问题：** ContentValues 的作用是什么？

**答案：**
- 封装 SQL 插入和更新的键值对
- 替代字符串拼接，防止 SQL 注入
- 支持不同类型的数据

```kotlin
val values = ContentValues().apply {
    put("name", "张三")
    put("age", 25)
}
db.insert("users", null, values)
```

### 考点 3：Cursor 的正确使用

**问题：** 如何正确使用 Cursor？

**答案：**
1. 检查 `moveToFirst()` 或 `moveToNext()`
2. 及时关闭 Cursor（使用 `use {}`）
3. 检查 `getColumnIndex()` 避免越界

```kotlin
cursor.use {
    if (it.moveToFirst()) {
        do {
            val name = it.getString(it.getColumnIndex("name"))
        } while (it.moveToNext())
    }
}
```

### 考点 4：事务处理

**问题：** SQLite 中如何处理事务？

**答案：**
```kotlin
db.beginTransaction()
try {
    // 多个操作
    db.setTransactionSuccessful()
} finally {
    db.endTransaction()
}
```

### 考点 5：索引优化

**问题：** 如何优化 SQLite 查询性能？

**答案：**
- 创建合适的索引
- 避免 SELECT *
- 使用 LIMIT 限制结果集
- 使用复合索引
- 定期 ANALYZE

### 考点 6：版本迁移

**问题：** 数据库版本升级如何处理？

**答案：**
```kotlin
override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    if (oldVersion < 2) {
        db.execSQL("ALTER TABLE users ADD COLUMN phone TEXT")
    }
    if (oldVersion < 3) {
        db.execSQL("CREATE TABLE orders (...)")
    }
}
```

### 考点 7：SQL 注入防护

**问题：** 如何防止 SQL 注入？

**答案：**
- 使用参数化查询（? 占位符）
- 使用 ContentValues
- 避免直接拼接 SQL

```kotlin
// 不安全
db.execSQL("SELECT * FROM users WHERE name = '$name'")

// 安全
db.execSQL("SELECT * FROM users WHERE name = ?", arrayOf(name))
```

### 考点 8：数据库存储位置

**问题：** SQLite 数据库存储在哪里？

**答案：**
- 路径：`/data/data/<package_name>/databases/`
- 文件：`数据库名.db`
- 应用私有，其他应用无法访问

### 考点 9：读写锁

**问题：** SQLite 如何处理并发读写？

**答案：**
- 写操作独占锁
- 读操作共享锁
- WAL 模式支持读写并发

### 考点 10：Room vs SQLite

**问题：** Room 和直接使用 SQLite 有什么区别？

**答案：**
- Room 是 SQLite 的 ORM 封装
- Room 提供编译时 SQL 检查
- Room 支持 LiveData、Flow 集成
- 直接使用 SQLite 更灵活但易出错

### 附加考点

**Q11：** SQLite 支持哪些数据类型？

**A11：** NULL, INTEGER, REAL, TEXT, BLOB

**Q12：** 如何实现软删除？

**A12：** 添加 is_deleted 字段，查询时过滤

**Q13：** SQLite 事务的 ACID 特性？

**A13：** Atomicity（原子性）、Consistency（一致性）、Isolation（隔离性）、Durability（持久性）

**Q14：** 如何备份 SQLite 数据库？

**A14：** 复制 .db 文件，或使用 sqlite3 .dump 命令

**Q15：** 数据库初始化应该在哪里执行？

**A15：** Application 的 onCreate() 或单例模式

---

## 总结

SQLite 是 Android 最基础、最强大的本地数据库解决方案：

✅ 适合存储结构化数据  
✅ 支持复杂查询和事务  
✅ 性能优秀  
✅ 学习成本适中  

**学习建议：**
1. 掌握基本的 CRUD 操作
2. 理解事务和索引
3. 学习性能优化技巧
4. 了解 Room 作为现代化选择

**进阶方向：**
SQLite → Room → Realm → SQLite + 缓存

---

*本文档涵盖 SQLite 的核心知识点，建议配合实际项目练习以加深理解。*