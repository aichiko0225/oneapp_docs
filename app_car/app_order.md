# App Order - 订单管理模块文档

## 模块概述

`app_order` 是 OneApp 车辆模块群中的订单管理核心模块，提供完整的订单生命周期管理，包括订单详情查看、发票管理、退款处理、订单历史等功能。该模块与支付系统、账户系统深度集成，为用户提供统一的订单管理体验。

### 基本信息
- **模块名称**: app_order
- **路径**: oneapp_app_car/app_order/
- **依赖**: clr_order, basic_modular, basic_modular_route, ui_basic
- **主要功能**: 订单详情、发票管理、退款处理、订单中心

## 目录结构

```
app_order/
├── lib/
│   ├── app_order.dart            # 主导出文件
│   └── src/                      # 源代码目录
│       ├── pages/                # 订单页面
│       │   ├── order_center_page.dart        # 订单中心页面
│       │   ├── orderdetail/                  # 订单详情页面
│       │   ├── orderlist/                    # 订单列表页面
│       │   ├── invoice/                      # 发票相关页面
│       │   │   ├── invoiceChooseManagePage/  # 发票选择管理
│       │   │   ├── invoiceDetailsPage/       # 发票详情
│       │   │   ├── invoiceHistoryCenterPage/ # 发票历史
│       │   │   └── ...                       # 其他发票功能
│       │   └── refunddetail/                 # 退款详情页面
│       ├── bloc/                 # 状态管理（BLoC）
│       ├── models/               # 数据模型
│       ├── utils/                # 工具类
│       ├── constants/            # 常量定义
│       ├── order_module.dart     # 订单模块配置
│       ├── route_dp.dart         # 路由配置
│       └── route_export.dart     # 路由导出
├── assets/                       # 静态资源
├── uml.puml/png/svg             # UML 设计图
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 主导出模块

**文件**: `lib/app_order.dart`

```dart
library app_order;

// 页面导出
export 'src/pages/order_center_page.dart';
export 'src/pages/orderdetail/orderdetail_page.dart';
export 'src/pages/orderlist/orderlist_page.dart';
export 'src/pages/invoice/invoiceChooseManagePage/invoiceChooseManage_page.dart';
export 'src/pages/invoice/invoiceDetailsPage/invoiceDetails_page.dart';
export 'src/pages/invoice/invoiceHistoryCenterPage/invoiceHistoryCenter_page.dart';
export 'src/pages/refunddetail/refunddetail_page.dart';

// 模块配置导出
export 'src/order_module.dart';
export 'src/route_dp.dart';
export 'src/route_export.dart';
```

### 2. 订单模块配置

**文件**: `src/order_module.dart`

```dart
import 'package:basic_modular/basic_modular.dart';
import 'package:flutter/material.dart';
import 'route_dp.dart';

/// App Order 模块定义
class AppOrderModule extends Module {
  @override
  String get name => "app_order";

  @override
  List<Bind> get binds => [];

  @override
  List<ModularRoute> get routes => OrderRouteController.routes;
}
```

### 3. 路由导出管理

**文件**: `src/route_export.dart`

```dart
import 'package:basic_modular_route/basic_modular_route.dart';

class AppOrderRouteExport {
  /// 订单中心路径
  static const String orderCenter = "/order-center";
  
  /// 订单详情路径
  static const String orderDetail = "/order-detail";
  
  /// 订单列表路径
  static const String orderList = "/order-list";
  
  /// 发票管理路径
  static const String invoiceManage = "/invoice-manage";
  
  /// 发票详情路径
  static const String invoiceDetail = "/invoice-detail";
  
  /// 发票历史中心路径
  static const String invoiceHistoryCenter = "/invoice-history-center";
  
  /// 退款详情路径
  static const String refundDetail = "/refund-detail";

  /// 跳转到订单中心
  static Future<T?> gotoOrderCenter<T extends Object?>(
    ModularRouteInformation information,
  ) {
    return information.pushNamed<T>(orderCenter);
  }

  /// 跳转到订单详情
  static Future<T?> gotoOrderDetail<T extends Object?>(
    ModularRouteInformation information, {
    required String orderId,
  }) {
    return information.pushNamed<T>(
      orderDetail,
      arguments: {'orderId': orderId},
    );
  }

  /// 跳转到发票管理页面
  static Future<T?> gotoInvoiceManage<T extends Object?>(
    ModularRouteInformation information,
  ) {
    return information.pushNamed<T>(invoiceManage);
  }

  /// 跳转到发票详情页面
  static Future<T?> gotoInvoiceDetail<T extends Object?>(
    ModularRouteInformation information, {
    required String invoiceId,
  }) {
    return information.pushNamed<T>(
      invoiceDetail,
      arguments: {'invoiceId': invoiceId},
    );
  }

  /// 跳转到退款详情页面
  static Future<T?> gotoRefundDetail<T extends Object?>(
    ModularRouteInformation information, {
    required String refundId,
  }) {
    return information.pushNamed<T>(
      refundDetail,
      arguments: {'refundId': refundId},
    );
  }
}
```

### 4. 订单中心页面

**文件**: `src/pages/order_center_page.dart`

```dart
import 'package:flutter/material.dart';
import 'package:basic_modular_route/basic_modular_route.dart';
import 'package:ui_basic/ui_basic.dart';
import '../bloc/order_center_bloc.dart';

class OrderCenterPage extends StatefulWidget {
  @override
  _OrderCenterPageState createState() => _OrderCenterPageState();
}

class _OrderCenterPageState extends State<OrderCenterPage>
    with TickerProviderStateMixin {
  late TabController _tabController;
  int _currentIndex = 0;

  final List<String> _tabTitles = [
    '全部订单',
    '待付款',
    '已付款',
    '已完成',
    '已取消',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: _tabTitles.length,
      vsync: this,
    );
    
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {
          _currentIndex = _tabController.index;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('订单中心'),
        backgroundColor: Colors.white,
        elevation: 0.5,
        bottom: TabBar(
          controller: _tabController,
          tabs: _tabTitles.map((title) => Tab(text: title)).toList(),
          indicatorColor: Theme.of(context).primaryColor,
          labelColor: Theme.of(context).primaryColor,
          unselectedLabelColor: Colors.grey,
          isScrollable: false,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _tabTitles.map((title) => _buildOrderList(title)).toList(),
      ),
    );
  }

  Widget _buildOrderList(String tabTitle) {
    return Container(
      child: RefreshIndicator(
        onRefresh: () async {
          // 刷新订单列表
          await _refreshOrderList(tabTitle);
        },
        child: ListView.builder(
          padding: EdgeInsets.all(16),
          itemBuilder: (context, index) => _buildOrderCard(index),
          itemCount: 10, // 示例数量
        ),
      ),
    );
  }

  Widget _buildOrderCard(int index) {
    return Card(
      margin: EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '订单号：20231201${(index + 1000)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  '已付款',
                  style: TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              '服务内容：车辆充电服务',
              style: TextStyle(color: Colors.grey[600]),
            ),
            SizedBox(height: 4),
            Text(
              '金额：￥${(index * 50 + 100)}.00',
              style: TextStyle(
                color: Colors.red,
                fontWeight: FontWeight.w500,
                fontSize: 16,
              ),
            ),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '下单时间：2023-12-0${index % 9 + 1} 14:30',
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 12,
                  ),
                ),
                Row(
                  children: [
                    TextButton(
                      onPressed: () => _viewOrderDetail(index),
                      child: Text('查看详情'),
                    ),
                    TextButton(
                      onPressed: () => _manageInvoice(index),
                      child: Text('发票管理'),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _refreshOrderList(String tabTitle) async {
    // 模拟刷新延时
    await Future.delayed(Duration(seconds: 1));
  }

  void _viewOrderDetail(int index) {
    ModularRouteInformation.of(context).pushNamed('/order-detail',
        arguments: {'orderId': '20231201${(index + 1000)}'});
  }

  void _manageInvoice(int index) {
    ModularRouteInformation.of(context).pushNamed('/invoice-manage',
        arguments: {'orderId': '20231201${(index + 1000)}'});
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
```

### 5. 路由配置系统

**文件**: `src/route_dp.dart`

```dart
import 'package:basic_modular/modular.dart';
import 'route_export.dart';

/// 订单中心页面路由key
class OrderCenterRouteKey implements RouteKey {
  /// 默认构造器
  const OrderCenterRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyOrderCenter;
}

/// 订单详情页面路由key
class OrderDetailRouteKey implements RouteKey {
  /// 默认构造器
  const OrderDetailRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyOrderDetail;
}

/// 订单退款详情页面路由key
class RefundDetailRouteKey implements RouteKey {
  /// 默认构造器
  const RefundDetailRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyRefundDetail;
}

/// 发票抬头选择管理页路由key
class InvoiceTitleCMRouteKey implements RouteKey {
  /// 默认构造器
  const InvoiceTitleCMRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyInvoiceCM;
}

/// 开具发票抬头提交页/发票抬头详情页
class InvoiceTitleDetailsRouteKey implements RouteKey {
  /// 默认构造器
  const InvoiceTitleDetailsRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyInvoiceTitleDetails;
}

/// 发票历史
class InvoiceHistoryRouteKey implements RouteKey {
  /// 默认构造器
  const InvoiceHistoryRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyInvoiceHistory;
}

/// 发票详情页
class InvoiceDetailsRouteKey implements RouteKey {
  /// 默认构造器
  const InvoiceDetailsRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyInvoiceDetails;
}

/// 可开发票列表页
class OpenInvoiceOrderChooseRouteKey implements RouteKey {
  /// 默认构造器
  const OpenInvoiceOrderChooseRouteKey();

  @override
  String get routeKey => AppOrderRouteExport.keyOpneInvoiceOrderChoose;
}
```

## 实际项目集成

### 依赖配置

**文件**: `pubspec.yaml`

```yaml
name: app_order
description: OneApp 订单管理模块

dependencies:
  flutter:
    sdk: flutter
  
  # 基础依赖
  basic_modular:
    path: ../../oneapp_basic_utils/base_mvvm
  basic_modular_route:
    path: ../../oneapp_basic_utils/basic_modular_route
  ui_basic:
    path: ../../oneapp_basic_uis/ui_basic
  
  # 订单核心依赖
  clr_order:
    path: ../clr_order
    
  # 其他依赖
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  dio: ^5.3.2
  cached_network_image: ^3.3.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
```

### 模块集成流程

#### 1. 模块注册

在主应用中注册订单模块：

```dart
// main_app 集成代码
import 'package:app_order/app_order.dart';

void setupOrderModule() {
  // 注册订单模块
  Modular.bindModule(AppOrderModule());
  
  // 配置路由
  Get.routing.add(
    AppOrderRouteExport.keyOrderCenter,
    page: () => OrderCenterPage(),
    binding: OrderCenterBinding(),
  );
}
```

#### 2. 功能特性

- **多状态订单管理**: 支持待付款、已付款、已完成、已取消等多种状态
- **发票系统集成**: 完整的发票申请、管理、历史查看功能  
- **退款处理**: 订单退款申请和详情查看
- **实时状态更新**: TabController 实现的多 Tab 订单分类浏览
- **响应式设计**: 支持刷新和分页加载的订单列表
- **模块化架构**: 基于 basic_modular 的标准化模块设计

#### 3. 与其他模块的集成

```dart
// 与其他车辆服务模块的集成示例
class OrderIntegrationService {
  // 从充电模块创建订单
  Future<void> createChargingOrder(ChargingSession session) async {
    await AppOrderRouteExport.gotoOrderCenter(
      ModularRouteInformation.current(),
    );
  }
  
  // 从维保模块创建订单  
  Future<void> createMaintenanceOrder(MaintenanceAppointment appointment) async {
    await AppOrderRouteExport.gotoOrderDetail(
      ModularRouteInformation.current(),
      orderId: appointment.orderId,
    );
  }
}
```

## 技术架构与设计模式

### 1. 模块化架构

app_order 模块采用标准的 OneApp 模块化架构：

- **模块定义**: `AppOrderModule` 继承自 `basic_modular.Module`
- **路由管理**: 通过 `AppOrderRouteExport` 统一管理所有路由
- **依赖注入**: 使用 basic_modular 的依赖注入机制
- **状态管理**: 基于 BLoC 模式的响应式状态管理

### 2. 核心功能实现

#### 订单中心页面特性
- **TabController**: 5个标签页（全部、待付款、已付款、已完成、已取消）
- **响应式设计**: 支持下拉刷新的 RefreshIndicator
- **卡片列表**: 每个订单展示为 Card 组件
- **导航集成**: 与订单详情页和发票管理页面的路由跳转

#### 发票管理系统
- **发票选择管理**: `invoiceChooseManagePage`
- **发票详情页面**: `invoiceDetailsPage`  
- **发票历史中心**: `invoiceHistoryCenterPage`
- **发票抬头管理**: 支持个人和企业发票抬头

#### 退款处理流程
- **退款详情页**: `refunddetail_page.dart`
- **退款状态跟踪**: 支持退款进度查看
- **退款原因记录**: 详细的退款申请理由

### 3. 与其他模块集成

```dart
// 集成示例 - 从其他模块跳转到订单相关页面
class OrderNavigationHelper {
  // 从充电模块跳转到订单中心
  static void gotoOrderCenterFromCharging() {
    AppOrderRouteExport.gotoOrderCenter(
      ModularRouteInformation.current(),
    );
  }
  
  // 从维保模块跳转到具体订单详情
  static void gotoOrderDetailFromMaintenance(String orderId) {
    AppOrderRouteExport.gotoOrderDetail(
      ModularRouteInformation.current(),
      orderId: orderId,
    );
  }
}
```

## 最佳实践与规范

### 1. 代码组织
- 页面文件统一放在 `src/pages/` 目录
- 按功能模块分别组织（订单、发票、退款）
- 共享组件复用，减少代码重复

### 2. 状态管理
- 采用 BLoC 模式管理复杂状态
- TabController 管理标签页切换状态
- RefreshIndicator 处理列表刷新状态

### 3. 用户体验优化
- 支持下拉刷新和上拉加载
- 响应式布局适配不同屏幕尺寸
- 错误状态友好提示

### 4. 性能优化
- 列表项懒加载，避免一次性加载过多数据
- 图片缓存和占位符处理
- 合理的状态更新频率控制
