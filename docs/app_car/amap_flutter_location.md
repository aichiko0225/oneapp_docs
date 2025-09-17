# AMap Flutter Location - 高德地图定位插件

## 模块概述

`amap_flutter_location` 是 OneApp 中基于高德地图 SDK 的定位服务插件，提供了高精度的位置定位、地理围栏、轨迹记录等功能。该插件为车辆定位、导航、位置服务等功能提供了可靠的地理位置支持。

## 核心功能

### 1. 位置定位
- **GPS 定位**：基于 GPS 卫星的高精度定位
- **网络定位**：基于基站和 WiFi 的快速定位
- **混合定位**：GPS + 网络的融合定位算法
- **室内定位**：支持室内场景的位置识别

### 2. 地理围栏
- **围栏创建**：创建圆形、多边形地理围栏
- **进出检测**：实时检测设备进入/离开围栏
- **多围栏管理**：同时管理多个地理围栏
- **事件通知**：围栏事件的实时推送

### 3. 轨迹记录
- **轨迹采集**：实时记录移动轨迹
- **轨迹优化**：去噪、平滑轨迹数据
- **轨迹存储**：本地和云端轨迹存储
- **轨迹分析**：距离、速度、停留点分析

### 4. 位置服务
- **逆地理编码**：坐标转换为地址信息
- **地理编码**：地址转换为坐标信息
- **POI 搜索**：兴趣点搜索和信息获取
- **距离计算**：两点间距离和路径计算

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            应用层                    │
│    (app_car, app_navigation)        │
├─────────────────────────────────────┤
│      AMap Flutter Location         │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 定位管理 │ 围栏服务 │ 轨迹记录 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 坐标转换 │ 事件处理 │ 数据存储 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│         高德地图 Native SDK         │
│  ┌──────────┬──────────┬──────────┐ │
│  │ Android  │   iOS    │ 定位引擎 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           系统定位服务               │
│     (GPS, Network, Sensors)         │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 定位管理器 (LocationManager)
```dart
class AMapLocationManager {
  // 初始化定位服务
  Future<bool> initialize(LocationConfig config);
  
  // 开始定位
  Future<void> startLocation();
  
  // 停止定位
  Future<void> stopLocation();
  
  // 获取当前位置
  Future<AMapLocation> getCurrentLocation();
  
  // 设置定位参数
  Future<void> setLocationOption(LocationOption option);
}
```

#### 2. 地理围栏管理器 (GeofenceManager)
```dart
class AMapGeofenceManager {
  // 添加围栏
  Future<String> addGeofence(GeofenceRegion region);
  
  // 移除围栏
  Future<bool> removeGeofence(String geofenceId);
  
  // 获取围栏列表
  Future<List<GeofenceRegion>> getGeofences();
  
  // 开始围栏监控
  Future<void> startGeofenceMonitoring();
  
  // 停止围栏监控
  Future<void> stopGeofenceMonitoring();
}
```

#### 3. 轨迹记录器 (TrackRecorder)
```dart
class AMapTrackRecorder {
  // 开始录制轨迹
  Future<String> startRecording(TrackConfig config);
  
  // 停止录制轨迹
  Future<Track> stopRecording(String trackId);
  
  // 暂停录制
  Future<void> pauseRecording(String trackId);
  
  // 恢复录制
  Future<void> resumeRecording(String trackId);
  
  // 获取轨迹数据
  Future<Track> getTrack(String trackId);
}
```

#### 4. 坐标转换器 (CoordinateConverter)
```dart
class AMapCoordinateConverter {
  // 坐标系转换
  LatLng convertCoordinate(LatLng source, CoordinateType from, CoordinateType to);
  
  // 批量坐标转换
  List<LatLng> convertCoordinates(List<LatLng> source, CoordinateType from, CoordinateType to);
  
  // 逆地理编码
  Future<RegeocodeResult> reverseGeocode(LatLng location);
  
  // 地理编码
  Future<GeocodeResult> geocode(String address);
}
```

## 数据模型

### 位置模型
```dart
class AMapLocation {
  final double latitude;        // 纬度
  final double longitude;       // 经度
  final double altitude;        // 海拔
  final double accuracy;        // 精度
  final double speed;          // 速度
  final double bearing;        // 方向角
  final DateTime timestamp;    // 时间戳
  final String address;        // 地址信息
  final String province;       // 省份
  final String city;          // 城市
  final String district;      // 区县
  final String street;        // 街道
  final String streetNumber;  // 门牌号
  final String aoiName;       // AOI 名称
  final String poiName;       // POI 名称
  final LocationType locationType; // 定位类型
}

enum LocationType {
  gps,              // GPS 定位
  network,          // 网络定位
  passive,          // 被动定位
  offline,          // 离线定位
  lastKnown         // 上次定位
}
```

### 地理围栏模型
```dart
class GeofenceRegion {
  final String id;
  final String name;
  final GeofenceType type;
  final LatLng center;
  final double radius;
  final List<LatLng> polygon;
  final GeofenceAction action;
  final bool isEnabled;
  final DateTime createdAt;
  final Map<String, dynamic> metadata;
}

enum GeofenceType {
  circle,           // 圆形围栏
  polygon,          // 多边形围栏
  poi,             // POI 围栏
  district         // 行政区围栏
}

enum GeofenceAction {
  enter,           // 进入事件
  exit,            // 离开事件
  dwell,           // 停留事件
  enterOrExit      // 进入或离开
}
```

### 轨迹模型
```dart
class Track {
  final String id;
  final String name;
  final DateTime startTime;
  final DateTime endTime;
  final List<TrackPoint> points;
  final double totalDistance;
  final Duration totalTime;
  final double averageSpeed;
  final double maxSpeed;
  final TrackStatistics statistics;
}

class TrackPoint {
  final double latitude;
  final double longitude;
  final double altitude;
  final double speed;
  final double bearing;
  final DateTime timestamp;
  final double accuracy;
}

class TrackStatistics {
  final double totalDistance;
  final Duration totalTime;
  final Duration movingTime;
  final Duration pausedTime;
  final double averageSpeed;
  final double maxSpeed;
  final double totalAscent;
  final double totalDescent;
  final List<StopPoint> stopPoints;
}
```

## API 接口

### 定位接口
```dart
abstract class LocationService {
  // 获取当前位置
  Future<ApiResponse<AMapLocation>> getCurrentLocation();
  
  // 开始连续定位
  Future<ApiResponse<bool>> startContinuousLocation(LocationOption option);
  
  // 停止连续定位
  Future<ApiResponse<bool>> stopContinuousLocation();
  
  // 获取定位权限状态
  Future<ApiResponse<LocationPermission>> getLocationPermission();
  
  // 请求定位权限
  Future<ApiResponse<bool>> requestLocationPermission();
}
```

### 地理围栏接口
```dart
abstract class GeofenceService {
  // 创建地理围栏
  Future<ApiResponse<String>> createGeofence(CreateGeofenceRequest request);
  
  // 删除地理围栏
  Future<ApiResponse<bool>> deleteGeofence(String geofenceId);
  
  // 获取围栏列表
  Future<ApiResponse<List<GeofenceRegion>>> getGeofences();
  
  // 获取围栏状态
  Future<ApiResponse<GeofenceStatus>> getGeofenceStatus(String geofenceId);
}
```

### 轨迹接口
```dart
abstract class TrackService {
  // 开始轨迹记录
  Future<ApiResponse<String>> startTrackRecording(TrackConfig config);
  
  // 停止轨迹记录
  Future<ApiResponse<Track>> stopTrackRecording(String trackId);
  
  // 获取轨迹数据
  Future<ApiResponse<Track>> getTrack(String trackId);
  
  // 获取轨迹列表
  Future<ApiResponse<List<TrackSummary>>> getTrackList(TrackQuery query);
}
```

## 配置管理

### 定位配置
```dart
class LocationOption {
  final LocationMode locationMode;         // 定位模式
  final int interval;                     // 定位间隔（毫秒）
  final bool needAddress;                 // 是否需要地址信息
  final bool mockEnable;                  // 是否允许模拟位置
  final bool wifiScan;                    // 是否开启 WiFi 扫描
  final bool gpsFirst;                    // 是否 GPS 优先
  final int httpTimeOut;                  // 网络超时时间
  final LocationPurpose locationPurpose;  // 定位目的
  
  static const LocationOption defaultOption = LocationOption(
    locationMode: LocationMode.hightAccuracy,
    interval: 2000,
    needAddress: true,
    mockEnable: false,
    wifiScan: true,
    gpsFirst: false,
    httpTimeOut: 30000,
    locationPurpose: LocationPurpose.signIn,
  );
}

enum LocationMode {
  batterySaving,    // 低功耗模式
  deviceSensors,    // 仅设备传感器
  hightAccuracy     // 高精度模式
}
```

### 围栏配置
```dart
class GeofenceConfig {
  final bool enableNotification;    // 是否启用通知
  final int dwellDelay;            // 停留延迟（毫秒）
  final double minimumRadius;      // 最小围栏半径
  final double maximumRadius;      // 最大围栏半径
  final int maxGeofenceCount;      // 最大围栏数量
  
  static const GeofenceConfig defaultConfig = GeofenceConfig(
    enableNotification: true,
    dwellDelay: 10000,
    minimumRadius: 50.0,
    maximumRadius: 100000.0,
    maxGeofenceCount: 100,
  );
}
```

## 使用示例

### 基本定位示例
```dart
// 初始化定位服务
final locationManager = AMapLocationManager.instance;
await locationManager.initialize(LocationConfig.defaultConfig);

// 设置定位参数
await locationManager.setLocationOption(LocationOption.defaultOption);

// 监听位置变化
locationManager.onLocationChanged.listen((location) {
  print('当前位置: ${location.latitude}, ${location.longitude}');
  print('地址: ${location.address}');
});

// 开始定位
await locationManager.startLocation();
```

### 地理围栏示例
```dart
// 创建圆形围栏
final geofence = GeofenceRegion(
  id: 'home_fence',
  name: '家庭围栏',
  type: GeofenceType.circle,
  center: LatLng(39.9042, 116.4074), // 北京天安门
  radius: 500.0, // 500米半径
  action: GeofenceAction.enterOrExit,
  isEnabled: true,
);

// 添加围栏
final geofenceManager = AMapGeofenceManager.instance;
final fenceId = await geofenceManager.addGeofence(geofence);

// 监听围栏事件
geofenceManager.onGeofenceTriggered.listen((event) {
  switch (event.action) {
    case GeofenceAction.enter:
      print('进入围栏: ${event.geofenceId}');
      // 执行进入围栏的逻辑
      break;
    case GeofenceAction.exit:
      print('离开围栏: ${event.geofenceId}');
      // 执行离开围栏的逻辑
      break;
  }
});

// 开始围栏监控
await geofenceManager.startGeofenceMonitoring();
```

### 轨迹记录示例
```dart
// 配置轨迹记录
final trackConfig = TrackConfig(
  name: '上班路线',
  minDistance: 10.0,    // 最小记录距离
  minTime: 5000,        // 最小记录时间间隔
  enableOptimization: true, // 启用轨迹优化
);

// 开始记录轨迹
final trackRecorder = AMapTrackRecorder.instance;
final trackId = await trackRecorder.startRecording(trackConfig);

// 监听轨迹点
trackRecorder.onTrackPointAdded.listen((point) {
  print('新轨迹点: ${point.latitude}, ${point.longitude}');
});

// 停止记录并获取轨迹
final track = await trackRecorder.stopRecording(trackId);
print('轨迹总距离: ${track.totalDistance}米');
print('轨迹总时间: ${track.totalTime}');
```

### 坐标转换示例
```dart
// WGS84 坐标转换为 GCJ02 坐标
final wgs84Point = LatLng(39.9042, 116.4074);
final gcj02Point = AMapCoordinateConverter.convertCoordinate(
  wgs84Point,
  CoordinateType.wgs84,
  CoordinateType.gcj02,
);

// 逆地理编码
final regeocodeResult = await AMapCoordinateConverter.reverseGeocode(gcj02Point);
print('地址: ${regeocodeResult.formattedAddress}');

// 地理编码
final geocodeResult = await AMapCoordinateConverter.geocode('北京市天安门广场');
if (geocodeResult.geocodes.isNotEmpty) {
  final location = geocodeResult.geocodes.first.location;
  print('坐标: ${location.latitude}, ${location.longitude}');
}
```

## 测试策略

### 单元测试
```dart
group('AMapLocation Tests', () {
  test('should convert coordinates correctly', () {
    // Given
    final wgs84Point = LatLng(39.9042, 116.4074);
    
    // When
    final gcj02Point = AMapCoordinateConverter.convertCoordinate(
      wgs84Point,
      CoordinateType.wgs84,
      CoordinateType.gcj02,
    );
    
    // Then
    expect(gcj02Point.latitude, isNot(equals(wgs84Point.latitude)));
    expect(gcj02Point.longitude, isNot(equals(wgs84Point.longitude)));
  });
});
```

### 集成测试
```dart
group('Location Integration Tests', () {
  testWidgets('location service flow', (tester) async {
    // 1. 初始化定位服务
    await AMapLocationManager.instance.initialize(LocationConfig.defaultConfig);
    
    // 2. 开始定位
    await AMapLocationManager.instance.startLocation();
    
    // 3. 等待定位结果
    final location = await AMapLocationManager.instance.getCurrentLocation();
    
    // 4. 验证定位结果
    expect(location.latitude, greaterThan(-90));
    expect(location.latitude, lessThan(90));
    expect(location.longitude, greaterThan(-180));
    expect(location.longitude, lessThan(180));
  });
});
```

## 性能优化

### 定位优化
- **智能定位策略**：根据场景自动选择最佳定位方式
- **缓存机制**：缓存最近的定位结果
- **批量处理**：批量处理定位请求
- **省电模式**：低功耗的定位策略

### 数据优化
- **数据压缩**：压缩轨迹数据减少存储空间
- **增量同步**：只同步变化的数据
- **本地缓存**：本地缓存常用的地理信息
- **数据清理**：定期清理过期的轨迹数据

## 权限管理

### 位置权限
```dart
enum LocationPermission {
  denied,           // 拒绝
  deniedForever,    // 永久拒绝
  whileInUse,       // 使用时允许
  always            // 始终允许
}

class PermissionManager {
  // 检查权限状态
  static Future<LocationPermission> checkPermission();
  
  // 请求权限
  static Future<LocationPermission> requestPermission();
  
  // 打开应用设置
  static Future<bool> openAppSettings();
}
```

### 权限处理示例
```dart
// 检查和请求位置权限
final permission = await PermissionManager.checkPermission();

if (permission == LocationPermission.denied) {
  final result = await PermissionManager.requestPermission();
  if (result != LocationPermission.whileInUse && 
      result != LocationPermission.always) {
    // 权限被拒绝，显示说明或引导用户到设置页面
    await showPermissionDialog();
    return;
  }
}

// 权限获取成功，开始定位
await startLocationService();
```

## 错误处理

### 定位错误类型
```dart
enum LocationErrorType {
  permissionDenied,     // 权限被拒绝
  locationServiceDisabled, // 定位服务未开启
  networkError,         // 网络错误
  timeout,             // 超时
  unknownError         // 未知错误
}

class LocationException implements Exception {
  final LocationErrorType type;
  final String message;
  final int? errorCode;
  
  const LocationException(this.type, this.message, [this.errorCode]);
}
```

## 隐私和安全

### 数据隐私
- **最小权限原则**：只请求必要的定位权限
- **数据加密**：敏感位置数据加密存储
- **用户控制**：用户可以随时关闭定位服务
- **透明度**：明确告知用户数据使用目的

### 安全措施
- **防伪造**：检测和过滤伪造的 GPS 信号
- **数据校验**：验证定位数据的有效性
- **传输安全**：使用 HTTPS 传输位置数据
- **访问控制**：严格控制位置数据的访问权限

## 版本历史

### v3.0.3 (当前版本)
- 支持 iOS 16 和 Android 13
- 优化定位精度和速度
- 修复地理围栏稳定性问题
- 改进轨迹记录算法

### v3.0.2
- 新增室内定位支持
- 优化电池使用效率
- 支持自定义坐标系
- 修复内存泄漏问题

## 依赖关系

### 内部依赖
- `basic_platform`: 平台抽象层
- `basic_storage`: 本地存储服务
- `basic_network`: 网络请求服务

### 外部依赖
- `permission_handler`: 权限管理
- `geolocator`: 位置服务补充
- `path_provider`: 文件路径管理

## 总结

`amap_flutter_location` 作为高德地图定位服务的 Flutter 插件，为 OneApp 提供了可靠、高效的位置服务能力。通过集成 GPS、网络定位、地理围栏、轨迹记录等功能，该插件能够满足车辆定位、导航、位置服务等多种业务需求。

插件在设计上充分考虑了性能优化、隐私保护、权限管理等关键因素，确保在提供精准位置服务的同时，保护用户隐私和设备安全。这为 OneApp 的车联网服务提供了坚实的技术基础。
