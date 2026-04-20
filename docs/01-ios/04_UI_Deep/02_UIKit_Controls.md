# 02 - UIKit 控件体系

## 目录

1. [控件体系总览](#1-控件体系总览)
2. [TableView 全栈深度分析](#2-tableview-全栈深度分析)
3. [CollectionView 全栈深度分析](#3-collectionview-全栈深度分析)
4. [ScrollView 原理](#4-scrollview-原理)
5. [事件响应链与触摸处理](#5-事件响应链与触摸处理)
6. [手势识别器详解](#6-手势识别器详解)
7. [键盘管理](#7-键盘管理)
8. [自定义 View 与控件封装](#8-自定义-view-与控件封装)
9. [VC 交互方式](#9-vc-交互方式)
10. [多适配与深色模式](#10-多适配与深色模式)
11. [面试考点汇总](#11-面试考点汇总)

---

## 1. 控件体系总览

### 1.1 UIKit 控件分类

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UIKit 控件体系                                    │
├───────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  基础控件（UIControl 子类）                                           │
│  ├─ UILabel          — 文本显示                                       │
│  ├─ UITextField      — 单行输入                                       │
│  ├─ UITextView       — 多行输入                                       │
│  ├─ UIButton         — 按钮                                           │
│  ├─ UIImageView      — 图片显示                                       │
│  ├─ UISwitch         — 开关                                           │
│  ├─ UISlider         — 滑块                                           │
│  ├─ UISegmentedControl — 分段控制器                                    │
│  └─ UIPickerView     — 选择器                                         │
│                                                                      │
│  容器控件                                                            │
│  ├─ UIScrollView     — 滚动容器                                       │
│  ├─ UITableView      — 列表（基于 UIScrollView）                        │
│  ├─ UICollectionView — 网格列表（基于 UIScrollView）                     │
│  ├─ UIStackView      — 自动布局堆栈                                     │
│  ├─ UISplitViewController — 分割视图（iPad）                           │
│  ├─ UITabBarController — 标签控制器                                     │
│  └─ UINavigationController — 导航控制器                                │
│                                                                      │
│  表单控件                                                            │
│  ├─ UIAlertController  — 弹窗                                           │
│  ├─ UIDatePicker     — 日期选择器                                      │
│  ├─ UIDocumentPicker — 文档选择器                                      │
│  └─ UIActivityViewController — 分享控制器                               │
│                                                                      │
│  状态控件                                                            │
│  ├─ UIActivityIndicatorView — 加载指示器                               │
│  ├─ UIProgressView     — 进度条                                       │
│  └─ UISegmentedControl — 分段显示                                       │
│                                                                      │
│  自定义控件                                                        │
│  └─ 继承 UIView/UIControl 自定义                                       │
│                                                                      │
└───────────────────────────────────────────────────────────────────────┘
```

### 1.2 UI 控件渲染性能对比

| 控件 | GPU 加速 | 离屏风险 | 性能等级 | 适用场景 |
|------|--|--|--|--|
| UILabel | ✅ | 低 | S | 文本展示（最快） |
| UIButton | ✅ | 低 | S | 交互按钮（内部是 label+imageView） |
| UIImageView | ✅ | 低 | S | 图片展示（contentMode 优化） |
| UITextField | ⚠️ | 中 | A | 输入框（有键盘/光标渲染） |
| UITextView | ⚠️ | 中 | A | 富文本（有文本布局开销） |
| UITableView | ✅ | 中 | A+ | 列表（复用机制优化） |
| UICollectionView | ✅ | 中 | A+ | 网格/瀑布流 |
| UIStackView | ❌ | 中 | B | 自动布局容器（不直接渲染） |

---

## 2. TableView 全栈深度分析

### 2.1 UITableView 架构

```
UITableView 架构（基于 UIScrollView）：
┌───────────────────────────────────────────────────┐
│                     UITableView                     │
│                                                     │
│  ┌───────────────┐                                  │
│  │  UIScrollView  │ — 继承关系                       │
│  │               │                                  │
│  │  delegate      │ — UITableViewDelegate          │
│  │  dataSource    │ — UITableViewDataSource       │
│  │  estimatedRowHeight │                           │
│  │  rowHeight     │ — 固定行高                      │
│  │  estimatedSectionHeaderHeight          │
│  │  estimatedSectionFooterHeight          │
│  └───────────────┘                                  │
│                                                     │
│  核心组件：                                           │
│  ├─ UITableViewCell（Cell 复用池）                   │
│  ├─ UITableViewHeaderFooterView（Header/Footer）       │
│  ├─ UITableViewStyle（Plain/Grouped）                │
│  ├─ UITableViewRowAnimation（动画类型）               │
│  └─ UITableViewSeparatorStyle（分割线样式）           │
│                                                     │
│  关键特性：                                           │
│  ├─ Cell 复用机制（最核心优化）                      │
│  ├─ 预估行高（estimatedRowHeight）                   │
│  ├─ 预加载（prefetchDataSource）                    │
│  └─ 批量更新（performBatchUpdates）                  │
└──────────────────────────────────────────────────────┘

Cell 复用池结构：
┌─────────────────────────────┐
│         UITableView            │
│                                │
│  UITableViewCache：              │
│  ├─ dequeueReusableWithIdentifier    │
│  │   ├─ 复用池（最近使用的 Cell）    │
│  │   └─ 容量：10 个 Cell           │
│  └─ indexPathCache：                │
│      缓存 Cell 的 frame 信息           │
└───────────────────────────────┘
```

### 2.2 Cell 复用机制深度分析

```swift
// ✅ 现代 Cell 复用方式（推荐）
func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    // 1. 先尝试从复用池获取
    guard let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath) as? MyTableViewCell else {
        fatalError("无法创建 cell")
    }
    
    // 2. 配置内容
    let item = data[indexPath.row]
    cell.configure(with: item)
    
    return cell
}

// Cell 复用池的工作流程：
/*
┌───────────────────────────────────────┐
│ UITableView 滚动                       │
│                                       │
│ 1. 用户开始滚动                        │
│ 2. 新 Cell 进入可视区域                  │
│ 3. tableView.dequeueReusableCell()     │
│    a. 检查复用池（dequeuePool）         │
│    b. 复用池有 Cell → 直接复用           │
│    c. 复用池无 Cell → 创建新 Cell        │
│ 4. configure(with:) 配置新内容            │
│ 5. 添加到可视区域                        │
│                                       │
│ 6. 旧 Cell 滑出可视区域                   │
│ 7. 自动放入复用池（dequeuePool）         │
│ 8. 复用池满 → 丢弃最旧的 Cell            │
└───────────────────────────────────────┘

Cell 复用池状态：
┌────────────────────────┐
│  复用池（capacity: 10）  │
│                            │
│  [Cell0] ← 最新的          │
│  [Cell1]                  │
│  [Cell2]                  │
│  ...                      │
│  [Cell9] ← 最旧的          │
│                            │
│  当 Cell10 进入时：         │
│  Cell0 滑出 → 丢弃最旧的    │
│  Cell1 → 最旧的             │
└─────────────────────────┘
*/
```

### 2.3 Cell 复用常见坑

```swift
// ❌ 坑 1：Cell 复用导致内容错乱
// 原因：复用的 Cell 可能保留上一次的内容
// 解决：每次 configure 时完整重置所有属性

func configure(with item: Data) {
    // ❌ 错误：只设置变化的部分
    nameLabel.text = item.name
    // imageView.image 可能还是上一次的值！
    
    // ✅ 正确：完整重置
    nameLabel.text = item.name
    nameLabel.isHidden = item.name.isEmpty
    imageView.image = item.image
    imageView.isHidden = item.image == nil
    priceLabel.text = item.price
    priceLabel.textColor = item.isSale ? .red : .black
    badgeLabel.text = item.badge
    badgeLabel.isHidden = item.badge == nil
}

// ❌ 坑 2：异步数据回传到错位的 Cell
@objc func fetchData() {
    fetchDataAPI { [weak self] data in
        guard let self = self else { return }
        // ❌ 错误：使用 indexPath.row 作为 key
        // 如果数据异步回来时 cell 已被复用，内容会错乱
        self.nameLabel.text = data.name
        
        // ✅ 正确：使用唯一标识
        if data.id == self.itemId {
            self.nameLabel.text = data.name
        } else {
            // Cell 已被复用，不更新
        }
    }
}

// ✅ 最佳实践：Cell 内部用闭包持有异步任务
class MyTableViewCell: UITableViewCell {
    private var completionTask: (() -> Void)?
    
    func configure(with data: Data, completion: @escaping () -> Void) {
        // 取消上一次的异步任务
        completionTask?()
        
        // 保存当前引用
        let itemId = data.id
        nameLabel.text = data.name
        
        // 异步请求
        completionTask = {
            fetchDataAPI { apiData in
                if apiData.id == itemId {
                    completion()
                }
            }
        }
    }
}

// ❌ 坑 3：Cell 高度缓存问题
// UITableView 会在首次计算 cell 高度后缓存
// 如果内容动态变化，需要 invalidate 缓存

// ✅ 解决：
tableView.beginUpdates()
tableView.endUpdates()
// 或
tableView.reloadData()
// 或（iOS 11+）
tableView.refreshRow(at: indexPath)
```

### 2.4 性能优化

```swift
// 优化策略对比表：
/*
┌────────────────────────────────┬──────────────┬───────────┐
│     优化策略                  │  效果          │  复杂度    │
├────────────────────────────────┼──────────────┼───────────┤
│ 正确的 Cell 复用              │ ⭐⭐⭐     │ ⭐         │
│ 异步加载图片                   │ ⭐⭐⭐     │ ⭐⭐       │
│ 预估行高 (estimatedRowHeight)  │ ⭐⭐⭐     │ ⭐         │
│ 减少约束数量 (5-8个)           │ ⭐⭐⭐     │ ⭐         │
│ 预加载 (prefetchDataSource)    │ ⭐⭐       │ ⭐⭐       │
│ 减少 draw(_:) 调用             │ ⭐⭐       │ ⭐⭐       │
│ 合并图片为一张 Sprite Sheet     │ ⭐⭐       │ ⭐⭐⭐     │
│ 使用 Content Size Category      │ ⭐       │ ⭐         │
└────────────────────────────────┴──────────────┴───────────┘
*/

// 1. 异步图片加载 + 缓存（最优方案）
class ImageLoader {
    static let shared = ImageLoader()
    private var cache = NSCache<NSString, UIImage>()
    
    func loadImage(url: URL, completion: @escaping (UIImage?) -> Void) {
        // 内存缓存
        if let cached = cache.object(forKey: url.absoluteString as NSString) {
            completion(cached)
            return
        }
        
        // 磁盘缓存
        let diskKey = url.absoluteString
        DispatchQueue.global().async {
            if let cached = DiskCache.shared.getImage(forKey: diskKey) {
                DispatchQueue.main.async {
                    self.cache.setObject(cached, forKey: url.absoluteString as NSString)
                    completion(cached)
                }
            }
        }
        
        // 网络请求
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let data = data, let image = UIImage(data: data) else {
                DispatchQueue.main.async { completion(nil) }
                return
            }
            // 写入缓存
            self.cache.setObject(image, forKey: url.absoluteString as NSString)
            DiskCache.shared.save(image, forKey: diskKey)
            DispatchQueue.main.async { completion(image) }
        }.resume()
    }
}

// 2. 预估行高
tableView.estimatedRowHeight = 80
tableView.rowHeight = UITableView.automaticDimension

// 3. 预加载
tableView.prefetchDataSource = self

// 4. 减少内容更新
// ❌ 频繁更新导致重绘
for cell in cells {
    cell.label.text = newValue  // 每次都会触发 layoutSubviews
}

// ✅ 批量更新
tableView.performBatchUpdates({
    for cell in cells {
        cell.label.text = newValue
    }
}) { finished in
    // 更新完成回调
}

// 5. 使用 UITableViewCellAccessoryView 而非自定义 subview
// UITableViewCell 的 accessoryView 在 Cell 复用时自动处理
```

### 2.5 TableView 高级特性

```swift
// 分组 Header 粘顶效果（iOS 11+）
func tableView(_ tableView: UITableView, 
               viewForHeaderInSection section: Int) -> UIView? {
    let header = UITableViewHeaderFooterView()
    header.textLabel?.text = "Section \(section)"
    header.contentView.backgroundColor = UIColor.systemGray6
    return header
}

// sticky header（iOS 11+）
func tableView(_ tableView: UITableView, 
               targetIndexPathForOffsetBeforePosition position: UITableViewScrollPosition) -> IndexPath? {
    return nil // 默认行为
}

// 无限滚动
func scrollViewDidScroll(_ scrollView: UIScrollView) {
    let threshold: CGFloat = 100 // 距离底部多少时触发
    if scrollView.contentOffset.y + scrollView.frame.size.height >= scrollView.contentSize.height - threshold {
        loadMoreData()
    }
}

// 批量更新动画
tableView.performBatchUpdates({
    // 插入
    tableView.insertRows(at: [indexPath], with: .fade)
    // 删除
    tableView.deleteRows(at: [indexPath], with: .left)
    // 移动
    tableView.moveRow(at: from, to: to)
    // 刷新
    tableView.reloadRows(at: [indexPath], with: .automatic)
}) { finished in
    // 完成回调
}
```

---

## 3. CollectionView 全栈深度分析

### 3.1 UICollectionView 架构

```
UICollectionView 核心组件：
┌─────────────────────────────────────────────────┐
│               UICollectionView                   │
│                                                  │
│  核心类：                                          │
│  ├─ UICollectionViewLayout（布局策略）             │
│  │   ├─ UICollectionViewFlowLayout（流式布局）    │
│  │   ├─ Custom Layout（自定义布局）              │
│  │   └─ Compositional Layout（组合布局 iOS13+）  │
│  ├─ UICollectionViewCell（Cell 类）              │
│  ├─ UICollectionViewSupplementaryView（Header）    │
│  ├─ UICollectionViewDecorationView（装饰元素）     │
│  └─ UICollectionViewDiffableDataSource（数据源）  │
│                                                  │
│  与 TableView 对比：                               │
│  ┌───────────────────────────────┬─────────────┐   │
│  │     特性                       │  TableView  │   │
│  ├────────────────────────────────┼─────────────┤   │
│  │ 布局                          │  固定表格      │   │
│  │ 网格/瀑布流                    │  ❌           │   │
│  │ 自定义布局                     │  困难         │   │
│  │ 头部/尾部                      │  支持         │   │
│  │ 动画效果                       │  简单         │   │
│  │ 数据源类型                     │  UITableViewDiffableDataSource │   │
│  │ 性能（大数据量）                │  略优         │   │
│  └────────────────────────────────┴─────────────┘   │
└─────────────────────────────────────────────────┘
```

### 3.2 Compositional Layout（现代推荐）

```swift
// iOS 13+ 推荐的布局方式：NSCollectionLayoutLayout
// 声明式、组合式、高度灵活

func createCompositionalLayout() -> UICollectionViewLayout {
    // 1. 定义布局项（Item）
    let itemSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(1.0),
        heightDimension: .fractionalHeight(1.0)
    )
    let item = NSCollectionLayoutItem(layoutSize: itemSize)
    
    // 2. 定义组（Group）
    let groupSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(1.0),
        heightDimension: .estimated(44)
    )
    let group = NSCollectionLayoutGroup.horizontal(
        layoutSize: groupSize,
        subitems: [item]
    )
    
    // 3. 定义区段（Section）
    let section = NSCollectionLayoutSection(group: group)
    section.interItemSpacing = .fixed(8)
    section.contentInsets = NSDirectionalEdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 8)
    
    // 4. 创建布局
    let layout = UICollectionViewLayout(section: section)
    return layout
}

// 更复杂的布局（网格）：
func createGridLayout() -> UICollectionViewLayout {
    // 列宽
    let itemSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(0.5),
        heightDimension: .fractionalWidth(0.5)
    )
    let item = NSCollectionLayoutItem(layoutSize: itemSize)
    
    // 组（2 列网格）
    let groupSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(1.0),
        heightDimension: .estimated(200)
    )
    let group = NSCollectionLayoutGroup.horizontal(
        layoutSize: groupSize,
        subitem: item,
        count: 2
    )
    group.interItemSpacing = .fixed(8)
    
    // 区段
    let section = NSCollectionLayoutSection(group: group)
    section.interGroupSpacing = 8
    
    return UICollectionViewLayout(section: section)
}
```

### 3.3 DiffableDataSource（iOS 13+ 推荐数据源）

```swift
// DiffableDataSource 是现代 CollectionView/TableView 的推荐数据源
// 核心：用快照（Snapshot）管理数据

// 定义数据类型
typename ItemID = String
type sectionIdentifier = String
typeitemIdentifier = ItemID

// 创建数据源
var dataSource: UICollectionViewDiffableDataSource<Section, ItemID>!

override func viewDidLoad() {
    super.viewDidLoad()
    
    dataSource = UICollectionViewDiffableDataSource<Section, ItemID>(
        collectionView: collectionView) { collectionView, indexPath, itemIdentifier in
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "Cell", for: indexPath)
        // 配置 cell
        return cell
    }
}

// 更新数据（通过快照）
func updateData(_ items: [Item]) {
    var snapshot = NSDiffableDataSourceSnapshot<Section, ItemID>()
    
    // 添加区段
    snapshot.appendSections([.main])
    
    // 添加项
    snapshot.appendItems(items.map { $0.id }, toSection: .main)
    
    // 应用快照（自动计算差异并更新 UI）
    dataSource.apply(snapshot, animatingDifferences: true)
}

// DiffableDataSource 的优势：
// • 数据驱动，无需手动调用 reload/delegate
// • 自动计算差异（Diff算法）
// • 自动处理删除/插入/更新动画
// • 线程安全（可在后台线程构建快照）
// • 支持折叠/展开/搜索等复杂场景
```

---

## 4. ScrollView 原理

### 4.1 UIScrollView 核心机制

```swift
/*
UIScrollView 内部结构：
┌───────────────────────────────────────┐
│            UIScrollView                  │
│                                          │
│  核心属性：                               │
│  ├─ contentSize          内容区域大小      │
│  ├─ contentOffset        滚动偏移量        │
│  ├─ contentInset         内容边距          │
│  ├─ bounces              是否回弹          │
│  ├─ alwaysBounceVertical 总是垂直回弹       │
│  ├─ alwaysBounceHorizontal 总是水平回弹     │
│  ├─ scrollEnabled        是否允许滚动        │
│  ├─ decelerationRate     减速速率            │
│  ├─ showsVerticalScrollIndicator 指示器      │
│  └─ pagingEnabled       分页模式             │
│                                          │
│  滚动原理：                                │
│  1. 用户手指在屏幕上滑动                      │
│  2. 触发 UITouch → UIResponder             │
│  3. UIScrollView 接收 touch 事件             │
│  4. 计算位移量，修改 contentOffset          │
│  5. contentOffset 变化 → 子视图位置变化     │
│  6. UIScrollView 的子视图跟着 contentOffset 移动 │
│  7. 松开手指 → 根据速度计算减速动画           │
│                                          │
│  关键理解：                                │
│  UIScrollView 的子视图是"固定"的             │
│  实际滚动的是 UIScrollView 的 content        │
│  子视图相对于 content 的位置不变              │
│  改变的是 content 相对于屏幕的偏移            │
└───────────────────────────────────────┘
*/

// UIScrollViewDelegate 方法
func scrollViewDidScroll(_ scrollView: UIScrollView) {
    // 滚动过程中持续调用
}

func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
    // 开始拖拽
}

func scrollViewWillBeginDecelerating(_ scrollView: UIScrollView) {
    // 开始减速
}

func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
    // 结束拖拽
}

func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
    // 减速结束（滚动停止）
}
```

### 4.2 UIScrollView 与 TableView/CollectionView 的关系

```
┌─────────────────────────────────────────────────────┐
│              继承关系                                 │
│                                                      │
│  UIScrollView                                        │
│  ┌──────────────┐ ┌───────────────┐                  │
│  │ UITableView   │ │ UICollectionView │                │
│  │              │ │               │                  │
│  │ • Cell 复用    │ • Layout 系统     │                  │
│  │ • 固定行高     │ • 动态布局        │                  │
│  │ • 简单高效     │ • 复杂布局        │                  │
│  └──────────────┘ └───────────────┘                  │
│                                                      │
│  共同点：                                              │
│  • 都继承 UIScrollView                                │
│  • 都用 contentOffset 控制滚动                       │
│  • 都使用 decelerationRate 控制减速                   │
│  • 都依赖 UIScrollViewDelegate                       │
│                                                      │
│  关键差异：                                            │
│  • UITableView 的滚动通过修改 contentOffset 实现       │
│  • UITableView 的 Cell 复用是 TableView 内部机制        │
│  • UICollectionView 的布局由 Layout 对象管理            │
└────────────────────────────────────────────────────────┘
```

---

## 5. 事件响应链与触摸处理

### 5.1 事件响应链（Responder Chain）

```
事件响应链（Event Responder Chain）：
┌───────────────────────────────────┐
│           UIWindow                    │
│         ┌───────────────┐             │
│         │   rootVC.view  │             │
│         │   （根视图控制器）  │             │
│         │               │             │
│         │  ┌─────────────┐         │
│         │  │ ViewController │       │
│         │  │    .view      │         │
│         │  │  ┌─────────────┐       │
│         │  │  │   Button     │       │
│         │  │  │   (触摸点)     │       │
│         │  │  └─────────────┘       │
│         │  └───────────────┘         │
│         └───────────────┘             │
│                                       │
│  触摸事件传递流程：                      │
│  1. 触摸点 → UIWindow.hitTest()       │
│  2. 从父视图到子视图递归                 │
│  3. findBestViewForHitTest()           │
│  4. 返回最深层的可触摸视图               │
│                                       │
│  UIResponder 方法链：                   │
│  • touchesBegan()  → 触摸开始            │
│  • touchesMoved()  → 触摸移动            │
│  • touchesEnded()  → 触摸结束            │
│  • touchesCancelled() → 触摸取消        │
│                                       │
│  hitTest 原理：                         │
│  1. 检查 pointInside() → 触摸点是否在视图内  │
│  2. 如果不在 → 返回 nil                 │
│  3. 如果在 → 递归调用 subviews.hitTest() │
│  4. 如果 subviews 都返回 nil → 返回自身   │
│  5. 如果某个 subview 返回非 nil → 返回该视图 │
└─────────────────────────────────────┘
```

### 5.2 hitTest 与触摸穿透

```swift
// 控制触摸传递：

// 1. 禁用用户交互
view.isUserInteractionEnabled = false  // 触摸穿透到下层

// 2. hitTest 重写
class TransparentOverlayView: UIView {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        // 检查触摸点是否在某个可交互的子视图上
        for subview in subviews.reversed() {
            let subPoint = subview.convert(point, from: self)
            if subview.point(inside: subPoint, with: event) {
                return subview.hitTest(subPoint, with: event)
            }
        }
        return nil  // 穿透到下层
    }
}

// 3. pointInside 重写
class CustomView: UIView {
    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        // 扩大可触摸区域
        let padding: CGFloat = 20
        let bounds = self.bounds.insetBy(dx: -padding, dy: -padding)
        return bounds.contains(point)
    }
}
```

---

## 6. 手势识别器详解

```swift
/*
UIGestureRecognizer 体系：
┌─────────────────────────────────────┐
│              UIGestureRecognizer      │
│              ├─ UITapGestureRecognizer  (单击) │
│              ├─ UIPinchGestureRecognizer   (捏合)│
│              ├─ UIPanGestureRecognizer   (拖拽)  │
│              ├─ UISwipeGestureRecognizer (滑动)  │
│              ├─ UIRotationGestureRecognizer (旋转)│
│              ├─ UILongPressGestureRecognizer (长按)│
│              └─ UIScreenEdgePanGestureRecognizer(边缘滑动)│
│                                          │
│  状态机：                               │
│  • .possible（可能触发）                │
│  • .began（开始触发）                   │
│  • .changed（状态改变）                 │
│  • .ended（触发结束）                   │
│  • .cancelled（被取消）                 │
│  • .failed（失败）                      │
└────────────────────────────────────────┘
*/

// 手势识别器关系（UIGestureRecognizerDelegate）：
/*
┌─────────────────────────────────────────────┐
│  UIGestureRecognizerDelegate 方法            │
│                                              │
│  • canPreventGestureRecognizer       │
│    阻止另一个手势识别器触发                  │
│                                              │
│  • canBePreventedByGestureRecognizer    │
│    被另一个手势识别器阻止                      │
│                                              │
│  • shouldRequireFailureToBegin()     │
│    必须先等待另一个手势失败                     │
│                                              │
│  • shouldBeRequiredToFailBy()        │
│    必须等待另一个手势失败才能触发              │
│                                              │
│  应用：                                        │
│  • tableView 的 pan 手势 vs 自定义 pan 手势   │
│  • swipe 手势 vs pinch 手势                   │
│  • longPress vs tap（长按和单击冲突）          │
└──────────────────────────────────────────────┘
*/

// 实战：手势与 TableView 的冲突解决
func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer,
                       shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    // 允许自定义 pan 手势与 TableView 的 pan 手势同时识别
    if gestureRecognizer is CustomPanGestureRecognizer,
       otherGestureRecognizer is UITableViewPanGestureRecognizer {
        return true
    }
    return false
}
```

---

## 7. 键盘管理

```swift
/*
键盘通知机制：
┌────────────────────────────────────────┐
│  UITextField/UITextView 成为第一响应者    │
│  ↓                                       │
│  UIApplication.sendAction()               │
│  ↓                                       │
│  UIResponderResponderChain                │
│  ↓                                       │
│  发送通知：                                │
│  • UIResponder.keyboardWillShowNotification  │
│  • UIResponder.keyboardDidShowNotification   │
│  • UIResponder.keyboardWillHideNotification │
│  • UIResponder.keyboardDidHideNotification │
│  • UIResponder.keyboardWillChangeFrameNotification│
│  ↓                                       │
│  通知包含 userInfo：                        │
│  • UIResponder.keyboardFrameEndUserInfoKey    │
│  • UIResponder.keyboardAnimationDurationUserInfoKey│
│  • UIResponder.keyboardAnimationCurveUserInfoKey  │
└───────────────────────────────────────┘
*/

// 键盘管理最佳实践：

// 1. 监听键盘通知
override func viewDidLoad() {
    super.viewDidLoad()
    NotificationCenter.default.addObserver(
        self,
        selector: #selector(keyboardWillShow(_:)),
        name: UIResponder.keyboardWillShowNotification,
        object: nil
    )
    NotificationCenter.default.addObserver(
        self,
        selector: #selector(keyboardWillHide(_:)),
        name: UIResponder.keyboardWillHideNotification,
        object: nil
    )
}

// 2. 自动调整 ScrollView 高度
func adjustScrollViewForKeyboard(_ frameEnd: CGRect, duration: TimeInterval, curve: UIView.AnimationCurve) {
    let keyboardHeight = frameEnd.height
    scrollView.contentInset.bottom = keyboardHeight
    scrollView.scrollIndicatorInsets.bottom = keyboardHeight
    
    // 将当前编辑的 textfield 滚动到可视区域
    UIView.animate(withDuration: duration, delay: 0, options: [.curveEaseInOut]) {
        self.scrollView.setContentOffset(CGPoint(x: 0, y: self.currentTextField.frame.origin.y - keyboardHeight), animated: false)
    }
}

// 3. 使用 UIScrollViewKeyboardDismissMode（最简单）
scrollView.keyboardDismissMode = .onDrag  // 下拉即关闭键盘
scrollView.keyboardDismissMode = .interactive  // 跟随手指移动
scrollView.keyboardDismissMode = .none  // 不自动关闭

// 4. 使用 UITextFieldDelegate 的 shouldChangeTextIn
func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
    // 实时计算 TextField 高度并调整布局
    let newLength = textField.text!.count + string.count - range.length
    if newLength > maxLength {
        textField.text = String(textField.text!.prefix(maxLength))
        return false
    }
    return true
}
```

---

## 8. 自定义 View 与控件封装

```swift
/*
自定义 View 的架构：
┌──────────────────────────────────────────────┐
│                  CustomView                    │
│                                                  │
│  职责分离：                                       │
│  ├─ 布局（Layout）   → 设置 frame/约束           │
│  ├─ 内容（Content）  → 数据绑定                   │
│  ├─ 交互（Interaction）→ 手势/点击处理            │
│  ├─ 动画（Animation）→ 状态动画                   │
│  └─ 状态（State）   → isHighlighted/isSelected   │
│                                                  │
│  封装原则：                                       │
│  • 自包含：不依赖外部视图控制器                    │
│  • 可复用：支持 XIB/Storyboard/代码三种创建方式    │
│  • 可配置：提供公开属性/方法                       │
│  • 可扩展：使用协议/闭包暴露回调                   │
└───────────────────────────────────────────────┘
*/

// 自定义控件封装示例（搜索框）：
@IBDesignable
class SearchBarView: UIView {
    
    // 公开配置属性
    @IBInspectable var placeholder: String = "搜索" {
        didSet { searchTextField.placeholder = placeholder }
    }
    
    @IBInspectable var isShowCancelButton: Bool = false {
        didSet { cancelButton.isHidden = !isShowCancelButton }
    }
    
    @IBInspectable var tintColor: UIColor = .systemBlue {
        didSet {
            searchTextField.tintColor = tintColor
            cancelButton.tintColor = tintColor
        }
    }
    
    // 回调闭包
    var onSearch: ((String) -> Void)?
    var onCancel: (() -> Void)?
    
    // 内部组件
    private let searchTextField = UITextField()
    private let cancelButton = UIButton()
    private let containerView = UIView()
    
    // 创建方式 1：代码
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
    }
    
    // 创建方式 2：Storyboard
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupUI()
    }
    
    // 创建方式 3：XIB
    override func awakeFromNib() {
        super.awakeFromNib()
        setupUI()
    }
    
    private func setupUI() {
        addSubview(containerView)
        containerView.addSubview(searchTextField)
        containerView.addSubview(cancelButton)
        
        // 布局（AutoLayout）
        containerView.snp.makeConstraints { make in
            make.edges.equalToSuperview()
            make.height.equalTo(44)
        }
        
        searchTextField.snp.makeConstraints { make in
            make.leading.equalTo(12)
            make.centerY.equalToSuperview()
            make.trailing.equalTo(cancelButton.snp.leading).offset(-8)
            make.height.equalTo(30)
        }
        
        cancelButton.snp.makeConstraints { make in
            make.trailing.equalTo(-12)
            make.centerY.equalToSuperview()
            make.width.equalTo(44)
        }
        
        // 设置
        searchTextField.placeholder = placeholder
        cancelButton.setTitle("取消", for: .normal)
        cancelButton.isHidden = !isShowCancelButton
        
        // 事件
        searchTextField.delegate = self
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
    }
    
    @objc private func cancelTapped() {
        searchTextField.resignFirstResponder()
        onCancel?()
    }
}

extension SearchBarView: UITextFieldDelegate {
    func textFieldDidChangeSelection(_ textField: UITextField) {
        onSearch?(textField.text ?? "")
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        onSearch?(textField.text ?? "")
        return true
    }
}
```

---

## 9. VC 交互方式

```swift
/*
VC 交互方式对比：
┌────────┬─────────────────────────┬───────────────┬─────────────┐
│ 方式     │  优点                   │  缺点           │  适用场景       │
├────────┼─────────────────────────┼───────────────┼─────────────┤
│ delegate│ 类型安全/编译时检查      │ 强耦合/单向    │ 简单数据回传    │
│ 闭包回调│ 灵活/无需额外文件       │ 循环引用风险    │ 异步回调       │
│ segue   │ Storyboard 可视化       │ 不灵活/类型安全│ 简单导航       │
│ 通知中心│ 解耦/一对多             │ 类型不安全     │ 全局事件       │
│ 单例    │ 全局共享                │ 难以测试       │ 配置/状态      │
│ Coordinator│ 导航解耦/可测试      │ 复杂度增加      │ 复杂导航       │
└────────┴─────────────────────────┴───────────────┴───────────────┘
*/

// 1. Delegate（类型安全）
protocol ProfileDelegate: AnyObject {
    func profileDidUpdate(_ profile: Profile)
    func profileDidCancel()
}

class ProfileVC: UIViewController {
    weak var delegate: ProfileDelegate?
    
    @objc func saveTapped() {
        delegate?.profileDidUpdate(profile)
    }
}

// 2. Closure（灵活）
class ProfileVC: UIViewController {
    var onSave: ((Profile) -> Void)?
    var onCancel: (() -> Void)?
}

// 3. Coordinator（解耦）
protocol ProfileCoordinatorDelegate: AnyObject {
    func coordinator(_ coordinator: ProfileCoordinator, didFinishWith profile: Profile)
}

class ProfileCoordinator {
    weak var delegate: ProfileCoordinatorDelegate?
    
    func presentProfileVC() {
        let vc = ProfileVC()
        vc.onSave = { [weak self] profile in
            self?.delegate?.coordinator(self!, didFinishWith: profile)
        }
        navigationController?.present(vc, animated: true)
    }
}
```

---

## 10. 多适配与深色模式

```swift
/*
iOS 屏幕适配方案对比：
┌────────┬───────────────────────────────────┬─────────────────┐
│ 方案     │ 原理                              │  适用场景       │
├────────┼───────────────────────────────────┼─────────────────┤
│ AutoLayout│ 约束求解                          │ 自适应（推荐）  │
│ SizeClasses│ 不同尺寸类别的布局                 │ iPad/iPhone   │
│ SafeArea │ 安全区域                          │ 刘海屏/动态岛   │
│ UIStackView│ 自动堆叠                          │ 简单自适应       │
│ UIScreen.main.bounds  │ 硬编码屏幕尺寸           │ ❌ 不推荐        │
└────────┴───────────────────────────────────┴─────────────────┘
*/

// SafeArea 使用：
view.safeAreaLayoutGuide.topAnchor  // 顶部安全区
view.safeAreaLayoutGuide.leadingAnchor  // 左侧安全区
view.safeAreaLayoutGuide.trailingAnchor  // 右侧安全区
view.safeAreaLayoutGuide.bottomAnchor  // 底部安全区

// 深色模式：
@objc var isDarkMode: Bool {
    return traitCollection.userInterfaceStyle == .dark
}

// 使用 traitCollection 适配：
override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)
    
    // 检测深色模式变化
    if traitCollection.userInterfaceStyle != previousTraitCollection?.userInterfaceStyle {
        updateAppearance()
    }
    
    // 检测粗体字体变化
    if traitCollection.preferredContentSizeCategory != previousTraitCollection?.preferredContentSizeCategory {
        updateFontSize()
    }
}

// 使用 UIColor.dynamic（自动适配深色模式）
let textColor = UIColor { traitCollection in
    switch traitCollection.userInterfaceStyle {
    case .dark:
        return .white
    case .light:
        return .black
    case .unspecified:
        return .systemLabel
    @default:
        return .systemLabel
    }
}
```

---

## 11. 面试题汇总

### 高频面试题

**Q1: TableView Cell 复用机制的原理？有哪些坑？**

**答**：
- **原理**：UITableView 维护一个复用池（dequeuePool），容量约 10 个 Cell。当新 Cell 进入可视区域时，优先从池中复用，复用池为空则创建新 Cell。滑出可视区域的 Cell 自动放入复用池。
- **坑**：异步回传导致内容错位、Cell 内容未完整重置、频繁计算行高、未使用预估行高。

**Q2: UICollectionView 的 Layout 系统工作原理？**

**答**：
- Layout 对象负责计算每个 Cell/SupplementaryView/DecorationView 的位置和尺寸
- UICollectionViewFlowLayout：流式布局（行/列/间距）
- CompositionalLayout（iOS13+）：声明式组合布局，更灵活
- 自定义 Layout：通过重写 UICollectionViewLayout 的方法实现

**Q3: 事件响应链（Responder Chain）的工作流程？**

**答**：
1. 触摸事件进入 UIWindow
2. 调用 hitTest(point, event) 查找目标视图
3. hitTest 递归调用 pointInside 和 subviews.hitTest
4. 返回最深层的可触摸视图
5. 该视图接收 touchesBegan/Moved/Ended
6. 如果返回 nil，事件沿父视图链向上冒泡
7. 最终到达 ViewController

**Q4: hitTest 的底层原理？**

**答**：
1. 检查 pointInside：触摸点是否在视图内
2. 不在 → 返回 nil（穿透）
3. 在 → 递归调用 subviews.hitTest
4. 所有子视图返回 nil → 返回自身
5. 子视图有返回值 → 返回该视图（最深层优先）
6. isHidden/userInteractionEnabled/alpha < 0.01 的视图不参与 hitTest

**Q5: UIScrollView 的滚动原理？**

**答**：
- UIScrollView 的子视图是"固定"的
- 实际滚动的是 UIScrollView 的 contentOffset
- 改变的是 content 相对于屏幕的偏移
- 滚动通过触摸事件 → contentOffset 修改 → 子视图位置更新
- 松开手指后根据 decelerationRate 计算减速动画

**Q6: 深色模式适配方案？**

**答**：
1. 使用 UIColor.dynamic 自动适配
2. 监听 traitCollectionDidChange
3. 使用 Color Set（Assets Catalog）
4. 避免硬编码颜色值
5. 测试所有 UI 组件在深色/浅色模式下的显示

---

## 12. 参考资源

- [Apple: UITableView Class Reference](https://developer.apple.com/documentation/uikit/uitableview)
- [Apple: UICollectionView Class Reference](https://developer.apple.com/documentation/uikit/uicollectionview)
- [Apple: UIGestureRecognizer Class Reference](https://developer.apple.com/documentation/uikit/uigestureRecognizer)
- [Apple: UIResponder Class Reference](https://developer.apple.com/documentation/uikit/uiresponder)
- [NSHipster: UIScrollView](https://nshipster.com/uiscrollview)
- [WWDC 2018: Advanced UICollectionView Techniques](https://developer.apple.com/videos/play/wwdc2018/222)
- [WWDC 2019: What's New in UIKit](https://developer.apple.com/videos/play/wwdc2019/219)
