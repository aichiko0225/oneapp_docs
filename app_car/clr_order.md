# CLR Order - 订单服务 SDK

## 模块概述

`clr_order` 是 OneApp 车辆订单管理的核心服务 SDK，提供了完整的订单生命周期管理功能。该模块封装了订单创建、支付、状态跟踪、取消退款等核心业务逻辑，为上层应用模块提供统一的订单服务接口。

## 核心功能

### 1. 订单管理
- **订单创建**：支持多种类型订单的创建和初始化
- **订单查询**：提供订单详情查询和列表获取功能
- **订单更新**：支持订单状态和信息的实时更新
- **订单取消**：处理订单取消和退款流程

### 2. 支付集成
- **支付方式管理**：支持多种支付渠道的集成
- **支付状态跟踪**：实时监控支付进度和结果
- **退款处理**：自动化的退款流程处理
- **支付安全**：确保支付过程的安全性和可靠性

### 3. 订单类型支持
- **充电订单**：电动车充电服务订单
- **维保订单**：车辆维护保养服务订单
- **配件订单**：车辆配件和用品订单
- **服务订单**：各类增值服务订单

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            应用层                    │
│  (app_order, app_charging, etc.)    │
├─────────────────────────────────────┤
│            CLR Order SDK            │
│  ┌─────────────┬─────────────────┐   │
│  │  订单管理   │    支付服务     │   │
│  ├─────────────┼─────────────────┤   │
│  │  状态机制   │    安全认证     │   │
│  └─────────────┴─────────────────┘   │
├─────────────────────────────────────┤
│            网络层                    │
│     (RESTful API / GraphQL)         │
├─────────────────────────────────────┤
│            后端服务                  │
│  ┌─────────────┬─────────────────┐   │
│  │  订单服务   │    支付网关     │   │
│  └─────────────┴─────────────────┘   │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 订单管理器 (OrderFacade)
```dart
/// 订单服务接口
abstract class IOrderFacade {
  /// 创建订单
  Future<Either<OrderError, OrderDetail>> createOrder({
    required OrderCreateParams params,
  });

  /// 批量获取订单
  Future<Either<OrderError, OrderList>> fetchOrders({
    required int pageIndex,
    required OrderQueryType orderQueryType,
    int pageSize = 10,
    OrderRefundQueryType? orderRefundQueryType,
  });

  /// 取消订单
  Future<Either<OrderError, Unit>> cancelOrder(String orderId);

  /// 删除订单
  Future<Either<OrderError, Unit>> delOrder(String orderId);

  /// 获取订单详情
  Future<Either<OrderError, OrderDetail>> fetchOrderDetail(
    String orderId, {
    bool realTimePull = false,
  });

  /// 获取退款详情
  Future<Either<OrderError, RefundDetail>> fetchRefundDetail(String orderId);

  /// 获取待支付的总数
  Future<Either<OrderError, OrderNum>> fetchAllUnpaidNum();

  /// 获取订单状态
  Future<Either<OrderError, OrderStatus>> fetchOrderStatus(String orderId);
}

class OrderFacade implements IOrderFacade {
  final OrderRemoteApi? remoteApi;
  final String? environment;
  
  OrderFacade(this.remoteApi, this.environment) {
    remoteApi ??= OrderRemoteApi(Impl());
    environment ??= defaultOption.environment;
    OrderModuleConfig.setUp(environment ?? '');
  }
  
  @override
  Future<Either<OrderError, OrderDetail>> createOrder({
    required OrderCreateParams params,
  }) async {
    try {
      final orderDetail = await remoteApi!.createOrder(params: params);
      return right(orderDetail);
    } catch (e) {
      return left(OrderError.createOrderError(obj: 'create order failed, $e'));
    }
  }
  
  // 其他方法实现...
}
```

#### 2. 发票门面 (InvoiceFacade)
```dart
/// 发票服务接口  
abstract class IInvoiceFacade {
  /// 获取发票抬头详情
  Future<Either<OrderError, InvoiceTitleDetailsDo>> getInvoiceTitleDetails(
    String titleId,
  );

  /// 新增/修改发票抬头
  Future<Either<OrderError, String>> submitInvoiceTitleDetails(
    InvoiceTitleDetailsDo invoiceTitleDetails,
  );

  /// 删除发票抬头
  Future<Either<OrderError, Unit>> delInvoiceTitleDetails(String titleId);

  /// 获取发票抬头列表
  Future<Either<OrderError, List<InvoiceTitleDetailsDo>>> 
      getInvoiceTitleDetailsList();

  /// 获取发票详情
  Future<Either<OrderError, InvoiceDetailsDo>> getInvoiceDetails(
    String invoiceId,
  );

  /// 获取发票历史列表
  Future<Either<OrderError, List<InvoiceDetailsDo>>> getInvoiceList({
    required int pageIndex,
    required int pageSize,
  });

  /// 申请开具发票
  Future<Either<OrderError, Unit>> submitInvoice(InvoiceOptionsDo invoiceOptions);

  /// 获取可开发票的订单列表
  Future<Either<OrderError, List<NoOpenInvoiceOrderDo>>> getNoOpenInvoiceOrderList({
    required int pageIndex,
    required int pageSize,
  });
}
```

#### 3. 订单状态和类型枚举
```dart
/// 订单状态枚举
enum OrderStatus {
  unpaid,           // 未付款
  paid,            // 已付款  
  processing,      // 处理中
  completed,       // 已完成
  cancelled,       // 已取消
  refunding,       // 退款中
  refunded         // 已退款
}

/// 订单查询类型
enum OrderQueryType {
  all,             // 全部
  unpaid,          // 待付款
  paid,            // 已付款
  completed,       // 已完成
  cancelled        // 已取消
}

/// 订单退款查询类型  
enum OrderRefundQueryType {
  refunding,       // 退款中
  refunded,        // 已退款
  refundFailed     // 退款失败
}
```

## 数据模型

### 订单模型
```dart
/// 订单领域模型
class Order {
  /// 订单ID
  final String id;
  
  /// 订单价格
  final double price;
  
  /// 订单标题
  final String title;
  
  /// 创建时间
  final DateTime createTime;
  
  /// 订单状态
  final OrderStatus status;
  
  /// 支付金额
  final double payAmount;
  
  /// 订单来源
  final OrderSource orderSource;
  
  /// 订单类型
  final OrderType orderType;
  
  /// 折扣金额
  final double discountAmount;
  
  /// 订单项总数量
  final int orderItemTotalQuantity;

  Order({
    required this.id,
    required this.price,
    required this.title,
    required this.createTime,
    required this.status,
    required this.payAmount,
    required this.orderSource,
    required this.orderType,
    required this.discountAmount,
    required this.orderItemTotalQuantity,
  });

  /// 从DTO转换为DO
  factory Order.fromDto(OrderDto dto) => Order(
    id: dto.orderNo,
    price: dto.orderAmount,
    title: dto.title,
    createTime: DateTime.fromMillisecondsSinceEpoch(dto.orderCreateTime),
    status: OrderStatusEx.valueFromBackend(dto.orderState),
    payAmount: dto.payAmount,
    orderSource: OrderSourceEx.valueFromBackend(dto.orderSource),
    orderType: OrderSourceTypeEx.valueFromBackend(dto.orderType),
    discountAmount: dto.discountAmount,
    orderItemTotalQuantity: dto.orderItemTotalQuantity,
  );
}

/// 订单详情模型
class OrderDetail {
  final String id;
  final double orderPrice;
  final List<Product> products;
  final DateTime createTime;
  final OrderStatus status;
  final double payAmount;
  final OrderSource orderSource;
  final OrderType orderType;
  final double discountAmount;
  final int orderItemTotalQuantity;
  
  // 构造方法和工厂方法...
}

/// 产品模型
class Product {
  final String productId;
  final String productName;
  final String productImage;
  final double price;
  final int quantity;
  
  // 构造方法...
}
```

### 发票模型
```dart
/// 发票详情模型
class InvoiceDetailsDo {
  final String invoiceId;
  final String invoiceNumber;
  final String invoiceTitle;
  final double invoiceAmount;
  final DateTime createTime;
  final InvoiceStatus status;
  final String downloadUrl;
  
  // 构造方法和工厂方法...
}

/// 发票抬头模型
class InvoiceTitleDetailsDo {
  final String titleId;
  final String invoiceTitle;
  final InvoiceType invoiceType;
  final String taxNumber;
  final String address;
  final String phone;
  final String bankName;
  final String bankAccount;
  
  // 构造方法和工厂方法...
}

/// 发票选项模型
class InvoiceOptionsDo {
  final String orderId;
  final String titleId;
  final String invoiceType;
  final String email;
  
  // 构造方法...
}

/// 可开发票订单模型
class NoOpenInvoiceOrderDo {
  final String orderId;
  final String orderTitle;
  final double amount;
  final DateTime createTime;
  final bool canInvoice;
  
  // 构造方法...
}
```

## API 接口

### 订单接口
```dart
/// 订单服务接口
abstract class IOrderFacade {
  /// 创建订单
  /// DSSOMOBILE-ONEAPP-ORDER-3001
  Future<Either<OrderError, OrderDetail>> createOrder({
    required OrderCreateParams params,
  });

  /// 批量获取订单
  /// DSSOMOBILE-ONEAPP-ORDER-3002  
  Future<Either<OrderError, OrderList>> fetchOrders({
    required int pageIndex,
    required OrderQueryType orderQueryType,
    int pageSize = 10,
    OrderRefundQueryType? orderRefundQueryType,
  });

  /// 获取订单详情
  /// DSSOMOBILE-ONEAPP-ORDER-3003
  Future<Either<OrderError, OrderDetail>> fetchOrderDetail(
    String orderId, {
    bool realTimePull = false,
  });

  /// 删除订单
  /// DSSOMOBILE-ONEAPP-ORDER-3004
  Future<Either<OrderError, Unit>> delOrder(String orderId);

  /// 取消订单
  /// DSSOMOBILE-ONEAPP-ORDER-3005
  Future<Either<OrderError, Unit>> cancelOrder(String orderId);

  /// 获取待支付订单数量
  /// DSSOMOBILE-ONEAPP-ORDER-3006
  Future<Either<OrderError, OrderNum>> fetchAllUnpaidNum();

  /// 获取订单状态
  /// DSSOMOBILE-ONEAPP-ORDER-3007
  Future<Either<OrderError, OrderStatus>> fetchOrderStatus(String orderId);

  /// 获取退款详情
  Future<Either<OrderError, RefundDetail>> fetchRefundDetail(String orderId);
}
```

### 发票接口
```dart
/// 发票服务接口
abstract class IInvoiceFacade {
  /// 获取发票抬头详情
  Future<Either<OrderError, InvoiceTitleDetailsDo>> getInvoiceTitleDetails(
    String titleId,
  );

  /// 新增/修改发票抬头
  Future<Either<OrderError, String>> submitInvoiceTitleDetails(
    InvoiceTitleDetailsDo invoiceTitleDetails,
  );

  /// 删除发票抬头
  Future<Either<OrderError, Unit>> delInvoiceTitleDetails(String titleId);

  /// 获取发票抬头列表
  Future<Either<OrderError, List<InvoiceTitleDetailsDo>>> 
      getInvoiceTitleDetailsList();

  /// 获取发票详情
  Future<Either<OrderError, InvoiceDetailsDo>> getInvoiceDetails(
    String invoiceId,
  );

  /// 获取发票历史列表
  Future<Either<OrderError, List<InvoiceDetailsDo>>> getInvoiceList({
    required int pageIndex,
    required int pageSize,
  });

  /// 申请开具发票
  Future<Either<OrderError, Unit>> submitInvoice(InvoiceOptionsDo invoiceOptions);

  /// 获取可开发票的订单列表
  Future<Either<OrderError, List<NoOpenInvoiceOrderDo>>> getNoOpenInvoiceOrderList({
    required int pageIndex,
    required int pageSize,
  });
}
```

## 配置管理

### 环境配置
```dart
class OrderConfig {
  static const String baseUrl = String.fromEnvironment('ORDER_API_BASE_URL');
  static const String apiKey = String.fromEnvironment('ORDER_API_KEY');
  static const int timeoutSeconds = 30;
  static const int maxRetries = 3;
}
```

### 支付配置
```dart
class PaymentConfig {
  static const Map<PaymentMethod, PaymentProviderConfig> providers = {
    PaymentMethod.creditCard: PaymentProviderConfig(
      provider: 'stripe',
      publicKey: 'pk_live_...',
    ),
    PaymentMethod.digitalWallet: PaymentProviderConfig(
      provider: 'alipay',
      appId: 'app_...',
    ),
  };
}
```

## 错误处理

### 订单错误类型
```dart
enum OrderErrorType {
  invalidRequest,       // 无效请求
  orderNotFound,       // 订单未找到
  paymentFailed,       // 支付失败
  insufficientStock,   // 库存不足
  orderExpired,        // 订单过期
  unauthorized,        // 未授权
  networkError,        // 网络错误
  serverError          // 服务器错误
}

class OrderException implements Exception {
  final OrderErrorType type;
  final String message;
  final Map<String, dynamic>? details;
  
  const OrderException(this.type, this.message, [this.details]);
}
```

## 使用示例

### 创建订单
```dart
final orderFacade = buildOrderFacadeImpl();

try {
  final orderCreateParams = OrderCreateParams(
    products: [
      OrderProduct(
        productId: 'charging_session',
        quantity: 1,
        price: 25.0,
      ),
    ],
    deliveryAddress: '北京市朝阳区...',
    paymentMethod: 'alipay',
  );
  
  final result = await orderFacade.createOrder(params: orderCreateParams);
  
  result.fold(
    (error) => print('订单创建失败: ${error.message}'),
    (orderDetail) => print('订单创建成功: ${orderDetail.id}'),
  );
} catch (e) {
  print('订单创建异常: $e');
}
```

### 查询订单列表
```dart
final orderFacade = buildOrderFacadeImpl();

try {
  final result = await orderFacade.fetchOrders(
    pageIndex: 1,
    orderQueryType: OrderQueryType.all,
    pageSize: 20,
  );
  
  result.fold(
    (error) => print('查询订单失败: ${error.message}'),
    (orderList) {
      print('查询订单成功，共 ${orderList.orders.length} 条记录');
      for (final order in orderList.orders) {
        print('订单: ${order.id} - ${order.title} - ${order.status}');
      }
    },
  );
} catch (e) {
  print('查询订单异常: $e');
}
```

### 获取订单详情
```dart
final orderFacade = buildOrderFacadeImpl();

try {
  final result = await orderFacade.fetchOrderDetail('order_123');
  
  result.fold(
    (error) => print('获取订单详情失败: ${error.message}'),
    (orderDetail) {
      print('订单详情获取成功:');
      print('订单ID: ${orderDetail.id}');
      print('订单状态: ${orderDetail.status}');
      print('订单金额: ${orderDetail.orderPrice}');
      print('产品列表: ${orderDetail.products.map((p) => p.productName).join(', ')}');
    },
  );
} catch (e) {
  print('获取订单详情异常: $e');
}
```

## 测试策略

### 单元测试
```dart
group('OrderManager Tests', () {
  test('should create order successfully', () async {
    // Given
    final request = CreateOrderRequest(/* ... */);
    
    // When
    final result = await orderManager.createOrder(request);
    
    // Then
    expect(result.isSuccess, true);
    expect(result.data.status, OrderStatus.created);
  });
  
  test('should handle payment failure', () async {
    // Given
    final request = PaymentRequest(/* invalid data */);
    
    // When & Then
    expect(
      () => paymentProcessor.initiatePayment(request),
      throwsA(isA<OrderException>()),
    );
  });
});
```

### 集成测试
```dart
group('Order Integration Tests', () {
  testWidgets('complete order flow', (tester) async {
    // 1. 创建订单
    final order = await createTestOrder();
    
    // 2. 处理支付
    final payment = await processTestPayment(order.id);
    
    // 3. 验证订单状态
    final updatedOrder = await getOrder(order.id);
    expect(updatedOrder.status, OrderStatus.completed);
  });
});
```

## 性能优化

### 缓存策略
- **订单缓存**：本地缓存常用订单信息
- **支付状态缓存**：缓存支付状态避免频繁查询
- **配置缓存**：缓存支付配置和费率信息

### 网络优化
- **请求合并**：合并多个订单查询请求
- **分页加载**：大量订单数据分页获取
- **压缩传输**：启用 gzip 压缩减少传输量

## 安全考虑

### 数据安全
- **敏感信息加密**：支付信息和个人数据加密存储
- **传输安全**：使用 HTTPS 和证书绑定
- **访问控制**：基于角色的权限控制

### 支付安全
- **PCI DSS 合规**：遵循支付卡行业数据安全标准
- **令牌化**：敏感支付信息使用令牌替换
- **风险控制**：实时风险评估和欺诈检测

## 监控和分析

### 业务指标
- **订单转化率**：从创建到完成的转化率
- **支付成功率**：支付处理的成功率
- **平均订单价值**：订单金额统计分析
- **退款率**：退款订单占比

### 技术指标
- **API 响应时间**：接口性能监控
- **错误率**：系统错误和异常监控
- **可用性**：服务可用性监控
- **吞吐量**：系统处理能力监控

## 版本历史

### v0.2.6+3 (当前版本)
- 新增加密货币支付支持
- 优化订单状态机逻辑
- 修复支付回调处理问题
- 改进错误处理机制

### v0.2.5
- 支持批量订单操作
- 新增订单搜索功能
- 优化支付流程
- 修复已知 bug

### v0.2.4
- 支持多币种订单
- 新增订单模板功能
- 改进性能和稳定性

## 依赖关系

### 内部依赖
- `basic_network`: 网络请求基础库
- `basic_storage`: 本地存储服务
- `basic_error`: 错误处理框架
- `basic_track`: 埋点统计服务

### 外部依赖
- `dio`: HTTP 客户端
- `json_annotation`: JSON 序列化
- `rxdart`: 响应式编程支持

## 部署说明

### 环境变量
```bash
ORDER_API_BASE_URL=https://api.oneapp.com/order
ORDER_API_KEY=your_api_key_here
PAYMENT_PROVIDER_STRIPE_KEY=pk_live_...
PAYMENT_PROVIDER_ALIPAY_APP_ID=app_...
```

### 配置文件
```yaml
order:
  timeout: 30s
  retry_count: 3
  cache_ttl: 300s
  
payment:
  providers:
    - stripe
    - alipay
    - wechat_pay
  security:
    encryption: aes256
    signature: hmac_sha256
```

## 总结

`clr_order` 作为订单服务的核心 SDK，提供了完整的订单生命周期管理能力。通过统一的接口设计、可靠的支付处理、完善的错误处理和安全保障，为 OneApp 的各个业务模块提供了稳定高效的订单服务支持。

该模块在设计上充分考虑了可扩展性、安全性和性能要求，能够很好地支撑车辆相关的各种订单业务场景，是 OneApp 电商和服务体系的重要基础设施。
