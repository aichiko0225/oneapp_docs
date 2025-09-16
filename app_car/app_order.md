# App Order - 订单管理模块文档

## 模块概述

`app_order` 是 OneApp 车辆模块群中的订单管理核心模块，提供完整的订单生命周期管理，包括订单创建、支付处理、状态跟踪、订单历史等功能。该模块与支付系统、账户系统深度集成，为用户提供统一的订单管理体验。

### 基本信息
- **模块名称**: app_order
- **版本**: 0.2.15+1
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-app-order
- **Flutter 版本**: >=3.10.0
- **Dart 版本**: >=2.16.2 <4.0.0

## 目录结构

```
app_order/
├── lib/
│   ├── app_order.dart            # 主导出文件
│   └── src/                      # 源代码目录
│       ├── pages/                # 订单页面
│       ├── widgets/              # 订单组件
│       ├── models/               # 数据模型
│       ├── services/             # 服务层
│       ├── blocs/                # 状态管理
│       ├── utils/                # 工具类
│       └── constants/            # 常量定义
├── assets/                       # 静态资源
├── uml.puml/png/svg             # UML 设计图
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 订单创建与管理

#### 订单创建服务
```dart
// 订单创建服务
class OrderCreationService {
  final OrderRepository _repository;
  final PaymentService _paymentService;
  final AccountService _accountService;
  final NotificationService _notificationService;
  
  OrderCreationService(
    this._repository,
    this._paymentService,
    this._accountService,
    this._notificationService,
  );
  
  // 创建订单
  Future<Result<Order>> createOrder({
    required String userId,
    required OrderType type,
    required List<OrderItem> items,
    required DeliveryInfo deliveryInfo,
    String? couponCode,
    String? notes,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      // 1. 验证用户账户
      final accountResult = await _accountService.validateAccount(userId);
      if (accountResult.isLeft()) {
        return Left(OrderFailure.accountValidationFailed());
      }
      
      // 2. 计算订单金额
      final pricing = await _calculateOrderPricing(
        items: items,
        couponCode: couponCode,
        deliveryInfo: deliveryInfo,
      );
      
      // 3. 创建订单
      final order = Order(
        id: generateOrderId(),
        userId: userId,
        type: type,
        items: items,
        deliveryInfo: deliveryInfo,
        pricing: pricing,
        status: OrderStatus.pending,
        couponCode: couponCode,
        notes: notes,
        metadata: metadata,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      // 4. 保存订单
      await _repository.createOrder(order);
      
      // 5. 发送订单创建通知
      await _notificationService.sendOrderCreatedNotification(
        userId: userId,
        order: order,
      );
      
      return Right(order);
    } catch (e) {
      return Left(OrderFailure.creationFailed(e.toString()));
    }
  }
  
  // 计算订单价格
  Future<OrderPricing> _calculateOrderPricing({
    required List<OrderItem> items,
    String? couponCode,
    required DeliveryInfo deliveryInfo,
  }) async {
    double subtotal = items.fold(0.0, (sum, item) => sum + item.totalPrice);
    
    // 计算优惠券折扣
    double discount = 0.0;
    if (couponCode != null) {
      final coupon = await _repository.validateCoupon(couponCode);
      if (coupon != null && coupon.isValid) {
        discount = coupon.calculateDiscount(subtotal);
      }
    }
    
    // 计算配送费
    double deliveryFee = await _calculateDeliveryFee(deliveryInfo, subtotal);
    
    // 计算税费
    double tax = _calculateTax(subtotal - discount, deliveryInfo.address);
    
    double total = subtotal - discount + deliveryFee + tax;
    
    return OrderPricing(
      subtotal: subtotal,
      discount: discount,
      deliveryFee: deliveryFee,
      tax: tax,
      total: total,
    );
  }
  
  // 取消订单
  Future<Result<void>> cancelOrder({
    required String orderId,
    required String reason,
    String? userId,
  }) async {
    try {
      final order = await _repository.getOrderById(orderId);
      if (order == null) {
        return Left(OrderFailure.orderNotFound());
      }
      
      // 检查取消权限
      if (userId != null && order.userId != userId) {
        return Left(OrderFailure.permissionDenied());
      }
      
      // 检查订单状态是否允许取消
      if (!order.canBeCancelled) {
        return Left(OrderFailure.cannotBeCancelled());
      }
      
      // 处理退款
      if (order.isPaid) {
        final refundResult = await _paymentService.processRefund(
          orderId: orderId,
          amount: order.pricing.total,
          reason: reason,
        );
        
        if (refundResult.isLeft()) {
          return Left(OrderFailure.refundFailed());
        }
      }
      
      // 更新订单状态
      await _repository.updateOrderStatus(
        orderId: orderId,
        status: OrderStatus.cancelled,
        reason: reason,
        updatedAt: DateTime.now(),
      );
      
      return Right(unit);
    } catch (e) {
      return Left(OrderFailure.cancellationFailed(e.toString()));
    }
  }
}
```

### 2. 订单支付处理

#### 支付集成服务
```dart
// 订单支付服务
class OrderPaymentService {
  final PaymentService _paymentService;
  final OrderRepository _repository;
  
  OrderPaymentService(this._paymentService, this._repository);
  
  // 处理订单支付
  Future<Result<PaymentResult>> processOrderPayment({
    required String orderId,
    required PaymentMethod paymentMethod,
    Map<String, dynamic>? paymentData,
  }) async {
    try {
      final order = await _repository.getOrderById(orderId);
      if (order == null) {
        return Left(OrderFailure.orderNotFound());
      }
      
      if (order.status != OrderStatus.pending) {
        return Left(OrderFailure.orderNotPayable());
      }
      
      // 创建支付请求
      final paymentRequest = PaymentRequest(
        orderId: orderId,
        amount: order.pricing.total,
        currency: 'CNY',
        paymentMethod: paymentMethod,
        description: '订单支付 - ${order.id}',
        metadata: {
          'order_id': orderId,
          'user_id': order.userId,
          'order_type': order.type.toString(),
        },
        additionalData: paymentData,
      );
      
      // 处理支付
      final paymentResult = await _paymentService.processPayment(paymentRequest);
      
      return paymentResult.fold(
        (failure) => Left(OrderFailure.paymentFailed(failure.message)),
        (result) async {
          // 更新订单支付状态
          await _updateOrderPaymentStatus(orderId, result);
          return Right(result);
        },
      );
    } catch (e) {
      return Left(OrderFailure.paymentProcessingFailed(e.toString()));
    }
  }
  
  // 更新订单支付状态
  Future<void> _updateOrderPaymentStatus(
    String orderId,
    PaymentResult paymentResult,
  ) async {
    OrderStatus newStatus;
    switch (paymentResult.status) {
      case PaymentStatus.success:
        newStatus = OrderStatus.paid;
        break;
      case PaymentStatus.pending:
        newStatus = OrderStatus.paymentPending;
        break;
      case PaymentStatus.failed:
        newStatus = OrderStatus.paymentFailed;
        break;
      case PaymentStatus.cancelled:
        newStatus = OrderStatus.pending;
        break;
    }
    
    await _repository.updateOrderPayment(
      orderId: orderId,
      paymentId: paymentResult.paymentId,
      paymentStatus: paymentResult.status,
      orderStatus: newStatus,
      paidAt: paymentResult.status == PaymentStatus.success 
          ? DateTime.now() 
          : null,
    );
  }
  
  // 验证支付结果
  Future<Result<void>> verifyPayment({
    required String orderId,
    required String paymentId,
  }) async {
    try {
      final verificationResult = await _paymentService.verifyPayment(paymentId);
      
      return verificationResult.fold(
        (failure) => Left(OrderFailure.paymentVerificationFailed()),
        (isValid) async {
          if (isValid) {
            await _repository.updateOrderStatus(
              orderId: orderId,
              status: OrderStatus.paid,
              updatedAt: DateTime.now(),
            );
            return Right(unit);
          } else {
            await _repository.updateOrderStatus(
              orderId: orderId,
              status: OrderStatus.paymentFailed,
              updatedAt: DateTime.now(),
            );
            return Left(OrderFailure.paymentVerificationFailed());
          }
        },
      );
    } catch (e) {
      return Left(OrderFailure.verificationError(e.toString()));
    }
  }
}
```

### 3. 订单状态跟踪

#### 订单状态管理服务
```dart
// 订单状态跟踪服务
class OrderTrackingService {
  final OrderRepository _repository;
  final NotificationService _notificationService;
  final LogisticsService _logisticsService;
  
  OrderTrackingService(
    this._repository,
    this._notificationService,
    this._logisticsService,
  );
  
  // 更新订单状态
  Future<Result<void>> updateOrderStatus({
    required String orderId,
    required OrderStatus newStatus,
    String? operatorId,
    String? notes,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final order = await _repository.getOrderById(orderId);
      if (order == null) {
        return Left(OrderFailure.orderNotFound());
      }
      
      // 验证状态转换的合法性
      if (!_isValidStatusTransition(order.status, newStatus)) {
        return Left(OrderFailure.invalidStatusTransition());
      }
      
      // 创建状态历史记录
      final statusHistory = OrderStatusHistory(
        id: generateId(),
        orderId: orderId,
        fromStatus: order.status,
        toStatus: newStatus,
        operatorId: operatorId,
        notes: notes,
        metadata: metadata,
        createdAt: DateTime.now(),
      );
      
      // 更新订单状态
      await _repository.updateOrderStatusWithHistory(
        orderId: orderId,
        newStatus: newStatus,
        statusHistory: statusHistory,
        updatedAt: DateTime.now(),
      );
      
      // 执行状态相关的业务逻辑
      await _executeStatusChangeActions(order, newStatus);
      
      // 发送状态更新通知
      await _notificationService.sendOrderStatusUpdateNotification(
        userId: order.userId,
        orderId: orderId,
        newStatus: newStatus,
      );
      
      return Right(unit);
    } catch (e) {
      return Left(OrderFailure.statusUpdateFailed(e.toString()));
    }
  }
  
  // 获取订单跟踪信息
  Future<Result<OrderTrackingInfo>> getOrderTracking(String orderId) async {
    try {
      final order = await _repository.getOrderById(orderId);
      if (order == null) {
        return Left(OrderFailure.orderNotFound());
      }
      
      final statusHistory = await _repository.getOrderStatusHistory(orderId);
      
      // 获取物流信息（如果有）
      LogisticsInfo? logisticsInfo;
      if (order.trackingNumber != null) {
        logisticsInfo = await _logisticsService.getLogisticsInfo(
          order.trackingNumber!,
        );
      }
      
      final trackingInfo = OrderTrackingInfo(
        order: order,
        statusHistory: statusHistory,
        logisticsInfo: logisticsInfo,
        estimatedDelivery: _calculateEstimatedDelivery(order),
      );
      
      return Right(trackingInfo);
    } catch (e) {
      return Left(OrderFailure.trackingLoadFailed(e.toString()));
    }
  }
  
  // 验证状态转换合法性
  bool _isValidStatusTransition(OrderStatus fromStatus, OrderStatus toStatus) {
    final validTransitions = {
      OrderStatus.pending: [
        OrderStatus.paid,
        OrderStatus.paymentFailed,
        OrderStatus.cancelled,
      ],
      OrderStatus.paid: [
        OrderStatus.processing,
        OrderStatus.cancelled,
      ],
      OrderStatus.processing: [
        OrderStatus.shipped,
        OrderStatus.cancelled,
      ],
      OrderStatus.shipped: [
        OrderStatus.delivered,
        OrderStatus.returnRequested,
      ],
      OrderStatus.delivered: [
        OrderStatus.completed,
        OrderStatus.returnRequested,
      ],
      // ... 其他状态转换规则
    };
    
    return validTransitions[fromStatus]?.contains(toStatus) ?? false;
  }
  
  // 执行状态变更相关操作
  Future<void> _executeStatusChangeActions(
    Order order,
    OrderStatus newStatus,
  ) async {
    switch (newStatus) {
      case OrderStatus.paid:
        await _onOrderPaid(order);
        break;
      case OrderStatus.shipped:
        await _onOrderShipped(order);
        break;
      case OrderStatus.delivered:
        await _onOrderDelivered(order);
        break;
      case OrderStatus.completed:
        await _onOrderCompleted(order);
        break;
      default:
        break;
    }
  }
}
```

### 4. 订单数据模型

#### 核心订单模型
```dart
// 订单模型
class Order {
  final String id;
  final String userId;
  final OrderType type;
  final List<OrderItem> items;
  final DeliveryInfo deliveryInfo;
  final OrderPricing pricing;
  final OrderStatus status;
  final String? couponCode;
  final String? notes;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? paidAt;
  final DateTime? shippedAt;
  final DateTime? deliveredAt;
  final DateTime? completedAt;
  final String? paymentId;
  final String? trackingNumber;
  final List<OrderStatusHistory> statusHistory;
  
  const Order({
    required this.id,
    required this.userId,
    required this.type,
    required this.items,
    required this.deliveryInfo,
    required this.pricing,
    required this.status,
    this.couponCode,
    this.notes,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.paidAt,
    this.shippedAt,
    this.deliveredAt,
    this.completedAt,
    this.paymentId,
    this.trackingNumber,
    this.statusHistory = const [],
  });
  
  // 业务逻辑方法
  bool get isPaid => status.index >= OrderStatus.paid.index;
  bool get isShipped => status.index >= OrderStatus.shipped.index;
  bool get isDelivered => status.index >= OrderStatus.delivered.index;
  bool get isCompleted => status == OrderStatus.completed;
  bool get isCancelled => status == OrderStatus.cancelled;
  
  bool get canBeCancelled => [
    OrderStatus.pending,
    OrderStatus.paid,
    OrderStatus.processing,
  ].contains(status);
  
  bool get canBeReturned => [
    OrderStatus.delivered,
    OrderStatus.completed,
  ].contains(status) && 
      DateTime.now().difference(deliveredAt ?? DateTime.now()).inDays <= 7;
  
  Duration get processingTime => updatedAt.difference(createdAt);
  
  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      userId: json['user_id'],
      type: OrderType.fromString(json['type']),
      items: (json['items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList(),
      deliveryInfo: DeliveryInfo.fromJson(json['delivery_info']),
      pricing: OrderPricing.fromJson(json['pricing']),
      status: OrderStatus.fromString(json['status']),
      couponCode: json['coupon_code'],
      notes: json['notes'],
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      paidAt: json['paid_at'] != null ? DateTime.parse(json['paid_at']) : null,
      shippedAt: json['shipped_at'] != null ? DateTime.parse(json['shipped_at']) : null,
      deliveredAt: json['delivered_at'] != null ? DateTime.parse(json['delivered_at']) : null,
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at']) : null,
      paymentId: json['payment_id'],
      trackingNumber: json['tracking_number'],
    );
  }
}

// 订单项模型
class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final String productDescription;
  final String? productImage;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final Map<String, dynamic>? productVariant;
  final Map<String, dynamic>? metadata;
  
  const OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productDescription,
    this.productImage,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.productVariant,
    this.metadata,
  });
  
  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'],
      productId: json['product_id'],
      productName: json['product_name'],
      productDescription: json['product_description'],
      productImage: json['product_image'],
      quantity: json['quantity'],
      unitPrice: (json['unit_price'] as num).toDouble(),
      totalPrice: (json['total_price'] as num).toDouble(),
      productVariant: json['product_variant'],
      metadata: json['metadata'],
    );
  }
}

// 订单状态枚举
enum OrderStatus {
  pending,          // 待支付
  paymentPending,   // 支付中
  paymentFailed,    // 支付失败
  paid,            // 已支付
  processing,      // 处理中
  shipped,         // 已发货
  delivered,       // 已送达
  completed,       // 已完成
  cancelled,       // 已取消
  returnRequested, // 申请退货
  returned,        // 已退货
  refunded,        // 已退款
}

extension OrderStatusExtension on OrderStatus {
  String get displayName {
    switch (this) {
      case OrderStatus.pending:
        return '待支付';
      case OrderStatus.paymentPending:
        return '支付中';
      case OrderStatus.paymentFailed:
        return '支付失败';
      case OrderStatus.paid:
        return '已支付';
      case OrderStatus.processing:
        return '处理中';
      case OrderStatus.shipped:
        return '已发货';
      case OrderStatus.delivered:
        return '已送达';
      case OrderStatus.completed:
        return '已完成';
      case OrderStatus.cancelled:
        return '已取消';
      case OrderStatus.returnRequested:
        return '申请退货';
      case OrderStatus.returned:
        return '已退货';
      case OrderStatus.refunded:
        return '已退款';
    }
  }
  
  Color get color {
    switch (this) {
      case OrderStatus.pending:
      case OrderStatus.paymentPending:
        return Colors.orange;
      case OrderStatus.paymentFailed:
      case OrderStatus.cancelled:
        return Colors.red;
      case OrderStatus.paid:
      case OrderStatus.processing:
        return Colors.blue;
      case OrderStatus.shipped:
        return Colors.purple;
      case OrderStatus.delivered:
      case OrderStatus.completed:
        return Colors.green;
      case OrderStatus.returnRequested:
      case OrderStatus.returned:
      case OrderStatus.refunded:
        return Colors.grey;
    }
  }
  
  static OrderStatus fromString(String value) {
    return OrderStatus.values.firstWhere(
      (status) => status.toString().split('.').last == value,
      orElse: () => OrderStatus.pending,
    );
  }
}
```

## 页面组件设计

### 订单列表页面
```dart
// 订单列表页面
class OrderListPage extends StatefulWidget {
  @override
  _OrderListPageState createState() => _OrderListPageState();
}

class _OrderListPageState extends State<OrderListPage>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late OrderListBloc _orderBloc;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _orderBloc = context.read<OrderListBloc>();
    _orderBloc.add(LoadOrders());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('我的订单'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: [
            Tab(text: '全部'),
            Tab(text: '待支付'),
            Tab(text: '待发货'),
            Tab(text: '待收货'),
            Tab(text: '已完成'),
          ],
          onTap: (index) => _onTabChanged(index),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrderList(null),
          _buildOrderList(OrderStatus.pending),
          _buildOrderList(OrderStatus.paid),
          _buildOrderList(OrderStatus.shipped),
          _buildOrderList(OrderStatus.completed),
        ],
      ),
    );
  }
  
  Widget _buildOrderList(OrderStatus? status) {
    return BlocBuilder<OrderListBloc, OrderListState>(
      builder: (context, state) {
        if (state is OrderListLoaded) {
          final filteredOrders = status != null
              ? state.orders.where((order) => order.status == status).toList()
              : state.orders;
          
          if (filteredOrders.isEmpty) {
            return _buildEmptyState();
          }
          
          return RefreshIndicator(
            onRefresh: () async {
              _orderBloc.add(RefreshOrders());
            },
            child: ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: filteredOrders.length,
              itemBuilder: (context, index) {
                return OrderCard(
                  order: filteredOrders[index],
                  onTap: () => _navigateToOrderDetail(filteredOrders[index]),
                );
              },
            ),
          );
        } else if (state is OrderListError) {
          return _buildErrorState(state.message);
        }
        return _buildLoadingState();
      },
    );
  }
}

// 订单卡片组件
class OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback? onTap;
  
  const OrderCard({
    Key? key,
    required this.order,
    this.onTap,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              SizedBox(height: 12),
              _buildItems(),
              SizedBox(height: 12),
              _buildFooter(),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildHeader() {
    return Row(
      children: [
        Text(
          '订单号: ${order.id}',
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
        Spacer(),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: order.status.color.withOpacity(0.1),
            border: Border.all(color: order.status.color),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            order.status.displayName,
            style: TextStyle(
              fontSize: 12,
              color: order.status.color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildItems() {
    return Column(
      children: order.items.take(3).map((item) {
        return Padding(
          padding: EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  item.productImage ?? '',
                  width: 50,
                  height: 50,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 50,
                      height: 50,
                      color: Colors.grey[300],
                      child: Icon(Icons.image, color: Colors.grey),
                    );
                  },
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.productName,
                      style: TextStyle(fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '数量: ${item.quantity}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '¥${item.totalPrice.toStringAsFixed(2)}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
  
  Widget _buildFooter() {
    return Row(
      children: [
        Text(
          '共${order.items.length}件商品',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        Spacer(),
        Text(
          '合计: ¥${order.pricing.total.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.red,
          ),
        ),
      ],
    );
  }
}
```

## 状态管理

### 订单状态管理
```dart
// 订单列表状态 BLoC
class OrderListBloc extends Bloc<OrderListEvent, OrderListState> {
  final OrderRepository _repository;
  
  OrderListBloc(this._repository) : super(OrderListInitial()) {
    on<LoadOrders>(_onLoadOrders);
    on<RefreshOrders>(_onRefreshOrders);
    on<FilterOrders>(_onFilterOrders);
  }
  
  Future<void> _onLoadOrders(
    LoadOrders event,
    Emitter<OrderListState> emit,
  ) async {
    emit(OrderListLoading());
    
    try {
      final orders = await _repository.getUserOrders(
        userId: event.userId,
        status: event.status,
        page: 1,
        pageSize: 20,
      );
      
      emit(OrderListLoaded(orders));
    } catch (e) {
      emit(OrderListError('加载订单失败: $e'));
    }
  }
}
```

## 依赖管理

### 核心依赖
- **basic_modular**: 模块化框架
- **basic_modular_route**: 路由管理
- **basic_network**: 网络请求
- **basic_logger**: 日志记录
- **basic_intl**: 国际化支持

### UI 依赖
- **ui_basic**: 基础 UI 组件
- **ui_payment**: 支付界面组件

### 服务依赖
- **clr_payment**: 支付服务 SDK
- **clr_account**: 账户服务 SDK
- **clr_order**: 订单服务 SDK (本地路径)

## 错误处理

### 订单异常定义
```dart
// 订单功能异常
abstract class OrderFailure {
  const OrderFailure();
  
  factory OrderFailure.creationFailed(String message) = OrderCreationFailure;
  factory OrderFailure.paymentFailed(String message) = OrderPaymentFailure;
  factory OrderFailure.orderNotFound() = OrderNotFoundFailure;
  factory OrderFailure.permissionDenied() = OrderPermissionDeniedFailure;
  factory OrderFailure.cannotBeCancelled() = OrderCannotBeCancelledFailure;
  factory OrderFailure.invalidStatusTransition() = InvalidStatusTransitionFailure;
}
```

## 总结

`app_order` 模块为 OneApp 提供了完整的订单管理解决方案，涵盖了订单创建、支付处理、状态跟踪、历史查询等全生命周期功能。模块与支付系统、账户系统深度集成，通过清晰的状态管理和完善的错误处理机制，为用户提供了可靠的订单管理体验。
