# App Carwatcher 车辆监控模块

## 模块概述

`app_carwatcher` 是 OneApp 车联网生态中的车辆监控模块，负责实时监控车辆状态、位置信息、安全警报等功能。该模块为用户提供全方位的车辆安全监控服务，确保车辆的安全性和用户的使用体验。

### 基本信息
- **模块名称**: app_carwatcher
- **版本**: 0.1.2
- **描述**: 车辆监控应用模块
- **Flutter 版本**: >=2.10.5
- **Dart 版本**: >=3.0.0 <4.0.0

## 功能特性

### 核心功能
1. **实时车辆监控**
   - 车辆位置实时追踪
   - 车辆状态监控（锁车状态、车窗状态等）
   - 车辆异常报警

2. **地理围栏管理**
   - 围栏设置和编辑
   - 围栏事件监控
   - POI 地点搜索

3. **历史报告查看**
   - 日报详情查看
   - 事件详情展示
   - 事件过滤功能

4. **地图集成**
   - 车辆位置可视化
   - 历史轨迹查看
   - 地理围栏设置

## 技术架构

### 目录结构
```
lib/
├── app_carwatcher.dart           # 模块入口文件
├── src/                          # 源代码目录
│   ├── app_carwatcher_module.dart # 模块定义和依赖注入
│   ├── route_dp.dart             # 路由配置
│   ├── route_export.dart         # 路由导出
│   ├── blocs/                    # 状态管理
│   ├── constants/                # 常量定义
│   ├── pages/                    # 页面组件
│   │   ├── home/                 # 首页
│   │   ├── geo_fence_list/       # 地理围栏列表
│   │   ├── geo_fence_detail/     # 地理围栏详情
│   │   ├── geo_fence_search_poi/ # POI搜索
│   │   ├── daily_report/         # 日报详情
│   │   ├── event_detail/         # 事件详情
│   │   └── event_filter/         # 事件过滤
│   └── utils/                    # 工具类
├── generated/                    # 代码生成文件
└── l10n/                         # 国际化文件
```

## 核心实现

### 1. 模块入口文件

**文件**: `lib/app_carwatcher.dart`

```dart
/// Carwatcher APP
library app_carwatcher;

export 'src/app_carwatcher_module.dart';
export 'src/route_dp.dart';
export 'src/route_export.dart';
```

### 2. 模块定义与路由配置

**文件**: `src/app_carwatcher_module.dart`

```dart
import 'package:basic_modular/modular.dart';
import 'package:basic_modular_route/basic_modular_route.dart';

import 'route_export.dart';

/// Module负责的页面
class AppCarwatcherModule extends Module with RouteObjProvider {
  @override
  List<ModularRoute> get routes {
    final moduleHome = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyModule);
    final carWatcherHomePage = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyCarWatcherHomePage);
    final geoFenceListPage = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyGeoFenceListPage);
    final geoFenceDetailPage = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyGeoFenceDetailPage);
    final searchPoiPage = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyGeoFenceSearchPOIPage);
    final dailyReportDetailPage = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyDailyReportPage);
    final eventFilterPage = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyEventFilterPage);
    final reportDetailPage = RouteCenterAPI.routeMetaBy(AppCarwatcherRouteExport.keyReportDetailPage);

    return [
      ChildRoute<dynamic>(moduleHome.path, child: (_, args) => moduleHome.provider(args).as()),
      ChildRoute<dynamic>(carWatcherHomePage.path, child: (_, args) => carWatcherHomePage.provider(args).as()),
      ChildRoute<dynamic>(geoFenceListPage.path, child: (_, args) => geoFenceListPage.provider(args).as()),
      ChildRoute<dynamic>(geoFenceDetailPage.path, child: (_, args) => geoFenceDetailPage.provider(args).as()),
      ChildRoute<dynamic>(searchPoiPage.path, child: (_, args) => searchPoiPage.provider(args).as()),
      ChildRoute<dynamic>(dailyReportDetailPage.path, child: (_, args) => dailyReportDetailPage.provider(args).as()),
      ChildRoute<dynamic>(eventFilterPage.path, child: (_, args) => eventFilterPage.provider(args).as()),
      ChildRoute<dynamic>(reportDetailPage.path, child: (_, args) => reportDetailPage.provider(args).as()),
    ];
  }
}
```

### 3. 路由导出管理

**文件**: `src/route_export.dart`

```dart
import 'package:basic_modular/modular.dart';
import 'package:clr_carwatcher/clr_carwatcher.dart';
import 'package:ui_mapview/ui_mapview.dart';

import 'app_carwatcher_module.dart';
import 'pages/daily_report/daily_report_detail_page.dart';
import 'pages/event_detail/report_event_detail_page.dart';
import 'pages/event_filter/event_filter_page.dart';
import 'pages/geo_fence_detail/geo_fence_detail_page.dart';
import 'pages/geo_fence_list/geo_fence_list_page.dart';
import 'pages/geo_fence_search_poi/geo_fence_search_poi_page.dart';
import 'pages/home/car_watcher_home_page.dart';

/// app_carwatcher的路由管理
class AppCarwatcherRouteExport implements RouteExporter {
  // 路由常量定义
  static const String keyModule = 'app_carWatcher';
  static const String keyCarWatcherHomePage = 'app_carWatcher.carWatcher_home';
  static const String keyGeoFenceListPage = 'app_carWatcher.geoFenceList';
  static const String keyGeoFenceDetailPage = 'app_carWatcher.geoFenceDetail';
  static const String keyGeoFenceSearchPOIPage = 'app_carWatcher.poiSearch';
  static const String keyDailyReportPage = 'app_carWatcher.dailyReport';
  static const String keyEventFilterPage = 'app_carWatcher.eventFilter';
  static const String keyReportDetailPage = 'app_carWatcher.reportDetail';

  @override
  List<RouteMeta> exportRoutes() {
    final r0 = RouteMeta(keyModule, '/app_carWatcher', (args) => AppCarwatcherModule(), null);
    
    final r1 = RouteMeta(keyCarWatcherHomePage, '/carWatcher_home', 
        (args) => CarWatcherHomePage(args.data['vin'] as String), r0);
    
    final r2 = RouteMeta(keyGeoFenceListPage, '/geoFenceList', 
        (args) => GeoFenceListPage(args.data['vin'] as String), r0);
    
    final r3 = RouteMeta(keyGeoFenceDetailPage, '/geoFenceDetail', 
        (args) => GeoFenceDetailPage(
          args.data['vin'] as String,
          args.data['fenceId'] as String?,
          args.data['fenceOnCount'] as int,
        ), r0);
    
    final r4 = RouteMeta(keyGeoFenceSearchPOIPage, '/poiSearch', 
        (args) => GeoFenceSearchPOIPage(
          args.data['province'] as String?,
          args.data['city'] as String?,
          args.data['cityCode'] as String?,
          args.data['fenceLatLng'] as LatLng?,
        ), r0);
    
    final r5 = RouteMeta(keyDailyReportPage, '/dailyReport', 
        (args) => DailyReportDetailPage(
          args.data['vin'] as String,
          args.data['reportId'] as String,
        ), r0);
    
    final r6 = RouteMeta(keyEventFilterPage, '/eventFilter', 
        (args) => EventFilterPage(args.data['eventTypes'] as List<EEventType>?), r0);
    
    final r7 = RouteMeta(keyReportDetailPage, '/reportDetail', 
        (args) => ReportEventDetailPage(
          args.data['vin'] as String,
          args.data['eventId'] as String,
        ), r0);

    return [r0, r1, r2, r3, r4, r5, r6, r7];
  }
}
```

## 核心页面功能

### 1. 车辆监控首页

**文件**: `pages/home/car_watcher_home_page.dart`

```dart
import 'package:app_consent/app_consent.dart';
import 'package:basic_intl/intl.dart';
import 'package:basic_logger/basic_logger.dart';
import 'package:basic_modular/modular.dart';
import 'package:flutter/material.dart';
import 'package:ui_basic/pull_to_refresh.dart';
import 'package:ui_basic/screen_util.dart';
import 'package:ui_basic/ui_basic.dart';

/// CarWatcher首页
class CarWatcherHomePage extends StatefulWidget with RouteObjProvider {
  const CarWatcherHomePage(this.vin, {Key? key}) : super(key: key);

  /// 车辆vin码
  final String vin;

  @override
  State<StatefulWidget> createState() => _CarWatcherHomeState();
}

class _CarWatcherHomeState extends State<CarWatcherHomePage> {
  final CarWatcherHomeBloc _bloc = CarWatcherHomeBloc();
  late List<BannerBean> images = [];

  @override
  void initState() {
    super.initState();
    
    // 初始化banner数据
    images.add(BannerBean(
      imageUrl: 'packages/app_carwatcher/assets/images/icon_banner1.png',
      title: '车辆监控横幅1',
    ));
    
    images.add(BannerBean(
      imageUrl: 'packages/app_carwatcher/assets/images/icon_banner2.png', 
      title: '车辆监控横幅2',
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('车辆监控')),
      body: RefreshIndicator(
        onRefresh: () async {
          _bloc.add(RefreshDataEvent());
        },
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Banner轮播
              HomeBannerWidget(images: images),
              
              // 功能入口区域
              _buildFunctionEntries(),
              
              // 车辆状态信息
              _buildVehicleStatus(),
              
              // 最近事件列表
              _buildRecentEvents(),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildFunctionEntries() {
    return Container(
      padding: EdgeInsets.all(16),
      child: GridView.count(
        shrinkWrap: true,
        physics: NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        children: [
          _buildFunctionCard(
            icon: Icons.location_on,
            title: '地理围栏',
            onTap: () => _navigateToGeoFenceList(),
          ),
          _buildFunctionCard(
            icon: Icons.event_note,
            title: '历史报告',
            onTap: () => _navigateToDailyReport(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFunctionCard({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Colors.blue),
            SizedBox(height: 8),
            Text(title, style: TextStyle(fontSize: 16)),
          ],
        ),
      ),
    );
  }
  
  void _navigateToGeoFenceList() {
    Modular.to.pushNamed('/app_carWatcher/geoFenceList', arguments: {'vin': widget.vin});
  }
  
  void _navigateToDailyReport() {
    Modular.to.pushNamed('/app_carWatcher/dailyReport', arguments: {'vin': widget.vin});
  }
}
```

### 2. 地理围栏功能

#### 围栏列表页面
```dart
/// 地理围栏列表页面
class GeoFenceListPage extends StatefulWidget {
  const GeoFenceListPage(this.vin, {Key? key}) : super(key: key);
  
  final String vin;
  
  @override
  State<GeoFenceListPage> createState() => _GeoFenceListPageState();
}

class _GeoFenceListPageState extends State<GeoFenceListPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('地理围栏'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => _navigateToCreateFence(),
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: fenceList.length,
        itemBuilder: (context, index) {
          final fence = fenceList[index];
          return ListTile(
            title: Text(fence.name),
            subtitle: Text(fence.address),
            trailing: Switch(
              value: fence.isEnabled,
              onChanged: (value) => _toggleFence(fence, value),
            ),
            onTap: () => _navigateToFenceDetail(fence),
          );
        },
      ),
    );
  }
  
  void _navigateToCreateFence() {
    Modular.to.pushNamed('/app_carWatcher/geoFenceDetail', arguments: {
      'vin': widget.vin,
      'fenceId': null,
      'fenceOnCount': 0,
    });
  }
}
```

#### 围栏详情页面
```dart
/// 地理围栏详情页面
class GeoFenceDetailPage extends StatefulWidget {
  const GeoFenceDetailPage(this.vin, this.fenceId, this.fenceOnCount, {Key? key}) 
      : super(key: key);
  
  final String vin;
  final String? fenceId;
  final int fenceOnCount;
  
  @override
  State<GeoFenceDetailPage> createState() => _GeoFenceDetailPageState();
}

class _GeoFenceDetailPageState extends State<GeoFenceDetailPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.fenceId == null ? '新建围栏' : '编辑围栏'),
        actions: [
          TextButton(
            onPressed: _saveFence,
            child: Text('保存'),
          ),
        ],
      ),
      body: Column(
        children: [
          // 地图显示区域
          Expanded(
            flex: 2,
            child: Container(
              color: Colors.grey[300],
              child: Center(child: Text('地图显示区域')),
            ),
          ),
          
          // 设置区域
          Expanded(
            flex: 1,
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    decoration: InputDecoration(
                      labelText: '围栏名称',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  SizedBox(height: 16),
                  Row(
                    children: [
                      Text('半径(米): '),
                      Expanded(
                        child: Slider(
                          min: 100,
                          max: 5000,
                          value: 500,
                          onChanged: (value) {},
                        ),
                      ),
                      Text('500'),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  void _saveFence() {
    // 保存围栏逻辑
    Navigator.of(context).pop();
  }
}
```

### 3. POI搜索功能

```dart
/// POI搜索页面
class GeoFenceSearchPOIPage extends StatefulWidget {
  const GeoFenceSearchPOIPage(
    this.province,
    this.city,
    this.cityCode,
    this.fenceLatLng, {
    Key? key,
  }) : super(key: key);
  
  final String? province;
  final String? city;
  final String? cityCode;
  final LatLng? fenceLatLng;
  
  @override
  State<GeoFenceSearchPOIPage> createState() => _GeoFenceSearchPOIPageState();
}

class _GeoFenceSearchPOIPageState extends State<GeoFenceSearchPOIPage> {
  final TextEditingController _searchController = TextEditingController();
  List<POIItem> _searchResults = [];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: '搜索地点',
            border: InputBorder.none,
            suffixIcon: IconButton(
              icon: Icon(Icons.search),
              onPressed: _performSearch,
            ),
          ),
          onSubmitted: (_) => _performSearch(),
        ),
      ),
      body: ListView.builder(
        itemCount: _searchResults.length,
        itemBuilder: (context, index) {
          final poi = _searchResults[index];
          return ListTile(
            title: Text(poi.name),
            subtitle: Text(poi.address),
            onTap: () => _selectPOI(poi),
          );
        },
      ),
    );
  }
  
  void _performSearch() {
    // 执行POI搜索
    setState(() {
      _searchResults = [
        // 模拟搜索结果
        POIItem(name: '示例地点1', address: '示例地址1'),
        POIItem(name: '示例地点2', address: '示例地址2'),
      ];
    });
  }
  
  void _selectPOI(POIItem poi) {
    Navigator.of(context).pop(poi);
  }
}

class POIItem {
  final String name;
  final String address;
  
  POIItem({required this.name, required this.address});
}
```

## 状态管理

### BLoC状态管理模式
```dart
// CarWatcher首页状态管理
class CarWatcherHomeBloc extends Bloc<CarWatcherHomeEvent, CarWatcherHomeState> {
  CarWatcherHomeBloc() : super(CarWatcherHomeInitial()) {
    on<LoadDataEvent>(_onLoadData);
    on<RefreshDataEvent>(_onRefreshData);
  }
  
  Future<void> _onLoadData(LoadDataEvent event, Emitter<CarWatcherHomeState> emit) async {
    emit(CarWatcherHomeLoading());
    
    try {
      // 加载车辆数据
      final vehicleData = await loadVehicleData(event.vin);
      emit(CarWatcherHomeLoaded(vehicleData));
    } catch (e) {
      emit(CarWatcherHomeError(e.toString()));
    }
  }
  
  Future<void> _onRefreshData(RefreshDataEvent event, Emitter<CarWatcherHomeState> emit) async {
    // 刷新数据逻辑
  }
}

// 事件定义
abstract class CarWatcherHomeEvent {}

class LoadDataEvent extends CarWatcherHomeEvent {
  final String vin;
  LoadDataEvent(this.vin);
}

class RefreshDataEvent extends CarWatcherHomeEvent {}

// 状态定义
abstract class CarWatcherHomeState {}

class CarWatcherHomeInitial extends CarWatcherHomeState {}

class CarWatcherHomeLoading extends CarWatcherHomeState {}

class CarWatcherHomeLoaded extends CarWatcherHomeState {
  final VehicleData data;
  CarWatcherHomeLoaded(this.data);
}

class CarWatcherHomeError extends CarWatcherHomeState {
  final String message;
  CarWatcherHomeError(this.message);
}
```

## 依赖管理

### 核心依赖
- **clr_carwatcher**: 车辆监控服务SDK
- **ui_mapview**: 地图视图组件
- **app_consent**: 用户授权管理

### 框架依赖
- **basic_modular**: 模块化框架
- **basic_modular_route**: 路由管理
- **basic_intl**: 国际化支持
- **basic_logger**: 日志服务

### UI 组件依赖
- **ui_basic**: 基础UI组件
- **flutter/material**: Material Design组件

## 最佳实践

### 1. 代码组织
- 按功能模块组织页面和组件
- 统一的路由管理和导航
- 清晰的状态管理模式

### 2. 用户体验
- 响应式设计适配不同屏幕
- 友好的加载和错误提示
- 流畅的页面转场

### 3. 性能优化
- 合理的状态管理避免不必要的重建
- 地图资源的合理加载和释放
- 网络请求的优化和缓存
