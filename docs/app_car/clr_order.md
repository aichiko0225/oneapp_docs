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

#### 1. 订单管理器 (OrderManager)
```dart
class OrderManager {
  // 创建订单
  Future<OrderResult> createOrder(OrderRequest request);
  
  // 查询订单
  Future<Order> getOrder(String orderId);
  
  // 更新订单状态
  Future<bool> updateOrderStatus(String orderId, OrderStatus status);
  
  // 取消订单
  Future<bool> cancelOrder(String orderId, String reason);
}
```

#### 2. 支付处理器 (PaymentProcessor)
```dart
class PaymentProcessor {
  // 发起支付
  Future<PaymentResult> initiatePayment(PaymentRequest request);
  
  // 查询支付状态
  Future<PaymentStatus> getPaymentStatus(String paymentId);
  
  // 处理退款
  Future<RefundResult> processRefund(RefundRequest request);
}
```

#### 3. 订单状态机 (OrderStateMachine)
```dart
enum OrderStatus {
  created,      // 已创建
  paid,         // 已支付
  processing,   // 处理中
  completed,    // 已完成
  cancelled,    // 已取消
  refunded      // 已退款
}

class OrderStateMachine {
  bool canTransition(OrderStatus from, OrderStatus to);
  Future<bool> transition(String orderId, OrderStatus to);
}
```

## 数据模型

### 订单模型
```dart
class Order {
  final String id;
  final String userId;
  final OrderType type;
  final OrderStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<OrderItem> items;
  final PaymentInfo payment;
  final DeliveryInfo delivery;
  final double totalAmount;
  final String currency;
  final Map<String, dynamic> metadata;
}

class OrderItem {
  final String id;
  final String productId;
  final String name;
  final int quantity;
  final double price;
  final Map<String, dynamic> attributes;
}
```

### 支付模型
```dart
class PaymentInfo {
  final String paymentId;
  final PaymentMethod method;
  final PaymentStatus status;
  final double amount;
  final String currency;
  final DateTime paidAt;
  final String transactionId;
}

enum PaymentMethod {
  creditCard,
  debitCard,
  digitalWallet,
  bankTransfer,
  cryptocurrency
}
```

## API 接口

### 订单接口
```dart
abstract class OrderService {
  // 创建订单
  Future<ApiResponse<Order>> createOrder(CreateOrderRequest request);
  
  // 获取订单列表
  Future<ApiResponse<List<Order>>> getOrders(OrderQuery query);
  
  // 获取订单详情
  Future<ApiResponse<Order>> getOrderById(String orderId);
  
  // 更新订单
  Future<ApiResponse<Order>> updateOrder(String orderId, UpdateOrderRequest request);
  
  // 取消订单
  Future<ApiResponse<bool>> cancelOrder(String orderId, CancelOrderRequest request);
}
```

### 支付接口
```dart
abstract class PaymentService {
  // 创建支付
  Future<ApiResponse<PaymentSession>> createPayment(CreatePaymentRequest request);
  
  // 确认支付
  Future<ApiResponse<PaymentResult>> confirmPayment(String paymentId, ConfirmPaymentRequest request);
  
  // 查询支付状态
  Future<ApiResponse<PaymentStatus>> getPaymentStatus(String paymentId);
  
  // 申请退款
  Future<ApiResponse<RefundResult>> requestRefund(RefundRequest request);
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
try {
  final orderRequest = CreateOrderRequest(
    userId: 'user123',
    items: [
      OrderItem(
        productId: 'charging_session',
        quantity: 1,
        price: 25.0,
      ),
    ],
    paymentMethod: PaymentMethod.creditCard,
  );
  
  final order = await OrderManager.instance.createOrder(orderRequest);
  print('订单创建成功: ${order.id}');
} catch (e) {
  print('订单创建失败: $e');
}
```

### 处理支付
```dart
try {
  final paymentRequest = PaymentRequest(
    orderId: order.id,
    amount: order.totalAmount,
    method: PaymentMethod.creditCard,
    cardToken: 'card_token_123',
  );
  
  final result = await PaymentProcessor.instance.initiatePayment(paymentRequest);
  
  if (result.isSuccess) {
    print('支付成功: ${result.transactionId}');
  } else {
    print('支付失败: ${result.errorMessage}');
  }
} catch (e) {
  print('支付处理异常: $e');
}
```

### 查询订单状态
```dart
try {
  final order = await OrderManager.instance.getOrder(orderId);
  
  switch (order.status) {
    case OrderStatus.created:
      print('订单已创建，等待支付');
      break;
    case OrderStatus.paid:
      print('订单已支付，正在处理');
      break;
    case OrderStatus.completed:
      print('订单已完成');
      break;
    case OrderStatus.cancelled:
      print('订单已取消');
      break;
  }
} catch (e) {
  print('查询订单失败: $e');
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
