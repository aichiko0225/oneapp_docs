# App Charging - 充电管理模块文档

## 模块概述

`app_charging` 是 OneApp 的充电管理核心模块，提供完整的电动车充电功能，包括充电桩查找、充电状态监控、充电历史记录、支付结算等全流程充电服务。该模块集成了地图服务、二维码扫描、支付功能等，为用户提供便捷的充电体验。

### 基本信息
- **模块名称**: app_charging
- **版本**: 0.3.13
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-app-charging
- **Flutter 版本**: >=2.10.5
- **Dart 版本**: >=2.17.0 <4.0.0

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
│       ├── utils/                # 工具类
│       ├── route_dp.dart         # 路由配置
│       ├── route_export.dart     # 路由导出
│       └── switch_vehicle.dart   # 车辆切换功能
├── assets/                       # 静态资源
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 充电桩查找与导航

#### 地图集成充电桩搜索
```dart
// 充电桩查找服务
class ChargingStationFinder {
  final GeoService _geoService;
  final ChargingService _chargingService;
  
  ChargingStationFinder(this._geoService, this._chargingService);
  
  // 搜索附近充电桩
  Future<Result<List<ChargingStation>>> findNearbyStations({
    required LatLng location,
    double radiusKm = 5.0,
    ChargingStationType? type,
    bool onlyAvailable = false,
  }) async {
    try {
      final stations = await _chargingService.searchStations(
        location: location,
        radius: radiusKm,
        type: type,
        availableOnly: onlyAvailable,
      );
      
      return Right(stations);
    } catch (e) {
      return Left(ChargingFailure.searchFailed(e.toString()));
    }
  }
  
  // 规划充电路线
  Future<Result<ChargingRoute>> planChargingRoute({
    required LatLng origin,
    required LatLng destination,
    required VehicleBatteryStatus batteryStatus,
  }) async {
    // 计算路线所需充电点
    final routeDistance = await _geoService.calculateDistance(origin, destination);
    final requiredCharging = _calculateChargingNeeds(routeDistance, batteryStatus);
    
    if (!requiredCharging.needsCharging) {
      return Right(ChargingRoute.direct(origin, destination));
    }
    
    // 查找路线上的充电桩
    final waypoints = await _findChargingWaypoints(
      origin: origin,
      destination: destination,
      chargingNeeds: requiredCharging,
    );
    
    return Right(ChargingRoute.withCharging(origin, destination, waypoints));
  }
}
```

#### 充电桩详情与状态
```dart
// 充电桩状态模型
class ChargingStation {
  final String id;
  final String name;
  final String address;
  final LatLng location;
  final List<ChargingPoint> chargingPoints;
  final StationOperator operator;
  final double rating;
  final List<String> amenities;
  final StationStatus status;
  final PricingInfo pricing;
  
  const ChargingStation({
    required this.id,
    required this.name,
    required this.address,
    required this.location,
    required this.chargingPoints,
    required this.operator,
    required this.rating,
    required this.amenities,
    required this.status,
    required this.pricing,
  });
  
  // 获取可用充电桩数量
  int get availablePointsCount => chargingPoints
      .where((point) => point.status == ChargingPointStatus.available)
      .length;
  
  // 获取最大充电功率
  double get maxPower => chargingPoints
      .map((point) => point.maxPower)
      .reduce(math.max);
  
  // 是否支持快充
  bool get supportsFastCharging => chargingPoints
      .any((point) => point.type == ChargingPointType.dcFast);
}

// 充电桩充电点
class ChargingPoint {
  final String id;
  final ChargingPointType type;
  final double maxPower;
  final ChargingPointStatus status;
  final ConnectorType connectorType;
  final double pricePerKwh;
  final EstimatedChargingTime? estimatedTime;
  
  const ChargingPoint({
    required this.id,
    required this.type,
    required this.maxPower,
    required this.status,
    required this.connectorType,
    required this.pricePerKwh,
    this.estimatedTime,
  });
}
```

### 2. 充电会话管理

#### 充电启动与控制
```dart
// 充电会话管理服务
class ChargingSessionManager {
  final ChargingService _chargingService;
  final PaymentService _paymentService;
  
  ChargingSessionManager(this._chargingService, this._paymentService);
  
  // 启动充电会话
  Future<Result<ChargingSession>> startChargingSession({
    required String stationId,
    required String pointId,
    required PaymentMethod paymentMethod,
    ChargingTarget? target,
  }) async {
    try {
      // 1. 验证充电桩可用性
      final pointStatus = await _chargingService.getPointStatus(pointId);
      if (pointStatus.status != ChargingPointStatus.available) {
        return Left(ChargingFailure.pointUnavailable());
      }
      
      // 2. 预授权支付
      final paymentAuth = await _paymentService.authorizePayment(
        paymentMethod: paymentMethod,
        estimatedAmount: _calculateEstimatedCost(target, pointStatus),
      );
      
      if (paymentAuth.isLeft()) {
        return Left(ChargingFailure.paymentFailed());
      }
      
      // 3. 启动充电
      final session = await _chargingService.startCharging(
        pointId: pointId,
        paymentAuthId: paymentAuth.getOrElse(() => ''),
        target: target,
      );
      
      return Right(session);
    } catch (e) {
      return Left(ChargingFailure.sessionStartFailed(e.toString()));
    }
  }
  
  // 停止充电会话
  Future<Result<ChargingSessionSummary>> stopChargingSession(
    String sessionId,
  ) async {
    try {
      final session = await _chargingService.stopCharging(sessionId);
      
      // 处理支付结算
      final payment = await _paymentService.processPayment(
        sessionId: sessionId,
        amount: session.totalCost,
      );
      
      return Right(ChargingSessionSummary.fromSession(session, payment));
    } catch (e) {
      return Left(ChargingFailure.sessionStopFailed(e.toString()));
    }
  }
}
```

#### 充电状态监控
```dart
// 充电会话实时状态
class ChargingSession {
  final String id;
  final String stationId;
  final String pointId;
  final DateTime startTime;
  final ChargingSessionStatus status;
  final ChargingProgress progress;
  final ChargingTarget target;
  final double currentCost;
  final Duration estimatedTimeRemaining;
  
  const ChargingSession({
    required this.id,
    required this.stationId,
    required this.pointId,
    required this.startTime,
    required this.status,
    required this.progress,
    required this.target,
    required this.currentCost,
    required this.estimatedTimeRemaining,
  });
  
  // 充电进度百分比
  double get progressPercentage {
    switch (target.type) {
      case ChargingTargetType.percentage:
        return (progress.currentPercentage - progress.startPercentage) /
               (target.targetPercentage! - progress.startPercentage);
      case ChargingTargetType.energy:
        return progress.energyDelivered / target.targetEnergy!;
      case ChargingTargetType.time:
        final elapsed = DateTime.now().difference(startTime);
        return elapsed.inMinutes / target.targetMinutes!;
    }
  }
}

// 充电进度信息
class ChargingProgress {
  final double startPercentage;
  final double currentPercentage;
  final double energyDelivered; // kWh
  final double currentPower; // kW
  final double averagePower; // kW
  final Duration chargingTime;
  
  const ChargingProgress({
    required this.startPercentage,
    required this.currentPercentage,
    required this.energyDelivered,
    required this.currentPower,
    required this.averagePower,
    required this.chargingTime,
  });
}
```

### 3. 二维码扫描启动充电

#### 扫码充电服务
```dart
// 二维码充电启动服务
class QRCodeChargingService {
  final ScanKitService _scanService;
  final ChargingSessionManager _sessionManager;
  
  QRCodeChargingService(this._scanService, this._sessionManager);
  
  // 扫描充电桩二维码
  Future<Result<ChargingPointInfo>> scanChargingPoint() async {
    try {
      final scanResult = await _scanService.startScan();
      
      if (scanResult.isSuccess) {
        final qrData = scanResult.code;
        final pointInfo = await _parseChargingQRCode(qrData);
        return Right(pointInfo);
      } else {
        return Left(ChargingFailure.scanFailed());
      }
    } catch (e) {
      return Left(ChargingFailure.scanError(e.toString()));
    }
  }
  
  // 解析充电桩二维码
  Future<ChargingPointInfo> _parseChargingQRCode(String qrData) async {
    // QR码格式：charging://station/{stationId}/point/{pointId}
    final uri = Uri.parse(qrData);
    
    if (uri.scheme != 'charging') {
      throw ChargingException('无效的充电桩二维码');
    }
    
    final pathSegments = uri.pathSegments;
    if (pathSegments.length < 4 || 
        pathSegments[0] != 'station' || 
        pathSegments[2] != 'point') {
      throw ChargingException('二维码格式错误');
    }
    
    final stationId = pathSegments[1];
    final pointId = pathSegments[3];
    
    // 获取充电桩详细信息
    final stationInfo = await _chargingService.getStationInfo(stationId);
    final pointInfo = stationInfo.chargingPoints
        .firstWhere((point) => point.id == pointId);
    
    return ChargingPointInfo(
      stationId: stationId,
      pointId: pointId,
      station: stationInfo,
      point: pointInfo,
    );
  }
  
  // 通过扫码启动充电
  Future<Result<ChargingSession>> startChargingFromQR(
    ChargingPointInfo pointInfo,
    PaymentMethod paymentMethod,
  ) async {
    return await _sessionManager.startChargingSession(
      stationId: pointInfo.stationId,
      pointId: pointInfo.pointId,
      paymentMethod: paymentMethod,
    );
  }
}
```

### 4. 充电历史与统计

#### 充电记录管理
```dart
// 充电历史记录服务
class ChargingHistoryService {
  final ChargingService _chargingService;
  final StorageService _storageService;
  
  ChargingHistoryService(this._chargingService, this._storageService);
  
  // 获取充电历史记录
  Future<Result<List<ChargingRecord>>> getChargingHistory({
    DateRange? dateRange,
    String? stationId,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final records = await _chargingService.getChargingRecords(
        startDate: dateRange?.start,
        endDate: dateRange?.end,
        stationId: stationId,
        page: page,
        pageSize: pageSize,
      );
      
      // 缓存到本地
      await _cacheChargingRecords(records);
      
      return Right(records);
    } catch (e) {
      // 尝试从缓存加载
      final cachedRecords = await _loadCachedRecords();
      if (cachedRecords.isNotEmpty) {
        return Right(cachedRecords);
      }
      return Left(ChargingFailure.historyLoadFailed(e.toString()));
    }
  }
  
  // 获取充电统计信息
  Future<Result<ChargingStatistics>> getChargingStatistics({
    required StatisticsPeriod period,
  }) async {
    try {
      final stats = await _chargingService.getChargingStatistics(period);
      return Right(stats);
    } catch (e) {
      return Left(ChargingFailure.statisticsLoadFailed(e.toString()));
    }
  }
}

// 充电记录模型
class ChargingRecord {
  final String id;
  final String sessionId;
  final String stationName;
  final String stationAddress;
  final DateTime startTime;
  final DateTime endTime;
  final double energyDelivered;
  final double totalCost;
  final int startPercentage;
  final int endPercentage;
  final Duration chargingDuration;
  final PaymentMethod paymentMethod;
  final ChargingRecordStatus status;
  
  const ChargingRecord({
    required this.id,
    required this.sessionId,
    required this.stationName,
    required this.stationAddress,
    required this.startTime,
    required this.endTime,
    required this.energyDelivered,
    required this.totalCost,
    required this.startPercentage,
    required this.endPercentage,
    required this.chargingDuration,
    required this.paymentMethod,
    required this.status,
  });
  
  // 计算平均充电功率
  double get averagePower => energyDelivered / (chargingDuration.inHours);
  
  // 计算单位能量成本
  double get costPerKwh => totalCost / energyDelivered;
}
```

### 5. 充电支付管理

#### 支付方式与结算
```dart
// 充电支付服务
class ChargingPaymentService {
  final PaymentService _paymentService;
  final ChargingService _chargingService;
  
  ChargingPaymentService(this._paymentService, this._chargingService);
  
  // 获取可用支付方式
  Future<Result<List<PaymentMethod>>> getAvailablePaymentMethods() async {
    try {
      final methods = await _paymentService.getPaymentMethods();
      // 过滤支持充电的支付方式
      final chargingMethods = methods
          .where((method) => method.supportsCharging)
          .toList();
      return Right(chargingMethods);
    } catch (e) {
      return Left(PaymentFailure.methodsLoadFailed(e.toString()));
    }
  }
  
  // 处理充电支付
  Future<Result<PaymentResult>> processChargingPayment({
    required String sessionId,
    required double amount,
    required PaymentMethod paymentMethod,
  }) async {
    try {
      final paymentResult = await _paymentService.processPayment(
        amount: amount,
        paymentMethod: paymentMethod,
        description: '充电服务费用',
        metadata: {'session_id': sessionId, 'type': 'charging'},
      );
      
      if (paymentResult.isSuccess) {
        // 更新充电会话支付状态
        await _chargingService.updateSessionPaymentStatus(
          sessionId: sessionId,
          paymentId: paymentResult.paymentId,
          status: PaymentStatus.completed,
        );
      }
      
      return Right(paymentResult);
    } catch (e) {
      return Left(PaymentFailure.processingFailed(e.toString()));
    }
  }
  
  // 处理充电退款
  Future<Result<RefundResult>> processChargingRefund({
    required String sessionId,
    required String reason,
  }) async {
    try {
      final session = await _chargingService.getSessionDetails(sessionId);
      
      if (session.paymentStatus != PaymentStatus.completed) {
        return Left(PaymentFailure.invalidRefundState());
      }
      
      final refundResult = await _paymentService.processRefund(
        paymentId: session.paymentId!,
        amount: session.totalCost,
        reason: reason,
      );
      
      return Right(refundResult);
    } catch (e) {
      return Left(PaymentFailure.refundFailed(e.toString()));
    }
  }
}
```

## 状态管理 (`blocs/`)

### 充电桩搜索 BLoC
```dart
// 充电桩搜索状态管理
class ChargingStationBloc extends Bloc<ChargingStationEvent, ChargingStationState> {
  final ChargingStationFinder _stationFinder;
  final GeoService _geoService;
  
  ChargingStationBloc(this._stationFinder, this._geoService) 
      : super(ChargingStationInitial()) {
    on<SearchNearbyStations>(_onSearchNearbyStations);
    on<SearchStationsByKeyword>(_onSearchStationsByKeyword);
    on<FilterStations>(_onFilterStations);
    on<UpdateUserLocation>(_onUpdateUserLocation);
  }
  
  Future<void> _onSearchNearbyStations(
    SearchNearbyStations event,
    Emitter<ChargingStationState> emit,
  ) async {
    emit(ChargingStationLoading());
    
    final result = await _stationFinder.findNearbyStations(
      location: event.location,
      radiusKm: event.radiusKm,
      type: event.stationType,
      onlyAvailable: event.onlyAvailable,
    );
    
    result.fold(
      (failure) => emit(ChargingStationError(failure.message)),
      (stations) => emit(ChargingStationLoaded(
        stations: stations,
        userLocation: event.location,
      )),
    );
  }
}

// 充电会话 BLoC
class ChargingSessionBloc extends Bloc<ChargingSessionEvent, ChargingSessionState> {
  final ChargingSessionManager _sessionManager;
  Timer? _statusUpdateTimer;
  
  ChargingSessionBloc(this._sessionManager) : super(ChargingSessionInitial()) {
    on<StartChargingSession>(_onStartChargingSession);
    on<StopChargingSession>(_onStopChargingSession);
    on<UpdateChargingProgress>(_onUpdateChargingProgress);
  }
  
  Future<void> _onStartChargingSession(
    StartChargingSession event,
    Emitter<ChargingSessionState> emit,
  ) async {
    emit(ChargingSessionStarting());
    
    final result = await _sessionManager.startChargingSession(
      stationId: event.stationId,
      pointId: event.pointId,
      paymentMethod: event.paymentMethod,
      target: event.target,
    );
    
    result.fold(
      (failure) => emit(ChargingSessionError(failure.message)),
      (session) {
        emit(ChargingSessionActive(session));
        _startStatusUpdates(session.id);
      },
    );
  }
  
  void _startStatusUpdates(String sessionId) {
    _statusUpdateTimer = Timer.periodic(
      Duration(seconds: 10),
      (_) => add(UpdateChargingProgress(sessionId)),
    );
  }
}
```

## 页面组件 (`pages/`)

### 充电桩地图页面
```dart
// 充电桩地图页面
class ChargingStationMapPage extends StatefulWidget {
  @override
  _ChargingStationMapPageState createState() => _ChargingStationMapPageState();
}

class _ChargingStationMapPageState extends State<ChargingStationMapPage> {
  late AMapController _mapController;
  late ChargingStationBloc _stationBloc;
  LatLng? _userLocation;
  List<ChargingStation> _stations = [];
  
  @override
  void initState() {
    super.initState();
    _stationBloc = context.read<ChargingStationBloc>();
    _getUserLocationAndSearch();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildMap(),
          _buildSearchBar(),
          _buildFilterButton(),
          _buildStationList(),
        ],
      ),
      floatingActionButton: _buildLocationButton(),
    );
  }
  
  Widget _buildMap() {
    return AMapWidget(
      onMapCreated: (controller) {
        _mapController = controller;
        _setupMapStyle();
      },
      markers: _buildStationMarkers(),
      onTap: _onMapTap,
    );
  }
  
  Set<Marker> _buildStationMarkers() {
    return _stations.map((station) {
      return Marker(
        markerId: MarkerId(station.id),
        position: station.location,
        icon: _getStationIcon(station),
        onTap: () => _showStationDetails(station),
        infoWindow: InfoWindow(
          title: station.name,
          snippet: '${station.availablePointsCount}个可用充电桩',
        ),
      );
    }).toSet();
  }
  
  void _showStationDetails(ChargingStation station) {
    showModalBottomSheet(
      context: context,
      builder: (context) => ChargingStationDetailSheet(station: station),
    );
  }
}
```

### 充电会话页面
```dart
// 充电会话监控页面
class ChargingSessionPage extends StatefulWidget {
  final String sessionId;
  
  const ChargingSessionPage({required this.sessionId});
  
  @override
  _ChargingSessionPageState createState() => _ChargingSessionPageState();
}

class _ChargingSessionPageState extends State<ChargingSessionPage> {
  late ChargingSessionBloc _sessionBloc;
  
  @override
  void initState() {
    super.initState();
    _sessionBloc = context.read<ChargingSessionBloc>();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('充电中')),
      body: BlocBuilder<ChargingSessionBloc, ChargingSessionState>(
        builder: (context, state) {
          if (state is ChargingSessionActive) {
            return _buildActiveSession(state.session);
          } else if (state is ChargingSessionError) {
            return _buildErrorState(state.message);
          } else {
            return _buildLoadingState();
          }
        },
      ),
    );
  }
  
  Widget _buildActiveSession(ChargingSession session) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildProgressCard(session),
          SizedBox(height: 16),
          _buildSessionInfo(session),
          SizedBox(height: 16),
          _buildCostInfo(session),
          SizedBox(height: 24),
          _buildStopButton(session),
        ],
      ),
    );
  }
  
  Widget _buildProgressCard(ChargingSession session) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            CircularProgressIndicator(
              value: session.progressPercentage,
              strokeWidth: 8,
              backgroundColor: Colors.grey[300],
            ),
            SizedBox(height: 16),
            Text(
              '${(session.progressPercentage * 100).toInt()}%',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            Text(
              '预计剩余 ${session.estimatedTimeRemaining.inMinutes} 分钟',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
```

## 车辆查找集成 (`carfinder/`)

### 充电时车辆定位
```dart
// 充电时车辆查找功能
class ChargingCarFinder {
  final CarFinderService _carFinderService;
  final ChargingSessionManager _sessionManager;
  
  ChargingCarFinder(this._carFinderService, this._sessionManager);
  
  // 获取充电中的车辆位置
  Future<Result<VehicleLocation>> getChargingVehicleLocation(
    String sessionId,
  ) async {
    try {
      final session = await _sessionManager.getSessionDetails(sessionId);
      if (session.status != ChargingSessionStatus.active) {
        return Left(ChargingFailure.sessionNotActive());
      }
      
      // 获取充电桩位置作为车辆位置
      final station = await _chargingService.getStationInfo(session.stationId);
      final point = station.chargingPoints
          .firstWhere((p) => p.id == session.pointId);
      
      return Right(VehicleLocation(
        coordinates: station.location,
        accuracy: 10.0, // 充电桩位置精度较高
        timestamp: DateTime.now(),
        isCharging: true,
        chargingStationId: station.id,
        chargingPointId: point.id,
      ));
    } catch (e) {
      return Left(ChargingFailure.locationNotFound(e.toString()));
    }
  }
  
  // 闪灯提醒（充电时）
  Future<Result<void>> flashVehicleAtChargingStation(
    String sessionId,
  ) async {
    try {
      // 通过充电桩控制车辆闪灯
      final result = await _chargingService.triggerVehicleAlert(sessionId);
      return Right(unit);
    } catch (e) {
      // 回退到车辆直接控制
      return await _carFinderService.flashAndHonk();
    }
  }
}
```

## 工具类 (`utils/`)

### 充电计算工具
```dart
// 充电相关计算工具
class ChargingCalculations {
  // 计算充电时间
  static Duration calculateChargingTime({
    required double currentPercentage,
    required double targetPercentage,
    required double batteryCapacity, // kWh
    required double chargingPower, // kW
    required ChargingCurve? chargingCurve,
  }) {
    final energyNeeded = (targetPercentage - currentPercentage) / 100 * batteryCapacity;
    
    if (chargingCurve != null) {
      return _calculateWithCurve(
        currentPercentage,
        targetPercentage,
        batteryCapacity,
        chargingCurve,
      );
    } else {
      // 简单线性计算
      final hours = energyNeeded / chargingPower;
      return Duration(minutes: (hours * 60).round());
    }
  }
  
  // 计算充电成本
  static double calculateChargingCost({
    required double energyDelivered,
    required double pricePerKwh,
    double? serviceFee,
    double? parkingFee,
  }) {
    double totalCost = energyDelivered * pricePerKwh;
    
    if (serviceFee != null) {
      totalCost += serviceFee;
    }
    
    if (parkingFee != null) {
      totalCost += parkingFee;
    }
    
    return totalCost;
  }
  
  // 计算碳减排量
  static double calculateCarbonSaved({
    required double energyDelivered,
    required double gridCarbonIntensity, // kg CO2/kWh
    required double fuelCarbonIntensity, // kg CO2/L
    required double vehicleEfficiency, // km/kWh
    required double fuelEfficiency, // km/L
  }) {
    final electricEmissions = energyDelivered * gridCarbonIntensity;
    final distance = energyDelivered * vehicleEfficiency;
    final fuelUsed = distance / fuelEfficiency;
    final fuelEmissions = fuelUsed * fuelCarbonIntensity;
    
    return fuelEmissions - electricEmissions;
  }
}
```

## 常量定义 (`constants/`)

### 充电相关常量
```dart
// 充电模块常量
class ChargingConstants {
  // 充电桩类型
  static const Map<ChargingPointType, String> chargingTypeNames = {
    ChargingPointType.acSlow: 'AC 慢充',
    ChargingPointType.acFast: 'AC 快充',
    ChargingPointType.dcFast: 'DC 快充',
    ChargingPointType.dcUltraFast: 'DC 超快充',
  };
  
  // 充电功率范围
  static const Map<ChargingPointType, PowerRange> powerRanges = {
    ChargingPointType.acSlow: PowerRange(3.7, 22.0),
    ChargingPointType.acFast: PowerRange(22.0, 43.0),
    ChargingPointType.dcFast: PowerRange(50.0, 150.0),
    ChargingPointType.dcUltraFast: PowerRange(150.0, 350.0),
  };
  
  // 默认搜索半径
  static const double defaultSearchRadius = 5.0; // km
  static const double maxSearchRadius = 50.0; // km
  
  // 充电会话更新间隔
  static const Duration sessionUpdateInterval = Duration(seconds: 10);
  static const Duration statusCheckInterval = Duration(seconds: 30);
  
  // 支付相关
  static const double minPreAuthAmount = 10.0; // 最小预授权金额
  static const double maxPreAuthAmount = 500.0; // 最大预授权金额
}
```

## 错误处理

### 充电特定异常
```dart
// 充电功能异常
abstract class ChargingFailure {
  const ChargingFailure();
  
  factory ChargingFailure.searchFailed(String message) = SearchFailure;
  factory ChargingFailure.pointUnavailable() = PointUnavailableFailure;
  factory ChargingFailure.sessionStartFailed(String message) = SessionStartFailure;
  factory ChargingFailure.sessionStopFailed(String message) = SessionStopFailure;
  factory ChargingFailure.paymentFailed() = PaymentFailure;
  factory ChargingFailure.scanFailed() = ScanFailure;
  factory ChargingFailure.networkError(String message) = NetworkFailure;
}

class PointUnavailableFailure extends ChargingFailure {
  const PointUnavailableFailure();
  
  String get message => '选择的充电桩当前不可用';
}

class SessionStartFailure extends ChargingFailure {
  final String message;
  const SessionStartFailure(this.message);
}
```

## 依赖管理

### 核心依赖
- **clr_charging**: 充电服务 SDK
- **clr_geo**: 地理位置服务
- **ui_mapview**: 地图视图组件
- **flutter_scankit**: 二维码扫描

### 地图相关
- **amap_flutter_map**: 高德地图
- **amap_flutter_base**: 高德地图基础组件

### UI 组件
- **flutter_rating_bar**: 评分组件
- **url_launcher**: 链接打开

### 框架依赖
- **basic_modular**: 模块化框架
- **basic_intl**: 国际化支持
- **basic_storage**: 本地存储
- **basic_share**: 分享功能

## 总结

`app_charging` 模块为 OneApp 提供了完整的充电管理解决方案，涵盖了充电桩查找、会话管理、支付结算、历史记录等全流程功能。模块采用 BLoC 模式进行状态管理，集成了地图服务和支付功能，为用户提供了便捷高效的充电体验。通过与车辆查找功能的集成，进一步提升了用户在充电场景下的服务体验。
