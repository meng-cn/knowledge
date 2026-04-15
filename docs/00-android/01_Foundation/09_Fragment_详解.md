# 04_Fragment.md - Fragment 深度解析

## 目录
1. [Fragment 概述](#fragment-概述)
2. [Fragment 生命周期](#fragment-生命周期)
3. [Fragment 事务管理](#fragment-事务管理)
4. [FragmentManager/BackStack](#fragmentmanager-backstack)
5. [Fragment 间通信](#fragment-间通信)
6. [Fragment 与 ViewModel](#fragment-与-viewmodel)
7. [Fragment 内存泄漏](#fragment-内存泄漏)
8. [面试考点](#面试考点)
9. [最佳实践与常见错误](#最佳实践与常见错误)
10. [参考资料](#参考资料)

---

## Fragment 概述

### 什么是 Fragment？

Fragment 是 Android 中代表 Activity 中一部分 UI 和行为的可重用组件。它有自己的生命周期，可以接收自己的输入事件，可以在 Activity 运行时添加或移除。

**核心特点：**
- **模块化 UI**：将 UI 拆分为可重用的组件
- **独立生命周期**：有自己的生命周期回调
- **灵活组合**：可以在一个 Activity 中组合多个 Fragment
- **响应式布局**：支持手机和平板的不同布局

### Fragment 的使用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| 多面板布局 | 平板上并排显示多个 Fragment | 邮件列表 + 邮件详情 |
| 动态 UI | 根据用户操作动态替换内容 | 设置页面的不同分类 |
| 底部导航 | 每个 Tab 对应一个 Fragment | 首页、消息、我的 |
| ViewPager | 滑动切换不同页面 | 新闻分类切换 |
| 对话框 | 使用 DialogFragment | 确认对话框、选择器 |
| 复用组件 | 在多个 Activity 中复用 | 登录 Fragment、搜索 Fragment |

### 添加依赖

```gradle
// Fragment KTX 提供 Kotlin 扩展
dependencies {
    implementation "androidx.fragment:fragment-ktx:1.6.2"
}
```

### Fragment 类型

```kotlin
// 1. 普通 Fragment
class MyFragment : Fragment() {
    override fun onCreateView(...): View? {
        return layoutInflater.inflate(R.layout.fragment_my, container, false)
    }
}

// 2. DialogFragment（对话框）
class MyDialogFragment : DialogFragment() {
    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return AlertDialog.Builder(requireContext())
            .setTitle("标题")
            .setMessage("内容")
            .setPositiveButton("确定", null)
            .create()
    }
}

// 3. BottomSheetDialogFragment（底部弹窗）
class MyBottomSheetFragment : BottomSheetDialogFragment() {
    override fun onCreateView(...): View? {
        return layoutInflater.inflate(R.layout.fragment_bottom_sheet, container, false)
    }
}

// 4. PreferenceFragmentCompat（设置页面）
class SettingsFragment : PreferenceFragmentCompat() {
    override fun onCreatePreferences(savedInstanceState: Bundle?, rootKey: String?) {
        setPreferencesFromResource(R.xml.preferences, rootKey)
    }
}

// 5. ListFragment（列表，已废弃，使用 RecyclerViewFragment）
// 6. WebViewFragment（WebView 封装）
```

---

## Fragment 生命周期

### 生命周期流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Fragment 生命周期                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  onAttach()                                                                 │
│      │                                                                      │
│      ▼                                                                      │
│  onCreate()                                                                 │
│      │                                                                      │
│      ▼                                                                      │
│  onCreateView() ────────────────────────────────────────┐                  │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onViewCreated()                                        │                  │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onStart() ◄────────────────────────────────────────────┤ (返回前台)        │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onResume()                                             │                  │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  ────────────────────  活跃状态  ───────────────────────┤                  │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onPause()                                              │                  │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onStop() ──────────────────────────────────────────────┤ (进入后台)        │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onDestroyView()                                        │                  │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onDestroy()                                            │                  │
│      │                                                  │                  │
│      ▼                                                  │                  │
│  onDetach()                                             │                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 完整生命周期示例

```kotlin
class LifecycleFragment : Fragment() {
    
    private var _binding: FragmentLifecycleBinding? = null
    private val binding get() = _binding!!
    
    // 1. onAttach - Fragment 与 Activity 关联
    override fun onAttach(context: Context) {
        super.onAttach(context)
        Log.d("Lifecycle", "onAttach")
        
        // 可以在这里获取 Activity 引用
        val activity = requireActivity()
        val fragmentManager = parentFragmentManager
    }
    
    // 2. onCreate - Fragment 创建
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("Lifecycle", "onCreate")
        
        // 初始化 ViewModel、保留实例状态等
        // 不访问 View
        
        // 保留 Fragment 实例（配置变化时不重建）
        // retainInstance = true // 已废弃，使用 ViewModel 替代
        
        // 接收来自 Activity 的参数
        arguments?.let {
            val param = it.getString("key")
        }
    }
    
    // 3. onCreateView - 创建 View
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.d("Lifecycle", "onCreateView")
        
        //  inflate 布局
        _binding = FragmentLifecycleBinding.inflate(inflater, container, false)
        return binding.root
        
        // 注意：不要在这里操作 View，因为 View 还未完全创建
    }
    
    // 4. onViewCreated - View 创建完成
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.d("Lifecycle", "onViewCreated")
        
        // 初始化 UI、设置监听器、观察 LiveData
        setupUI()
        observeData()
        
        // 恢复状态
        savedInstanceState?.let {
            val savedValue = it.getString("key")
        }
    }
    
    // 5. onStart - Fragment 可见
    override fun onStart() {
        super.onStart()
        Log.d("Lifecycle", "onStart")
        
        // 启动需要可见的动画、刷新数据
    }
    
    // 6. onResume - Fragment 可交互
    override fun onResume() {
        super.onResume()
        Log.d("Lifecycle", "onResume")
        
        // 恢复动画、传感器监听等
    }
    
    // 7. onPause - Fragment 失去焦点
    override fun onPause() {
        Log.d("Lifecycle", "onPause")
        
        // 暂停动画、保存临时数据
        super.onPause()
    }
    
    // 8. onStop - Fragment 不可见
    override fun onStop() {
        Log.d("Lifecycle", "onStop")
        
        // 停止刷新、释放资源
        super.onStop()
    }
    
    // 9. onDestroyView - View 销毁
    override fun onDestroyView() {
        Log.d("Lifecycle", "onDestroyView")
        
        // 清理 View 相关资源，防止内存泄漏
        _binding = null
        
        super.onDestroyView()
    }
    
    // 10. onDestroy - Fragment 销毁
    override fun onDestroy() {
        Log.d("Lifecycle", "onDestroy")
        
        // 清理资源
        super.onDestroy()
    }
    
    // 11. onDetach - Fragment 与 Activity 分离
    override fun onDetach() {
        Log.d("Lifecycle", "onDetach")
        
        // 清理与 Activity 相关的引用
        super.onDetach()
    }
    
    // 保存状态
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        Log.d("Lifecycle", "onSaveInstanceState")
        
        outState.putString("key", "value")
    }
    
    // 配置变化处理
    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        Log.d("Lifecycle", "onConfigurationChanged")
        
        // 处理屏幕旋转等配置变化
    }
}
```

### 生命周期状态对比

| Fragment 状态 | Activity 状态 | 说明 |
|--------------|--------------|------|
| onAttach | - | Fragment 附加到 Activity |
| onCreate | onCreate | Fragment 初始化 |
| onCreateView | - | 创建 View 层次结构 |
| onViewCreated | - | View 创建完成 |
| onStart | onStart | Fragment 可见 |
| onResume | onResume | Fragment 可交互 |
| onPause | onPause | Fragment 失去焦点 |
| onStop | onStop | Fragment 不可见 |
| onDestroyView | - | View 销毁 |
| onDestroy | onDestroy | Fragment 销毁 |
| onDetach | - | Fragment 分离 |

### Fragment 与 Activity 生命周期交互

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("Activity", "onCreate")
        
        // 添加 Fragment
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .add(R.id.container, MyFragment())
                .commit()
        }
    }
    
    // 生命周期顺序：
    // Activity.onCreate → Fragment.onAttach → Fragment.onCreate → 
    // Fragment.onCreateView → Fragment.onViewCreated → Activity.onStart → 
    // Fragment.onStart → Activity.onResume → Fragment.onResume
}
```

---

## Fragment 事务管理

### 基本事务操作

```kotlin
class TransactionFragment : Fragment() {
    
    private fun performTransactions() {
        val fragmentManager = parentFragmentManager
        val transaction = fragmentManager.beginTransaction()
        
        // 1. add - 添加 Fragment
        transaction.add(R.id.container, HomeFragment(), "home")
        
        // 2. replace - 替换 Fragment（先移除所有，再添加）
        transaction.replace(R.id.container, DetailFragment(), "detail")
        
        // 3. remove - 移除 Fragment
        transaction.remove(someFragment)
        
        // 4. hide - 隐藏 Fragment（View 变为 GONE）
        transaction.hide(someFragment)
        
        // 5. show - 显示隐藏的 Fragment
        transaction.show(someFragment)
        
        // 6. setCustomAnimations - 设置动画
        transaction.setCustomAnimations(
            R.anim.slide_in_right,  // enter
            R.anim.slide_out_left,  // exit
            R.anim.slide_in_left,   // popEnter
            R.anim.slide_out_right  // popExit
        )
        
        // 7. addToBackStack - 添加到回退栈
        transaction.addToBackStack("detail")
        
        // 提交事务
        transaction.commit()
        
        // 或者立即提交（不推荐，可能导致状态丢失）
        // transaction.commitNow()
        
        // 或者允许状态丢失时提交（不推荐）
        // transaction.commitAllowingStateLoss()
    }
}
```

### 事务操作对比

| 操作 | 说明 | 使用场景 |
|------|------|----------|
| `add()` | 添加 Fragment 到容器 | 多个 Fragment 叠加显示 |
| `replace()` | 替换容器中的所有 Fragment | 页面切换 |
| `remove()` | 移除 Fragment | 清理不需要的 Fragment |
| `hide()` | 隐藏 Fragment | 临时隐藏，保留状态 |
| `show()` | 显示隐藏的 Fragment | 恢复显示 |

### add vs replace

```kotlin
// add - 多个 Fragment 共存
// 容器中可以同时存在多个 Fragment
transaction.add(R.id.container, FragmentA(), "A")
transaction.add(R.id.container, FragmentB(), "B") // B 覆盖在 A 上面

// replace - 只保留一个 Fragment
// 先移除容器中所有 Fragment，再添加新的
transaction.replace(R.id.container, FragmentA(), "A")
transaction.replace(R.id.container, FragmentB(), "B") // 移除 A，添加 B

// 实际开发中，页面切换推荐使用 replace
```

### 提交方式对比

```kotlin
// 1. commit() - 标准提交
// 将事务添加到消息队列，异步执行
transaction.commit()

// 2. commitNow() - 立即提交
// 同步执行，不经过消息队列
// 不能与 addToBackStack 一起使用
transaction.commitNow()

// 3. commitAllowingStateLoss() - 允许状态丢失
// 在 Activity 状态保存后仍可提交
// 可能导致配置变化时状态丢失
transaction.commitAllowingStateLoss()

// 4. commitNowAllowingStateLoss() - 立即提交且允许状态丢失
transaction.commitNowAllowingStateLoss()

// 推荐使用 commit()，避免状态丢失问题
```

### 批量事务操作

```kotlin
// 使用 runOnCommit 在事务提交后执行
fragmentManager.beginTransaction()
    .replace(R.id.container, NewFragment())
    .addToBackStack(null)
    .runOnCommit {
        // 事务提交后执行
        Log.d("Transaction", "Commit completed")
    }
    .commit()

// 使用 setReorderingAllowed 优化多个 Fragment 操作
// Android 8.0+ 支持
fragmentManager.beginTransaction()
    .setReorderingAllowed(true)
    .hide(fragmentA)
    .show(fragmentB)
    .commit()
```

---

## FragmentManager/BackStack

### FragmentManager 类型

```kotlin
class MyFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 1. parentFragmentManager - 父 FragmentManager（Activity 的）
        val parentFM = parentFragmentManager
        
        // 2. childFragmentManager - 子 FragmentManager（用于嵌套 Fragment）
        val childFM = childFragmentManager
        
        // 3. requireParentFragmentManager - 非空获取
        val fm = requireParentFragmentManager()
    }
}
```

### FragmentManager 操作

```kotlin
class FragmentManagerDemo : Fragment() {
    
    private fun demonstrateFragmentManager() {
        val fm = parentFragmentManager
        
        // 1. 查找 Fragment
        val fragmentById = fm.findFragmentById(R.id.container)
        val fragmentByTag = fm.findFragmentByTag("my_tag")
        
        // 2. 获取所有 Fragment
        val fragments = fm.fragments
        
        // 3. 检查是否有待执行的事务
        val hasPending = fm.isStateSaved
        
        // 4. 立即执行待处理事务
        fm.executePendingTransactions()
        
        // 5. 注册 Fragment 状态变化监听
        fm.registerFragmentLifecycleCallbacks(
            object : FragmentManager.FragmentLifecycleCallbacks() {
                override fun onFragmentCreated(
                    fm: FragmentManager,
                    f: Fragment,
                    savedInstanceState: Bundle?
                ) {
                    Log.d("Callback", "Fragment created: ${f.javaClass.simpleName}")
                }
                
                override fun onFragmentResumed(fm: FragmentManager, f: Fragment) {
                    Log.d("Callback", "Fragment resumed: ${f.javaClass.simpleName}")
                }
            },
            true // true = 包括子 Fragment
        )
        
        // 6. 取消注册
        // fm.unregisterFragmentLifecycleCallbacks(callback)
    }
}
```

### BackStack 管理

```kotlin
class BackStackDemo : Fragment() {
    
    private fun manageBackStack() {
        val fm = parentFragmentManager
        
        // 1. 添加到回退栈
        fm.beginTransaction()
            .replace(R.id.container, DetailFragment())
            .addToBackStack("detail") // 添加标签
            .commit()
        
        // 2. 获取回退栈条目数
        val backStackCount = fm.backStackEntryCount
        
        // 3. 获取回退栈条目
        for (i in 0 until fm.backStackEntryCount) {
            val entry = fm.getBackStackEntryAt(i)
            Log.d("BackStack", "Entry $i: ${entry.name}")
        }
        
        // 4. 监听回退栈变化
        fm.addOnBackStackChangedListener {
            Log.d("BackStack", "Changed, count: ${fm.backStackEntryCount}")
        }
        
        // 5. 弹出回退栈
        // 弹出一条
        fm.popBackStack()
        
        // 弹出到指定条目
        fm.popBackStack("detail", 0) // 保留 detail
        
        // 弹出包括指定条目
        fm.popBackStack("detail", FragmentManager.POP_BACK_STACK_INCLUSIVE)
        
        // 6. 立即弹出
        fm.popBackStackImmediate()
        
        // 7. 移除监听器
        // fm.removeOnBackStackChangedListener(listener)
    }
}
```

### BackStack 最佳实践

```kotlin
// 1. 使用标签管理回退栈
fm.beginTransaction()
    .replace(R.id.container, FragmentA())
    .addToBackStack("A")
    .commit()

fm.beginTransaction()
    .replace(R.id.container, FragmentB())
    .addToBackStack("B")
    .commit()

// 2. 避免回退栈过深
// 使用 clearBackStack 或 popTo
fun navigateToHome() {
    fm.popBackStack(null, FragmentManager.POP_BACK_STACK_INCLUSIVE)
    fm.beginTransaction()
        .replace(R.id.container, HomeFragment())
        .commit()
}

// 3. 使用 Navigation 组件管理回退栈（推荐）
// Navigation 组件自动处理 BackStack
```

### 嵌套 Fragment

```kotlin
// 父 Fragment
class ParentFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 使用 childFragmentManager 管理子 Fragment
        if (savedInstanceState == null) {
            childFragmentManager.beginTransaction()
                .add(R.id.child_container, ChildFragment())
                .commit()
        }
    }
}

// 子 Fragment
class ChildFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 访问父 Fragment
        val parent = parentFragment as? ParentFragment
        
        // 访问父 Fragment 的 FragmentManager
        val parentFM = parentFragment?.parentFragmentManager
        
        // 访问自己的子 FragmentManager
        val childFM = childFragmentManager
    }
}
```

---

## Fragment 间通信

### 通信方式对比

| 方式 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| ViewModel | 类型安全、生命周期感知 | 需要额外依赖 | ⭐⭐⭐⭐⭐ |
| Interface | 简单直接 | 容易内存泄漏 | ⭐⭐⭐ |
| Bundle | 简单 | 类型不安全 | ⭐⭐ |
| Shared ViewModel | 适合兄弟 Fragment | 需要共同 Activity | ⭐⭐⭐⭐⭐ |
| FragmentResult | 官方推荐、类型安全 | 需要 API 支持 | ⭐⭐⭐⭐⭐ |

### 方式 1：使用 ViewModel（推荐）

```kotlin
// 共享 ViewModel
class SharedViewModel : ViewModel() {
    private val _selectedItem = MutableLiveData<String>()
    val selectedItem: LiveData<String> = _selectedItem
    
    fun selectItem(item: String) {
        _selectedItem.value = item
    }
}

// Fragment A - 发送数据
class ListFragment : Fragment() {
    
    private val viewModel: SharedViewModel by activityViewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        recyclerView.setOnItemClickListener { item ->
            viewModel.selectItem(item) // 发送数据
        }
    }
}

// Fragment B - 接收数据
class DetailFragment : Fragment() {
    
    private val viewModel: SharedViewModel by activityViewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel.selectedItem.observe(viewLifecycleOwner) { item ->
            textView.text = item // 接收数据
        }
    }
}
```

### 方式 2：使用 Interface（传统方式）

```kotlin
// 定义接口
interface OnDataPassListener {
    fun onDataPassed(data: String)
}

// Fragment A - 发送
class SenderFragment : Fragment() {
    
    private var listener: OnDataPassListener? = null
    
    override fun onAttach(context: Context) {
        super.onAttach(context)
        listener = context as? OnDataPassListener
            ?: throw ClassCastException("$context must implement OnDataPassListener")
    }
    
    private fun sendData() {
        listener?.onDataPassed("Hello from SenderFragment")
    }
    
    override fun onDetach() {
        super.onDetach()
        listener = null // 防止内存泄漏
    }
}

// Activity 实现接口
class MainActivity : AppCompatActivity(), OnDataPassListener {
    
    override fun onDataPassed(data: String) {
        // 转发给其他 Fragment
        val receiverFragment = supportFragmentManager
            .findFragmentByTag("receiver") as? ReceiverFragment
        receiverFragment?.updateData(data)
    }
}

// Fragment B - 接收
class ReceiverFragment : Fragment() {
    
    fun updateData(data: String) {
        textView.text = data
    }
}
```

### 方式 3：使用 FragmentResult（官方推荐）

```kotlin
// Fragment A - 发送结果
class SenderFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        button.setOnClickListener {
            val result = Bundle().apply {
                putString("key", "Hello from SenderFragment")
                putInt("count", 10)
            }
            
            // 设置结果
            parentFragmentManager.setFragmentResult("request_key", result)
        }
    }
}

// Fragment B - 接收结果
class ReceiverFragment : Fragment() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 监听结果
        parentFragmentManager.setFragmentResultListener(
            "request_key",
            viewLifecycleOwner
        ) { requestKey, bundle ->
            val data = bundle.getString("key")
            val count = bundle.getInt("count")
            
            textView.text = "$data, count: $count"
        }
    }
}
```

### 方式 4：直接访问（不推荐）

```kotlin
// ❌ 不推荐：紧耦合，难以测试
class FragmentA : Fragment() {
    
    private fun sendData() {
        val fragmentB = parentFragmentManager
            .findFragmentByTag("B") as? FragmentB
        fragmentB?.updateData("Hello")
    }
}

class FragmentB : Fragment() {
    
    fun updateData(data: String) {
        textView.text = data
    }
}
```

### DialogFragment 通信

```kotlin
// DialogFragment - 发送结果
class ConfirmDialogFragment : DialogFragment() {
    
    interface ConfirmListener {
        fun onConfirmed()
        fun onCanceled()
    }
    
    private var listener: ConfirmListener? = null
    
    override fun onAttach(context: Context) {
        super.onAttach(context)
        listener = context as? ConfirmListener
    }
    
    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return AlertDialog.Builder(requireContext())
            .setTitle("确认")
            .setMessage("确定要执行此操作吗？")
            .setPositiveButton("确定") { _, _ ->
                listener?.onConfirmed()
            }
            .setNegativeButton("取消") { _, _ ->
                listener?.onCanceled()
            }
            .create()
    }
    
    // 或使用 FragmentResult
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        yesButton.setOnClickListener {
            parentFragmentManager.setFragmentResult("confirm_key", Bundle().apply {
                putBoolean("confirmed", true)
            })
            dismiss()
        }
        
        noButton.setOnClickListener {
            parentFragmentManager.setFragmentResult("confirm_key", Bundle().apply {
                putBoolean("confirmed", false)
            })
            dismiss()
        }
    }
}

// 接收结果
class MainFragment : Fragment() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        parentFragmentManager.setFragmentResultListener(
            "confirm_key",
            this
        ) { _, bundle ->
            val confirmed = bundle.getBoolean("confirmed")
            if (confirmed) {
                // 执行操作
            }
        }
    }
    
    private fun showDialog() {
        ConfirmDialogFragment().show(parentFragmentManager, "confirm")
    }
}
```

---

## Fragment 与 ViewModel

### ViewModel 作用域

```kotlin
class MyFragment : Fragment() {
    
    // 1. Fragment 作用域 - 仅该 Fragment 共享
    private val viewModel: MyViewModel by viewModels()
    
    // 2. Activity 作用域 - Activity 内所有 Fragment 共享
    private val sharedViewModel: SharedViewModel by activityViewModels()
    
    // 3. 父 Fragment 作用域 - 嵌套 Fragment 场景
    private val parentViewModel: ParentViewModel by parentViewModels()
    
    // 4. 自定义作用域 - 使用 ViewModelProvider
    private val customViewModel: CustomViewModel by viewModels(
        ownerProducer = { this }, // 或 { requireActivity() }
        factoryProducer = { MyViewModelFactory() }
    )
    
    // 5. 带 SavedStateHandle
    private val stateViewModel: StateViewModel by viewModels {
        StateViewModel.createSavedStateHandle()
    }
}
```

### ViewModel 与 Fragment 生命周期

```kotlin
class MyFragment : Fragment() {
    
    private val viewModel: MyViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // LiveData 自动感知生命周期
        viewModel.data.observe(viewLifecycleOwner) { data ->
            // 只在 Fragment 活跃时更新
            textView.text = data
        }
        
        // StateFlow 配合 lifecycleScope
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.stateFlow.collect { state ->
                    render(state)
                }
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        // ViewModel 不会被销毁，直到 Activity 或 Fragment 作用域结束
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Fragment 作用域的 ViewModel 在此时清除
    }
}
```

### ViewModel 保存状态

```kotlin
// 使用 SavedStateHandle
class MyViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    
    // 从 SavedStateHandle 读取
    private val userId: Long? = savedStateHandle.get("user_id")
    
    // 使用 LiveData 包装
    val userName: LiveData<String> = savedStateHandle.getLiveData("user_name")
    
    // 写入数据
    fun saveData(name: String) {
        savedStateHandle["user_name"] = name
    }
}

// 在 Fragment 中使用
class MyFragment : Fragment() {
    
    private val viewModel: MyViewModel by viewModels {
        MyViewModelFactory(requireArguments()) // 传递 arguments
    }
}
```

### ViewModel 工厂

```kotlin
// 传统方式
class MyViewModelFactory(
    private val repository: DataRepository
) : ViewModelProvider.Factory {
    
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MyViewModel::class.java)) {
            return MyViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

// 使用 by viewModels 委托
class MyFragment : Fragment() {
    
    private val viewModel: MyViewModel by viewModels {
        MyViewModelFactory(repository)
    }
}

// 使用 Koin 等依赖注入
class MyFragment : Fragment() {
    
    private val viewModel: MyViewModel by viewModel() // Koin
}
```

---

## Fragment 内存泄漏

### 常见泄漏场景

#### 1. View 引用泄漏

```kotlin
// ❌ 错误：持有 View 引用导致泄漏
class LeakyFragment : Fragment() {
    
    private lateinit var textView: TextView // 持有 View 引用
    
    override fun onCreateView(...): View? {
        val view = inflater.inflate(R.layout.fragment, container, false)
        textView = view.findViewById(R.id.text_view) // 泄漏！
        return view
    }
    
    // Fragment 销毁后，textView 仍然引用 View
    // View 引用 Context，导致整个 Fragment 无法回收
}

// ✅ 正确：使用 ViewBinding 并在 onDestroyView 清理
class SafeFragment : Fragment() {
    
    private var _binding: FragmentSafeBinding? = null
    private val binding get() = _binding!! // 只在 onCreateView 到 onDestroyView 之间有效
    
    override fun onCreateView(...): View? {
        _binding = FragmentSafeBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null // 清理引用
    }
}
```

#### 2. 异步回调泄漏

```kotlin
// ❌ 错误：异步回调持有 Fragment 引用
class LeakyFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 长时间运行的任务
        CoroutineScope(Dispatchers.IO).launch {
            val data = fetchData()
            
            // Fragment 可能已经销毁
            withContext(Dispatchers.Main) {
                textView.text = data // 可能崩溃或泄漏
            }
        }
    }
}

// ✅ 正确：使用 viewLifecycleOwner.lifecycleScope
class SafeFragment : Fragment() {
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // 自动在 onDestroyView 时取消
        viewLifecycleOwner.lifecycleScope.launch {
            val data = withContext(Dispatchers.IO) {
                fetchData()
            }
            textView.text = data
        }
    }
}
```

#### 3. 静态引用泄漏

```kotlin
// ❌ 错误：静态引用 Context 或 View
class LeakyFragment : Fragment() {
    
    companion object {
        var context: Context? = null // 静态引用 Context
        var view: View? = null // 静态引用 View
    }
    
    override fun onAttach(context: Context) {
        super.onAttach(context)
        Companion.context = context // 泄漏！
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Companion.view = view // 泄漏！
    }
}

// ✅ 正确：使用 requireContext() 和 requireView()
class SafeFragment : Fragment() {
    
    fun doSomething() {
        val context = requireContext() // 安全获取
        val view = requireView() // 安全获取
    }
}
```

#### 4. Listener 泄漏

```kotlin
// ❌ 错误：未移除监听器
class LeakyFragment : Fragment() {
    
    private val listener = object : SomeListener {
        override fun onEvent(data: String) {
            textView.text = data
        }
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        SomeManager.addListener(listener) // 添加监听器
    }
    
    // 忘记移除监听器
}

// ✅ 正确：在适当时机移除监听器
class SafeFragment : Fragment() {
    
    private val listener = object : SomeListener {
        override fun onEvent(data: String) {
            textView.text = data
        }
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        SomeManager.addListener(listener)
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        SomeManager.removeListener(listener) // 移除监听器
    }
}
```

#### 5. Handler 泄漏

```kotlin
// ❌ 错误：Handler 持有 Fragment 引用
class LeakyFragment : Fragment() {
    
    private val handler = Handler(Looper.getMainLooper()) { message ->
        textView.text = message.obj as String // 持有 Fragment 引用
        true
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        handler.postDelayed({
            // Fragment 可能已销毁
        }, 5000)
    }
}

// ✅ 正确：使用 WeakReference 或清理消息
class SafeFragment : Fragment() {
    
    private val handler = Handler(Looper.getMainLooper())
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        handler.postDelayed({
            if (::textView.isInitialized) {
                textView.text = "Hello"
            }
        }, 5000)
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        handler.removeCallbacksAndMessages(null) // 清理消息
    }
}
```

### 内存泄漏检测

```kotlin
// 使用 LeakCanary 检测泄漏
// build.gradle
debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'

// 常见泄漏点检查清单：
// 1. ViewBinding 是否在 onDestroyView 清理
// 2. 协程是否使用 viewLifecycleOwner.lifecycleScope
// 3. 监听器是否在 onDestroyView 移除
// 4. 静态变量是否引用 Context 或 View
// 5. Handler 消息是否清理
// 6. LiveData 观察者是否自动清理
```

---

## 面试考点

### 基础问题

#### Q1: Fragment 的生命周期有哪些回调？

**参考答案：**

Fragment 的生命周期回调包括：

1. **onAttach()** - Fragment 与 Activity 关联
2. **onCreate()** - Fragment 创建，初始化组件
3. **onCreateView()** - 创建 View 层次结构
4. **onViewCreated()** - View 创建完成，初始化 UI
5. **onStart()** - Fragment 可见
6. **onResume()** - Fragment 可交互
7. **onPause()** - Fragment 失去焦点
8. **onStop()** - Fragment 不可见
9. **onDestroyView()** - View 销毁，清理 View 相关资源
10. **onDestroy()** - Fragment 销毁
11. **onDetach()** - Fragment 与 Activity 分离

另外还有 `onSaveInstanceState()` 用于保存状态。

#### Q2: Fragment 与 Activity 的区别？

**参考答案：**

| 特性 | Fragment | Activity |
|------|----------|----------|
| **独立性** | 依赖 Activity | 独立组件 |
| **生命周期** | 受 Activity 影响 | 完整生命周期 |
| **Manifest 注册** | 不需要 | 需要 |
| **UI 灵活性** | 可组合、复用 | 单一窗口 |
| **通信方式** | ViewModel、Interface | Intent、Broadcast |
| **使用场景** | 模块化 UI、多面板 | 独立页面 |

#### Q3: add() 和 replace() 的区别？

**参考答案：**

- **add()**：将 Fragment 添加到容器，不移除现有 Fragment。多个 Fragment 可以共存，后添加的覆盖在先添加的上面。
- **replace()**：先移除容器中所有 Fragment，再添加新 Fragment。容器中只保留一个 Fragment。

```kotlin
// add - 多个 Fragment 共存
transaction.add(R.id.container, FragmentA)
transaction.add(R.id.container, FragmentB) // A 和 B 都在

// replace - 只保留一个
transaction.replace(R.id.container, FragmentA)
transaction.replace(R.id.container, FragmentB) // 只有 B
```

#### Q4: 什么是 Fragment 的回退栈？如何管理？

**参考答案：**

回退栈（BackStack）用于记录 Fragment 事务历史，支持用户通过返回键导航。

```kotlin
// 添加到回退栈
transaction.addToBackStack("tag")

// 获取条目数
val count = fragmentManager.backStackEntryCount

// 弹出
fragmentManager.popBackStack()

// 弹出到指定条目
fragmentManager.popBackStack("tag", 0)

// 监听变化
fragmentManager.addOnBackStackChangedListener { }
```

### 进阶问题

#### Q5: Fragment 内存泄漏的常见原因及解决方案？

**参考答案：**

**常见原因：**

1. **View 引用泄漏**：在 Fragment 中持有 View 的强引用
2. **异步回调泄漏**：协程、回调未正确取消
3. **静态引用**：静态变量引用 Context 或 View
4. **监听器未移除**：注册监听器后未移除

**解决方案：**

```kotlin
// 1. 使用 ViewBinding 并清理
private var _binding: FragmentBinding? = null
private val binding get() = _binding!!

override fun onDestroyView() {
    _binding = null
}

// 2. 使用 viewLifecycleOwner.lifecycleScope
viewLifecycleOwner.lifecycleScope.launch { }

// 3. 避免静态引用，使用 requireContext()
val context = requireContext()

// 4. 在 onDestroyView 移除监听器
override fun onDestroyView() {
    manager.removeListener(listener)
}
```

#### Q6: Fragment 间通信有哪些方式？推荐哪种？

**参考答案：**

**通信方式：**

1. **ViewModel**（推荐）：类型安全、生命周期感知
2. **FragmentResult**（推荐）：官方 API、类型安全
3. **Interface**：传统方式，容易泄漏
4. **Bundle**：简单但类型不安全
5. **直接访问**：紧耦合，不推荐

**推荐方案：**

```kotlin
// 兄弟 Fragment 通信 - 使用 Shared ViewModel
class SharedViewModel : ViewModel() { }

class FragmentA : Fragment() {
    private val viewModel: SharedViewModel by activityViewModels()
}

class FragmentB : Fragment() {
    private val viewModel: SharedViewModel by activityViewModels()
}

// 一次性结果 - 使用 FragmentResult
parentFragmentManager.setFragmentResult("key", bundle)
parentFragmentManager.setFragmentResultListener("key", owner) { }
```

#### Q7: viewLifecycleOwner 和 this 的区别？

**参考答案：**

- **viewLifecycleOwner**：Fragment 视图的生命周期所有者，从 `onViewCreated` 到 `onDestroyView`
- **this（Fragment）**：Fragment 本身的生命周期所有者，从 `onAttach` 到 `onDetach`

```kotlin
// ✅ 正确：UI 相关使用 viewLifecycleOwner
viewModel.uiData.observe(viewLifecycleOwner) { }

// ❌ 错误：可能导致空指针
viewModel.uiData.observe(this) { }
// 当 Fragment 重建但 view 未创建时，会崩溃

// ✅ 正确：非 UI 相关可以使用 this
viewModel.nonUiData.observe(this) { }
```

#### Q8: Fragment 的 retainInstance 属性有什么用？现在如何使用？

**参考答案：**

`retainInstance = true` 用于在配置变化（如屏幕旋转）时保留 Fragment 实例，避免重建。

```kotlin
// 旧方式（已废弃）
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    retainInstance = true // 已废弃
}

// 新方式：使用 ViewModel
class MyViewModel : ViewModel() {
    // ViewModel 在配置变化时自动保留
    val data = MutableLiveData<Data>()
}

class MyFragment : Fragment() {
    private val viewModel: MyViewModel by viewModels()
    // 配置变化后，ViewModel 和数据都保留
}
```

---

## 最佳实践与常见错误

### 最佳实践

#### 1. 使用 ViewBinding 并正确清理

```kotlin
// ✅ 推荐
class MyFragment : Fragment() {
    private var _binding: FragmentMyBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(...): View? {
        _binding = FragmentMyBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

#### 2. 使用 viewLifecycleOwner.lifecycleScope

```kotlin
// ✅ 推荐
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    viewLifecycleOwner.lifecycleScope.launch {
        val data = fetchData()
        textView.text = data
    }
}
```

#### 3. 使用 ViewModel 进行 Fragment 通信

```kotlin
// ✅ 推荐
class SharedViewModel : ViewModel() {
    val selectedId = MutableLiveData<Long>()
}

class ListFragment : Fragment() {
    private val viewModel: SharedViewModel by activityViewModels()
    
    fun onItemSelected(id: Long) {
        viewModel.selectedId.value = id
    }
}

class DetailFragment : Fragment() {
    private val viewModel: SharedViewModel by activityViewModels()
    
    override fun onViewCreated(...) {
        viewModel.selectedId.observe(viewLifecycleOwner) { id ->
            loadDetail(id)
        }
    }
}
```

#### 4. 使用 FragmentResult 处理一次性结果

```kotlin
// ✅ 推荐
// 发送
parentFragmentManager.setFragmentResult("request_key", bundle)

// 接收
parentFragmentManager.setFragmentResultListener("request_key", viewLifecycleOwner) { _, bundle ->
    // 处理结果
}
```

### 常见错误

#### 错误 1：在 onCreate 中访问 View

```kotlin
// ❌ 错误
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    textView.text = "Hello" // View 还未创建
}

// ✅ 正确
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    textView.text = "Hello"
}
```

#### 错误 2：使用错误的 LifecycleOwner

```kotlin
// ❌ 错误
viewModel.data.observe(this) { } // 可能导致空指针

// ✅ 正确
viewModel.data.observe(viewLifecycleOwner) { }
```

#### 错误 3：忘记清理 ViewBinding

```kotlin
// ❌ 错误
class MyFragment : Fragment() {
    private lateinit var binding: FragmentMyBinding
    
    override fun onCreateView(...): View? {
        binding = FragmentMyBinding.inflate(inflater, container, false)
        return binding.root
    }
    // 忘记清理，导致内存泄漏
}

// ✅ 正确
private var _binding: FragmentMyBinding? = null
private val binding get() = _binding!!

override fun onDestroyView() {
    _binding = null
}
```

#### 错误 4：在错误的时机使用 childFragmentManager

```kotlin
// ❌ 错误
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    childFragmentManager.beginTransaction()... // 太早
}

// ✅ 正确
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    childFragmentManager.beginTransaction()...
}
```

---

## 参考资料

### 官方文档
- [Fragment 官方文档](https://developer.android.com/guide/fragments)
- [Fragment 版本说明](https://developer.android.com/jetpack/androidx/releases/fragment)
- [Fragment 生命周期](https://developer.android.com/guide/fragments/lifecycle)

### 源码阅读
- [Fragment 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:fragment/fragment/src/main/java/androidx/fragment/app/Fragment.java)
- [FragmentManager 源码](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:fragment/fragment/src/main/java/androidx/fragment/app/FragmentManager.java)

### 相关文章
- [Android Fragment 完全指南](https://medium.com/androiddevelopers/fragments-not-your-base-class-1bed88d74f4e)
- [Fragment 内存泄漏详解](https://proandroiddev.com/avoid-memory-leaks-in-fragments-5e3b04e6e68d)

---

## 总结

Fragment 是 Android 开发中用于构建模块化 UI 的核心组件。掌握 Fragment 需要理解：

1. **生命周期**：11 个回调的时机和用途
2. **事务管理**：add、replace、remove、hide、show 的使用
3. **FragmentManager**：管理 Fragment 的容器和回退栈
4. **通信方式**：ViewModel、FragmentResult、Interface 等
5. **内存泄漏**：常见泄漏场景和预防措施

Fragment 与 ViewModel、LiveData、Navigation 等组件配合使用，可以构建出结构清晰、易于维护的 Android 应用。
