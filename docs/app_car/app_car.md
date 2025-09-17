# App Car - 车辆控制主模块文档

## 模块概述

`app_car` 是 OneApp 车辆功能的核心模块，提供完整的车辆控制、状态监控、远程操作等功能。该模块集成了车联网通信、车辆状态管理、空调控制、车门锁控制、充电管理等核心车辆服务。

### 基本信息
- **模块名称**: app_car
- **版本**: 0.6.48+4
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-car-app
- **Flutter 版本**: >=3.0.0
- **Dart 版本**: >=3.0.0 <4.0.0

## 目录结构

```
app_car/
├── lib/
│   ├── app_car.dart              # 主导出文件
│   ├── app_car_temp.dart         # 临时配置文件
│   ├── generated/                # 代码生成文件
│   ├── l10n/                     # 国际化文件
│   └── src/                      # 源代码目录
│       ├── ai_chat/              # AI 聊天集成
│       ├── app_ingeek_mdk/       # 车钥匙 MDK 集成
│       ├── bloc/                 # 状态管理（BLoC）
│       ├── car_animation/        # 车辆动画效果
│       ├── car_charging_center/  # 充电中心功能
│       ├── car_charging_profiles/# 充电配置文件
│       ├── car_climatisation/    # 空调控制
│       ├── car_climatisation_50/ # 空调控制（5.0版本）
│       ├── car_common_widget/    # 车辆通用组件
│       ├── car_digital_key_renewal/# 数字钥匙更新
│       ├── car_enum/             # 车辆相关枚举
│       ├── car_finder_card/      # 车辆查找卡片
│       ├── car_health_status/    # 车辆健康状态
│       ├── car_lock_unlock/      # 车门锁控制
│       ├── car_vehicle_status/   # 车辆状态管理
│       ├── constants/            # 常量定义
│       ├── dbr_card/             # DBR 卡片组件
│       ├── models/               # 数据模型
│       ├── pages/                # 页面组件
│       ├── res/                  # 资源文件
│       ├── utils/                # 工具类
│       ├── common_import.dart    # 通用导入
│       ├── route_dp.dart         # 路由配置
│       └── route_export.dart     # 路由导出
├── assets/                       # 静态资源
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 车辆控制核心 (Vehicle Control Core)

#### 车门锁控制 (`car_lock_unlock/`)
```dart
// 车门锁控制服务
class CarLockUnlockService {
  // 车门上锁
  Future<Result<void>> lockVehicle() async {
    return await _vehicleConnector.sendCommand(
      VehicleCommand.lock(),
    );
  }
  
  // 车门解锁
  Future<Result<void>> unlockVehicle() async {
    return await _vehicleConnector.sendCommand(
      VehicleCommand.unlock(),
    );
  }
  
  // 获取车门锁状态
  Future<Result<LockStatus>> getLockStatus() async {
    return await _vehicleConnector.getVehicleStatus()
        .map((status) => status.lockStatus);
  }
}
```

#### 空调控制 (`car_climatisation/`, `car_climatisation_50/`)
```dart
// 空调控制服务
class CarClimatisationService {
  // 开启空调
  Future<Result<void>> startClimatisation({
    required double targetTemperature,
    AirConditioningMode mode = AirConditioningMode.auto,
  }) async {
    return await _vehicleConnector.sendCommand(
      ClimatisationCommand.start(
        temperature: targetTemperature,
        mode: mode,
      ),
    );
  }
  
  // 关闭空调
  Future<Result<void>> stopClimatisation() async {
    return await _vehicleConnector.sendCommand(
      ClimatisationCommand.stop(),
    );
  }
  
  // 预设温度控制
  Future<Result<void>> setPresetTemperature(
    TemperaturePreset preset,
  ) async {
    return await _vehicleConnector.sendCommand(
      ClimatisationCommand.setPreset(preset),
    );
  }
}
```

### 2. 车辆状态管理 (`car_vehicle_status/`)

#### 实时状态监控
```dart
// 车辆状态管理器
class VehicleStatusManager {
  Stream<VehicleStatus> get statusStream => _statusController.stream;
  
  final StreamController<VehicleStatus> _statusController = 
      StreamController.broadcast();
  
  // 启动状态监控
  void startStatusMonitoring() {
    _statusTimer = Timer.periodic(
      Duration(seconds: 30),
      (_) => _fetchVehicleStatus(),
    );
  }
  
  Future<void> _fetchVehicleStatus() async {
    try {
      final status = await _vehicleConnector.getVehicleStatus();
      status.fold(
        (failure) => _handleStatusError(failure),
        (vehicleStatus) => _statusController.add(vehicleStatus),
      );
    } catch (e) {
      _handleStatusError(VehicleFailure.networkError(e.toString()));
    }
  }
}
```

#### 车辆健康状态 (`car_health_status/`)
```dart
// 车辆健康状态模型
class VehicleHealthStatus {
  final BatteryHealth batteryHealth;
  final EngineHealth engineHealth;
  final List<MaintenanceAlert> maintenanceAlerts;
  final List<DiagnosticCode> diagnosticCodes;
  final DateTime lastCheckTime;
  
  const VehicleHealthStatus({
    required this.batteryHealth,
    required this.engineHealth,
    required this.maintenanceAlerts,
    required this.diagnosticCodes,
    required this.lastCheckTime,
  });
  
  // 获取整体健康评分
  HealthScore get overallScore {
    final scores = [
      batteryHealth.score,
      engineHealth.score,
    ];
    final average = scores.reduce((a, b) => a + b) / scores.length;
    return HealthScore.fromValue(average);
  }
}
```

### 3. 充电管理 (`car_charging_center/`, `car_charging_profiles/`)

#### 充电中心控制
```dart
// 充电管理服务
class ChargingCenterService {
  // 开始充电
  Future<Result<void>> startCharging({
    ChargingProfile? profile,
    DateTime? scheduledTime,
  }) async {
    return await _vehicleConnector.sendCommand(
      ChargingCommand.start(
        profile: profile ?? ChargingProfile.standard(),
        scheduledTime: scheduledTime,
      ),
    );
  }
  
  // 停止充电
  Future<Result<void>> stopCharging() async {
    return await _vehicleConnector.sendCommand(
      ChargingCommand.stop(),
    );
  }
  
  // 设置充电目标
  Future<Result<void>> setChargingTarget(int targetPercentage) async {
    return await _vehicleConnector.sendCommand(
      ChargingCommand.setTarget(targetPercentage),
    );
  }
}
```

#### 充电配置文件管理
```dart
// 充电配置文件
class ChargingProfile {
  final String id;
  final String name;
  final int targetPercentage;
  final ChargingSpeed speed;
  final bool isEcoMode;
  final TimeWindow? timeWindow;
  
  const ChargingProfile({
    required this.id,
    required this.name,
    required this.targetPercentage,
    required this.speed,
    this.isEcoMode = false,
    this.timeWindow,
  });
  
  // 标准充电配置
  factory ChargingProfile.standard() {
    return ChargingProfile(
      id: 'standard',
      name: '标准充电',
      targetPercentage: 80,
      speed: ChargingSpeed.normal,
    );
  }
  
  // 快速充电配置
  factory ChargingProfile.fast() {
    return ChargingProfile(
      id: 'fast',
      name: '快速充电',
      targetPercentage: 100,
      speed: ChargingSpeed.fast,
    );
  }
}
```

### 4. 数字钥匙管理 (`car_digital_key_renewal/`, `app_ingeek_mdk/`)

#### 数字钥匙服务
```dart
// 数字钥匙管理服务
class DigitalKeyService {
  // 数字钥匙续期
  Future<Result<void>> renewDigitalKey() async {
    try {
      final result = await _ingeekMdk.renewKey();
      if (result.isSuccess) {
        await _updateLocalKeyInfo(result.keyInfo);
        return Right(unit);
      } else {
        return Left(DigitalKeyFailure.renewalFailed(result.error));
      }
    } catch (e) {
      return Left(DigitalKeyFailure.networkError(e.toString()));
    }
  }
  
  // 检查钥匙状态
  Future<Result<DigitalKeyStatus>> checkKeyStatus() async {
    try {
      final keyInfo = await _ingeekMdk.getKeyInfo();
      return Right(DigitalKeyStatus.fromKeyInfo(keyInfo));
    } catch (e) {
      return Left(DigitalKeyFailure.statusCheckFailed(e.toString()));
    }
  }
  
  // 激活数字钥匙
  Future<Result<void>> activateDigitalKey(String activationCode) async {
    return await _ingeekMdk.activateKey(activationCode);
  }
}
```

### 5. 车辆查找功能 (`car_finder_card/`)

#### 车辆定位服务
```dart
// 车辆查找服务
class CarFinderService {
  // 获取车辆位置
  Future<Result<VehicleLocation>> getVehicleLocation() async {
    return await _vehicleConnector.getVehicleLocation();
  }
  
  // 闪灯鸣笛
  Future<Result<void>> flashAndHonk() async {
    return await _vehicleConnector.sendCommand(
      VehicleCommand.flashAndHonk(),
    );
  }
  
  // 计算到车辆的距离
  Future<Result<Distance>> calculateDistanceToVehicle(
    UserLocation userLocation,
  ) async {
    final vehicleLocationResult = await getVehicleLocation();
    return vehicleLocationResult.map((vehicleLocation) {
      return Distance.calculate(userLocation, vehicleLocation.coordinates);
    });
  }
}
```

## 状态管理架构 (`bloc/`)

### BLoC 模式实现
```dart
// 车辆状态 BLoC
class VehicleStatusBloc extends Bloc<VehicleStatusEvent, VehicleStatusState> {
  final VehicleStatusRepository _repository;
  
  VehicleStatusBloc(this._repository) : super(VehicleStatusInitial()) {
    on<LoadVehicleStatus>(_onLoadVehicleStatus);
    on<RefreshVehicleStatus>(_onRefreshVehicleStatus);
    on<VehicleStatusUpdated>(_onVehicleStatusUpdated);
  }
  
  Future<void> _onLoadVehicleStatus(
    LoadVehicleStatus event,
    Emitter<VehicleStatusState> emit,
  ) async {
    emit(VehicleStatusLoading());
    
    final result = await _repository.getVehicleStatus();
    result.fold(
      (failure) => emit(VehicleStatusError(failure.message)),
      (status) => emit(VehicleStatusLoaded(status)),
    );
  }
}

// 车辆控制 BLoC
class VehicleControlBloc extends Bloc<VehicleControlEvent, VehicleControlState> {
  final VehicleControlRepository _repository;
  
  VehicleControlBloc(this._repository) : super(VehicleControlInitial()) {
    on<LockVehicle>(_onLockVehicle);
    on<UnlockVehicle>(_onUnlockVehicle);
    on<StartClimatisation>(_onStartClimatisation);
    on<StopClimatisation>(_onStopClimatisation);
  }
  
  Future<void> _onLockVehicle(
    LockVehicle event,
    Emitter<VehicleControlState> emit,
  ) async {
    emit(VehicleControlLoading());
    
    final result = await _repository.lockVehicle();
    result.fold(
      (failure) => emit(VehicleControlError(failure.message)),
      (_) => emit(VehicleControlSuccess('车辆已上锁')),
    );
  }
}
```

## 数据模型 (`models/`)

### 车辆状态模型
```dart
// 车辆状态模型
class VehicleStatus {
  final String vehicleId;
  final LockStatus lockStatus;
  final BatteryStatus batteryStatus;
  final ClimatisationStatus climatisationStatus;
  final ChargingStatus chargingStatus;
  final VehicleLocation? location;
  final DateTime lastUpdated;
  
  const VehicleStatus({
    required this.vehicleId,
    required this.lockStatus,
    required this.batteryStatus,
    required this.climatisationStatus,
    required this.chargingStatus,
    this.location,
    required this.lastUpdated,
  });
  
  factory VehicleStatus.fromJson(Map<String, dynamic> json) {
    return VehicleStatus(
      vehicleId: json['vehicle_id'],
      lockStatus: LockStatus.fromString(json['lock_status']),
      batteryStatus: BatteryStatus.fromJson(json['battery_status']),
      climatisationStatus: ClimatisationStatus.fromJson(json['climatisation_status']),
      chargingStatus: ChargingStatus.fromJson(json['charging_status']),
      location: json['location'] != null 
          ? VehicleLocation.fromJson(json['location']) 
          : null,
      lastUpdated: DateTime.parse(json['last_updated']),
    );
  }
}
```

### 车辆控制命令模型
```dart
// 车辆控制命令
abstract class VehicleCommand {
  const VehicleCommand();
  
  // 车门锁命令
  factory VehicleCommand.lock() = LockCommand;
  factory VehicleCommand.unlock() = UnlockCommand;
  
  // 空调命令
  factory VehicleCommand.startClimatisation({
    required double temperature,
    AirConditioningMode mode,
  }) = StartClimatisationCommand;
  
  factory VehicleCommand.stopClimatisation() = StopClimatisationCommand;
  
  // 充电命令
  factory VehicleCommand.startCharging({
    ChargingProfile? profile,
  }) = StartChargingCommand;
  
  factory VehicleCommand.stopCharging() = StopChargingCommand;
  
  // 车辆查找命令
  factory VehicleCommand.flashAndHonk() = FlashAndHonkCommand;
}
```

## 枚举定义 (`car_enum/`)

### 车辆状态枚举
```dart
// 车门锁状态
enum LockStatus {
  locked,
  unlocked,
  unknown;
  
  static LockStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'locked':
        return LockStatus.locked;
      case 'unlocked':
        return LockStatus.unlocked;
      default:
        return LockStatus.unknown;
    }
  }
}

// 充电状态
enum ChargingStatus {
  notConnected,
  connected,
  charging,
  chargingComplete,
  chargingError;
  
  bool get isCharging => this == ChargingStatus.charging;
  bool get isConnected => this != ChargingStatus.notConnected;
}

// 空调模式
enum AirConditioningMode {
  auto,
  heat,
  cool,
  ventilation,
  defrost;
  
  String get displayName {
    switch (this) {
      case AirConditioningMode.auto:
        return '自动';
      case AirConditioningMode.heat:
        return '制热';
      case AirConditioningMode.cool:
        return '制冷';
      case AirConditioningMode.ventilation:
        return '通风';
      case AirConditioningMode.defrost:
        return '除霜';
    }
  }
}
```

## UI 组件 (`car_common_widget/`)

### 车辆状态卡片
```dart
// 车辆状态卡片组件
class VehicleStatusCard extends StatelessWidget {
  final VehicleStatus status;
  final VoidCallback? onRefresh;
  
  const VehicleStatusCard({
    Key? key,
    required this.status,
    this.onRefresh,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            SizedBox(height: 16),
            _buildStatusGrid(),
            SizedBox(height: 16),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatusGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      children: [
        _buildStatusItem('车门', status.lockStatus.displayName),
        _buildStatusItem('电量', '${status.batteryStatus.percentage}%'),
        _buildStatusItem('空调', status.climatisationStatus.displayName),
        _buildStatusItem('充电', status.chargingStatus.displayName),
      ],
    );
  }
}
```

### 车辆控制面板
```dart
// 车辆控制面板
class VehicleControlPanel extends StatelessWidget {
  final VehicleStatus status;
  final Function(VehicleCommand) onCommand;
  
  const VehicleControlPanel({
    Key? key,
    required this.status,
    required this.onCommand,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildLockControls(),
        SizedBox(height: 16),
        _buildClimatisationControls(),
        SizedBox(height: 16),
        _buildChargingControls(),
        SizedBox(height: 16),
        _buildFinderControls(),
      ],
    );
  }
  
  Widget _buildLockControls() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: status.lockStatus == LockStatus.unlocked
                ? () => onCommand(VehicleCommand.lock())
                : null,
            icon: Icon(Icons.lock),
            label: Text('上锁'),
          ),
        ),
        SizedBox(width: 8),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: status.lockStatus == LockStatus.locked
                ? () => onCommand(VehicleCommand.unlock())
                : null,
            icon: Icon(Icons.lock_open),
            label: Text('解锁'),
          ),
        ),
      ],
    );
  }
}
```

## 动画效果 (`car_animation/`)

### 车辆控制动画
```dart
// 车辆控制动画控制器
class VehicleAnimationController extends ChangeNotifier {
  late AnimationController _lockAnimationController;
  late AnimationController _chargingAnimationController;
  
  Animation<double> get lockAnimation => _lockAnimationController;
  Animation<double> get chargingAnimation => _chargingAnimationController;
  
  void initialize(TickerProvider vsync) {
    _lockAnimationController = AnimationController(
      duration: Duration(milliseconds: 500),
      vsync: vsync,
    );
    
    _chargingAnimationController = AnimationController(
      duration: Duration(milliseconds: 1500),
      vsync: vsync,
    )..repeat();
  }
  
  void playLockAnimation() {
    _lockAnimationController.forward().then((_) {
      _lockAnimationController.reverse();
    });
  }
  
  void startChargingAnimation() {
    _chargingAnimationController.repeat();
  }
  
  void stopChargingAnimation() {
    _chargingAnimationController.stop();
  }
}
```

## AI 聊天集成 (`ai_chat/`)

### AI 聊天车辆控制
```dart
// AI 聊天车辆控制集成
class AIChatVehicleIntegration {
  final VehicleControlRepository _vehicleRepository;
  final AIChatAssistant _aiAssistant;
  
  AIChatVehicleIntegration(this._vehicleRepository, this._aiAssistant);
  
  // 处理车辆控制语音命令
  Future<AIChatResponse> handleVehicleCommand(String command) async {
    final intent = await _aiAssistant.parseIntent(command);
    
    switch (intent.type) {
      case VehicleIntentType.lock:
        return await _handleLockCommand();
      case VehicleIntentType.unlock:
        return await _handleUnlockCommand();
      case VehicleIntentType.startAC:
        return await _handleStartACCommand(intent.parameters);
      case VehicleIntentType.stopAC:
        return await _handleStopACCommand();
      default:
        return AIChatResponse.error('未识别的车辆控制命令');
    }
  }
  
  Future<AIChatResponse> _handleLockCommand() async {
    final result = await _vehicleRepository.lockVehicle();
    return result.fold(
      (failure) => AIChatResponse.error('车辆上锁失败：${failure.message}'),
      (_) => AIChatResponse.success('车辆已成功上锁'),
    );
  }
}
```

## 依赖管理

### 核心依赖
- **car_connector**: 车联网连接服务
- **car_vehicle**: 车辆基础服务
- **car_vur**: 车辆更新记录
- **flutter_ingeek_carkey**: 数字钥匙 SDK

### 框架依赖
- **basic_modular**: 模块化框架
- **basic_modular_route**: 路由管理
- **basic_intl**: 国际化支持
- **basic_storage**: 本地存储

### 业务依赖
- **ai_chat_assistant**: AI 聊天助手集成
- **clr_mno**: MNO 服务
- **dartz**: 函数式编程支持

## 路由配置 (`route_dp.dart`, `route_export.dart`)

### 路由定义
```dart
// 车辆模块路由配置
class CarRoutes {
  static const String vehicleStatus = '/car/status';
  static const String vehicleControl = '/car/control';
  static const String chargingCenter = '/car/charging';
  static const String digitalKey = '/car/digital-key';
  static const String carFinder = '/car/finder';
  static const String climatisation = '/car/climatisation';
  
  static List<ModularRoute> get routes => [
    ChildRoute(
      vehicleStatus,
      child: (context, args) => VehicleStatusPage(),
    ),
    ChildRoute(
      vehicleControl,
      child: (context, args) => VehicleControlPage(),
    ),
    ChildRoute(
      chargingCenter,
      child: (context, args) => ChargingCenterPage(),
    ),
    ChildRoute(
      digitalKey,
      child: (context, args) => DigitalKeyPage(),
    ),
    ChildRoute(
      carFinder,
      child: (context, args) => CarFinderPage(),
    ),
    ChildRoute(
      climatisation,
      child: (context, args) => ClimatisationPage(),
    ),
  ];
}
```

## 常量定义 (`constants/`)

### 车辆常量
```dart
// 车辆控制常量
class CarConstants {
  // 温度范围
  static const double minTemperature = 16.0;
  static const double maxTemperature = 32.0;
  static const double defaultTemperature = 22.0;
  
  // 充电相关
  static const int minChargingTarget = 20;
  static const int maxChargingTarget = 100;
  static const int defaultChargingTarget = 80;
  
  // 动画时长
  static const Duration lockAnimationDuration = Duration(milliseconds: 500);
  static const Duration statusUpdateInterval = Duration(seconds: 30);
  
  // 错误重试
  static const int maxRetryCount = 3;
  static const Duration retryDelay = Duration(seconds: 2);
}
```

## 错误处理

### 车辆特定异常
```dart
// 车辆操作异常
abstract class VehicleFailure {
  const VehicleFailure();
  
  factory VehicleFailure.networkError(String message) = NetworkFailure;
  factory VehicleFailure.authenticationError() = AuthenticationFailure;
  factory VehicleFailure.vehicleNotFound() = VehicleNotFoundFailure;
  factory VehicleFailure.commandTimeout() = CommandTimeoutFailure;
  factory VehicleFailure.vehicleOffline() = VehicleOfflineFailure;
  factory VehicleFailure.insufficientBattery() = InsufficientBatteryFailure;
}

class NetworkFailure extends VehicleFailure {
  final String message;
  const NetworkFailure(this.message);
}

class VehicleOfflineFailure extends VehicleFailure {
  const VehicleOfflineFailure();
}
```

## 性能优化

### 状态缓存策略
- 车辆状态本地缓存
- 智能刷新机制
- 后台状态同步

### 网络优化
- 命令队列管理
- 批量请求处理
- 离线命令缓存

### UI 优化
- 状态变更动画
- 加载状态指示
- 错误状态处理

## 测试策略

### 单元测试
- BLoC 状态管理测试
- 服务类功能测试
- 模型序列化测试

### 集成测试
- 车联网通信测试
- 状态同步测试
- 命令执行测试

### UI 测试
- 控制面板交互测试
- 状态显示测试
- 错误场景测试

## 总结

`app_car` 模块是 OneApp 车辆功能的核心，提供了完整的车辆控制和状态管理功能。模块采用 BLoC 模式进行状态管理，具有清晰的分层架构和良好的可扩展性。通过集成 AI 聊天助手和数字钥匙技术，为用户提供了智能化和便捷的车辆操作体验。
