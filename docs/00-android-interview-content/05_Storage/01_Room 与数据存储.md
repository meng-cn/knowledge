# Room 与数据存储详解 💾

> Android 本地数据存储核心方案

---

## 一、Room 数据库

### 1.1 快速开始

```kotlin
// 1. 添加依赖
dependencies {
    val room_version = "2.6.1"
    implementation("androidx.room:room-runtime:$room_version")
    implementation("androidx.room:room-ktx:$room_version")
    kapt("androidx.room:room-compiler:$room_version")
}

// 2. 定义实体类
@Entity(tableName = "users")
data class User(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "name") val name: String,
    @ColumnInfo(name = "email") val email: String,
    @ColumnInfo(name = "age") val age: Int,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis()
)

// 3. 定义 DAO
@Dao
interface UserDao {
    // 查询
    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<User>>
    
    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserById(userId: Int): User?
    
    @Query("SELECT * FROM users WHERE name LIKE :name")
    fun searchUsers(name: String): Flow<List<User>>
    
    // 插入
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: User)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<User>)
    
    // 更新
    @Update
    suspend fun update(user: User)
    
    // 删除
    @Delete
    suspend fun delete(user: User)
    
    @Query("DELETE FROM users WHERE id = :userId")
    suspend fun deleteById(userId: Int)
}

// 4. 定义 Database
@Database(entities = [User::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database"
                )
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

// 5. 使用
class UserRepository @Inject constructor(
    private val userDao: UserDao
) {
    fun getAllUsers(): Flow<List<User>> = userDao.getAllUsers()
    
    suspend fun getUserById(userId: Int): User? = userDao.getUserById(userId)
    
    suspend fun insertUser(user: User) = userDao.insert(user)
}
```

### 1.2 高级查询

```kotlin
@Dao
interface UserDao {
    // 1. 参数查询
    @Query("SELECT * FROM users WHERE age > :minAge AND age < :maxAge")
    fun getUsersByAgeRange(minAge: Int, maxAge: Int): Flow<List<User>>
    
    // 2. IN 查询
    @Query("SELECT * FROM users WHERE id IN (:userIds)")
    fun getUsersByIds(userIds: List<Int>): Flow<List<User>>
    
    // 3. 排序
    @Query("SELECT * FROM users ORDER BY name ASC, age DESC")
    fun getUsersSorted(): Flow<List<User>>
    
    // 4. 限制数量
    @Query("SELECT * FROM users LIMIT :limit")
    fun getLimitedUsers(limit: Int): Flow<List<User>>
    
    // 5. 统计查询
    @Query("SELECT COUNT(*) FROM users")
    fun getUserCount(): Flow<Int>
    
    // 6. 聚合查询
    @Query("SELECT AVG(age) FROM users")
    fun getAverageAge(): Flow<Double>
    
    // 7. 多表查询
    @Query("""
        SELECT * FROM users 
        INNER JOIN posts ON users.id = posts.user_id 
        WHERE posts.title LIKE :keyword
    """)
    fun searchUsersWithPosts(keyword: String): Flow<List<User>>
    
    // 8. 原生 SQL
    @RawQuery
    suspend fun rawQuery(query: SupportSQLiteQuery): Int
}

// 使用 RawQuery
val query = SimpleSQLiteQuery("DELETE FROM users WHERE age > ?", arrayOf(100))
userDao.rawQuery(query)
```

### 1.3 类型转换器

```kotlin
// 1. 定义 TypeConverter
class Converters {
    // Date ↔ Long
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }
    
    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }
    
    // List ↔ String
    @TypeConverter
    fun fromStringList(list: List<String>): String {
        return list.joinToString(",")
    }
    
    @TypeConverter
    fun toStringList(data: String): List<String> {
        return if (data.isEmpty()) emptyList() else data.split(",")
    }
    
    // JSON ↔ Object
    private val gson = Gson()
    
    @TypeConverter
    fun fromJson(json: String): UserPreferences {
        return gson.fromJson(json, UserPreferences::class.java)
    }
    
    @TypeConverter
    fun toJson(preferences: UserPreferences): String {
        return gson.toJson(preferences)
    }
}

// 2. 使用 TypeConverter
@Database(entities = [User::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase()
```

### 1.4 数据库迁移

```kotlin
// 版本 1 → 2：添加新字段
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(database: SupportSQLiteDatabase) {
        database.execSQL("ALTER TABLE users ADD COLUMN phone TEXT")
    }
}

// 版本 2 → 3：创建新表
val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(database: SupportSQLiteDatabase) {
        database.execSQL("""
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT,
                content TEXT,
                created_at INTEGER
            )
        """)
    }
}

// 使用迁移
Room.databaseBuilder(context, AppDatabase::class.java, "app_database")
    .addMigrations(MIGRATION_1_2, MIGRATION_2_3)
    .build()
```

---

## 二、DataStore

### 2.1 Preferences DataStore

```kotlin
// 1. 添加依赖
dependencies {
    implementation("androidx.datastore:datastore-preferences:1.0.0")
}

// 2. 创建 DataStore
val Context.dataStore: DataStore<Preferences> by preferencesDataStore(
    name = "settings"
)

// 3. 定义 Key
object PreferencesKeys {
    val USERNAME = stringPreferencesKey("username")
    val AGE = intPreferencesKey("age")
    val IS_LOGGED_IN = booleanPreferencesKey("is_logged_in")
    val THEME = stringPreferencesKey("theme")
}

// 4. 读取数据
val usernameFlow: Flow<String?> = context.dataStore.data
    .map { preferences ->
        preferences[PreferencesKeys.USERNAME]
    }

// 5. 保存数据
lifecycleScope.launch {
    context.dataStore.edit { preferences ->
        preferences[PreferencesKeys.USERNAME] = "张三"
        preferences[PreferencesKeys.AGE] = 25
        preferences[PreferencesKeys.IS_LOGGED_IN] = true
    }
}

// 6. 删除数据
// 删除单个
context.dataStore.edit { preferences ->
    preferences.remove(PreferencesKeys.USERNAME)
}

// 删除所有
context.dataStore.edit { preferences ->
    preferences.clear()
}
```

### 2.2 Proto DataStore

```kotlin
// 1. 定义 proto 文件
// settings.proto
syntax = "proto3";

option java_package = "com.example.datastore";
option java_multiple_files = true;

message UserSettings {
    string username = 1;
    int32 age = 2;
    bool is_logged_in = 3;
    string theme = 4;
}

// 2. 添加依赖
dependencies {
    implementation("androidx.datastore:datastore:1.0.0")
    implementation("com.google.protobuf:protobuf-kotlin-lite:3.21.12")
}

// 3. 创建 DataStore
val Context.settingsDataStore: DataStore<UserSettings> by dataStore(
    fileName = "settings.pb",
    serializer = UserSettingsSerializer
)

// 4. 实现 Serializer
object UserSettingsSerializer : Serializer<UserSettings> {
    override val defaultValue: UserSettings = UserSettings()
    
    override suspend fun readFrom(input: InputStream): UserSettings {
        return UserSettings.parseFrom(input)
    }
    
    override suspend fun writeTo(t: UserSettings, output: OutputStream) {
        t.writeTo(output)
    }
}

// 5. 使用
lifecycleScope.launch {
    // 读取
    val settings = context.settingsDataStore.data.first()
    println("Username: ${settings.username}")
    
    // 保存
    context.settingsDataStore.updateData { currentSettings ->
        currentSettings.copy {
            username = "张三"
            age = 25
        }
    }
}
```

---

## 三、缓存策略

### 3.1 内存缓存（LruCache）

```kotlin
class ImageCache {
    // LruCache: 最近最少使用缓存
    private val cache = LruCache<String, Bitmap>(
        (Runtime.getRuntime().maxMemory() / 1024 / 8).toInt()  // 使用 1/8 内存
    )
    
    fun get(key: String): Bitmap? {
        return cache.get(key)
    }
    
    fun put(key: String, bitmap: Bitmap) {
        cache.put(key, bitmap)
    }
    
    fun remove(key: String) {
        cache.remove(key)
    }
    
    fun clear() {
        cache.evictAll()
    }
}

// 使用
val imageCache = ImageCache()
imageCache.put("image_url", bitmap)
val cachedBitmap = imageCache.get("image_url")
```

### 3.2 磁盘缓存

```kotlin
class DiskCache(private val context: Context) {
    private val cacheDir = File(context.cacheDir, "disk_cache")
    private val maxSize = 10 * 1024 * 1024L  // 10MB
    
    init {
        if (!cacheDir.exists()) {
            cacheDir.mkdirs()
        }
    }
    
    fun get(key: String): Bitmap? {
        val file = getFile(key)
        return if (file.exists()) {
            BitmapFactory.decodeFile(file.absolutePath)
        } else {
            null
        }
    }
    
    fun put(key: String, bitmap: Bitmap) {
        val file = getFile(key)
        FileOutputStream(file).use { output ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)
        }
        
        // 清理超出大小的缓存
        trimCache()
    }
    
    private fun getFile(key: String): File {
        return File(cacheDir, key.hashCode().toString())
    }
    
    private fun trimCache() {
        val size = calculateSize()
        if (size > maxSize) {
            cacheDir.listFiles()
                ?.sortedBy { it.lastModified() }
                ?.forEach { it.delete() }
        }
    }
    
    private fun calculateSize(): Long {
        return cacheDir.listFiles()?.sumOf { it.length() } ?: 0L
    }
}
```

### 3.3 多级缓存

```kotlin
class MultiLevelCache(
    private val memoryCache: LruCache<String, Bitmap>,
    private val diskCache: DiskCache
) {
    suspend fun get(key: String): Bitmap? {
        // 1. 先查内存缓存
        memoryCache.get(key)?.let {
            return it
        }
        
        // 2. 再查磁盘缓存
        diskCache.get(key)?.let { bitmap ->
            // 3. 回写到内存缓存
            memoryCache.put(key, bitmap)
            return bitmap
        }
        
        return null
    }
    
    fun put(key: String, bitmap: Bitmap) {
        // 同时写入内存和磁盘
        memoryCache.put(key, bitmap)
        diskCache.put(key, bitmap)
    }
}

// 使用示例
class ImageRepository @Inject constructor(
    private val api: ImageApi,
    private val cache: MultiLevelCache
) {
    suspend fun loadImage(url: String): Bitmap {
        // 先查缓存
        cache.get(url)?.let {
            return it
        }
        
        // 缓存未命中，从网络加载
        val bitmap = api.downloadImage(url)
        
        // 写入缓存
        cache.put(url, bitmap)
        
        return bitmap
    }
}
```

---

## 四、面试核心考点

### 4.1 基础问题

**Q1: Room 的优势？**

**A:**
1. **编译时检查**: SQL 错误在编译时发现
2. **样板代码少**: 自动生成实现
3. **LiveData/Flow 支持**: 自动观察数据变化
4. **类型安全**: 参数绑定、结果映射

**Q2: Room 和 SQLite 的区别？**

**A:**
- **SQLite**: 底层数据库，原生 SQL
- **Room**: ORM 框架，基于 SQLite，提供注解 API
- **关系**: Room 内部使用 SQLite

**Q3: DataStore vs SharedPreferences？**

**A:**
| 特性 | SharedPreferences | DataStore |
|------|------------------|-----------|
| **线程安全** | 部分 | 完全 |
| **类型安全** | 否 | 是 |
| **Flow 支持** | 无 | 有 |
| **异常处理** | 可能崩溃 | 不会崩溃 |
| **推荐** | 旧项目 | 新项目 |

### 4.2 进阶问题

**Q4: 如何实现数据库迁移？**

**A:**
```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(database: SupportSQLiteDatabase) {
        // 添加新列
        database.execSQL("ALTER TABLE users ADD COLUMN phone TEXT")
    }
}

Room.databaseBuilder(context, AppDatabase::class.java, "db")
    .addMigrations(MIGRATION_1_2)
    .build()
```

**Q5: 如何实现缓存策略？**

**A:**
```kotlin
// 三级缓存：内存 → 磁盘 → 网络
class CacheRepository {
    private val memoryCache = LruCache<String, Data>(100)
    private val diskCache = DiskCache()
    
    suspend fun getData(key: String): Data {
        // 1. 内存缓存
        memoryCache.get(key)?.let { return it }
        
        // 2. 磁盘缓存
        diskCache.get(key)?.let { data ->
            memoryCache.put(key, data)
            return data
        }
        
        // 3. 网络请求
        val data = api.getData(key)
        memoryCache.put(key, data)
        diskCache.put(key, data)
        return data
    }
}
```

**Q6: 如何处理 Room 的并发写入？**

**A:**
```kotlin
// Room 自动处理并发
// 使用事务保证原子性
@Transaction
suspend fun insertUserWithPosts(user: User, posts: List<Post>) {
    val userId = userDao.insert(user)
    val postsWithUserId = posts.map { it.copy(userId = userId) }
    postDao.insertAll(postsWithUserId)
}

// 或使用 withTransaction
database.withTransaction {
    // 原子操作
}
```

### 4.3 实战问题

**Q7: 如何实现搜索功能？**

**A:**
```kotlin
@Dao
interface UserDao {
    // LIKE 查询
    @Query("SELECT * FROM users WHERE name LIKE '%' || :query || '%'")
    fun searchUsers(query: String): Flow<List<User>>
    
    // 多字段搜索
    @Query("""
        SELECT * FROM users 
        WHERE name LIKE '%' || :query || '%' 
           OR email LIKE '%' || :query || '%'
    """)
    fun searchUsersAdvanced(query: String): Flow<List<User>>
}

// ViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() {
    
    private val searchQuery = MutableStateFlow("")
    
    val searchResults: Flow<List<User>> = searchQuery
        .debounce(300)  // 防抖
        .distinctUntilChanged()
        .flatMapLatest { query ->
            repository.searchUsers(query)
        }
    
    fun search(query: String) {
        searchQuery.value = query
    }
}
```

**Q8: 如何优化数据库性能？**

**A:**
1. **索引**: 为查询字段添加索引
   ```kotlin
   @Entity
   data class User(
       @PrimaryKey val id: Int,
       @ColumnInfo(index = true) val email: String
   )
   ```
2. **分页**: 使用 LIMIT/OFFSET
3. **异步**: 使用 Flow、suspend 函数
4. **批量操作**: 批量插入/更新
5. **预编译**: Room 自动处理

---

## 五、面试速查表

| 问题 | 难度 | 关键点 |
|------|------|-------|
| Room 优势 | ⭐⭐ | 编译时检查、类型安全 |
| DataStore vs SP | ⭐⭐ | Flow 支持、类型安全 |
| 数据库迁移 | ⭐⭐⭐ | Migration 类 |
| 缓存策略 | ⭐⭐⭐ | LruCache、多级缓存 |
| 事务处理 | ⭐⭐⭐ | @Transaction |
| 搜索实现 | ⭐⭐⭐ | LIKE、Flow |
| 性能优化 | ⭐⭐⭐⭐ | 索引、分页、批量 |

---

**📚 参考资料**
- [Room 官方文档](https://developer.android.com/training/data-storage/room)
- [DataStore 官方文档](https://developer.android.com/topic/libraries/architecture/datastore)
- [缓存最佳实践](https://developer.android.com/topic/performance)

**🔗 下一篇**: [Handler 机制](../03_Async/02_Handler 机制.md)
