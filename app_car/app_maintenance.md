# App Maintenance - 维护保养模块文档

## 模块概述

`app_maintenance` 是 OneApp 车辆模块群中的维护保养核心模块，提供车辆保养预约管理、经销商选择、时间预约、历史记录查询等功能。该模块集成了地图服务、经销商查询、预约管理等，为用户提供完整的车辆维护保养预约体验。

### 基本信息
- **模块名称**: app_maintenance
- **路径**: oneapp_app_car/app_maintenance/
- **依赖**: clr_maintenance, basic_modular, basic_modular_route
- **主要功能**: 维保预约、经销商选择、时间管理、历史记录

## 目录结构

```
app_maintenance/
├── lib/
│   ├── app_maintenance.dart      # 主导出文件
│   └── src/                      # 源代码目录
│       ├── pages/                # 维护保养页面
│       │   ├── maintenance_home_page/        # 维保信息首页
│       │   ├── appointment_create_page/      # 创建预约页面
│       │   ├── appointment_detail_page/      # 预约详情页面
│       │   ├── appointment_history_page/     # 预约历史页面
│       │   ├── dealer_select_page/           # 经销商选择页面
│       │   ├── time_select_page/             # 时间选择页面
│       │   └── carPlate_binding_page/        # 车牌绑定页面
│       ├── blocs/                # 状态管理（BLoC）
│       ├── model/                # 数据模型
│       ├── constants/            # 常量定义
│       ├── route_dp.dart         # 路由配置
│       └── route_export.dart     # 路由导出
├── assets/                       # 静态资源
├── uml.puml/svg                  # UML 设计图
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 主控制模块

```dart
library app_maintenance;

import 'package:basic_logger/basic_logger.dart';
import 'package:basic_modular/modular.dart';
import 'package:basic_modular_route/basic_modular_route.dart';

import 'src/route_export.dart';

export 'src/route_dp.dart';
export 'src/route_export.dart';

/// 维护保养控制模块
class MaintenanceControlModule extends Module with RouteObjProvider {
  @override
  List<ModularRoute> get routes {
    // 维保模块主页
    final RouteMeta maintenance =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keyModule);
    // 维保信息首页Route
    final RouteMeta maintenanceHome =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keyMaintenanceHome);
    // 预约详情页Route
    final RouteMeta appointmentDetail =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keyAppointmentDetail);
    // 绑定车牌页Route
    final RouteMeta bindingPlateNo =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keyBindingPlateNo);
    // 创建预约Route
    final RouteMeta createAppointment =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keyAppointmentCreate);
    // 经销商选择页Route
    final RouteMeta selectDealerList =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keySelectDealerList);
    // 选择时间页Route
    final RouteMeta selectTime =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keySelectTime);
    // 预约历史页Route
    final RouteMeta appointmentHistory = RouteCenterAPI.routeMetaBy(
      MaintenanceRouteExport.keyAppointmentHistory,
    );
    // 选择时间_更多页Route
    final RouteMeta selectTimeMore =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keySelectTimeMore);
    // 搜索经销商
    final RouteMeta searchDealerList =
        RouteCenterAPI.routeMetaBy(MaintenanceRouteExport.keySearchDealerList);

    return [
      // 维保模块主页
      ChildRoute<dynamic>(
        maintenance.path,
        child: (_, args) => maintenance.provider(args).as(),
      ),
      // 维保信息首页
      ChildRoute<dynamic>(
        maintenanceHome.path,
        child: (_, args) => maintenanceHome.provider(args).as(),
      ),
      // 维保详情页
      ChildRoute<dynamic>(
        appointmentDetail.path,
        child: (_, args) => appointmentDetail.provider(args).as(),
      ),
      // 车牌设置页
      ChildRoute<dynamic>(
        bindingPlateNo.path,
        child: (_, args) => bindingPlateNo.provider(args).as(),
      ),
      // 创建预约页
      ChildRoute<dynamic>(
        createAppointment.path,
        child: (_, args) => createAppointment.provider(args).as(),
      ),
      // 选择经销商页
      ChildRoute<dynamic>(
        selectDealerList.path,
        child: (_, args) => selectDealerList.provider(args).as(),
      ),
      // 选择时间页
      ChildRoute<dynamic>(
        selectTime.path,
        child: (_, args) => selectTime.provider(args).as(),
      ),
      // 预约历史页
      ChildRoute<dynamic>(
        appointmentHistory.path,
        child: (_, args) => appointmentHistory.provider(args).as(),
      ),
      // 选择时间_更多页
      ChildRoute<dynamic>(
        selectTimeMore.path,
        child: (_, args) => selectTimeMore.provider(args).as(),
      ),
      // 搜索经销商
      ChildRoute<dynamic>(
        searchDealerList.path,
        child: (_, args) => searchDealerList.provider(args).as(),
      ),
    ];
  }

  @override
  void dispose() {
    Logger.i('AppMaintenance dispose');
    super.dispose();
  }
}
```

### 2. 路由导出配置

实际的维保模块路由配置：

```dart
/// 维保页面路由
class MaintenanceRouteExport implements RouteExporter {
  /// 模块主页
  static const String keyModule = 'maintenance';
  /// 维保首页
  static const String keyMaintenanceHome = 'maintenance.home';
  /// 详情页
  static const String keyAppointmentDetail = 'maintenance.appointmentDetail';
  /// 绑定/修改车牌页
  static const String keyBindingPlateNo = 'maintenance.bindingPlateNo';
  /// 创建维修保养页
  static const String keyAppointmentCreate = 'maintenance.appointmentCreate';
  /// 选择经销商列表页
  static const String keySelectDealerList = 'maintenance.selectDealerList';
  /// 搜索经销商列表页
  static const String keySearchDealerList = 'maintenance.keySearchDealerList';
  /// 选择时间
  static const String keySelectTime = 'maintenance.selectTime';
  /// 选择时间更多
  static const String keySelectTimeMore = 'maintenance.selectTimeMore';
  /// 预约历史
  static const String keyAppointmentHistory = 'maintenance.appointmentHistory';

  @override
  List<RouteMeta> exportRoutes() {
    // 各种路由配置...包括维保首页、预约创建、经销商选择等
    return [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10];
  }
}
```

### 3. 维保信息首页

```dart
/// 维保信息页
class MaintenanceHomePage extends StatelessWidget with RouteObjProvider {
  /// 初始化
  /// [vin] 页面相关车辆vin码
  MaintenanceHomePage({
    required this.vin,
    Key? key,
  }) : super(key: key);

  /// vin null时请求会取默认车辆vin码
  String? vin;

  @override
  Widget build(BuildContext context) => BlocProvider(
        create: (context) =>
            MaintenanceHomeBloc()..add(const MaintenanceHomeEvent.init()),
        child: BlocConsumer<MaintenanceHomeBloc, MaintenanceHomeState>(
          builder: _buildLayout,
          listener: (context, state) {},
        ),
      );

  /// 标题栏
  CommonTitleBar titleBar(BuildContext context, MaintenanceHomeState state) =>
      CommonTitleBar(
        titleText: homePage_titleWidget_title,
        backgroundColor: OneColors.bgc,
        actions: [
          Container(
            color: OneColors.bgc,
            width: (16 * 2 + 20).w,
            child: Center(
              child: OneIcons.iconHistory(20.r),
            ),
          ).withOnTap(() async {
            Logger.i('点击预约历史');
            // 获取车牌
            String? plateNo;
            if (state.maintenanceDetailLast == null &&
                state.maintenanceInFoModel == null) {
              // 详情与最后一个预约记录全部为null
              plateNo = null;
            } else {
              // 预约详情车牌权重比最后一次高，因为用户可能会更新
              // 最后一个预约有车牌
              if (state.maintenanceDetailLast != null) {
                plateNo = state.maintenanceDetailLast?.plateNo;
              }
              // 预约详情有车牌
              if (state.maintenanceInFoModel != null) {
                plateNo = null;
                plateNo = state.maintenanceInFoModel?.vehicleHealth.plateNo;
              }
            }

            // 前往历史列表页面
            final res = await Modular.to.pushNamed(
              RouteCenterAPI.getRoutePathBy(
                const AppointmentHistoryPageRouteKey(),
              ),
              arguments: {
                // 当前是否存在预约
                'isExistAppointmen': state.isAppointment,
                // vin
                'vin': vin ??
                    Modular.get<IGarageFacade>().getDefaultVehicleVin() ??
                    '',
                // 车牌
                'plateNo': plateNo,
              },
            );
            // 预约历史页面返回刷新数据
            if (res is bool && res) {
              Logger.i('预约历史页面返回刷新数据');
              context
                  .read<MaintenanceHomeBloc>()
                  .add(const MaintenanceHomeEvent.init());
            }
          }),
        ],
      );
}
```

### 4. 主要功能页面

#### 4.1 预约创建页面
支持多种预约创建场景：
- **安装预约** (`isInstallAppointmen`) - 从安装服务跳转创建预约
- **创建预约** (`isCreateAppointmen`) - 普通维保预约创建
- **再次预约** (`isAgainAppointmen`) - 基于历史记录再次预约
- **修改预约** (`isAmendAppointmen`) - 修改现有预约信息

```dart
AppointmentCreatePage(
  vin: args.data['vin'] as String?,
  isCreateAppointmen: true,
  plateNo: args.data['plateNo'] as String?,
  detailModel: args.data['model'] as MaintenanceDetailModel?,
);
```

#### 4.2 经销商选择页面
- **经销商列表页** (`DealerSelectListPage`) - 显示附近经销商列表
- **经销商搜索页** (`DealerSearchListPage`) - 支持按地理位置搜索经销商

#### 4.3 时间选择页面
- **时间选择页** (`TimeSelectPage`) - 选择预约时间段
- **时间选择更多页** (`TimeSelectMorePage`) - 更多可选时间段展示

#### 4.4 预约管理页面
- **预约详情页** (`AppointmentDetailPage`) - 查看预约详细信息
- **预约历史页** (`AppointmentHistoryPage`) - 历史预约记录管理
- **车牌绑定页** (`LicensePlatePage`) - 车牌号码设置和修改

### 5. 核心功能特性

#### 5.1 预约流程管理
- 支持根据VIN码和车牌号创建预约
- 提供预约修改、再次预约等功能
- 集成经销商信息和时间选择功能
- 支持预约历史记录查询

#### 5.2 经销商服务
- 基于地理位置的经销商推荐
- 经销商详细信息展示（联系方式、地址等）
- 支持经销商搜索和筛选功能

#### 5.3 时间预约系统
- 经销商可用时间段查询
- 支持多时间段选择
- 提供更多时间选项扩展功能

```dart
// 导航到维保首页
Modular.to.pushNamed(
  RouteCenterAPI.getRoutePathBy(MaintenanceRouteExport.keyMaintenanceHome),
  arguments: {
    'vin': vehicleVin, // 车辆VIN码
  },
);

// 创建新预约
Modular.to.pushNamed(
  RouteCenterAPI.getRoutePathBy(MaintenanceRouteExport.keyAppointmentCreate),
  arguments: {
    'isCreateAppointmen': true,
    'vin': vehicleVin,
    'plateNo': plateNumber,
    'model': previousDetailModel, // 携带上一次预约信息
  },
);

// 修改现有预约
Modular.to.pushNamed(
  RouteCenterAPI.getRoutePathBy(MaintenanceRouteExport.keyAppointmentCreate),
  arguments: {
    'isAmendAppointmen': true,
    'plateNo': plateNumber,
    'model': currentDetailModel,
  },
);

// 查看预约详情
Modular.to.pushNamed(
  RouteCenterAPI.getRoutePathBy(MaintenanceRouteExport.keyAppointmentDetail),
  arguments: {
    'number': appointmentNumber,
    'vin': vehicleVin,
    'isExistAppointmen': true,
    'model': detailModel,
  },
);

// 选择经销商
Modular.to.pushNamed(
  RouteCenterAPI.getRoutePathBy(MaintenanceRouteExport.keySelectDealerList),
);

// 选择预约时间
Modular.to.pushNamed(
  RouteCenterAPI.getRoutePathBy(MaintenanceRouteExport.keySelectTime),
  arguments: {
    'dealerCode': selectedDealerCode,
  },
);

// 查看预约历史
Modular.to.pushNamed(
  RouteCenterAPI.getRoutePathBy(MaintenanceRouteExport.keyAppointmentHistory),
  arguments: {
    'tabKey': 'hasAppointment', // 或 'noAppointment'
    'plateNo': plateNumber,
  },
);

// 安装服务预约（deeplink支持）
// oneapp://dssomobile/launch?routePath=/maintenance/createAppointment&isInstallAppointmen=1&vin=$vin&dealer=$dealer&dealerCode=$dealerCode&dealerPhone=$dealerPhone
```

## 依赖关系

该模块依赖以下包：
- `clr_maintenance` - 维保业务逻辑核心
- `basic_modular` - 模块化架构支持
- `basic_modular_route` - 路由管理
- `basic_logger` - 日志记录
- `basic_intl` - 国际化支持
- `basic_track` - 埋点追踪
- `clr_account` - 账户管理
- `ui_basic` - 基础UI组件
- `app_car` - 车辆相关功能

## 总结

app_maintenance 模块是 OneApp 维保功能的核心实现，提供了完整的维保预约管理体验：

### 主要特性
1. **多场景预约支持** - 支持创建预约、修改预约、再次预约、安装服务预约等多种业务场景
2. **完整预约流程** - 从经销商选择到时间预约的完整用户体验
3. **历史记录管理** - 提供预约历史查询和管理功能
4. **车辆信息管理** - 支持车牌绑定和车辆信息管理
5. **地理位置集成** - 基于位置的经销商推荐和搜索功能

### 技术架构
- **BLoC状态管理** - 使用BLoC模式管理复杂的预约业务状态
- **模块化路由** - 采用基于路由中心的模块化架构设计
- **参数传递机制** - 灵活的路由参数传递支持各种业务场景
- **业务逻辑分离** - 依赖clr_maintenance提供核心业务逻辑

### 业务价值
该模块通过标准化的维保预约流程，为用户提供便捷的维保服务体验，同时支持经销商管理和时间调度等复杂业务需求。