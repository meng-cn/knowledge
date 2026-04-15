# UI 测试 - Espresso & UI Automator

> **字数统计：约 11000 字**  
> **难度等级：⭐⭐⭐⭐**  
> **面试重要度：⭐⭐⭐**

---

## 目录

1. [UI 测试基础](#1-ui-测试基础)
2. [Espresso 核心用法](#2-espresso-核心用法)
3. [UI Automator](#3-ui-automator)
4. [Compose 测试](#4-compose-测试)
5. [最佳实践](#5-最佳实践)
6. [面试考点](#6-面试考点)

---

## 1. UI 测试基础

### 1.1 为什么需要 UI 测试

```
UI 测试的价值：
- 验证用户界面正确显示
- 确保用户交互按预期工作
- 检测回归问题
- 模拟真实用户行为
```

### 1.2 测试框架对比

```
Android UI 测试框架：

1. Espresso
   - 白盒测试（知道应用内部结构）
   - 自动同步（等待 UI 稳定）
   - 快速执行
   - 适合应用内测试

2. UI Automator
   - 黑盒测试（不知道内部结构）
   - 跨应用测试
   - 系统级操作
   - 适合系统交互测试

3. Compose Testing
   - 专为 Jetpack Compose 设计
   - 语义树查询
   - 与 Compose 深度集成
```

### 1.3 依赖配置

```gradle
dependencies {
    // Espresso
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    androidTestImplementation 'androidx.test.espresso:espresso-contrib:3.5.1'
    androidTestImplementation 'androidx.test.espresso:espresso-intents:3.5.1'
    androidTestImplementation 'androidx.test.espresso:espresso-web:3.5.1'
    androidTestImplementation 'androidx.test.espresso:espresso-idling-resource:3.5.1'
    
    // UI Automator
    androidTestImplementation 'androidx.test.uiautomator:uiautomator:2.3.0'
    
    // Compose Testing
    androidTestImplementation 'androidx.compose.ui:ui-test-junit4:1.5.4'
    debugImplementation 'androidx.compose.ui:ui-test-manifest:1.5.4'
    
    // Test Runner
    androidTestImplementation 'androidx.test:runner:1.5.2'
    androidTestImplementation 'androidx.test:rules:1.5.0'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
}
```

---

## 2. Espresso 核心用法

### 2.1 基础 API

```kotlin
import androidx.test.espresso.Espresso.*
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.*
import androidx.test.espresso.matcher.ViewMatchers.*
import org.hamcrest.Matchers.*

class EspressoBasics {
    
    @Test
    fun `basic UI test`() {
        // onView - 查找 View
        onView(withId(R.id.editText))
            // perform - 执行操作
            .perform(typeText("Hello"))
        
        // check - 断言
        onView(withId(R.id.editText))
            .check(matches(withText("Hello")))
        
        // 链式调用
        onView(withId(R.id.editText))
            .perform(typeText("Hello"))
            .check(matches(withText("Hello")))
    }
    
    @Test
    fun `click button and verify result`() {
        // 点击按钮
        onView(withId(R.id.submitButton))
            .perform(click())
        
        // 验证结果显示
        onView(withId(R.id.resultText))
            .check(matches(isDisplayed()))
            .check(matches(withText("Success")))
    }
    
    @Test
    fun `multiple view interactions`() {
        // 填充表单
        onView(withId(R.id.usernameEdit))
            .perform(typeText("admin"))
        
        onView(withId(R.id.passwordEdit))
            .perform(typeText("password123"))
        
        // 点击登录
        onView(withId(R.id.loginButton))
            .perform(click())
        
        // 验证跳转到主页
        onView(withId(R.id.homeTitle))
            .check(matches(isDisplayed()))
    }
}
```

### 2.2 View 匹配器

```kotlin
class ViewMatchers {
    
    @Test
    fun `ID matchers`() {
        // 通过 ID 查找
        onView(withId(R.id.button))
        onView(withContentDescription("Back"))
    }
    
    @Test
    fun `text matchers`() {
        // 精确匹配
        onView(withText("Submit"))
        
        // 包含文本
        onView(withText(containsString("Hello")))
        
        // 正则匹配
        onView(withText(matchesRegex("\\d+")))
        
        // 忽略大小写
        onView(withText(equalsIgnoringCase("submit")))
    }
    
    @Test
    fun `visibility matchers`() {
        // 显示
        onView(withId(R.id.view)).check(matches(isDisplayed()))
        
        // 存在（可能不可见）
        onView(withId(R.id.view)).check(matches(isCompletelyDisplayed()))
        
        // 不存在
        onView(withId(R.id.view)).check(doesNotExist())
    }
    
    @Test
    fun `state matchers`() {
        // 已选中
        onView(withId(R.id.checkbox)).check(matches(isChecked()))
        
        // 已启用
        onView(withId(R.id.button)).check(matches(isEnabled()))
        
        // 已聚焦
        onView(withId(R.id.edit)).check(matches(hasFocus()))
        
        // 已选中（Spinner 等）
        onView(withId(R.id.spinner)).check(matches(withSelection(0)))
    }
    
    @Test
    fun `combined matchers`() {
        // AND
        onView(allOf(
            withId(R.id.button),
            withText("Submit"),
            isDisplayed()
        ))
        
        // OR
        onView(anyOf(
            withId(R.id.button1),
            withId(R.id.button2)
        ))
        
        // NOT
        onView(not(withId(R.id.loading)))
        
        // 组合复杂条件
        onView(allOf(
            withId(R.id.item),
            hasDescendant(withText("Item Title")),
            isDisplayed()
        ))
    }
    
    @Test
    fun `custom matcher`() {
        // 自定义匹配器
        val withHint = withHint("Enter username")
        onView(withId(R.id.edit)).check(matches(withHint))
    }
}
```

### 2.3 View 操作

```kotlin
class ViewActions {
    
    @Test
    fun `click actions`() {
        // 普通点击
        onView(withId(R.id.button)).perform(click())
        
        // 长按
        onView(withId(R.id.item)).perform(longClick())
        
        // 双击
        onView(withId(R.id.item)).perform(doubleClick())
        
        // 指定位置点击
        onView(withId(R.id.view)).perform(
            generalClick(
                ClickCoordinates(0.5f, 0.5f) // 中心
            )
        )
    }
    
    @Test
    fun `text input actions`() {
        // 输入文本
        onView(withId(R.id.edit)).perform(typeText("Hello"))
        
        // 替换文本
        onView(withId(R.id.edit)).perform(replaceText("World"))
        
        // 清除文本
        onView(withId(R.id.edit)).perform(clearText())
        
        // 输入文本并关闭键盘
        onView(withId(R.id.edit)).perform(
            typeText("Hello"),
            closeSoftKeyboard()
        )
        
        // 输入文本并提交
        onView(withId(R.id.edit)).perform(
            typeText("Hello"),
            pressKey(KeyEvent.KEYCODE_ENTER)
        )
    }
    
    @Test
    fun `scroll actions`() {
        // 滚动到 View
        onView(withId(R.id.bottomView)).perform(scrollTo())
        
        // 在 RecyclerView 中滚动
        onView(withId(R.id.recyclerView)).perform(
            RecyclerViewActions.scrollToPosition<ViewHolder>(10)
        )
        
        // 滚动并点击
        onView(withId(R.id.recyclerView)).perform(
            RecyclerViewActions.actionOnItemAtPosition<ViewHolder>(
                10,
                click()
            )
        )
    }
    
    @Test
    fun `swipe actions`() {
        // 滑动
        onView(withId(R.id.view)).perform(swipeLeft())
        onView(withId(R.id.view)).perform(swipeRight())
        onView(withId(R.id.view)).perform(swipeUp())
        onView(withId(R.id.view)).perform(swipeDown())
        
        // 指定强度的滑动
        onView(withId(R.id.view)).perform(
            generalSwipe(
                Swipe.LEFT,
                GeneralLocation.CENTER,
                GeneralLocation.CENTER_RIGHT,
                Press.FINGER
            )
        )
    }
    
    @Test
    fun `other actions`() {
        // 打开软键盘
        onView(withId(R.id.edit)).perform(openSoftKeyboard())
        
        // 关闭软键盘
        onView(withId(R.id.edit)).perform(closeSoftKeyboard())
        
        // 按下返回键
        pressBack()
        
        // 按下特定键
        onView(withId(R.id.edit)).perform(
            pressKey(KeyEvent.KEYCODE_ENTER)
        )
        
        // 设置进度（SeekBar）
        onView(withId(R.id.seekBar)).perform(
            SeekBarActions.setProgress(50)
        )
        
        // 选择 Spinner 项
        onView(withId(R.id.spinner)).perform(
            selectPositionInSpinner(0)
        )
    }
}
```

### 2.4 RecyclerView 测试

```kotlin
import androidx.test.espresso.contrib.RecyclerViewActions

class RecyclerViewTest {
    
    @Test
    fun `scroll to position`() {
        onView(withId(R.id.recyclerView)).perform(
            scrollToPosition<ViewHolder>(10)
        )
    }
    
    @Test
    fun `scroll to item with text`() {
        onView(withId(R.id.recyclerView)).perform(
            scrollTo<ViewHolder>(
                hasDescendant(withText("Item 10"))
            )
        )
    }
    
    @Test
    fun `click on item at position`() {
        onView(withId(R.id.recyclerView)).perform(
            actionOnItemAtPosition<ViewHolder>(
                5,
                click()
            )
        )
    }
    
    @Test
    fun `perform action on item matching`() {
        onView(withId(R.id.recyclerView)).perform(
            actionOnItem<ViewHolder>(
                hasDescendant(withText("Target Item")),
                click()
            )
        )
    }
    
    @Test
    fun `verify item count`() {
        onView(withId(R.id.recyclerView)).check(
            matches(hasChildCount(10))
        )
    }
    
    @Test
    fun `verify item content`() {
        onView(withId(R.id.recyclerView)).check(
            matches(atPositionOnView(
                0,
                R.id.itemText,
                withText("First Item")
            ))
        )
    }
}
```

### 2.5 Intent 测试

```kotlin
import androidx.test.espresso.intent.Intents.*
import androidx.test.espresso.intent.matcher.IntentMatchers.*
import android.content.Intent
import android.net.Uri

class IntentTest {
    
    @Before
    fun setup() {
        // 初始化 Intent 测试
        Intents.init()
    }
    
    @After
    fun teardown() {
        // 释放 Intent 测试
        Intents.release()
    }
    
    @Test
    fun `verify intent sent`() {
        // 点击分享按钮
        onView(withId(R.id.shareButton)).perform(click())
        
        // 验证发送了分享 Intent
        intended(
            allOf(
                hasAction(Intent.ACTION_SEND),
                hasType("text/plain")
            )
        )
    }
    
    @Test
    fun `verify intent with data`() {
        onView(withId(R.id.callButton)).perform(click())
        
        intended(
            allOf(
                hasAction(Intent.ACTION_DIAL),
                hasData(Uri.parse("tel:123456"))
            )
        )
    }
    
    @Test
    fun `stub intent response`() {
        // 模拟相机 Intent 响应
        val result = ActivityResult(
            Activity.RESULT_OK,
            Intent().putExtra("data", "photo_uri")
        )
        
        intending(hasAction(MediaStore.ACTION_IMAGE_CAPTURE))
            .respondWith(result)
        
        // 点击拍照按钮
        onView(withId(R.id.cameraButton)).perform(click())
        
        // 验证结果显示
        onView(withId(R.id.photoView)).check(matches(isDisplayed()))
    }
    
    @Test
    fun `block external intents`() {
        // 阻止所有外部 Intent
        intending(not(isInternal())).respondWith(
            ActivityResult(Activity.RESULT_CANCELED, null)
        )
        
        // 测试应用内流程
    }
}
```

### 2.6 WebView 测试

```kotlin
import androidx.test.espresso.web.sugar.Web.*
import androidx.test.espresso.web.webdriver.DriverAtoms.*
import androidx.test.espresso.web.webdriver.Locator

class WebViewTest {
    
    @Test
    fun `interact with web content`() {
        // 查找 WebView
        onWebView()
            // 查找元素
            .withElement(findElement(Locator.ID, "username"))
            // 输入文本
            .perform(webKeys("admin"))
        
        // 输入密码
        onWebView()
            .withElement(findElement(Locator.ID, "password"))
            .perform(webKeys("password123"))
        
        // 点击登录按钮
        onWebView()
            .withElement(findElement(Locator.ID, "loginButton"))
            .perform(webClick())
        
        // 验证结果
        onWebView()
            .withElement(findElement(Locator.ID, "welcomeMessage"))
            .check(matches(webContent("Welcome, admin!")))
    }
    
    @Test
    fun `execute JavaScript`() {
        val result = onWebView()
            .forceJavascriptEnabled()
            .withElement(findElement(Locator.ID, "result"))
            .perform(webJavascriptExecution(
                "document.getElementById('result').innerText"
            ))
        
        assertEquals("Expected Result", result)
    }
    
    @Test
    fun `navigate in WebView`() {
        onWebView()
            .perform(webNavigation().toUrl("https://example.com"))
        
        // 验证页面加载
        onWebView()
            .withElement(findElement(Locator.ID, "mainContent"))
            .check(matches(isDisplayed()))
    }
}
```

### 2.7 自定义 ViewAction

```kotlin
class CustomViewAction {
    
    // 自定义点击带坐标
    fun clickAt(x: Float, y: Float): ViewAction {
        return GeneralClickAction(
            Tap.SINGLE,
            GeneralLocation.VISIBLE_CENTER,
            Press.FINGER,
            InputDevice.SOURCE_UNKNOWN,
            MotionEvent.BUTTON_PRIMARY
        ) { view, rootLocation ->
            floatArrayOf(x, y)
        }
    }
    
    // 自定义滚动到
    fun scrollToView(): ViewAction {
        return object : ViewAction {
            override fun getDescription() = "Scroll to view"
            
            override fun getConstraints() = isDisplayingAtLeast(10)
            
            override fun perform(uiController: UiController, view: View) {
                (view.parent as? ScrollView)?.scrollTo(0, view.bottom)
            }
        }
    }
    
    // 自定义断言
    fun isAtPosition(expectedX: Int, expectedY: Int): ViewAssertion {
        return ViewAssertion { view, noMatchingViewException ->
            if (noMatchingViewException != null) {
                throw noMatchingViewException
            }
            
            val actualX = view.left
            val actualY = view.top
            
            assertEquals(expectedX, actualX)
            assertEquals(expectedY, actualY)
        }
    }
    
    @Test
    fun `use custom actions`() {
        onView(withId(R.id.view))
            .perform(clickAt(100f, 50f))
        
        onView(withId(R.id.view))
            .check(isAtPosition(0, 100))
    }
}
```

### 2.8 IdlingResource

```kotlin
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.IdlingResource

class IdlingResourceTest {
    
    private lateinit var idlingResource: IdlingResource
    
    @Before
    fun setup() {
        // 注册 IdlingResource
        idlingResource = SimpleIdlingResource()
        IdlingRegistry.getInstance().register(idlingResource)
    }
    
    @After
    fun teardown() {
        // 注销 IdlingResource
        IdlingRegistry.getInstance().unregister(idlingResource)
    }
    
    @Test
    fun `test with async operation`() {
        // 触发异步操作
        onView(withId(R.id.loadButton)).perform(click())
        
        // Espresso 会等待 IdlingResource 变为空闲
        // 然后继续执行
        
        // 验证结果
        onView(withId(R.id.result))
            .check(matches(isDisplayed()))
    }
}

// 简单 IdlingResource 实现
class SimpleIdlingResource : IdlingResource {
    
    @Volatile
    private var isIdle = true
    
    private var callback: IdlingResource.ResourceCallback? = null
    
    override fun getName() = "SimpleIdlingResource"
    
    override fun isIdleNow() = isIdle
    
    override fun registerIdleTransitionCallback(callback: IdlingResource.ResourceCallback) {
        this.callback = callback
    }
    
    fun setIdleState(isIdle: Boolean) {
        this.isIdle = isIdle
        if (isIdle && callback != null) {
            callback?.onTransitionToIdle()
        }
    }
}

// 使用 CountingIdlingResource
object EspressoIdlingResource {
    private const val RESOURCE = "GLOBAL"
    
    @JvmField
    val countingIdlingResource = CountingIdlingResource(RESOURCE)
    
    fun increment() {
        countingIdlingResource.increment()
    }
    
    fun decrement() {
        countingIdlingResource.decrement()
    }
}

// 在代码中使用
class Repository {
    suspend fun fetchData(): Data {
        EspressoIdlingResource.increment()
        try {
            return api.getData()
        } finally {
            EspressoIdlingResource.decrement()
        }
    }
}
```

---

## 3. UI Automator

### 3.1 基础用法

```kotlin
import androidx.test.uiautomator.*

class UiAutomatorBasics {
    
    private lateinit var device: UiDevice
    
    @Before
    fun setup() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    }
    
    @Test
    fun `basic UI Automator test`() {
        // 启动应用
        device.launchApp()
        
        // 查找元素
        val button = device.findObject(By.text("Submit"))
        
        // 点击
        button.click()
        
        // 等待元素出现
        device.wait(Until.hasObject(By.text("Success")), 5000)
        
        // 验证
        val resultText = device.findObject(By.text("Success"))
        assertNotNull(resultText)
    }
    
    @Test
    fun `input text`() {
        val editField = device.findObject(By.res("editText"))
        editField.click()
        editField.text = "Hello World"
    }
    
    @Test
    fun `scroll and find`() {
        // 滚动查找
        device.findObject(By.scrollable(true))
            .scrollUntil(
                By.text("Target Item"),
                UiScrollableConfig.Builder().maxSwipes(10).build()
            )
    }
}
```

### 3.2 跨应用测试

```kotlin
class CrossAppTest {
    
    private lateinit var device: UiDevice
    
    @Before
    fun setup() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    }
    
    @Test
    fun `test with system dialog`() {
        // 启动应用
        device.launchApp()
        
        // 触发系统对话框
        device.findObject(By.text("Request Permission")).click()
        
        // 等待系统对话框
        device.wait(Until.hasObject(By.pkg("com.android.permissionmanager")), 5000)
        
        // 点击允许
        device.findObject(By.text("允许")).click()
        
        // 返回应用
        device.pressBack()
    }
    
    @Test
    fun `test with notification`() {
        // 打开通知栏
        device.openNotification()
        
        // 查找通知
        val notification = device.findObject(By.text("Test Notification"))
        assertNotNull(notification)
        
        // 点击通知
        notification.click()
        
        // 关闭通知栏
        device.pressBack()
    }
    
    @Test
    fun `test with recent apps`() {
        // 打开最近任务
        device.pressRecentApps()
        
        // 切换到应用
        device.findObject(By.text("My App")).click()
        
        // 验证应用在前台
        device.wait(Until.hasObject(By.pkg("com.example.app")), 5000)
    }
}
```

### 3.3 手势操作

```kotlin
class GestureTest {
    
    private lateinit var device: UiDevice
    
    @Test
    fun `swipe gesture`() {
        // 从屏幕底部滑到顶部
        device.swipe(
            device.displayWidth / 2,
            device.displayHeight * 3 / 4,
            device.displayWidth / 2,
            device.displayHeight / 4,
            100 // 步数
        )
    }
    
    @Test
    fun `pinch gesture`() {
        // 捏合缩放（需要两个手指）
        val startX = device.displayWidth / 2
        val startY = device.displayHeight / 2
        
        // 模拟两个手指
        device.swipe(startX - 100, startY, startX + 100, startY, 50)
    }
    
    @Test
    fun `long press`() {
        val item = device.findObject(By.text("Item"))
        item.longClick()
    }
}
```

---

## 4. Compose 测试

### 4.1 基础 Compose 测试

```kotlin
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.*

class ComposeTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun `test basic Compose UI`() {
        // 设置 Compose 内容
        composeTestRule.setContent {
            Text("Hello World")
        }
        
        // 查找并验证
        composeTestRule
            .onNodeWithText("Hello World")
            .assertIsDisplayed()
    }
    
    @Test
    fun `test button click`() {
        var clickCount = 0
        
        composeTestRule.setContent {
            Button(onClick = { clickCount++ }) {
                Text("Click me")
            }
            Text("Count: $clickCount")
        }
        
        // 点击按钮
        composeTestRule
            .onNodeWithText("Click me")
            .performClick()
        
        // 验证结果
        composeTestRule
            .onNodeWithText("Count: 1")
            .assertIsDisplayed()
    }
}
```

### 4.2 Compose 选择器

```kotlin
class ComposeMatchers {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun `find by text`() {
        composeTestRule.setContent {
            Text("Hello")
        }
        
        composeTestRule
            .onNodeWithText("Hello")
            .assertExists()
    }
    
    @Test
    fun `find by content description`() {
        composeTestRule.setContent {
            Icon(
                imageVector = Icons.Default.Home,
                contentDescription = "Home"
            )
        }
        
        composeTestRule
            .onNodeWithContentDescription("Home")
            .assertExists()
    }
    
    @Test
    fun `find by test tag`() {
        composeTestRule.setContent {
            TextField(
                value = "",
                onValueChange = {},
                modifier = Modifier.testTag("usernameField")
            )
        }
        
        composeTestRule
            .onNodeWithTag("usernameField")
            .assertExists()
    }
    
    @Test
    fun `find by role`() {
        composeTestRule.setContent {
            Button(onClick = {}) {
                Text("Submit")
            }
        }
        
        composeTestRule
            .onNodeWithRole(Role.Button)
            .assertExists()
    }
    
    @Test
    fun `combined matchers`() {
        composeTestRule.setContent {
            Text("Submit", modifier = Modifier.testTag("button"))
        }
        
        composeTestRule
            .onNodeWithTag("button")
            .onNodeWithText("Submit")
            .assertExists()
    }
}
```

### 4.3 Compose 操作

```kotlin
class ComposeActions {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun `text input`() {
        composeTestRule.setContent {
            var text by remember { mutableStateOf("") }
            TextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.testTag("input")
            )
        }
        
        composeTestRule
            .onNodeWithTag("input")
            .performTextInput("Hello World")
        
        composeTestRule
            .onNodeWithText("Hello World")
            .assertExists()
    }
    
    @Test
    fun `scroll`() {
        composeTestRule.setContent {
            LazyColumn {
                items(100) { index ->
                    Text("Item $index", modifier = Modifier.testTag("item_$index"))
                }
            }
        }
        
        // 滚动到特定项
        composeTestRule
            .onNodeWithTag("item_50")
            .performScrollTo()
            .assertIsDisplayed()
    }
    
    @Test
    fun `click`() {
        composeTestRule.setContent {
            var clicked by remember { mutableStateOf(false) }
            Button(onClick = { clicked = true }) {
                Text("Click me")
            }
            if (clicked) {
                Text("Clicked!")
            }
        }
        
        composeTestRule
            .onNodeWithText("Click me")
            .performClick()
        
        composeTestRule
            .onNodeWithText("Clicked!")
            .assertExists()
    }
}
```

### 4.4 Compose 断言

```kotlin
class ComposeAssertions {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun `visibility assertions`() {
        composeTestRule.setContent {
            Text("Visible")
            Text("Hidden", modifier = Modifier.hidden())
        }
        
        composeTestRule
            .onNodeWithText("Visible")
            .assertIsDisplayed()
        
        composeTestRule
            .onNodeWithText("Hidden")
            .assertIsNotDisplayed()
    }
    
    @Test
    fun `enabled assertions`() {
        composeTestRule.setContent {
            Button(onClick = {}, enabled = true) {
                Text("Enabled")
            }
            Button(onClick = {}, enabled = false) {
                Text("Disabled")
            }
        }
        
        composeTestRule
            .onNodeWithText("Enabled")
            .assertIsEnabled()
        
        composeTestRule
            .onNodeWithText("Disabled")
            .assertIsNotEnabled()
    }
    
    @Test
    fun `text assertions`() {
        composeTestRule.setContent {
            Text("Hello World")
        }
        
        composeTestRule
            .onNodeWithText("Hello World")
            .assertTextEquals("Hello World")
        
        composeTestRule
            .onNodeWithText("Hello World")
            .assertTextContains("World")
    }
    
    @Test
    fun `count assertions`() {
        composeTestRule.setContent {
            LazyColumn {
                items(5) { Text("Item") }
            }
        }
        
        composeTestRule
            .onAllNodesWithText("Item")
            .assertCountEquals(5)
    }
}
```

### 4.5 Compose 与 ViewModel 测试

```kotlin
class ComposeViewModelTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    private lateinit var viewModel: LoginViewModel
    
    @Before
    fun setup() {
        viewModel = LoginViewModel(mockk())
    }
    
    @Test
    fun `test login flow`() {
        composeTestRule.setContent {
            LoginScreen(viewModel = viewModel)
        }
        
        // 输入用户名
        composeTestRule
            .onNodeWithTag("username")
            .performTextInput("admin")
        
        // 输入密码
        composeTestRule
            .onNodeWithTag("password")
            .performTextInput("password123")
        
        // 点击登录
        composeTestRule
            .onNodeWithTag("loginButton")
            .performClick()
        
        // 验证导航
        composeTestRule
            .onNodeWithTag("homeScreen")
            .assertExists()
    }
}
```

---

## 5. 最佳实践

### 5.1 Page Object 模式

```kotlin
// Page Object
class LoginPage {
    
    private val usernameField = onView(withId(R.id.usernameEdit))
    private val passwordField = onView(withId(R.id.passwordEdit))
    private val loginButton = onView(withId(R.id.loginButton))
    private val errorText = onView(withId(R.id.errorText))
    
    fun enterUsername(username: String): LoginPage {
        usernameField.perform(typeText(username), closeSoftKeyboard())
        return this
    }
    
    fun enterPassword(password: String): LoginPage {
        passwordField.perform(typeText(password), closeSoftKeyboard())
        return this
    }
    
    fun clickLogin(): HomePage {
        loginButton.perform(click())
        return HomePage()
    }
    
    fun verifyError(message: String): LoginPage {
        errorText.check(matches(withText(message)))
        return this
    }
}

class HomePage {
    
    private val welcomeText = onView(withId(R.id.welcomeText))
    private val logoutButton = onView(withId(R.id.logoutButton))
    
    fun verifyWelcome(username: String): HomePage {
        welcomeText.check(matches(withText("Welcome, $username")))
        return this
    }
    
    fun clickLogout(): LoginPage {
        logoutButton.perform(click())
        return LoginPage()
    }
}

// 测试使用
class LoginFlowTest {
    
    @Test
    fun `successful login`() {
        LoginPage()
            .enterUsername("admin")
            .enterPassword("password123")
            .clickLogin()
            .verifyWelcome("admin")
    }
    
    @Test
    fun `login with invalid credentials`() {
        LoginPage()
            .enterUsername("admin")
            .enterPassword("wrong")
            .clickLogin()
            .verifyError("Invalid credentials")
    }
}
```

### 5.2 测试数据管理

```kotlin
// 测试数据工厂
object TestDataFactory {
    
    fun createValidUser(): User {
        return User(
            id = 1,
            username = "test_user",
            email = "test@example.com",
            password = "password123"
        )
    }
    
    fun createInvalidUser(): User {
        return User(
            id = 0,
            username = "",
            email = "invalid",
            password = "123"
        )
    }
    
    fun createUsers(count: Int): List<User> {
        return (1..count).map {
            User(id = it, username = "user_$it", email = "user_$it@example.com")
        }
    }
}

// 在测试中使用
class UserTest {
    
    @Test
    fun `test with valid user`() {
        val user = TestDataFactory.createValidUser()
        // 使用 user 进行测试
    }
}
```

### 5.3 测试隔离

```kotlin
class IsolatedTests {
    
    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)
    
    @Before
    fun setup() {
        // 每个测试前重置状态
        Intents.init()
    }
    
    @After
    fun teardown() {
        // 每个测试后清理
        Intents.release()
    }
    
    @Test
    fun `test 1 - isolated`() {
        // 不受其他测试影响
    }
    
    @Test
    fun `test 2 - isolated`() {
        // 不受其他测试影响
    }
}
```

### 5.4 截图测试

```kotlin
class ScreenshotTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun `capture screenshot`() {
        composeTestRule.setContent {
            MyScreen()
        }
        
        // 捕获截图
        composeTestRule
            .onRoot()
            .captureToImage()
            .saveToFile("my_screen.png")
    }
    
    @Test
    fun `compare screenshots`() {
        composeTestRule.setContent {
            MyScreen()
        }
        
        val currentImage = composeTestRule
            .onRoot()
            .captureToImage()
        
        // 与基准截图比较
        val baselineImage = loadBaselineImage("my_screen_baseline.png")
        compareImages(currentImage, baselineImage)
    }
}
```

---

## 6. 面试考点

### 6.1 基础概念

**Q1: Espresso 和 UI Automator 的区别？**

```
答案要点：
- Espresso：白盒测试，应用内测试，自动同步
- UI Automator：黑盒测试，跨应用测试，系统级操作
- 选择建议：
  - 应用内 UI 测试用 Espresso
  - 跨应用/系统交互用 UI Automator
```

**Q2: Espresso 的三大核心 API？**

```
答案要点：
1. onView() - 查找 View
2. perform() - 执行操作
3. check() - 断言验证

示例：
onView(withId(R.id.button))
    .perform(click())
    .check(matches(isDisplayed()))
```

**Q3: 什么是 IdlingResource？**

```
答案要点：
- 用于处理异步操作
- 告诉 Espresso 何时应用处于空闲状态
- 避免测试因异步操作而失败
- 类型：CountingIdlingResource, SimpleIdlingResource
```

### 6.2 实战问题

**Q4: 如何测试 RecyclerView？**

```kotlin
// 滚动到位置
onView(withId(R.id.recyclerView)).perform(
    scrollToPosition<ViewHolder>(10)
)

// 点击特定位置
onView(withId(R.id.recyclerView)).perform(
    actionOnItemAtPosition<ViewHolder>(5, click())
)

// 查找并点击匹配项
onView(withId(R.id.recyclerView)).perform(
    actionOnItem<ViewHolder>(
        hasDescendant(withText("Target")),
        click()
    )
)
```

**Q5: 如何测试 Intent？**

```kotlin
@Before
fun setup() { Intents.init() }

@After
fun teardown() { Intents.release() }

@Test
fun testIntent() {
    onView(withId(R.id.shareButton)).perform(click())
    
    intended(
        allOf(
            hasAction(Intent.ACTION_SEND),
            hasType("text/plain")
        )
    )
}
```

**Q6: Compose 测试的优势？**

```
答案要点：
- 语义树查询（不依赖 View ID）
- 与 Compose 深度集成
- 更简洁的 API
- 支持状态测试
- 自动同步
```

### 6.3 高级问题

**Q7: 如何处理测试中的异步操作？**

```kotlin
// 1. 使用 IdlingResource
val idlingResource = CountingIdlingResource("RESOURCE")
idlingResource.increment()
// 异步操作完成后
idlingResource.decrement()

// 2. 使用 Espresso 的内置同步
// Espresso 自动等待 Looper 空闲

// 3. Compose 测试自动同步
composeTestRule
    .onNodeWithText("Loading")
    .assertDoesNotExist() // 等待消失
```

**Q8: Page Object 模式的好处？**

```
答案要点：
- 封装 UI 操作逻辑
- 提高代码复用性
- 易于维护（UI 变化只改 Page 类）
- 测试代码更清晰
- 符合单一职责原则
```

**Q9: 如何优化 UI 测试速度？**

```
答案要点：
- 减少测试数量，聚焦关键路径
- 使用单元测试替代部分 UI 测试
- 并行执行测试
- 使用模拟器快照
- 避免不必要的等待
- 使用 TestRule 管理生命周期
```

---

## 参考资料

- [Espresso 官方文档](https://developer.android.com/training/testing/espresso)
- [UI Automator 官方文档](https://developer.android.com/training/testing/ui-automator)
- [Compose Testing 文档](https://developer.android.com/jetpack/compose/testing)

---

*本文完，感谢阅读！*
