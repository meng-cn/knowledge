# 01 - iOS 地图与位置服务全栈

## 目录

1. [Core Location 架构](#1-core-location-架构)
2. [CLLocationManager 核心 API](#2-cllocationmanager-核心-api)
3. [地理编码与反地理编码](#3-地理编码与反地理编码)
4. [MapKit 地图框架](#4-mapkit-地图框架)
5. [地图标记与覆盖物](#5-地图标记与覆盖物)
6. [地理围栏与区域监测](#6-地理围栏与区域监测)
7. [导航与路线](#7-导航与路线)
8. [地图性能优化](#8-地图性能优化)
9. [位置与地图 Android 对比](#9-位置与地图-android-对比)
10. [面试考点汇总](#10-面试考点汇总)

---

## 1. Core Location 架构

### 1.1 Core Location 框架结构

```
Core Location 框架：

┌──────────────────────────────────────────┐
│              Core Location               │
├────────────────┬────────────────────────┤
│  CLLocationMan  │  CLLocation            │
│  (定位管理器)   │  (位置数据)             │
├────────────────┼────────────────────────┤
│  CLBeaconRegion │  CLGeocoder            │
│  (信标区域)    │  (地理编码)             │
├────────────────┼────────────────────────┤
│  CLRegion      │  CLVisit               │
│  (区域类)      │  (访问历史)             │
└────────────────┴────────────────────────┘
```

### 1.2 位置精度

```
位置精度层级：

┌──────────────────────┬──────────────────────┐
│ 精度级别              │  误差范围           │
├──────────────────────┼──────────────────────┤
│ kCLLocationAccuracyBest │  ~3m (GPS)        │
│ kCLLocationAccuracyNear │  ~10m (Wi-Fi)     │
│ kCLLocationAccuracyHundredMeters │ ~100m    │
│ kCLLocationAccuracyKilometer │ ~1000m      │
│ kCLLocationAccuracyThreeKilometers │ ~3km   │
│ kCLLocationAccuracyBestForNavigation │ GPS + 惯性  │
└──────────────────────┴──────────────────────┘
```

---

## 2. CLLocationManager 核心 API

### 2.1 基本定位

```swift
class LocationManager: NSObject, CLLocationManagerDelegate {
    
    private let locationManager = CLLocationManager()
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 10  // 每移动 10 米更新
    }
    
    func requestAlwaysAuthorization() {
        locationManager.requestAlwaysAuthorization()
    }
    
    func requestWhenInUseAuthorization() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startUpdatingLocation() {
        locationManager.startUpdatingLocation()
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManager(_ manager: CLLocationManager,
                         didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        print("位置: \(location.coordinate.latitude), \(location.coordinate.longitude)")
        print("海拔: \(location.altitude) m")
        print("精度: \(location.horizontalAccuracy) m")
        print("速度: \(location.speed) m/s")
        print("航向: \(location.course}°")
    }
    
    func locationManager(_ manager: CLLocationManager,
                         didFailWithError error: Error) {
        print("定位失败: \(error.localizedDescription)")
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            manager.startUpdatingLocation()
        case .denied, .restricted:
            print("用户拒绝定位权限")
        case .notDetermined:
            requestWhenInUseAuthorization()
        @unknown default:
            break
        }
    }
}
```

### 2.2 权限类型

| 权限类型 | Info.plist 键 | 行为 |
|---|---|---|
| Always | NSLocationAlwaysAndWhenInUseUsageDescription | 前台+后台 |
| When In Use | NSLocationWhenInUseUsageDescription | 仅前台 |
| Always (旧) | NSLocationAlwaysUsageDescription | 已弃用 |

### 2.3 停止定位

```swift
// 停止更新以节省电量
locationManager.stopUpdatingLocation()

// 按距离触发更新
locationManager.startMonitoringSignificantLocationChanges()
// 显著位置变化（基站切换），后台也能触发

// 按时间触发更新
locationManager.startUpdatingLocation()
locationManager.pausesLocationUpdatesAutomatically = true
```

---

## 3. 地理编码与反地理编码

### 3.1 坐标 → 地址（反地理编码）

```swift
let geocoder = CLGeocoder()

geocoder.reverseGeocodeLocation(clLocation) { placemarks, error in
    guard let placemark = placemarks?.first else { return }
    
    // 地址组成部分
    print("街道: \(placemark.thoroughfare)")
    print("城市: \(placemark.locality)")
    print("省: \(placemark.administrativeArea)")
    print("国家: \(placemark.country)")
    print("邮编: \(placemark.postalCode)")
    print("时区: \(placemark.timeZone?.identifier)")
}

// CLPlacemark 属性：
// thoroughfare - 街道
// subThoroughfare - 门牌号
// locality - 城市
// administrativeArea - 省/州
// country - 国家
// postalCode - 邮编
// timezone - 时区
// timeZone - 时区对象
```

### 3.2 地址 → 坐标（地理编码）

```swift
geocoder.geocodeAddressString("北京市海淀区中关村大街1号") { placemarks, error in
    guard let placemark = placemarks?.first else { return }
    print("坐标: \(placemark.location?.coordinate)")
}
```

---

## 4. MapKit 地图框架

### 4.1 MKMapView 基础

```swift
import MapKit

class MapViewController: UIViewController {
    
    @IBOutlet weak var mapView: MKMapView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        mapView.delegate = self
        mapView.mapType = .standard  // .standard/.satellite/.hybrid/.mutedStandard
        mapView.isZoomEnabled = true
        mapView.isScrollEnabled = true
        mapView.showsUserLocation = true
    }
}

// MARK: - MKMapViewDelegate

extension MapViewController: MKMapViewDelegate {
    func mapView(_ mapView: MKMapView,
                 regionDidChangeAnimated animated: Bool) {
        // 地图区域变化
        let center = mapView.centerCoordinate
        print("中心: \(center.latitude), \(center.longitude)")
    }
    
    func mapView(_ mapView: MKMapView,
                 didUpdate userLocation: MKUserLocation) {
        // 用户位置更新
        let loc = userLocation.location?.coordinate
    }
}
```

### 4.2 地图类型

| 类型 | MKMapType | 说明 |
|---|---|---|
| 标准 | .standard | 道路地图 |
| 卫星 | .satellite | 卫星图像 |
| 混合 | .hybrid | 卫星+道路叠加 |
| 暗色标准 | .mutedStandard | 低饱和度暗色地图 |
| 地形 | .terrain | 地形图 |
| 卫星地形 | .satelliteFlyover | 3D 卫星 |
| 混合地形 | .hybridFlyover | 3D 混合 |

### 4.3 地图区域控制

```swift
// 设置显示区域
let region = MKCoordinateRegion(
    center: CLLocationCoordinate2D(latitude: 39.9042, longitude: 116.4074),
    span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
)
mapView.setRegion(region, animated: true)

// 显示特定区域（带边距）
let visibleRect = mapView.visibleMapRect
let insets = UIEdgeInsets(top: 50, left: 50, bottom: 50, right: 50)
mapView.setVisibleMapRect(visibleRect, edgePadding: insets, animated: true)

// 从坐标到屏幕位置
let point = mapView.convert(coordinate, toPointTo: mapView)

// 从屏幕位置到坐标
let coordinate = mapView.convert(point, toCoordinateFrom: mapView)
```

---

## 5. 地图标记与覆盖物

### 5.1 MKAnnotation

```swift
// 自定义标注
struct PlaceAnnotation: MKAnnotation {
    let coordinate: CLLocationCoordinate2D
    let title: String?
    let subtitle: String?
    let identifier: String
}

// 添加标注
let annotation = PlaceAnnotation(
    coordinate: CLLocationCoordinate2D(latitude: 39.9, longitude: 116.4),
    title: "北京",
    subtitle: "首都",
    identifier: "beijing"
)
mapView.addAnnotation(annotation)

// 批量添加
mapView.addAnnotations(annotations)

// 自定义标注视图
func mapView(_ mapView: MKMapView,
             viewFor annotation: MKAnnotation) -> MKAnnotationView? {
    guard !(annotation is MKUserLocation) else { return nil }
    
    let identifier = "placePin"
    var annotationView = mapView.dequeueReusableAnnotationView(
        withIdentifier: identifier
    )
    
    if annotationView == nil {
        annotationView = MKPinAnnotationView(annotation: annotation,
                                             reuseIdentifier: identifier)
        (annotationView as? MKPinAnnotationView)?.pinTintColor = .red
        (annotationView as? MKPinAnnotationView)?.animatesDrop = true
        annotationView?.isDraggable = true
    } else {
        annotationView?.annotation = annotation
    }
    
    // 添加右按钮
    let detailButton = UIButton(type: .detailDisclosure)
    annotationView?.rightCalloutAccessoryView = detailButton
    annotationView?.canShowCallout = true
    
    return annotationView
}
```

### 5.2 MKOverlay（覆盖物）

```swift
// 绘制圆形覆盖物
let circle = MKCircle(center: coordinate, radius: 1000)  // 1km 半径
mapView.addOverlay(circle)

func mapView(_ mapView: MKMapView,
             rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
    if let circle = overlay as? MKCircle {
        let renderer = MKCircleRenderer(circle: circle)
        renderer.fillColor = UIColor.red.withAlphaComponent(0.3)
        renderer.strokeColor = .red
        renderer.lineWidth = 2
        return renderer
    }
    return MKOverlayRenderer()
}

// 多边形覆盖物
let path = CGMutablePath()
path.addLines(between: [p1, p2, p3, p4])
let polygon = MKPolygon(path: path, coordinateSystem: .linear)
mapView.addOverlay(polygon)

// 自定义折线
let polyline = MKPolyline(coordinates: coordinates, count: coordinates.count)
mapView.addOverlay(polyline)
```

---

## 6. 地理围栏与区域监测

### 6.1 CLCircularRegion

```swift
// 创建地理围栏
let region = CLCircularRegion(
    center: CLLocationCoordinate2D(latitude: 39.9, longitude: 116.4),
    radius: 500,  // 500 米半径
    identifier: "home"
)
region.notifyEntryStateOnDisplay = true

locationManager.startMonitoring(for: region)

// MARK: - CLLocationManagerDelegate

func locationManager(_ manager: CLLocationManager,
                     didEnterRegion region: CLRegion) {
    print("进入围栏: \(region.identifier)")
}

func locationManager(_ manager: CLLocationManager,
                     didExitRegion region: CLRegion) {
    print("离开围栏: \(region.identifier)")
}

func locationManager(_ manager: CLLocationManager,
                     monitoringDidFailFor region: CLRegion?,
                     withError error: Error) {
    print("围栏监测失败: \(error.localizedDescription)")
}
```

---

## 7. 导航与路线

### 7.1 MKMapItem & MKDirections

```swift
let source = MKMapItem(forCurrentLocation())!
let destination = MKMapItem(placemark: destinationPlacemark)

let request = MKDirectionsRequest()
request.source = source
request.destination = destination
request.transportType = .automobile  // .automobile/.transit/.walking
request.requestsAlternateRoutes = true

let directions = MKDirections(request: request)
directions.calculate { response, error in
    guard let route = response?.routes.first else { return }
    
    print("距离: \(route.distance / 1000) km")
    print("预计时间: \(route.expectedTravelTime / 60) 分钟")
    
    // 在地图上显示路线
    mapView.addOverlay(route.polyline)
    mapView.setVisibleMapRect(route.polyline.boundingMapRect, animated: true)
}
```

### 7.2 MKMapUserTrackingMode

```swift
mapView.userTrackingMode = .follow          // 跟随用户
mapView.userTrackingMode = .followWithHeading // 跟随+航向
mapView.userTrackingMode = .none             // 不跟随
```

---

## 8. 地图性能优化

### 8.1 渲染优化

| 优化手段 | 说明 | 效果 |
|---|---|---|
| 按需加载标注 | regionWillAnimate 时加载 | ⭐⭐⭐ |
| 复用 annotationView | dequeueReusableAnnotationView | ⭐⭐⭐ |
| 减少 overlay 数量 | 聚合标注 | ⭐⭐⭐ |
| 自定义 renderer | MKOverlayRenderer | ⭐⭐ |
| 缓存 placemark | 避免重复地理编码 | ⭐⭐ |
| 异步地理编码 | dispatch queue | ⭐⭐ |

---

## 9. 位置与地图 Android 对比

| 概念 | iOS | Android/Kotlin |
|---|---|---|
| 定位管理器 | CLLocationManager | FusedLocationProviderClient |
| 地图 | MapKit (Apple 原生) | Google Maps SDK / 高德/百度 |
| 地理编码 | CLGeocoder | Geocoder / Maps SDK |
| 地理围栏 | CLCircularRegion.startMonitoring | GeofencingApi |
| 导航 | MKDirections + Maps | Directions API |
| 用户位置 | mapView.showsUserLocation | GoogleMap.myLocationEnabled |
| 权限 | NSLocationWhenInUseUsageDescription | ACCESS_FINE_LOCATION |
| 后台定位 | significantLocationChanges | foregroundService |

---

## 10. 面试考点汇总

### 高频面试题

1. **iOS 定位权限有哪几种？区别？**
   - When In Use：仅前台
   - Always：前台+后台
   - 用户拒绝后无法自动获取，需在设置中手动开启

2. **CLLocationManager 的主要职责？**
   - 管理定位权限请求
   - 控制定位精度和更新频率
   - 处理位置更新回调和错误

3. **地理围栏的工作原理？**
   - 基于基站/Wi-Fi/GPS 监测用户进入/离开区域
   - 系统级别监测（后台/锁屏也能触发）
   - 最多监控 25 个区域

4. **MapKit 和 MKMapView 的核心 API？**
   - MKMapView 显示地图
   - MKAnnotation 添加标注
   - MKOverlay 添加覆盖物
   - MKCircleRenderer/MKPolylineRenderer 渲染

5. **如何优化地图性能？**
   - 按需加载标注
   - 复用 annotationView
   - 减少 overlay 数量（聚合）
   - 异步地理编码

### 面试回答模板

> "iOS 位置服务用 Core Location 框架，MKMapView 展示地图。定位权限分前台和后台两种。地理围栏用 CLCircularRegion 监测进入/离开事件。地图标注用 MKAnnotation + MKAnnotationView，覆盖物用 MKOverlay。性能优化关键是按需加载和复用视图。"

---

*本文档对标 Android `28_Location_Map/` 的深度*
