# AMap Flutter Search - 高德地图搜索插件

## 模块概述

`amap_flutter_search` 是 OneApp 中基于高德地图 SDK 的搜索服务插件，提供了全面的地理信息搜索功能，包括 POI 搜索、路线规划、地址解析等服务。该插件为车辆导航、位置查找、路径规划等功能提供了强大的搜索能力支持。

## 核心功能

### 1. POI 搜索
- **关键词搜索**：基于关键词的兴趣点搜索
- **周边搜索**：指定位置周边的 POI 搜索
- **分类搜索**：按类别筛选的 POI 搜索
- **详情查询**：获取 POI 的详细信息

### 2. 路线规划
- **驾车路线**：多种驾车路径规划策略
- **步行路线**：行人路径规划
- **骑行路线**：骑行路径规划
- **公交路线**：公共交通路径规划
- **货车路线**：货车专用路径规划

### 3. 地址解析
- **地理编码**：地址转换为坐标
- **逆地理编码**：坐标转换为地址
- **输入提示**：地址输入智能提示
- **行政区查询**：行政区域信息查询

### 4. 距离计算
- **直线距离**：两点间直线距离计算
- **驾车距离**：实际驾车距离和时间
- **步行距离**：步行距离和时间
- **批量计算**：批量距离矩阵计算

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            应用层                    │
│   (app_navigation, app_car)         │
├─────────────────────────────────────┤
│      AMap Flutter Search           │
│  ┌──────────┬──────────┬──────────┐ │
│  │ POI搜索  │ 路线规划 │ 地址解析 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 距离计算 │ 缓存管理 │ 数据处理 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│         高德地图 Search SDK         │
│  ┌──────────┬──────────┬──────────┐ │
│  │ Android  │   iOS    │ 搜索引擎 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│            网络服务层                │
│      (REST API, WebService)         │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. POI 搜索管理器 (PoiSearchManager)
```dart
class AMapPoiSearchManager {
  // 关键词搜索
  Future<PoiResult> searchByKeyword(PoiKeywordSearchOption option);
  
  // 周边搜索
  Future<PoiResult> searchNearby(PoiNearbySearchOption option);
  
  // ID 搜索
  Future<PoiItem> searchById(String poiId);
  
  // 分类搜索
  Future<PoiResult> searchByCategory(PoiCategorySearchOption option);
}
```

#### 2. 路线规划管理器 (RouteSearchManager)
```dart
class AMapRouteSearchManager {
  // 驾车路线规划
  Future<DriveRouteResult> calculateDriveRoute(DriveRouteQuery query);
  
  // 步行路线规划
  Future<WalkRouteResult> calculateWalkRoute(WalkRouteQuery query);
  
  // 骑行路线规划
  Future<RideRouteResult> calculateRideRoute(RideRouteQuery query);
  
  // 公交路线规划
  Future<BusRouteResult> calculateBusRoute(BusRouteQuery query);
  
  // 货车路线规划
  Future<TruckRouteResult> calculateTruckRoute(TruckRouteQuery query);
}
```

#### 3. 地理编码管理器 (GeocodeManager)
```dart
class AMapGeocodeManager {
  // 地理编码
  Future<GeocodeResult> geocode(GeocodeQuery query);
  
  // 逆地理编码
  Future<RegeocodeResult> reverseGeocode(RegeocodeQuery query);
  
  // 输入提示
  Future<List<TipItem>> inputTips(InputTipsQuery query);
  
  // 行政区查询
  Future<DistrictResult> searchDistrict(DistrictQuery query);
}
```

#### 4. 距离计算器 (DistanceCalculator)
```dart
class AMapDistanceCalculator {
  // 计算两点距离
  Future<DistanceResult> calculateDistance(DistanceQuery query);
  
  // 批量距离计算
  Future<List<DistanceResult>> calculateDistances(List<DistanceQuery> queries);
  
  // 路径距离计算
  Future<RouteDistanceResult> calculateRouteDistance(RouteDistanceQuery query);
}
```

## 数据模型

### POI 模型
```dart
class PoiItem {
  final String poiId;           // POI ID
  final String title;           // POI 名称
  final String snippet;         // POI 描述
  final LatLng latLng;         // POI 坐标
  final String distance;        // 距离
  final String tel;            // 电话
  final String postcode;       // 邮编
  final String website;        // 网站
  final String email;          // 邮箱
  final String province;       // 省份
  final String city;           // 城市
  final String district;       // 区县
  final String address;        // 地址
  final String direction;      // 方向
  final String businessArea;   // 商圈
  final String typeCode;       // 类型编码
  final String typeDes;        // 类型描述
  final List<Photo> photos;    // 照片列表
  final List<String> shopID;   // 商铺ID
  final IndoorData indoorData; // 室内数据
}

class PoiResult {
  final List<PoiItem> pois;
  final int pageCount;
  final int totalCount;
  final SearchBound searchBound;
  final PoiQuery query;
}
```

### 路线模型
```dart
class DriveRouteResult {
  final List<DrivePath> paths;
  final RouteQuery startPos;
  final RouteQuery targetPos;
  final List<RouteQuery> viaPoints;
  final int taxiCost;
}

class DrivePath {
  final String strategy;        // 策略
  final int distance;          // 距离（米）
  final int duration;          // 时长（秒）
  final String tolls;          // 过路费
  final String tollDistance;   // 收费距离
  final String totalTrafficLights; // 红绿灯数
  final List<DriveStep> steps; // 路径段
  final List<TMC> tmcs;       // 路况信息
}

class DriveStep {
  final String instruction;    // 行驶指示
  final String orientation;    // 方向
  final String road;          // 道路名称
  final int distance;         // 距离
  final int duration;         // 时长
  final List<LatLng> polyline; // 路径坐标
  final String action;        // 导航动作
  final String assistantAction; // 辅助动作
}
```

### 地址模型
```dart
class RegeocodeResult {
  final RegeocodeAddress regeocodeAddress;
  final List<PoiItem> pois;
  final List<Road> roads;
  final List<RoadInter> roadInters;
  final List<AoiItem> aois;
}

class RegeocodeAddress {
  final String formattedAddress; // 格式化地址
  final String country;         // 国家
  final String province;        // 省份
  final String city;           // 城市
  final String district;       // 区县
  final String township;       // 乡镇
  final String neighborhood;   // 社区
  final String building;       // 建筑
  final String adcode;         // 区域编码
  final String citycode;       // 城市编码
  final List<StreetNumber> streetNumbers; // 门牌信息
}
```

## API 接口

### POI 搜索接口
```dart
abstract class PoiSearchService {
  // 关键词搜索
  Future<ApiResponse<PoiResult>> searchByKeyword(PoiKeywordSearchRequest request);
  
  // 周边搜索
  Future<ApiResponse<PoiResult>> searchNearby(PoiNearbySearchRequest request);
  
  // 多边形搜索
  Future<ApiResponse<PoiResult>> searchInPolygon(PoiPolygonSearchRequest request);
  
  // POI 详情
  Future<ApiResponse<PoiItem>> getPoiDetail(String poiId);
}
```

### 路线规划接口
```dart
abstract class RouteSearchService {
  // 驾车路线规划
  Future<ApiResponse<DriveRouteResult>> planDriveRoute(DriveRouteRequest request);
  
  // 步行路线规划
  Future<ApiResponse<WalkRouteResult>> planWalkRoute(WalkRouteRequest request);
  
  // 骑行路线规划
  Future<ApiResponse<RideRouteResult>> planRideRoute(RideRouteRequest request);
  
  // 公交路线规划
  Future<ApiResponse<BusRouteResult>> planBusRoute(BusRouteRequest request);
}
```

### 地理编码接口
```dart
abstract class GeocodeService {
  // 地理编码
  Future<ApiResponse<GeocodeResult>> geocode(GeocodeRequest request);
  
  // 逆地理编码
  Future<ApiResponse<RegeocodeResult>> reverseGeocode(RegeocodeRequest request);
  
  // 输入提示
  Future<ApiResponse<List<TipItem>>> getInputTips(InputTipsRequest request);
  
  // 行政区搜索
  Future<ApiResponse<DistrictResult>> searchDistrict(DistrictRequest request);
}
```

## 配置管理

### 搜索配置
```dart
class SearchConfig {
  final String apiKey;           // API 密钥
  final int timeoutMs;          // 超时时间
  final int maxRetries;         // 最大重试次数
  final bool enableCache;       // 是否启用缓存
  final int cacheExpireTime;    // 缓存过期时间
  final String language;        // 语言设置
  final String region;          // 区域设置
  
  static const SearchConfig defaultConfig = SearchConfig(
    apiKey: '',
    timeoutMs: 30000,
    maxRetries: 3,
    enableCache: true,
    cacheExpireTime: 3600,
    language: 'zh-CN',
    region: 'CN',
  );
}
```

### POI 搜索配置
```dart
class PoiSearchConfig {
  final int pageSize;           // 每页结果数
  final int maxPage;           // 最大页数
  final String city;           // 搜索城市
  final String types;          // 搜索类型
  final bool extensions;       // 是否返回扩展信息
  final String sortrule;       // 排序规则
  
  static const PoiSearchConfig defaultConfig = PoiSearchConfig(
    pageSize: 20,
    maxPage: 100,
    city: '',
    types: '',
    extensions: false,
    sortrule: 'distance',
  );
}
```

## 使用示例

### POI 搜索示例
```dart
// 关键词搜索
final searchOption = PoiKeywordSearchOption(
  keyword: '加油站',
  city: '北京',
  pageSize: 20,
  pageNum: 1,
  extensions: true,
);

final poiResult = await AMapPoiSearchManager.instance.searchByKeyword(searchOption);

for (final poi in poiResult.pois) {
  print('POI 名称: ${poi.title}');
  print('POI 地址: ${poi.address}');
  print('POI 距离: ${poi.distance}');
  print('POI 坐标: ${poi.latLng.latitude}, ${poi.latLng.longitude}');
}
```

### 周边搜索示例
```dart
// 周边搜索
final nearbyOption = PoiNearbySearchOption(
  keyword: '餐厅',
  center: LatLng(39.9042, 116.4074), // 搜索中心点
  radius: 1000, // 搜索半径 1000 米
  pageSize: 10,
  pageNum: 1,
);

final nearbyResult = await AMapPoiSearchManager.instance.searchNearby(nearbyOption);

print('附近餐厅数量: ${nearbyResult.pois.length}');
for (final restaurant in nearbyResult.pois) {
  print('餐厅: ${restaurant.title} - ${restaurant.distance}');
}
```

### 路线规划示例
```dart
// 驾车路线规划
final driveQuery = DriveRouteQuery(
  fromPoint: RouteQuery(39.9042, 116.4074), // 起点
  toPoint: RouteQuery(39.9015, 116.3974),   // 终点
  mode: DriveMode.fastest, // 最快路线
  avoidhighspeed: false,   // 不避开高速
  avoidtolls: false,       // 不避开收费
  avoidtrafficjam: true,   // 避开拥堵
);

final driveResult = await AMapRouteSearchManager.instance.calculateDriveRoute(driveQuery);

if (driveResult.paths.isNotEmpty) {
  final path = driveResult.paths.first;
  print('驾车距离: ${path.distance} 米');
  print('预计时间: ${path.duration} 秒');
  print('过路费: ${path.tolls} 元');
  
  for (final step in path.steps) {
    print('导航指示: ${step.instruction}');
    print('道路: ${step.road}');
    print('距离: ${step.distance} 米');
  }
}
```

### 地理编码示例
```dart
// 地址转坐标
final geocodeQuery = GeocodeQuery(
  locationName: '北京市朝阳区望京SOHO',
  city: '北京',
);

final geocodeResult = await AMapGeocodeManager.instance.geocode(geocodeQuery);

if (geocodeResult.geocodeAddressList.isNotEmpty) {
  final address = geocodeResult.geocodeAddressList.first;
  print('地址坐标: ${address.latLonPoint.latitude}, ${address.latLonPoint.longitude}');
}

// 坐标转地址
final regeocodeQuery = RegeocodeQuery(
  latLonPoint: LatLng(39.9915, 116.4684),
  radius: 200.0,
  extensions: 'all',
);

final regeocodeResult = await AMapGeocodeManager.instance.reverseGeocode(regeocodeQuery);
print('格式化地址: ${regeocodeResult.regeocodeAddress.formattedAddress}');
```

### 输入提示示例
```dart
// 地址输入提示
final tipsQuery = InputTipsQuery(
  keyword: '王府井',
  city: '北京',
  datatype: 'all',
);

final tipsList = await AMapGeocodeManager.instance.inputTips(tipsQuery);

for (final tip in tipsList) {
  print('提示: ${tip.name}');
  print('地址: ${tip.address}');
  if (tip.point != null) {
    print('坐标: ${tip.point!.latitude}, ${tip.point!.longitude}');
  }
}
```

## 测试策略

### 单元测试
```dart
group('AMapSearch Tests', () {
  test('should search POI by keyword', () async {
    // Given
    final searchOption = PoiKeywordSearchOption(
      keyword: '测试POI',
      city: '北京',
    );
    
    // When
    final result = await AMapPoiSearchManager.instance.searchByKeyword(searchOption);
    
    // Then
    expect(result.pois, isNotEmpty);
    expect(result.pois.first.title, contains('测试POI'));
  });
  
  test('should calculate drive route', () async {
    // Given
    final query = DriveRouteQuery(
      fromPoint: RouteQuery(39.9042, 116.4074),
      toPoint: RouteQuery(39.9015, 116.3974),
    );
    
    // When
    final result = await AMapRouteSearchManager.instance.calculateDriveRoute(query);
    
    // Then
    expect(result.paths, isNotEmpty);
    expect(result.paths.first.distance, greaterThan(0));
  });
});
```

### 集成测试
```dart
group('Search Integration Tests', () {
  testWidgets('complete search flow', (tester) async {
    // 1. 搜索 POI
    final pois = await searchNearbyPois('加油站', currentLocation);
    
    // 2. 选择目标 POI
    final targetPoi = pois.first;
    
    // 3. 规划路线
    final route = await planRouteToDestination(currentLocation, targetPoi.latLng);
    
    // 4. 验证结果
    expect(route.paths, isNotEmpty);
    expect(route.paths.first.steps, isNotEmpty);
  });
});
```

## 性能优化

### 搜索优化
- **搜索缓存**：缓存常用搜索结果
- **预测搜索**：基于历史预测用户搜索
- **分页加载**：大结果集分页加载
- **搜索建议**：智能搜索建议减少请求

### 路线优化
- **路线缓存**：缓存常用路线规划结果
- **增量更新**：只更新路线变化部分
- **压缩传输**：压缩路线数据减少传输量
- **多线程处理**：并行处理多个路线请求

## 错误处理

### 搜索错误类型
```dart
enum SearchErrorType {
  networkError,         // 网络错误
  apiKeyInvalid,       // API Key 无效
  quotaExceeded,       // 配额超限
  invalidParameter,    // 参数无效
  noResult,           // 无搜索结果
  serverError,        // 服务器错误
  timeout             // 请求超时
}

class SearchException implements Exception {
  final SearchErrorType type;
  final String message;
  final int? errorCode;
  
  const SearchException(this.type, this.message, [this.errorCode]);
}
```

### 错误处理示例
```dart
try {
  final result = await AMapPoiSearchManager.instance.searchByKeyword(searchOption);
  // 处理搜索结果
} on SearchException catch (e) {
  switch (e.type) {
    case SearchErrorType.networkError:
      showErrorDialog('网络连接失败，请检查网络设置');
      break;
    case SearchErrorType.noResult:
      showInfoDialog('未找到相关结果，请尝试其他关键词');
      break;
    case SearchErrorType.quotaExceeded:
      showErrorDialog('搜索次数已达上限，请稍后再试');
      break;
    default:
      showErrorDialog('搜索失败: ${e.message}');
  }
} catch (e) {
  showErrorDialog('未知错误: $e');
}
```

## 缓存策略

### 搜索结果缓存
```dart
class SearchCache {
  static const int maxCacheSize = 1000;
  static const Duration cacheExpiration = Duration(hours: 1);
  
  // 缓存 POI 搜索结果
  static Future<void> cachePoiResult(String key, PoiResult result);
  
  // 获取缓存的 POI 结果
  static Future<PoiResult?> getCachedPoiResult(String key);
  
  // 缓存路线规划结果
  static Future<void> cacheRouteResult(String key, DriveRouteResult result);
  
  // 获取缓存的路线结果
  static Future<DriveRouteResult?> getCachedRouteResult(String key);
  
  // 清理过期缓存
  static Future<void> cleanExpiredCache();
}
```

## 配额管理

### API 配额监控
```dart
class QuotaManager {
  // 获取当前配额使用情况
  static Future<QuotaInfo> getCurrentQuota();
  
  // 检查是否可以发起请求
  static Future<bool> canMakeRequest(RequestType type);
  
  // 记录请求使用
  static Future<void> recordRequest(RequestType type);
  
  // 获取配额重置时间
  static Future<DateTime> getQuotaResetTime();
}

class QuotaInfo {
  final int dailyLimit;      // 日限额
  final int dailyUsed;       // 日使用量
  final int monthlyLimit;    // 月限额
  final int monthlyUsed;     // 月使用量
  final DateTime resetTime;  // 重置时间
}
```

## 版本历史

### v3.1.22+1 (当前版本)
- 支持最新的高德地图 API
- 新增货车路线规划功能
- 优化搜索性能和准确性
- 修复路线规划稳定性问题

### v3.1.21
- 支持室内 POI 搜索
- 新增批量距离计算
- 优化内存使用
- 改进错误处理机制

## 依赖关系

### 内部依赖
- `amap_flutter_base`: 高德地图基础库
- `basic_network`: 网络请求服务
- `basic_storage`: 本地存储服务

### 外部依赖
- `dio`: HTTP 客户端
- `cached_network_image`: 图片缓存
- `sqflite`: 本地数据库

## 总结

`amap_flutter_search` 作为高德地图搜索服务的 Flutter 插件，为 OneApp 提供了全面的地理信息搜索能力。通过集成 POI 搜索、路线规划、地理编码、距离计算等功能，该插件能够满足车辆导航、位置服务、路径规划等多种业务需求。

插件在设计上充分考虑了性能优化、缓存管理、错误处理、配额控制等关键因素，确保在提供高质量搜索服务的同时，保持良好的用户体验和系统稳定性。这为 OneApp 的车联网和导航服务提供了强大的技术支撑。
