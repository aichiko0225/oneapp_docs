# App Charging - 充电管理模块文档

## 模块概述

`app_charging` 是 OneApp 的充电管理核心模块，提供完整的电动车充电功能，包括充电地图、充电站查找、订单管理、支付结算等全流程充电服务。该模块集成了高德地图服务、BLoC状态管理、路由导航等，为用户提供便捷的充电体验。

### 基本信息
- **模块名称**: app_charging  
- **路径**: oneapp_app_car/app_charging/
- **依赖**: car_services, car_vehicle, clr_charging, basic_modular
- **主要功能**: 充电地图、充电站搜索、订单管理、智能寻桩

## 目录结构

```
app_charging/
├── lib/
│   ├── app_charging.dart         # 主导出文件
│   ├── generated/                # 代码生成文件
│   ├── l10n/                     # 国际化文件
│   └── src/                      # 源代码目录
│       ├── app_charging_module.dart # 充电模块配置
│       ├── blocs/                # 状态管理（BLoC）
│       ├── carfinder/            # 车辆查找功能
│       ├── constants/            # 常量定义
│       ├── pages/                # 页面组件
│       │   └── public_charging/  # 公共充电页面
│       │       ├── charging_map_home_page/      # 充电地图首页
│       │       ├── charging_station_detail_page/ # 充电站详情
│       │       ├── charging_query_order_list_page/ # 订单列表
│       │       ├── charging_report_page/          # 充电报告
│       │       ├── charging_smart_pile_finding_page/ # 智能寻桩
│       │       └── ...           # 其他充电功能页面
│       ├── utils/                # 工具类
│       ├── route_dp.dart         # 路由配置
│       ├── route_export.dart     # 路由导出
│       └── switch_vehicle.dart   # 车辆切换功能
├── assets/                       # 静态资源
└── README.md                     # 项目说明
```

# App Charging - 充电管理模块文档

## 模块概述

`app_charging` 是 OneApp 的充电管理核心模块，提供完整的电动车充电功能，包括充电地图、充电站查找、订单管理、支付结算等全流程充电服务。该模块集成了高德地图服务、BLoC状态管理、路由导航等，为用户提供便捷的充电体验。

### 基本信息
- **模块名称**: app_charging  
- **路径**: oneapp_app_car/app_charging/
- **依赖**: car_services, car_vehicle, clr_charging, basic_modular
- **主要功能**: 充电地图、充电站搜索、订单管理、智能寻桩

## 目录结构

```
app_charging/
├── lib/
│   ├── app_charging.dart         # 主导出文件
│   ├── generated/                # 代码生成文件
│   ├── l10n/                     # 国际化文件
│   └── src/                      # 源代码目录
│       ├── app_charging_module.dart # 充电模块配置
│       ├── blocs/                # 状态管理（BLoC）
│       ├── carfinder/            # 车辆查找功能
│       ├── constants/            # 常量定义
│       ├── pages/                # 页面组件
│       │   └── public_charging/  # 公共充电页面
│       │       ├── charging_map_home_page/      # 充电地图首页
│       │       ├── charging_station_detail_page/ # 充电站详情
│       │       ├── charging_query_order_list_page/ # 订单列表
│       │       ├── charging_report_page/          # 充电报告
│       │       ├── charging_smart_pile_finding_page/ # 智能寻桩
│       │       ├── charging_coupon_page/          # 充电优惠券
│       │       ├── charging_power_monitor_page/   # 功率监控
│       │       └── ...           # 其他充电功能页面
│       ├── utils/                # 工具类
│       ├── route_dp.dart         # 路由配置
│       ├── route_export.dart     # 路由导出
│       └── switch_vehicle.dart   # 车辆切换功能
├── assets/                       # 静态资源
└── README.md                     # 项目说明
```

## 核心实现

### 1. 模块主导出文件

**文件**: `lib/app_charging.dart`

```dart
/// charging pages
library app_charging;

export 'package:car_services/services.dart';
export 'package:car_vehicle/vehicle.dart';

export 'src/app_charging_module.dart';
export 'src/pages/public_charging/charging_map_card/charging_map_card.dart';
export 'src/pages/public_charging/charging_map_home_page/charging_map_home_page.dart';
export 'src/pages/public_charging/charging_query_order_list_page/charging_query_order_list_page.dart';

// 路由键导出
export 'src/route_dp.dart' show ChargingReservationRouteKey;
export 'src/route_dp.dart' show CarChargingCouponRouteKey;
export 'src/route_dp.dart' show ChargingCpoCollectionRouteKey;
export 'src/route_dp.dart' show ChargingDetectiveRouteKey;
export 'src/route_dp.dart' show ChargingMapHomeNonOwnerRouteKey;
export 'src/route_dp.dart' show ChargingMapHomeRouteKey;
export 'src/route_dp.dart' show ChargingPowerMonitorResultRouteKey;
export 'src/route_dp.dart' show ChargingPowerMonitorRouteKey;
export 'src/route_dp.dart' show ChargingPrePaySettingRouteKey;
export 'src/route_dp.dart' show ChargingQueryOrderDetailRouteKey;
export 'src/route_dp.dart' show ChargingQueryOrderListRouteKey;
export 'src/route_dp.dart' show ChargingQueryRatingRouteKey;
export 'src/route_dp.dart' show ChargingReportRouteKey;
export 'src/route_dp.dart' show ChargingSmartPileFindingRouteKey;
export 'src/route_dp.dart' show ChargingStationDetailRouteKey;
export 'src/route_dp.dart' show ChargingStationGuideRouteKey;
export 'src/route_dp.dart' show ChargingVehicleReportRouteKey;
export 'src/route_export.dart';
```

### 2. 模块定义与依赖管理

**文件**: `src/app_charging_module.dart`

```dart
import 'package:basic_logger/basic_logger.dart';
import 'package:basic_modular/modular.dart';
import 'package:basic_modular_route/basic_modular_route.dart';
import 'package:clr_account/account.dart';
import 'package:clr_charging/clr_charging.dart';
import 'package:ui_basic/ui_basic.dart';

import 'constants/module_constant.dart';
import 'route_export.dart';

/// 充电模块定义
class AppChargingModule extends Module with RouteObjProvider, AppLifeCycleListener {
  @override
  List<Bind<Object>> get binds => [];

  @override
  List<Module> get imports => [AccountConModule(), ClrChargingModule()];

  @override
  List<ModularRoute> get routes {
    // 模块首页
    final moduleHome = RouteCenterAPI.routeMetaBy(AppChargingRouteExport.keyModule);
    
    // 充电地图首页
    final chargingMapHome = RouteCenterAPI.routeMetaBy(AppChargingRouteExport.keyChargingMapHome);
    
    // 搜索首页
    final searchHome = RouteCenterAPI.routeMetaBy(AppChargingRouteExport.keySearchHome);
    
    // CPO收藏页面
    final cpoCollection = RouteCenterAPI.routeMetaBy(AppChargingRouteExport.keyChargingCpoCollection);
    
    // 充电站详情页面
    final stationDetailPage = RouteCenterAPI.routeMetaBy(AppChargingRouteExport.keyStationDetailPage);
    
    // 电价页面
    final electricPricePage = RouteCenterAPI.routeMetaBy(AppChargingRouteExport.keyStationElectricPricePage);
    
    return [
      ChildRoute<dynamic>(moduleHome.path, child: (_, args) => moduleHome.provider(args).as()),
      ChildRoute<dynamic>(chargingMapHome.path, child: (_, args) => chargingMapHome.provider(args).as()),
      ChildRoute<dynamic>(searchHome.path, child: (_, args) => searchHome.provider(args).as()),
      ChildRoute<dynamic>(cpoCollection.path, child: (_, args) => cpoCollection.provider(args).as()),
      ChildRoute<dynamic>(stationDetailPage.path, child: (_, args) => stationDetailPage.provider(args).as()),
      ChildRoute<dynamic>(electricPricePage.path, child: (_, args) => electricPricePage.provider(args).as()),
      // 更多路由配置...
    ];
  }
}
```

### 3. 路由导出管理

**文件**: `src/route_export.dart`

```dart
import 'dart:convert';

import 'package:amap_flutter_base/amap_flutter_base.dart';
import 'package:basic_logger/basic_logger.dart';
import 'package:basic_modular/modular.dart';
import 'package:clr_charging/clr_charging.dart';
import 'package:clr_geo/clr_geo.dart';

import 'app_charging_module.dart';
import 'pages/public_charging/charging_map_home_page/charging_map_home_page.dart';
import 'pages/public_charging/charging_station_detail_page/charging_station_detail_page.dart';
import 'pages/public_charging/charging_query_order_list_page/charging_query_order_list_page.dart';
import 'pages/public_charging/charging_smart_pile_finding_page/charging_smart_pile_finding_page.dart';
// ... 更多页面导入

/// app_charging的路由管理
class AppChargingRouteExport implements RouteExporter {
  // 路由键常量定义
  static const String keyModule = 'charging';
  static const String keyChargingMapHome = 'charging.map_home';
  static const String keySearchHome = 'charging.search_home';
  static const String keyChargingCpoCollection = 'charging.cpo_collection';
  static const String keyStationDetailPage = 'charging.station_detail';
  static const String keyStationElectricPricePage = 'charging.electric_price';
  static const String keyQueryOrderListPage = 'charging.order_list';
  static const String keySmartPileFinding = 'charging.smart_pile_finding';
  static const String keyChargingReport = 'charging.report';
  static const String keyPowerMonitor = 'charging.power_monitor';
  // ... 更多路由键定义

  @override
  List<RouteMeta> exportRoutes() {
    // 模块根路由
    final r0 = RouteMeta(keyModule, '/charging', (args) => AppChargingModule(), null);
    
    // 充电地图首页
    final r1 = RouteMeta(
      keyChargingMapHome,
      '/map_home',
      (args) => ChargingMapHomePage(args.data['vin'] as String?),
      r0,
    );
    
    // 充电站详情页面
    final r2 = RouteMeta(
      keyStationDetailPage,
      '/station_detail',
      (args) => ChargingStationDetailPage(
        stationID: args.data['stationID'] as String,
        chargingVin: args.data['chargingVin'] as String?,
      ),
      r0,
    );
    
    // 智能寻桩页面
    final r3 = RouteMeta(
      keySmartPileFinding,
      '/smart_pile_finding',
      (args) => ChargingSmartPileFindingPage(
        vin: args.data['vin'] as String,
      ),
      r0,
    );
    
    // 订单列表页面
    final r4 = RouteMeta(
      keyQueryOrderListPage,
      '/order_list',
      (args) => ChargingQueryOrderListPage(
        vin: args.data['vin'] as String,
      ),
      r0,
    );
    
    return [r0, r1, r2, r3, r4];
  }
}
```

## 核心功能模块

### 1. 充电地图首页

**文件**: `pages/public_charging/charging_map_home_page/charging_map_home_page.dart`

```dart
import 'package:flutter/material.dart';
import 'package:amap_flutter_map/amap_flutter_map.dart';
import 'package:basic_modular/modular.dart';

/// 充电地图首页
class ChargingMapHomePage extends StatefulWidget {
  const ChargingMapHomePage(this.vin, {Key? key}) : super(key: key);
  
  final String? vin;

  @override
  State<ChargingMapHomePage> createState() => _ChargingMapHomePageState();
}

class _ChargingMapHomePageState extends State<ChargingMapHomePage> {
  AMapController? _mapController;
  List<ChargingStation> _chargingStations = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('充电地图'),
        actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: _openSearch,
          ),
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: _openFilter,
          ),
        ],
      ),
      body: Stack(
        children: [
          // 地图组件
          AMapWidget(
            onMapCreated: _onMapCreated,
            markers: Set<Marker>.from(_buildMarkers()),
          ),
          
          // 功能按钮区域
          Positioned(
            bottom: 100,
            right: 16,
            child: Column(
              children: [
                FloatingActionButton(
                  heroTag: "locate",
                  onPressed: _locateUser,
                  child: Icon(Icons.my_location),
                ),
                SizedBox(height: 10),
                FloatingActionButton(
                  heroTag: "smart_find",
                  onPressed: _smartPileFinding,
                  child: Icon(Icons.electric_bolt),
                ),
              ],
            ),
          ),
          
          // 底部信息卡片
          _buildBottomSheet(),
        ],
      ),
    );
  }
  
  void _onMapCreated(AMapController controller) {
    _mapController = controller;
    _loadChargingStations();
  }
  
  List<Marker> _buildMarkers() {
    return _chargingStations.map((station) {
      return Marker(
        markerId: MarkerId(station.id),
        position: LatLng(station.latitude, station.longitude),
        infoWindow: InfoWindow(title: station.name),
        onTap: () => _showStationDetail(station),
      );
    }).toList();
  }
  
  void _loadChargingStations() {
    // 加载充电站数据
  }
  
  void _openSearch() {
    Modular.to.pushNamed('/charging/search_home');
  }
  
  void _openFilter() {
    Modular.to.pushNamed('/charging/filter');
  }
  
  void _locateUser() {
    // 定位到用户位置
  }
  
  void _smartPileFinding() {
    if (widget.vin != null) {
      Modular.to.pushNamed('/charging/smart_pile_finding', arguments: {
        'vin': widget.vin,
      });
    }
  }
  
  void _showStationDetail(ChargingStation station) {
    Modular.to.pushNamed('/charging/station_detail', arguments: {
      'stationID': station.id,
      'chargingVin': widget.vin,
    });
  }
  
  Widget _buildBottomSheet() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        height: 80,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildBottomAction(Icons.list, '订单', _openOrderList),
            _buildBottomAction(Icons.assessment, '报告', _openReport),
            _buildBottomAction(Icons.settings, '设置', _openSettings),
          ],
        ),
      ),
    );
  }
  
  Widget _buildBottomAction(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.blue),
          SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
  
  void _openOrderList() {
    if (widget.vin != null) {
      Modular.to.pushNamed('/charging/order_list', arguments: {
        'vin': widget.vin,
      });
    }
  }
  
  void _openReport() {
    if (widget.vin != null) {
      Modular.to.pushNamed('/charging/report', arguments: {
        'vin': widget.vin,
      });
    }
  }
  
  void _openSettings() {
    Modular.to.pushNamed('/charging/settings');
  }
}

// 充电站数据模型
class ChargingStation {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final int totalPiles;
  final int availablePiles;
  
  ChargingStation({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.totalPiles,
    required this.availablePiles,
  });
}
```

### 2. 充电站详情页面

```dart
/// 充电站详情页面
class ChargingStationDetailPage extends StatefulWidget {
  const ChargingStationDetailPage({
    Key? key,
    required this.stationID,
    this.chargingVin,
  }) : super(key: key);
  
  final String stationID;
  final String? chargingVin;

  @override
  State<ChargingStationDetailPage> createState() => _ChargingStationDetailPageState();
}

class _ChargingStationDetailPageState extends State<ChargingStationDetailPage> {
  ChargingStationDetail? _stationDetail;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStationDetail();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('充电站详情')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_stationDetail == null) {
      return Scaffold(
        appBar: AppBar(title: Text('充电站详情')),
        body: Center(child: Text('加载失败')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_stationDetail!.name),
        actions: [
          IconButton(
            icon: Icon(Icons.share),
            onPressed: _shareStation,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 充电站基本信息
            _buildStationInfo(),
            
            // 充电桩列表
            _buildChargingPilesList(),
            
            // 服务设施
            _buildFacilities(),
            
            // 电价信息
            _buildPriceInfo(),
            
            // 评价与评论
            _buildRatingsSection(),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: _navigateToStation,
                child: Text('导航'),
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: _bookChargingPile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                ),
                child: Text('预约充电'),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStationInfo() {
    return Container(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_stationDetail!.name, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Text(_stationDetail!.address, style: TextStyle(color: Colors.grey[600])),
          SizedBox(height: 16),
          Row(
            children: [
              _buildInfoChip('总桩数', '${_stationDetail!.totalPiles}'),
              SizedBox(width: 16),
              _buildInfoChip('可用桩数', '${_stationDetail!.availablePiles}'),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildInfoChip(String label, String value) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text('$label: $value', style: TextStyle(color: Colors.blue)),
    );
  }
  
  void _loadStationDetail() {
    // 加载充电站详情数据
    Future.delayed(Duration(seconds: 1), () {
      setState(() {
        _stationDetail = ChargingStationDetail(
          id: widget.stationID,
          name: '示例充电站',
          address: '示例地址',
          totalPiles: 10,
          availablePiles: 6,
        );
        _isLoading = false;
      });
    });
  }
  
  void _navigateToStation() {
    Modular.to.pushNamed('/charging/station_guide', arguments: {
      'stationID': widget.stationID,
    });
  }
  
  void _bookChargingPile() {
    Modular.to.pushNamed('/charging/reservation', arguments: {
      'stationID': widget.stationID,
      'vin': widget.chargingVin,
    });
  }
}

// 充电站详情数据模型
class ChargingStationDetail {
  final String id;
  final String name;
  final String address;
  final int totalPiles;
  final int availablePiles;
  
  ChargingStationDetail({
    required this.id,
    required this.name,
    required this.address,
    required this.totalPiles,
    required this.availablePiles,
  });
}
```

### 3. 智能寻桩页面

```dart
/// 智能寻桩页面
class ChargingSmartPileFindingPage extends StatefulWidget {
  const ChargingSmartPileFindingPage({
    Key? key,
    required this.vin,
  }) : super(key: key);
  
  final String vin;

  @override
  State<ChargingSmartPileFindingPage> createState() => _ChargingSmartPileFindingPageState();
}

class _ChargingSmartPileFindingPageState extends State<ChargingSmartPileFindingPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('智能寻桩')),
      body: Column(
        children: [
          // 车辆信息卡片
          _buildVehicleInfoCard(),
          
          // 推荐充电站列表
          Expanded(
            child: ListView.builder(
              itemCount: _recommendedStations.length,
              itemBuilder: (context, index) {
                final station = _recommendedStations[index];
                return _buildStationRecommendCard(station);
              },
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildVehicleInfoCard() {
    return Container(
      margin: EdgeInsets.all(16),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('当前车辆', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Text('VIN: ${widget.vin}'),
          Text('当前电量: 30%'),
          Text('续航里程: 120km'),
        ],
      ),
    );
  }
  
  Widget _buildStationRecommendCard(RecommendedStation station) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        child: ListTile(
          title: Text(station.name),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('距离: ${station.distance}km'),
              Text('可用桩数: ${station.availablePiles}'),
              Text('预计费用: ¥${station.estimatedCost}'),
            ],
          ),
          trailing: ElevatedButton(
            onPressed: () => _selectStation(station),
            child: Text('选择'),
          ),
        ),
      ),
    );
  }
  
  void _selectStation(RecommendedStation station) {
    Modular.to.pushNamed('/charging/station_detail', arguments: {
      'stationID': station.id,
      'chargingVin': widget.vin,
    });
  }
}

// 推荐充电站数据模型
class RecommendedStation {
  final String id;
  final String name;
  final double distance;
  final int availablePiles;
  final double estimatedCost;
  
  RecommendedStation({
    required this.id,
    required this.name,
    required this.distance,
    required this.availablePiles,
    required this.estimatedCost,
  });
}
```

## 状态管理 (BLoC)

### 充电地图状态管理
```dart
// 充电地图状态管理
class ChargingMapHomeBloc extends Bloc<ChargingMapHomeEvent, ChargingMapHomeState> {
  final ChargingService _chargingService;
  
  ChargingMapHomeBloc(this._chargingService) : super(ChargingMapHomeInitial()) {
    on<LoadChargingStationsEvent>(_onLoadChargingStations);
    on<FilterStationsEvent>(_onFilterStations);
    on<SearchStationsEvent>(_onSearchStations);
  }
  
  Future<void> _onLoadChargingStations(
    LoadChargingStationsEvent event,
    Emitter<ChargingMapHomeState> emit,
  ) async {
    emit(ChargingMapHomeLoading());
    
    try {
      final stations = await _chargingService.getNearbyStations(
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
      );
      
      emit(ChargingMapHomeLoaded(stations));
    } catch (e) {
      emit(ChargingMapHomeError(e.toString()));
    }
  }
  
  Future<void> _onFilterStations(
    FilterStationsEvent event,
    Emitter<ChargingMapHomeState> emit,
  ) async {
    if (state is ChargingMapHomeLoaded) {
      final currentState = state as ChargingMapHomeLoaded;
      final filteredStations = _applyFilter(currentState.stations, event.filter);
      emit(ChargingMapHomeLoaded(filteredStations));
    }
  }
  
  List<ChargingStation> _applyFilter(List<ChargingStation> stations, StationFilter filter) {
    return stations.where((station) {
      if (filter.onlyAvailable && station.availablePiles == 0) return false;
      if (filter.maxDistance != null && station.distance > filter.maxDistance!) return false;
      return true;
    }).toList();
  }
}

// 事件定义
abstract class ChargingMapHomeEvent {}

class LoadChargingStationsEvent extends ChargingMapHomeEvent {
  final double latitude;
  final double longitude;
  final double radius;
  
  LoadChargingStationsEvent(this.latitude, this.longitude, this.radius);
}

class FilterStationsEvent extends ChargingMapHomeEvent {
  final StationFilter filter;
  FilterStationsEvent(this.filter);
}

// 状态定义
abstract class ChargingMapHomeState {}

class ChargingMapHomeInitial extends ChargingMapHomeState {}

class ChargingMapHomeLoading extends ChargingMapHomeState {}

class ChargingMapHomeLoaded extends ChargingMapHomeState {
  final List<ChargingStation> stations;
  ChargingMapHomeLoaded(this.stations);
}

class ChargingMapHomeError extends ChargingMapHomeState {
  final String message;
  ChargingMapHomeError(this.message);
}

// 过滤器模型
class StationFilter {
  final bool onlyAvailable;
  final double? maxDistance;
  final List<String>? supportedConnectors;
  
  StationFilter({
    this.onlyAvailable = false,
    this.maxDistance,
    this.supportedConnectors,
  });
}
```

## 依赖管理

### 核心依赖
- **clr_charging**: 充电服务SDK
- **car_services**: 车辆服务
- **car_vehicle**: 车辆管理
- **amap_flutter_map**: 高德地图

### 框架依赖
- **basic_modular**: 模块化框架  
- **basic_modular_route**: 路由管理
- **basic_logger**: 日志服务
- **ui_basic**: 基础UI组件

### 账户与支付
- **clr_account**: 账户管理
- **clr_geo**: 地理位置服务

## 最佳实践

### 1. 代码组织
- 按业务功能模块化组织
- 统一的路由管理和页面导航
- 清晰的状态管理模式

### 2. 用户体验
- 地图加载优化和缓存策略
- 实时充电桩状态更新
- 智能推荐算法

### 3. 性能优化
- 地图资源合理加载释放
- 充电站数据分页加载
- 网络请求优化和重试机制
