# Android ContentProvider 内容提供者 - 全面详解

> ContentProvider 是 Android 四大组件之一，用于在应用间安全地共享数据。

---

## 目录

1. [ContentProvider 基础概念](#1-contentprovider-基础概念)
2. [CRUD 操作详解](#2-crud-操作详解)
3. [UriMatcher 使用](#3-urimatcher-使用)
4. [ContentObserver 监听变化](#4-contentobserver-监听变化)
5. [跨进程数据共享](#5-跨进程数据共享)
6. [权限控制](#6-权限控制)
7. [常用 ContentProvider](#7-常用-contentprovider)
8. [自定义 ContentProvider](#8-自定义-contentprovider)
9. [面试考点](#9-面试考点)

---

## 1. ContentProvider 基础概念

### 1.1 什么是 ContentProvider

ContentProvider（内容提供者）是 Android 四大组件之一，为应用提供了一种标准化的数据共享接口。

**核心作用：**

- ✅ 应用间数据共享
- ✅ 统一的数据访问接口
- ✅ 权限控制和数据安全
- ✅ 数据抽象和封装
- ✅ 支持远程查询（跨进程）

### 1.2 为什么需要 ContentProvider

**问题场景：没有 ContentProvider 时**

```
┌─────────────┐     ┌─────────────┐
│   App A     │     │   App B     │
│             │     │             │
│ 直接访问数据库 │ ❌  │ 数据库私有    │
│             │     │             │
└─────────────┘     └─────────────┘

问题：
- 无法直接访问其他应用的数据库
- 数据库结构变化会导致兼容性问题
- 没有统一的权限控制机制
```

**使用 ContentProvider 后：**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   App A     │────▶│ ContentProvider│────▶│  App B      │
│             │     │   (App C)    │     │             │
│   query     │     │              │     │  query      │
│  insert     │     │  数据库      │     │  update     │
│             │     │              │     │             │
└─────────────┘     └─────────────┘     └─────────────┘

优势：
- 统一的数据访问接口
- 权限控制
- 数据抽象（App B 不需要知道 App C 的数据库结构）
```

### 1.3 ContentProvider 工作原理

```
┌────────────────────────────────────────────────────────┐
│              ContentProvider 工作流程                   │
│                                                       │
│   ┌──────────┐    URI    ┌─────────────┐             │
│   │ Consumer │ ───────>  │ Provider    │             │
│   │ (Client) │ 查询请求   │ (Content)   │             │
│   └──────────┘           └──────┬──────┘             │
│                                │                     │
│                          解析 URI                      │
│                                │                     │
│                                ▼                     │
│                          ┌──────────┐               │
│                          │ Database │               │
│                          │  /File   │               │
│                          │  /Memory │               │
│                          └──────────┘               │
│                                │                     │
│                                ▼                     │
│                          ┌──────────┐               │
│                          │  Cursor  │               │
│                          │  (结果)  │               │
│                          └────┬─────┘               │
│                               │                     │
│                               ▼                     │
│   ┌──────────┐              返回数据                 │
│   │ Consumer │ ◀──────────────────────────          │
│   └──────────┘                                      │
│                                                       │
└────────────────────────────────────────────────────────┘
```

### 1.4 ContentProvider 的 URI 结构

ContentProvider 通过 URI（统一资源标识符）来定位数据。

**URI 格式：**

```
content://authority/path/id

例如：
content://com.example.provider/books/123
        │           │        │    │
        │           │        │    └─ ID（可选）
        │           │        └───── 路径
        │           └────────────── 权威标识符
        └────────────────────────── 方案（固定为 content）
```

**解析示例：**

```kotlin
val uri = Uri.parse("content://com.example.provider/books/123")

uri.scheme        // "content"
uri.authority     // "com.example.provider"
uri.path          // "/books/123"
uri.pathSegments  // ["books", "123"]
uri.lastPathSegment // "123"
```

---

## 2. CRUD 操作详解

### 2.1 ContentProvider 核心方法

```kotlin
class MyContentProvider : ContentProvider() {
    
    // 1. 查询数据
    override fun query(
        uri: Uri,
        projection: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? {
        // 实现查询逻辑
        return database.query(...)
    }
    
    // 2. 插入数据
    override fun insert(
        uri: Uri,
        values: ContentValues?
    ): Uri? {
        // 实现插入逻辑
        val id = database.insert(...)
        return Uri.withAppendedPath(uri, id.toString())
    }
    
    // 3. 更新数据
    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int {
        // 实现更新逻辑
        return database.update(...)
    }
    
    // 4. 删除数据
    override fun delete(
        uri: Uri,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int {
        // 实现删除逻辑
        return database.delete(...)
    }
    
    // 5. 返回 MIME 类型
    override fun getType(uri: Uri): String? {
        return when (uriMatcher.match(uri)) {
            BOOKS -> "vnd.android.cursor.dir/vnd.com.example.book"
            BOOK -> "vnd.android.cursor.item/vnd.com.example.book"
            else -> null
        }
    }
    
    // 6. 初始化
    override fun onCreate(): Boolean {
        // 初始化数据库
        return true
    }
}
```

### 2.2 查询操作（Query）

**ContentResolver 查询：**

```kotlin
// 方式 1：查询所有数据
fun queryAllBooks(context: Context) {
    val cursor = context.contentResolver.query(
        BooksContract.CONTENT_URI,
        null,  // 所有列
        null,  // 无筛选条件
        null,  // 无筛选参数
        null   // 无排序
    )
    
    cursor?.use {
        while (it.moveToNext()) {
            val id = it.getInt(it.getColumnIndexOrThrow(BooksContract._ID))
            val title = it.getString(it.getColumnIndexOrThrow(BooksContract.TITLE))
            val author = it.getString(it.getColumnIndexOrThrow(BooksContract.AUTHOR))
            Log.d("Book", "$id: $title by $author")
        }
    }
}

// 方式 2：查询指定列
fun queryBookTitles(context: Context) {
    val projection = arrayOf(
        BooksContract.TITLE,
        BooksContract.AUTHOR
    )
    
    val cursor = context.contentResolver.query(
        BooksContract.CONTENT_URI,
        projection,
        null,
        null,
        null
    )
}

// 方式 3：带筛选条件查询
fun queryBooksByAuthor(context: Context, author: String) {
    val selection = "${BooksContract.AUTHOR} = ?"
    val selectionArgs = arrayOf(author)
    
    val cursor = context.contentResolver.query(
        BooksContract.CONTENT_URI,
        null,
        selection,
        selectionArgs,
        null
    )
}

// 方式 4：带排序查询
fun queryBooksSorted(context: Context) {
    val sortOrder = "${BooksContract.TITLE} ASC, ${BooksContract.CREATED_DATE} DESC"
    
    val cursor = context.contentResolver.query(
        BooksContract.CONTENT_URI,
        null,
        null,
        null,
        sortOrder
    )
}

// 方式 5：查询指定 ID 的书籍
fun queryBookById(context: Context, id: Long) {
    val bookUri = ContentUris.withAppendedId(
        BooksContract.CONTENT_URI,
        id
    )
    
    val cursor = context.contentResolver.query(
        bookUri,
        null,
        null,
        null,
        null
    )
}
```

### 2.3 插入操作（Insert）

```kotlin
// 插入单条数据
fun insertBook(context: Context, title: String, author: String): Uri? {
    val values = ContentValues().apply {
        put(BooksContract.TITLE, title)
        put(BooksContract.AUTHOR, author)
        put(BooksContract.PAGE_COUNT, 300)
        put(BooksContract.CREATED_DATE, System.currentTimeMillis())
    }
    
    return context.contentResolver.insert(
        BooksContract.CONTENT_URI,
        values
    )
}

// 插入多条数据（使用 Transaction）
fun insertMultipleBooks(context: Context, books: List<Book>) {
    context.contentResolver.apply {
        acquireContentProviderTransaction()
        try {
            for (book in books) {
                val values = ContentValues().apply {
                    put(BooksContract.TITLE, book.title)
                    put(BooksContract.AUTHOR, book.author)
                }
                insert(BooksContract.CONTENT_URI, values)
            }
        } finally {
            finishContentProviderTransaction()
        }
    }
}

// 使用 BulkInsertCallback 批量插入
fun bulkInsertBooks(context: Context, books: List<Book>) {
    val values = books.map { book ->
        ContentValues().apply {
            put(BooksContract.TITLE, book.title)
            put(BooksContract.AUTHOR, book.author)
        }
    }.toTypedArray()
    
    context.contentResolver.bulkInsert(
        BooksContract.CONTENT_URI,
        values
    )
}
```

### 2.4 更新操作（Update）

```kotlin
// 更新指定 ID 的数据
fun updateBook(context: Context, id: Long, newTitle: String): Int {
    val values = ContentValues().apply {
        put(BooksContract.TITLE, newTitle)
        put(BooksContract.UPDATED_DATE, System.currentTimeMillis())
    }
    
    val selection = "${BooksContract._ID} = ?"
    val selectionArgs = arrayOf(id.toString())
    
    return context.contentResolver.update(
        ContentUris.withAppendedId(BooksContract.CONTENT_URI, id),
        values,
        null,
        null
    )
}

// 更新多条数据
fun updateBooksByAuthor(context: Context, author: String, newAuthor: String): Int {
    val values = ContentValues().apply {
        put(BooksContract.AUTHOR, newAuthor)
    }
    
    val selection = "${BooksContract.AUTHOR} = ?"
    val selectionArgs = arrayOf(author)
    
    return context.contentResolver.update(
        BooksContract.CONTENT_URI,
        values,
        selection,
        selectionArgs
    )
}
```

### 2.5 删除操作（Delete）

```kotlin
// 删除指定 ID 的数据
fun deleteBook(context: Context, id: Long): Int {
    val bookUri = ContentUris.withAppendedId(BooksContract.CONTENT_URI, id)
    return context.contentResolver.delete(bookUri, null, null)
}

// 删除多条数据
fun deleteBooksByAuthor(context: Context, author: String): Int {
    val selection = "${BooksContract.AUTHOR} = ?"
    val selectionArgs = arrayOf(author)
    
    return context.contentResolver.delete(
        BooksContract.CONTENT_URI,
        selection,
        selectionArgs
    )
}

// 删除所有数据
fun deleteAllBooks(context: Context): Int {
    return context.contentResolver.delete(
        BooksContract.CONTENT_URI,
        null,
        null
    )
}
```

### 2.6 使用 Kotlin Flow 进行协程查询

```kotlin
// 将 Cursor 转换为 Flow
fun Context.booksFlow(): Flow<List<Book>> = flow {
    val cursor = contentResolver.query(
        BooksContract.CONTENT_URI,
        null,
        null,
        null,
        null
    )
    
    val books = mutableListOf<Book>()
    cursor?.use {
        while (it.moveToNext()) {
            val book = Book(
                id = it.getLong(it.getColumnIndexOrThrow(BooksContract._ID)),
                title = it.getString(it.getColumnIndexOrThrow(BooksContract.TITLE)),
                author = it.getString(it.getColumnIndexOrThrow(BooksContract.AUTHOR))
            )
            books.add(book)
        }
    }
    
    emit(books)
}

// 在 ViewModel 中使用
class BooksViewModel(application: Application) : ViewModel() {
    private val context = application.applicationContext
    
    private val _books = MutableStateFlow<List<Book>>(emptyList())
    val books: StateFlow<List<Book>> = _books.asStateFlow()
    
    init {
        loadBooks()
    }
    
    private fun loadBooks() {
        viewModelScope.launch {
            context.booksFlow().collect { books ->
                _books.value = books
            }
        }
    }
}
```

---

## 3. UriMatcher 使用

### 3.1 什么是 UriMatcher

UriMatcher 用于解析和匹配 ContentProvider 的 URI，根据匹配结果返回不同的代码，便于在 ContentProvider 中进行相应的处理。

### 3.2 添加 URI 匹配规则

```kotlin
class BooksContentProvider : ContentProvider() {
    
    private lateinit var database: SQLiteDatabase
    private val uriMatcher = UriMatcher(UriMatcher.NO_MATCH)
    
    companion object {
        // 定义匹配代码
        private const val BOOKS = 1      // 匹配 /books
        private const val BOOK = 2       // 匹配 /books/123
        private const val AUTHORS = 3    // 匹配 /authors
        private const val AUTHOR = 4     // 匹配 /authors/456
    }
    
    override fun onCreate(): Boolean {
        // 初始化数据库
        database = dbHelper.writableDatabase
        
        // 添加匹配规则
        uriMatcher.addURI(
            BooksContract.AUTHORITY,      // 权威标识符
            BooksContract.PATH_BOOKS,     // 路径
            BOOKS                         // 匹配代码
        )
        
        uriMatcher.addURI(
            BooksContract.AUTHORITY,
            BooksContract.PATH_BOOKS + "/#",  // # 表示数字 ID
            BOOK
        )
        
        uriMatcher.addURI(
            BooksContract.AUTHORITY,
            BooksContract.PATH_AUTHORS,
            AUTHORS
        )
        
        uriMatcher.addURI(
            BooksContract.AUTHORITY,
            BooksContract.PATH_AUTHORS + "/#",
            AUTHOR
        )
        
        return true
    }
    
    override fun query(
        uri: Uri,
        projection: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? {
        return when (uriMatcher.match(uri)) {
            BOOKS -> {
                // 查询所有书籍
                database.query(
                    BooksContract.TABLE_BOOKS,
                    projection,
                    selection,
                    selectionArgs,
                    null,
                    null,
                    sortOrder
                )
            }
            BOOK -> {
                // 查询指定 ID 的书籍
                val id = uri.lastPathSegment?.toLongOrNull() ?: return null
                val newSelection = "(${selection ?: ""}) AND ${BooksContract._ID} = ?"
                val newSelectionArgs = if (selectionArgs != null) {
                    selectionArgs + id.toString()
                } else {
                    arrayOf(id.toString())
                }
                
                database.query(
                    BooksContract.TABLE_BOOKS,
                    projection,
                    newSelection,
                    newSelectionArgs,
                    null,
                    null,
                    sortOrder
                )
            }
            AUTHORS -> {
                // 查询所有作者
                database.query(
                    AuthorsContract.TABLE_AUTHORS,
                    projection,
                    selection,
                    selectionArgs,
                    null,
                    null,
                    sortOrder
                )
            }
            AUTHOR -> {
                // 查询指定 ID 的作者
                val id = uri.lastPathSegment?.toLongOrNull() ?: return null
                // ... 类似 BOOK 的处理
                null
            }
            else -> {
                throw IllegalArgumentException("Unknown URI: $uri")
            }
        }
    }
    
    // insert, update, delete 方法同样使用 uriMatcher 判断
}
```

### 3.3 UriMatcher 匹配规则

```kotlin
// 精确匹配
uriMatcher.addURI("com.example", "books", BOOKS)
// 匹配：content://com.example/books

// 通配符匹配（# 表示数字）
uriMatcher.addURI("com.example", "books/#", BOOK)
// 匹配：content://com.example/books/123

// 通配符匹配（* 表示任意字符）
uriMatcher.addURI("com.example", "books/*/authors", BOOK_AUTHORS)
// 匹配：content://com.example/books/123/authors

// 多级路径匹配
uriMatcher.addURI("com.example", "books/*/chapters/*", BOOK_CHAPTER)
// 匹配：content://com.example/books/123/chapters/456
```

### 3.4 自定义 UriMatcher

```kotlin
class CustomUriMatcher : UriMatcher(NO_MATCH) {
    
    companion object {
        const val USERS = 100
        const val USER = 101
        const val USER_POSTS = 102
        const val USER_POST = 103
    }
    
    fun addRules(authority: String) {
        addURI(authority, "users", USERS)
        addURI(authority, "users/#", USER)
        addURI(authority, "users/*/posts", USER_POSTS)
        addURI(authority, "users/*/posts/#", USER_POST)
    }
    
    fun extractUserId(uri: Uri): Long? {
        return when (match(uri)) {
            USER, USER_POSTS, USER_POST -> {
                uri.pathSegments[1].toLongOrNull()
            }
            else -> null
        }
    }
    
    fun extractPostId(uri: Uri): Long? {
        return if (match(uri) == USER_POST) {
            uri.pathSegments[3].toLongOrNull()
        } else {
            null
        }
    }
}
```

---

## 4. ContentObserver 监听变化

### 4.1 什么是 ContentObserver

ContentObserver 用于监听 ContentProvider 的数据变化，当数据发生增删改时自动通知观察者。

### 4.2 注册 ContentObserver

```kotlin
class BookActivity : AppCompatActivity() {
    
    private var contentObserver: ContentObserver? = null
    
    override fun onStart() {
        super.onStart()
        
        // 创建 ContentObserver
        contentObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) {
                // 数据变化时调用
                refreshBooks()
            }
            
            override fun onChange(selfChange: Boolean, uri: Uri?) {
                // 带 URI 的变化通知
                if (uri == BooksContract.CONTENT_URI) {
                    refreshBooks()
                }
            }
        }
        
        // 注册观察者
        contentResolver.registerContentObserver(
            BooksContract.CONTENT_URI,
            true,  // 是否立即通知
            contentObserver
        )
    }
    
    override fun onStop() {
        super.onStop()
        
        // 注销观察者
        contentObserver?.let {
            contentResolver.unregisterContentObserver(it)
        }
    }
    
    private fun refreshBooks() {
        // 重新加载数据
        loadBooks()
    }
}
```

### 4.3 通知观察者

**在 ContentProvider 中通知数据变化：**

```kotlin
class BooksContentProvider : ContentProvider() {
    
    override fun insert(
        uri: Uri,
        values: ContentValues?
    ): Uri? {
        val id = database.insert(
            BooksContract.TABLE_BOOKS,
            null,
            values
        )
        
        // 插入成功后通知观察者
        val insertUri = ContentUris.withAppendedId(uri, id)
        context?.contentResolver?.notifyChange(insertUri, null)
        
        return insertUri
    }
    
    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int {
        val count = database.update(
            BooksContract.TABLE_BOOKS,
            values,
            selection,
            selectionArgs
        )
        
        // 更新成功后通知观察者
        if (count > 0) {
            context?.contentResolver?.notifyChange(uri, null)
        }
        
        return count
    }
    
    override fun delete(
        uri: Uri,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int {
        val count = database.delete(
            BooksContract.TABLE_BOOKS,
            selection,
            selectionArgs
        )
        
        // 删除成功后通知观察者
        if (count > 0) {
            context?.contentResolver?.notifyChange(uri, null)
        }
        
        return count
    }
}
```

### 4.4 使用 LiveData 监听

```kotlin
// 使用 LiveData 包装 ContentObserver
fun Context.observeBooks(): LiveData<List<Book>> {
    return object : LiveData<List<Book>>() {
        private val contentObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) {
                postValue(loadBooks())
            }
        }
        
        override fun onActive() {
            super.onActive()
            contentResolver.registerContentObserver(
                BooksContract.CONTENT_URI,
                true,
                contentObserver
            )
        }
        
        override fun onInactive() {
            super.onInactive()
            contentResolver.unregisterContentObserver(contentObserver)
        }
        
        private fun loadBooks(): List<Book> {
            // 查询书籍
            return emptyList()
        }
    }
}

// 在 Activity 中使用
bookLiveData.observe(this) { books ->
    adapter.submitList(books)
}
```

### 4.5 使用 Flow 监听

```kotlin
fun Context.booksFlow(): StateFlow<List<Book>> {
    return MutableStateFlow(emptyList<Book>()).apply {
        val observer = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) {
                val books = contentResolver.query(
                    BooksContract.CONTENT_URI,
                    null,
                    null,
                    null,
                    null
                )?.use { cursor ->
                    cursor.toBooksList()
                } ?: emptyList()
                
                value = books
            }
        }
        
        // 注册观察者
        contentResolver.registerContentObserver(
            BooksContract.CONTENT_URI,
            true,
            observer
        )
    }
}
```

---

## 5. 跨进程数据共享

### 5.1 跨进程通信原理

```
┌─────────────────┐              ┌─────────────────┐
│   App A         │              │   App B         │
│                 │              │                 │
│  ContentResolver│              │  ContentProvider│
│                 │              │                 │
│    query()      │────────────▶ │   query()       │
│                 │   IPC (Binder)              │
│   Cursor        │◀──────────── │   Cursor        │
│                 │              │                 │
└─────────────────┘              └─────────────────┘
```

### 5.2 设置跨进程访问

**在 Manifest 中声明：**

```xml
<provider
    android:name=".BooksContentProvider"
    android:authorities="com.example.provider.books"
    android:exported="true"        <!-- 允许跨进程访问 -->
    android:grantUriPermissions="true"
    android:permission="com.example.READ_BOOKS_PERMISSION">
    
    <path-permission
        android:path="/books"
        android:readPermission="com.example.READ_BOOKS_PERMISSION"
        android:writePermission="com.example.WRITE_BOOKS_PERMISSION" />
</provider>

<!-- 定义权限 -->
<permission
    android:name="com.example.READ_BOOKS_PERMISSION"
    android:protectionLevel="normal" />
<permission
    android:name="com.example.WRITE_BOOKS_PERMISSION"
    android:protectionLevel="normal" />
```

**其他应用访问：**

```kotlin
// App B 访问 App A 的 ContentProvider

// 1. 声明使用权限
// App B 的 AndroidManifest.xml
<uses-permission android:name="com.example.READ_BOOKS_PERMISSION" />
<uses-permission android:name="com.example.WRITE_BOOKS_PERMISSION" />

// 2. 查询数据
fun queryBooksFromOtherApp(context: Context) {
    val uri = Uri.parse("content://com.example.provider.books/books")
    
    val cursor = context.contentResolver.query(
        uri,
        arrayOf("title", "author"),
        null,
        null,
        null
    )
    
    cursor?.use {
        while (it.moveToNext()) {
            val title = it.getString(0)
            val author = it.getString(1)
            Log.d("Books", "$title by $author")
        }
    }
}

// 3. 插入数据
fun insertBookToOtherApp(context: Context, title: String, author: String) {
    val uri = Uri.parse("content://com.example.provider.books/books")
    val values = ContentValues().apply {
        put("title", title)
        put("author", author)
    }
    
    context.contentResolver.insert(uri, values)
}
```

### 5.3 跨进程 Cursor

**跨进程 Cursor 的使用注意事项：**

```kotlin
// ⚠️ 注意：跨进程返回的 Cursor 不能直接使用，需要转换

// 方式 1：使用 copy()
val cursor = contentResolver.query(uri, projection, null, null, null)
val localCursor = cursor?.copy()
localCursor?.use {
    // 安全使用
}

// 方式 2：转换为 List
val cursor = contentResolver.query(uri, projection, null, null, null)
val data = cursor?.toList()
cursor?.close()

// 方式 3：使用 ContentResolver 的便捷方法
val books = queryBooksAsList(context, uri)
```

---

## 6. 权限控制

### 6.1 权限保护级别

```xml
<!-- normal：安装时自动授予 -->
<permission
    android:name="com.example.NORMAL_PERMISSION"
    android:protectionLevel="normal" />

<!-- dangerous：用户手动授予 -->
<permission
    android:name="com.example.DANGEROUS_PERMISSION"
    android:protectionLevel="dangerous" />

<!-- signature：签名一致才能获取 -->
<permission
    android:name="com.example.SIGNATURE_PERMISSION"
    android:protectionLevel="signature" />

<!-- signatureOrSystem：签名一致或系统应用 -->
<permission
    android:name="com.example.SIGNATURE_OR_SYSTEM_PERMISSION"
    android:protectionLevel="signatureOrSystem" />
```

### 6.2 ContentProvider 权限设置

```xml
<provider
    android:name=".SecureContentProvider"
    android:authorities="com.example.secure.provider"
    android:exported="true"
    android:permission="com.example.ACCESS_SECURE_DATA">
    
    <!-- 路径级别的权限 -->
    <path-permission
        android:path="/public"
        android:readPermission="com.example.READ_PUBLIC"
        android:writePermission="com.example.WRITE_PUBLIC" />
    
    <path-permission
        android:path="/private"
        android:readPermission="com.example.READ_PRIVATE"
        android:writePermission="com.example.WRITE_PRIVATE" />
</provider>
```

### 6.3 运行时权限检查

```kotlin
class SecureContentProvider : ContentProvider() {
    
    override fun query(
        uri: Uri,
        projection: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? {
        // 检查权限
        if (!hasReadPermission()) {
            throw SecurityException("Permission denied for reading")
        }
        
        return database.query(...)
    }
    
    override fun insert(
        uri: Uri,
        values: ContentValues?
    ): Uri? {
        // 检查写权限
        if (!hasWritePermission()) {
            throw SecurityException("Permission denied for writing")
        }
        
        return super.insert(uri, values)
    }
    
    private fun hasReadPermission(): Boolean {
        return context?.checkCallingOrSelfPermission(
            "com.example.READ_PRIVATE"
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    private fun hasWritePermission(): Boolean {
        return context?.checkCallingOrSelfPermission(
            "com.example.WRITE_PRIVATE"
        ) == PackageManager.PERMISSION_GRANTED
    }
}
```

---

## 7. 常用 ContentProvider

### 7.1 ContactsProvider（联系人）

```kotlin
// 查询联系人
fun queryContacts(context: Context): List<Contact> {
    val projection = arrayOf(
        ContactsContract.Contacts._ID,
        ContactsContract.Contacts.DISPLAY_NAME,
        ContactsContract.Contacts.HAS_PHONE_NUMBER
    )
    
    val contacts = mutableListOf<Contact>()
    
    val cursor = context.contentResolver.query(
        ContactsContract.Contacts.CONTENT_URI,
        projection,
        null,
        null,
        "${ContactsContract.Contacts.DISPLAY_NAME} ASC"
    )
    
    cursor?.use {
        while (it.moveToNext()) {
            val id = it.getString(it.getColumnIndexOrThrow(ContactsContract.Contacts._ID))
            val name = it.getString(it.getColumnIndexOrThrow(ContactsContract.DISPLAY_NAME))
            val hasPhone = it.getInt(it.getColumnIndexOrThrow(ContactsContract.Contacts.HAS_PHONE_NUMBER)) == 1
            
            if (hasPhone) {
                val phones = queryPhoneNumbers(context, id)
                contacts.add(Contact(name, phones))
            }
        }
    }
    
    return contacts
}

// 查询电话号码
fun queryPhoneNumbers(context: Context, contactId: String): List<String> {
    val phones = mutableListOf<String>()
    
    val cursor = context.contentResolver.query(
        ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
        arrayOf(ContactsContract.CommonDataKinds.Phone.NUMBER),
        "${ContactsContract.CommonDataKinds.Phone.CONTACT_ID} = ?",
        arrayOf(contactId),
        null
    )
    
    cursor?.use {
        while (it.moveToNext()) {
            val number = it.getString(it.getColumnIndexOrThrow(
                ContactsContract.CommonDataKinds.Phone.NUMBER
            ))
            phones.add(number)
        }
    }
    
    return phones
}

// 添加联系人
fun addContact(
    context: Context,
    name: String,
    phone: String,
    email: String?
) {
    val rawContactId = context.contentResolver.insert(
        ContactsContract.RawContacts.CONTENT_URI,
        ContentValues().apply {
            put(ContactsContract.RawContacts.ACCOUNT_TYPE, null)
            put(ContactsContract.RawContacts.ACCOUNT_NAME, null)
        }
    )?.lastPathSegment?.toLongOrNull()
    
    if (rawContactId != null) {
        // 设置姓名
        context.contentResolver.insert(
            ContactsContract.Data.CONTENT_URI,
            ContentValues().apply {
                put(ContactsContract.Data.RAW_CONTACT_ID, rawContactId)
                put(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.StructuredName.MIMETYPE)
                put(ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME, name)
            }
        )
        
        // 设置电话
        context.contentResolver.insert(
            ContactsContract.Data.CONTENT_URI,
            ContentValues().apply {
                put(ContactsContract.Data.RAW_CONTACT_ID, rawContactId)
                put(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.Phone.MIMETYPE)
                put(ContactsContract.CommonDataKinds.Phone.NUMBER, phone)
                put(ContactsContract.CommonDataKinds.Phone.TYPE, ContactsContract.CommonDataKinds.Phone.TYPE_MOBILE)
            }
        )
        
        // 设置邮箱
        if (email != null) {
            context.contentResolver.insert(
                ContactsContract.Data.CONTENT_URI,
                ContentValues().apply {
                    put(ContactsContract.Data.RAW_CONTACT_ID, rawContactId)
                    put(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.Email.MIMETYPE)
                    put(ContactsContract.CommonDataKinds.Email.DATA, email)
                }
            )
        }
    }
}
```

### 7.2 MediaStore（媒体存储）

```kotlin
// 查询图片
fun queryImages(context: Context): List<Uri> {
    val projection = arrayOf(
        MediaStore.Images.Media._ID,
        MediaStore.Images.Media.DISPLAY_NAME,
        MediaStore.Images.Media.DATA
    )
    
    val selection = MediaStore.Images.Media.IS_DELETED + " = 0"
    
    val imageUris = mutableListOf<Uri>()
    
    val cursor = context.contentResolver.query(
        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
        projection,
        selection,
        null,
        "${MediaStore.Images.Media.DATE_ADDED} DESC"
    )
    
    cursor?.use {
        while (it.moveToNext()) {
            val id = it.getLong(it.getColumnIndexOrThrow(MediaStore.Images.Media._ID))
            val uri = ContentUris.withAppendedId(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                id
            )
            imageUris.add(uri)
        }
    }
    
    return imageUris
}

// 保存图片
fun saveImage(context: Context, bitmap: Bitmap, title: String): Uri? {
    val values = ContentValues().apply {
        put(MediaStore.Images.Media.DISPLAY_NAME, title)
        put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
        put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/MyApp")
    }
    
    val uri = context.contentResolver.insert(
        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
        values
    )
    
    uri?.let {
        context.contentResolver.openOutputStream(it)?.use { outputStream ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
        }
    }
    
    return uri
}

// 查询视频
fun queryVideos(context: Context): List<Video> {
    val projection = arrayOf(
        MediaStore.Video.Media._ID,
        MediaStore.Video.Media.DISPLAY_NAME,
        MediaStore.Video.Media.DURATION,
        MediaStore.Video.Media.SIZE
    )
    
    val videos = mutableListOf<Video>()
    
    val cursor = context.contentResolver.query(
        MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
        projection,
        null,
        null,
        null
    )
    
    cursor?.use {
        while (it.moveToNext()) {
            val id = it.getLong(0)
            val name = it.getString(1)
            val duration = it.getLong(2)
            val size = it.getLong(3)
            
            videos.add(Video(id, name, duration, size))
        }
    }
    
    return videos
}
```

### 7.3 CallLogProvider（通话记录）

```kotlin
// 查询通话记录
fun queryCallLog(context: Context): List<CallRecord> {
    val projection = arrayOf(
        CallLog.Calls._ID,
        CallLog.Calls.NUMBER,
        CallLog.Calls.CACHED_NAME,
        CallLog.Calls.TYPE,
        CallLog.Calls.DATE
    )
    
    val records = mutableListOf<CallRecord>()
    
    val cursor = context.contentResolver.query(
        CallLog.Calls.CONTENT_URI,
        projection,
        null,
        null,
        "${CallLog.Calls.DATE} DESC"
    )
    
    cursor?.use {
        while (it.moveToNext()) {
            val number = it.getString(it.getColumnIndexOrThrow(CallLog.Calls.NUMBER))
            val name = it.getString(it.getColumnIndexOrThrow(CallLog.Calls.CACHED_NAME))
            val type = it.getInt(it.getColumnIndexOrThrow(CallLog.Calls.TYPE))
            val date = it.getLong(it.getColumnIndexOrThrow(CallLog.Calls.DATE))
            
            val callType = when (type) {
                CallLog.Calls.INCOMING_TYPE -> "来电"
                CallLog.Calls.OUTGOING_TYPE -> "去电"
                CallLog.Calls.MISSED_TYPE -> "未接"
                else -> "未知"
            }
            
            records.add(CallRecord(number, name, callType, date))
        }
    }
    
    return records
}
```

---

## 8. 自定义 ContentProvider

### 8.1 完整的 ContentProvider 实现

**定义 Contract 类：**

```kotlin
class BooksContract {
    companion object {
        // 权威标识符
        const val AUTHORITY = "com.example.provider.books"
        
        // Content URI
        val CONTENT_URI: Uri = Uri.parse(
            "content://$AUTHORITY/books"
        )
        
        // 路径
        const val PATH_BOOKS = "books"
        const val PATH_AUTHORS = "authors"
        
        // 表名
        const val TABLE_BOOKS = "books"
        const val TABLE_AUTHORS = "authors"
        
        // 列名
        const val _ID = "_id"
        const val TITLE = "title"
        const val AUTHOR = "author"
        const val PAGE_COUNT = "page_count"
        const val CREATED_DATE = "created_date"
        const val UPDATED_DATE = "updated_date"
        
        // MIME 类型
        const val MIME_BOOKS = "vnd.android.cursor.dir/vnd.com.example.book"
        const val MIME_BOOK = "vnd.android.cursor.item/vnd.com.example.book"
    }
}
```

**创建数据库帮助类：**

```kotlin
class DatabaseHelper(context: Context) : 
    SQLiteOpenHelper(context, "books.db", null, DATABASE_VERSION) {
    
    companion object {
        const val DATABASE_VERSION = 1
        
        private const val CREATE_BOOKS = """
            CREATE TABLE ${BooksContract.TABLE_BOOKS} (
                ${BooksContract._ID} INTEGER PRIMARY KEY AUTOINCREMENT,
                ${BooksContract.TITLE} TEXT NOT NULL,
                ${BooksContract.AUTHOR} TEXT NOT NULL,
                ${BooksContract.PAGE_COUNT} INTEGER,
                ${BooksContract.CREATED_DATE} INTEGER,
                ${BooksContract.UPDATED_DATE} INTEGER
            )
        """
    }
    
    override fun onCreate(db: SQLiteDatabase?) {
        db?.execSQL(CREATE_BOOKS)
    }
    
    override fun onUpgrade(
        db: SQLiteDatabase?,
        oldVersion: Int,
        newVersion: Int
    ) {
        // 处理数据库升级
    }
}
```

**实现 ContentProvider：**

```kotlin
class BooksContentProvider : ContentProvider() {
    
    private var database: SQLiteDatabase? = null
    private var context: Context? = null
    
    private val uriMatcher = UriMatcher(UriMatcher.NO_MATCH).apply {
        addURI(BooksContract.AUTHORITY, BooksContract.PATH_BOOKS, BOOKS)
        addURI(BooksContract.AUTHORITY, BooksContract.PATH_BOOKS + "/#", BOOK)
    }
    
    companion object {
        private const val BOOKS = 1
        private const val BOOK = 2
    }
    
    override fun onCreate(): Boolean {
        context = context
        database = DatabaseHelper(context).writableDatabase
        return true
    }
    
    override fun query(
        uri: Uri,
        projection: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? {
        val db = database ?: return null
        
        return when (uriMatcher.match(uri)) {
            BOOKS -> db.query(
                BooksContract.TABLE_BOOKS,
                projection,
                selection,
                selectionArgs,
                null,
                null,
                sortOrder
            )
            BOOK -> {
                val id = uri.lastPathSegment?.toLongOrNull() ?: return null
                db.query(
                    BooksContract.TABLE_BOOKS,
                    projection,
                    "(${selection ?: ""}) AND ${BooksContract._ID} = ?",
                    if (selectionArgs != null) selectionArgs + id.toString()
                    else arrayOf(id.toString()),
                    null,
                    null,
                    sortOrder
                )
            }
            else -> throw IllegalArgumentException("Unknown URI: $uri")
        }
    }
    
    override fun insert(
        uri: Uri,
        values: ContentValues?
    ): Uri? {
        if (uriMatcher.match(uri) != BOOKS || values == null) {
            return null
        }
        
        val id = database?.insertOrThrow(
            BooksContract.TABLE_BOOKS,
            null,
            values
        )
        
        context?.contentResolver?.notifyChange(
            ContentUris.withAppendedId(uri, id),
            null
        )
        
        return ContentUris.withAppendedId(uri, id)
    }
    
    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int {
        return when (uriMatcher.match(uri)) {
            BOOKS -> database?.update(
                BooksContract.TABLE_BOOKS,
                values,
                selection,
                selectionArgs
            )
            BOOK -> {
                val id = uri.lastPathSegment?.toLongOrNull() ?: return 0
                database?.update(
                    BooksContract.TABLE_BOOKS,
                    values,
                    "${BooksContract._ID} = ?",
                    arrayOf(id.toString())
                )
            }
            else -> throw IllegalArgumentException("Unknown URI: $uri")
        }?.let {
            context?.contentResolver?.notifyChange(uri, null)
            it
        } ?: 0
    }
    
    override fun delete(
        uri: Uri,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int {
        return when (uriMatcher.match(uri)) {
            BOOKS -> database?.delete(
                BooksContract.TABLE_BOOKS,
                selection,
                selectionArgs
            )
            BOOK -> {
                val id = uri.lastPathSegment?.toLongOrNull() ?: return 0
                database?.delete(
                    BooksContract.TABLE_BOOKS,
                    "${BooksContract._ID} = ?",
                    arrayOf(id.toString())
                )
            }
            else -> throw IllegalArgumentException("Unknown URI: $uri")
        }?.let {
            context?.contentResolver?.notifyChange(uri, null)
            it
        } ?: 0
    }
    
    override fun getType(uri: Uri): String? {
        return when (uriMatcher.match(uri)) {
            BOOKS -> BooksContract.MIME_BOOKS
            BOOK -> BooksContract.MIME_BOOK
            else -> null
        }
    }
}
```

**在 Manifest 中注册：**

```xml
<provider
    android:name=".BooksContentProvider"
    android:authorities="com.example.provider.books"
    android:exported="false"
    android:grantUriPermissions="true" />
```

---

## 9. 面试考点

### 9.1 基础题

**Q1: ContentProvider 的作用是什么？**

A: ContentProvider 用于在应用间安全地共享数据，提供统一的数据访问接口，支持权限控制和跨进程通信。

**Q2: ContentProvider 的四大核心方法？**

A:
- query(): 查询数据，返回 Cursor
- insert(): 插入数据，返回 URI
- update(): 更新数据，返回更新行数
- delete(): 删除数据，返回删除行数

**Q3: UriMatcher 的作用？**

A: UriMatcher 用于解析和匹配 ContentProvider 的 URI，根据匹配结果返回不同的代码，便于进行相应的数据处理。

### 9.2 进阶题

**Q4: ContentObserver 如何使用？**

A: ContentObserver 用于监听 ContentProvider 的数据变化，在数据增删改时自动通知观察者，实现数据同步。

**Q5: 如何保护 ContentProvider 的访问权限？**

A:
- 设置 android:exported 控制是否跨进程访问
- 使用 android:permission 设置访问权限
- 使用 path-permission 设置路径级别权限
- 在代码中手动检查权限

**Q6: ContentProvider 跨进程返回的 Cursor 有什么特殊性？**

A: 跨进程返回的是 CursorWindow，不能直接修改，需要使用 copy() 方法转换为本地 Cursor。

### 9.3 高级题

**Q7: ContentProvider 的实现原理？**

A: ContentProvider 通过 Binder 实现跨进程通信，客户端通过 ContentResolver 发送请求，服务端 ContentProvider 接收请求并操作数据源。

**Q8: 如何高效地批量插入数据？**

A:
- 使用 bulkInsert() 方法
- 使用 Transaction 事务
- 实现 BulkInsertCallback 接口

**Q9: ContentProvider 和直接数据库访问的区别？**

A:
- ContentProvider 提供统一接口，直接数据库访问暴露实现细节
- ContentProvider 支持跨进程，数据库访问仅限本进程
- ContentProvider 有权限控制，数据库访问无权限控制

---

## 总结

ContentProvider 是 Android 数据共享的核心机制，掌握要点：

1. 理解 URI 的作用和结构
2. 掌握 CRUD 操作的实现
3. 熟练使用 UriMatcher 进行 URI 匹配
4. 使用 ContentObserver 监听数据变化
5. 注意跨进程访问的安全性和性能
6. 了解常用系统 ContentProvider 的使用
