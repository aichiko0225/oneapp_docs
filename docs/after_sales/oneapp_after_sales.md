# OneApp After Sales 售后服务主模块

## 模块概述

`oneapp_after_sales` 是 OneApp 售后服务模块群中的主应用模块，负责为用户提供完整的汽车售后服务功能。该模块包含维修预约、服务跟踪、客户服务、支付结算等核心功能，为车主提供便捷的售后服务体验。

### 基本信息
- **模块名称**: oneapp_after_sales
- **版本**: 0.0.1
- **描述**: 售后服务主应用模块
- **Flutter 版本**: >=1.17.0
- **Dart 版本**: >=3.0.0 <4.0.0

## 功能特性

### 核心功能
1. **维修预约管理**
   - 在线预约维修服务
   - 预约时间智能调度
   - 服务门店选择和导航
   - 预约状态实时跟踪

2. **服务流程跟踪**
   - 维修进度实时更新
   - 服务照片和视频记录
   - 技师服务过程展示
   - 完工通知和验收

3. **客户服务中心**
   - 在线客服聊天
   - 投诉建议提交
   - 服务评价反馈
   - FAQ常见问题

4. **支付和结算**
   - 多种支付方式支持
   - 费用明细透明展示
   - 电子发票生成
   - 会员优惠计算

## 技术架构

### 目录结构
```
lib/
├── oneapp_after_sales.dart    # 模块入口文件
├── src/                        # 源代码目录
│   ├── appointment/            # 预约管理
│   ├── service/                # 服务跟踪
│   ├── customer/               # 客户服务
│   ├── payment/                # 支付结算
│   ├── store/                  # 门店管理
│   ├── pages/                  # 页面组件
│   ├── widgets/                # 自定义组件
│   ├── models/                 # 数据模型
│   └── utils/                  # 工具类
├── assets/                     # 资源文件
└── l10n/                       # 国际化文件
```

### 依赖关系

#### 基础框架依赖
- `basic_modular: ^0.2.3` - 模块化框架
- `basic_modular_route: ^0.2.1` - 路由管理
- `basic_intl: ^0.2.0` - 国际化支持
- `basic_webview: ^0.2.4+4` - WebView组件

#### 地图和位置服务
- `ui_mapview: ^0.2.18` - 地图视图组件
- `amap_flutter_location: ^3.0.3` - 高德地图定位
- `clr_geo: ^0.2.16+1` - 地理位置服务
- `location_service_check: ^1.0.1` - 位置服务检查

#### 支付服务
- `kit_alipay: ^0.2.0` - 支付宝支付
- `fluwx: ^4.4.3` - 微信支付

#### 媒体和文件处理
- `photo_view: ^0.14.0` - 图片预览
- `photo_gallery: 2.2.1+1` - 相册选择
- `signature: ^5.4.0` - 电子签名

#### 工具依赖
- `permission_handler: ^10.3.0` - 权限管理
- `url_launcher: ^6.1.14` - URL启动
- `dio: any` - 网络请求
- `common_utils: ^2.1.0` - 通用工具
- `flutter_color_plugin: ^1.1.0` - 颜色工具

## 核心模块分析

### 1. 预约管理 (`src/appointment/`)

#### 预约创建流程
```dart
class AppointmentBookingPage extends StatefulWidget {
  @override
  _AppointmentBookingPageState createState() => _AppointmentBookingPageState();
}

class _AppointmentBookingPageState extends State<AppointmentBookingPage> {
  final AppointmentBookingController _controller = AppointmentBookingController();
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('维修预约')),
      body: Stepper(
        currentStep: _controller.currentStep,
        onStepTapped: _controller.onStepTapped,
        controlsBuilder: _buildStepControls,
        steps: [
          Step(
            title: Text('选择服务'),
            content: ServiceTypeSelector(
              selectedType: _controller.selectedServiceType,
              onTypeSelected: _controller.onServiceTypeSelected,
            ),
            isActive: _controller.currentStep >= 0,
          ),
          Step(
            title: Text('选择门店'),
            content: StoreSelector(
              location: _controller.userLocation,
              selectedStore: _controller.selectedStore,
              onStoreSelected: _controller.onStoreSelected,
            ),
            isActive: _controller.currentStep >= 1,
          ),
          Step(
            title: Text('预约时间'),
            content: TimeSlotSelector(
              availableSlots: _controller.availableTimeSlots,
              selectedSlot: _controller.selectedTimeSlot,
              onSlotSelected: _controller.onTimeSlotSelected,
            ),
            isActive: _controller.currentStep >= 2,
          ),
          Step(
            title: Text('车辆信息'),
            content: VehicleInfoForm(
              vehicleInfo: _controller.vehicleInfo,
              onInfoChanged: _controller.onVehicleInfoChanged,
            ),
            isActive: _controller.currentStep >= 3,
          ),
          Step(
            title: Text('确认预约'),
            content: AppointmentSummary(
              appointment: _controller.appointmentSummary,
            ),
            isActive: _controller.currentStep >= 4,
          ),
        ],
      ),
    );
  }
}
```

#### 预约管理器
```dart
class AppointmentManager {
  static Future<List<Appointment>> getUserAppointments() async {
    try {
      final response = await AfterSalesAPI.getUserAppointments();
      return response.data.map((json) => Appointment.fromJson(json)).toList();
    } catch (e) {
      throw AppointmentException('获取预约列表失败: $e');
    }
  }
  
  static Future<Appointment> createAppointment(AppointmentRequest request) async {
    try {
      final response = await AfterSalesAPI.createAppointment(request.toJson());
      return Appointment.fromJson(response.data);
    } catch (e) {
      throw AppointmentException('创建预约失败: $e');
    }
  }
  
  static Future<bool> cancelAppointment(String appointmentId) async {
    try {
      await AfterSalesAPI.cancelAppointment(appointmentId);
      return true;
    } catch (e) {
      throw AppointmentException('取消预约失败: $e');
    }
  }
}
```

### 2. 服务跟踪 (`src/service/`)

#### 服务进度展示
```dart
class ServiceProgressPage extends StatefulWidget {
  final String appointmentId;
  
  const ServiceProgressPage({Key? key, required this.appointmentId}) : super(key: key);
  
  @override
  _ServiceProgressPageState createState() => _ServiceProgressPageState();
}

class _ServiceProgressPageState extends State<ServiceProgressPage> {
  ServiceProgress? _progress;
  Timer? _progressTimer;
  
  @override
  void initState() {
    super.initState();
    _loadServiceProgress();
    _startProgressPolling();
  }
  
  @override
  Widget build(BuildContext context) {
    if (_progress == null) {
      return Scaffold(
        appBar: AppBar(title: Text('服务进度')),
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    return Scaffold(
      appBar: AppBar(title: Text('服务进度')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ServiceStatusCard(progress: _progress!),
            SizedBox(height: 16),
            ServiceTimelineWidget(steps: _progress!.steps),
            SizedBox(height: 16),
            if (_progress!.photos.isNotEmpty) ...[
              ServicePhotosSection(photos: _progress!.photos),
              SizedBox(height: 16),
            ],
            TechnicianInfoCard(technician: _progress!.technician),
          ],
        ),
      ),
    );
  }
  
  void _startProgressPolling() {
    _progressTimer = Timer.periodic(Duration(seconds: 30), (timer) {
      _loadServiceProgress();
    });
  }
  
  @override
  void dispose() {
    _progressTimer?.cancel();
    super.dispose();
  }
}
```

#### 服务时间轴组件
```dart
class ServiceTimelineWidget extends StatelessWidget {
  final List<ServiceStep> steps;
  
  const ServiceTimelineWidget({Key? key, required this.steps}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '服务进度',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        SizedBox(height: 16),
        Timeline.tileBuilder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          builder: TimelineTileBuilder.connected(
            itemCount: steps.length,
            connectionDirection: ConnectionDirection.before,
            itemExtentBuilder: (_, __) => 80.0,
            contentsBuilder: (context, index) {
              final step = steps[index];
              return Padding(
                padding: EdgeInsets.all(8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      step.title,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: step.isCompleted ? Colors.green : Colors.grey,
                      ),
                    ),
                    Text(
                      step.description,
                      style: TextStyle(fontSize: 12),
                    ),
                    if (step.completedAt != null)
                      Text(
                        DateFormat('MM-dd HH:mm').format(step.completedAt!),
                        style: TextStyle(fontSize: 10, color: Colors.grey),
                      ),
                  ],
                ),
              );
            },
            indicatorBuilder: (context, index) {
              final step = steps[index];
              return DotIndicator(
                color: step.isCompleted ? Colors.green : Colors.grey,
                child: Icon(
                  step.isCompleted ? Icons.check : Icons.schedule,
                  color: Colors.white,
                  size: 16,
                ),
              );
            },
            connectorBuilder: (context, index, type) {
              return SolidLineConnector(
                color: steps[index].isCompleted ? Colors.green : Colors.grey,
              );
            },
          ),
        ),
      ],
    );
  }
}
```

### 3. 客户服务 (`src/customer/`)

#### 在线客服聊天
```dart
class CustomerServiceChatPage extends StatefulWidget {
  @override
  _CustomerServiceChatPageState createState() => _CustomerServiceChatPageState();
}

class _CustomerServiceChatPageState extends State<CustomerServiceChatPage> {
  final List<ChatMessage> _messages = [];
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late WebSocketChannel _channel;
  
  @override
  void initState() {
    super.initState();
    _connectToCustomerService();
    _loadChatHistory();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('在线客服'),
        actions: [
          IconButton(
            icon: Icon(Icons.phone),
            onPressed: _makePhoneCall,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return ChatMessageBubble(message: _messages[index]);
              },
            ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }
  
  Widget _buildMessageInput() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey[300]!)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: _showAttachmentOptions,
          ),
          Expanded(
            child: TextField(
              controller: _textController,
              decoration: InputDecoration(
                hintText: '请输入消息...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
              onSubmitted: _sendMessage,
            ),
          ),
          SizedBox(width: 8),
          IconButton(
            icon: Icon(Icons.send, color: Theme.of(context).primaryColor),
            onPressed: () => _sendMessage(_textController.text),
          ),
        ],
      ),
    );
  }
}
```

### 4. 支付结算 (`src/payment/`)

#### 支付管理器
```dart
class PaymentManager {
  static Future<PaymentResult> processPayment({
    required PaymentMethod method,
    required double amount,
    required String orderId,
    Map<String, dynamic>? extras,
  }) async {
    try {
      switch (method) {
        case PaymentMethod.alipay:
          return await _processAlipayPayment(amount, orderId, extras);
        case PaymentMethod.wechat:
          return await _processWechatPayment(amount, orderId, extras);
        case PaymentMethod.card:
          return await _processBankCardPayment(amount, orderId, extras);
        default:
          throw PaymentException('不支持的支付方式');
      }
    } catch (e) {
      return PaymentResult.failure(error: e.toString());
    }
  }
  
  static Future<PaymentResult> _processAlipayPayment(
    double amount,
    String orderId,
    Map<String, dynamic>? extras,
  ) async {
    // 获取支付宝支付参数
    final paymentParams = await AfterSalesAPI.getAlipayParams(
      amount: amount,
      orderId: orderId,
      extras: extras,
    );
    
    // 调用支付宝SDK
    final result = await AlipayKit.pay(paymentParams.orderString);
    
    if (result.resultStatus == '9000') {
      return PaymentResult.success(
        transactionId: result.result,
        method: PaymentMethod.alipay,
      );
    } else {
      return PaymentResult.failure(error: result.memo);
    }
  }
}
```

## 数据模型

### 预约模型
```dart
@freezed
class Appointment with _$Appointment {
  const factory Appointment({
    required String id,
    required String userId,
    required ServiceType serviceType,
    required Store store,
    required DateTime appointmentTime,
    required VehicleInfo vehicleInfo,
    required AppointmentStatus status,
    String? description,
    List<String>? attachments,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Appointment;

  factory Appointment.fromJson(Map<String, dynamic> json) =>
      _$AppointmentFromJson(json);
}

enum AppointmentStatus {
  pending,    // 待确认
  confirmed,  // 已确认
  inProgress, // 进行中
  completed,  // 已完成
  cancelled,  // 已取消
}

enum ServiceType {
  maintenance,     // 保养
  repair,          // 维修
  inspection,      // 检测
  bodywork,        // 钣喷
  insurance,       // 保险
  emergency,       // 紧急救援
}
```

### 服务进度模型
```dart
@freezed
class ServiceProgress with _$ServiceProgress {
  const factory ServiceProgress({
    required String appointmentId,
    required ServiceStatus status,
    required List<ServiceStep> steps,
    required Technician technician,
    required Store store,
    @Default([]) List<ServicePhoto> photos,
    String? currentStepDescription,
    DateTime? estimatedCompletion,
    double? totalCost,
  }) = _ServiceProgress;

  factory ServiceProgress.fromJson(Map<String, dynamic> json) =>
      _$ServiceProgressFromJson(json);
}

@freezed
class ServiceStep with _$ServiceStep {
  const factory ServiceStep({
    required String id,
    required String title,
    required String description,
    required bool isCompleted,
    DateTime? completedAt,
    String? note,
  }) = _ServiceStep;

  factory ServiceStep.fromJson(Map<String, dynamic> json) =>
      _$ServiceStepFromJson(json);
}
```

## 业务流程实现

### 预约流程管理
```dart
class AppointmentWorkflow {
  static Future<AppointmentResult> executeBookingWorkflow(
    AppointmentRequest request,
  ) async {
    try {
      // 1. 验证预约时间可用性
      final availability = await _checkTimeAvailability(
        request.storeId,
        request.appointmentTime,
      );
      
      if (!availability.isAvailable) {
        return AppointmentResult.failure(
          error: '所选时间不可用，建议时间：${availability.suggestedTimes}',
        );
      }
      
      // 2. 创建预约记录
      final appointment = await AppointmentManager.createAppointment(request);
      
      // 3. 发送确认通知
      await NotificationService.sendAppointmentConfirmation(appointment);
      
      // 4. 更新门店排班
      await StoreScheduleService.updateSchedule(
        appointment.store.id,
        appointment.appointmentTime,
      );
      
      return AppointmentResult.success(appointment: appointment);
    } catch (e) {
      return AppointmentResult.failure(error: e.toString());
    }
  }
}
```

## 集成和测试

### API集成
```dart
class AfterSalesAPI {
  static const String baseUrl = 'https://api.oneapp.com/after-sales';
  static final Dio _dio = Dio();
  
  static Future<ApiResponse> createAppointment(Map<String, dynamic> data) async {
    final response = await _dio.post('$baseUrl/appointments', data: data);
    return ApiResponse.fromJson(response.data);
  }
  
  static Future<ApiResponse> getServiceProgress(String appointmentId) async {
    final response = await _dio.get('$baseUrl/appointments/$appointmentId/progress');
    return ApiResponse.fromJson(response.data);
  }
}
```

### 单元测试
```dart
void main() {
  group('AppointmentManager', () {
    test('should create appointment successfully', () async {
      final request = AppointmentRequest(
        serviceType: ServiceType.maintenance,
        storeId: 'store_123',
        appointmentTime: DateTime.now().add(Duration(days: 1)),
        vehicleInfo: VehicleInfo(vin: 'TEST123'),
      );
      
      final appointment = await AppointmentManager.createAppointment(request);
      
      expect(appointment.id, isNotEmpty);
      expect(appointment.serviceType, ServiceType.maintenance);
      expect(appointment.status, AppointmentStatus.pending);
    });
  });
}
```

## 最佳实践

### 用户体验优化
1. **流程简化**: 减少预约步骤，提供智能推荐
2. **实时反馈**: 及时更新服务进度和状态
3. **多渠道沟通**: 提供电话、在线客服等多种联系方式
4. **透明计费**: 清晰展示费用明细和计算过程

### 性能优化
1. **数据缓存**: 缓存门店信息和服务数据
2. **图片优化**: 压缩和缓存服务照片
3. **网络优化**: 使用CDN加速资源加载
4. **离线支持**: 关键信息支持离线查看

## 总结

`oneapp_after_sales` 模块作为售后服务的主要入口，通过完整的业务流程设计和用户友好的界面实现，为车主提供了便捷高效的售后服务体验。模块具有良好的扩展性和可维护性，能够适应不断变化的售后服务需求。
