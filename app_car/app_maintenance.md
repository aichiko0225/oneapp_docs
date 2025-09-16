# App Maintenance - 维护保养模块文档

## 模块概述

`app_maintenance` 是 OneApp 车辆模块群中的维护保养核心模块，提供车辆保养计划管理、保养提醒、服务预约、保养记录跟踪等功能。该模块集成了地图服务、日历组件、地理位置服务等，为用户提供完整的车辆维护保养体验。

### 基本信息
- **模块名称**: app_maintenance
- **版本**: 0.2.20
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-app-maintenance
- **Flutter 版本**: >=2.10.5
- **Dart 版本**: >=2.16.2 <4.0.0

## 目录结构

```
app_maintenance/
├── lib/
│   ├── app_maintenance.dart      # 主导出文件
│   └── src/                      # 源代码目录
│       ├── pages/                # 维护保养页面
│       ├── widgets/              # 维护保养组件
│       ├── models/               # 数据模型
│       ├── services/             # 服务层
│       ├── blocs/                # 状态管理
│       ├── utils/                # 工具类
│       └── constants/            # 常量定义
├── assets/                       # 静态资源
├── uml.puml/svg                  # UML 设计图
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 保养计划管理

#### 保养计划服务
```dart
// 保养计划管理服务
class MaintenancePlanService {
  final MaintenanceRepository _repository;
  final VehicleService _vehicleService;
  final NotificationService _notificationService;
  
  MaintenancePlanService(
    this._repository,
    this._vehicleService,
    this._notificationService,
  );
  
  // 获取车辆保养计划
  Future<Result<MaintenancePlan>> getVehicleMaintenancePlan(
    String vehicleId,
  ) async {
    try {
      // 获取车辆���息
      final vehicle = await _vehicleService.getVehicleById(vehicleId);
      if (vehicle == null) {
        return Left(MaintenanceFailure.vehicleNotFound());
      }
      
      // 获取保养计划模板
      final planTemplate = await _repository.getMaintenancePlanTemplate(
        vehicle.model,
        vehicle.year,
      );
      
      // 获取已完成的保养记录
      final completedServices = await _repository.getCompletedMaintenanceRecords(
        vehicleId,
      );
      
      // 计算下次保养时间
      final plan = _calculateMaintenancePlan(
        vehicle: vehicle,
        template: planTemplate,
        completedServices: completedServices,
      );
      
      return Right(plan);
    } catch (e) {
      return Left(MaintenanceFailure.planLoadFailed(e.toString()));
    }
  }
  
  // 计算保养计划
  MaintenancePlan _calculateMaintenancePlan({
    required Vehicle vehicle,
    required MaintenancePlanTemplate template,
    required List<MaintenanceRecord> completedServices,
  }) {
    final currentMileage = vehicle.mileage;
    final lastServiceDate = completedServices.isNotEmpty
        ? completedServices
            .map((record) => record.serviceDate)
            .reduce((a, b) => a.isAfter(b) ? a : b)
        : vehicle.purchaseDate;
    
    final upcomingServices = <MaintenanceService>[];
    
    for (final serviceTemplate in template.services) {
      final nextService = _calculateNextService(
        serviceTemplate: serviceTemplate,
        currentMileage: currentMileage,
        lastServiceDate: lastServiceDate,
        completedServices: completedServices,
      );
      
      if (nextService != null) {
        upcomingServices.add(nextService);
      }
    }
    
    // 按紧急程度排序
    upcomingServices.sort((a, b) => a.priority.compareTo(b.priority));
    
    return MaintenancePlan(
      vehicleId: vehicle.id,
      upcomingServices: upcomingServices,
      lastServiceDate: lastServiceDate,
      totalServicesCompleted: completedServices.length,
      nextServiceDue: upcomingServices.isNotEmpty ? upcomingServices.first : null,
    );
  }
  
  // 设置保养提醒
  Future<Result<void>> setMaintenanceReminder({
    required String vehicleId,
    required String serviceType,
    required DateTime reminderDate,
    required ReminderType reminderType,
    String? customMessage,
  }) async {
    try {
      final reminder = MaintenanceReminder(
        id: generateId(),
        vehicleId: vehicleId,
        serviceType: serviceType,
        reminderDate: reminderDate,
        reminderType: reminderType,
        customMessage: customMessage,
        isActive: true,
        createdAt: DateTime.now(),
      );
      
      await _repository.createMaintenanceReminder(reminder);
      
      // 设置本地通知
      await _notificationService.scheduleMaintenanceReminder(reminder);
      
      return Right(unit);
    } catch (e) {
      return Left(MaintenanceFailure.reminderSetFailed(e.toString()));
    }
  }
}

// 保养计划模型
class MaintenancePlan {
  final String vehicleId;
  final List<MaintenanceService> upcomingServices;
  final DateTime lastServiceDate;
  final int totalServicesCompleted;
  final MaintenanceService? nextServiceDue;
  
  const MaintenancePlan({
    required this.vehicleId,
    required this.upcomingServices,
    required this.lastServiceDate,
    required this.totalServicesCompleted,
    this.nextServiceDue,
  });
  
  bool get hasOverdueServices => upcomingServices
      .any((service) => service.isOverdue);
  
  int get overdueServicesCount => upcomingServices
      .where((service) => service.isOverdue)
      .length;
  
  Duration get timeSinceLastService => DateTime.now().difference(lastServiceDate);
}

// 保养服务模型
class MaintenanceService {
  final String id;
  final String name;
  final String description;
  final ServiceType type;
  final ServicePriority priority;
  final int intervalMileage;
  final Duration intervalTime;
  final double estimatedCost;
  final Duration estimatedDuration;
  final DateTime? dueDate;
  final int? dueMileage;
  final List<String> requiredParts;
  final bool isOverdue;
  
  const MaintenanceService({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.priority,
    required this.intervalMileage,
    required this.intervalTime,
    required this.estimatedCost,
    required this.estimatedDuration,
    this.dueDate,
    this.dueMileage,
    required this.requiredParts,
    required this.isOverdue,
  });
  
  String get priorityDisplayName {
    switch (priority) {
      case ServicePriority.urgent:
        return '紧急';
      case ServicePriority.high:
        return '重要';
      case ServicePriority.medium:
        return '一般';
      case ServicePriority.low:
        return '可选';
    }
  }
  
  Color get priorityColor {
    switch (priority) {
      case ServicePriority.urgent:
        return Colors.red;
      case ServicePriority.high:
        return Colors.orange;
      case ServicePriority.medium:
        return Colors.blue;
      case ServicePriority.low:
        return Colors.grey;
    }
  }
}
```

### 2. 服务预约管理

#### 服务预约服务
```dart
// 维护保养预约服务
class MaintenanceAppointmentService {
  final AppointmentRepository _repository;
  final ServiceProviderService _providerService;
  final NotificationService _notificationService;
  
  MaintenanceAppointmentService(
    this._repository,
    this._providerService,
    this._notificationService,
  );
  
  // 创建保养预约
  Future<Result<MaintenanceAppointment>> createMaintenanceAppointment({
    required String userId,
    required String vehicleId,
    required String serviceProviderId,
    required List<String> serviceTypes,
    required DateTime preferredDateTime,
    DateTime? alternativeDateTime,
    required CustomerInfo customerInfo,
    String? specialRequests,
    bool pickupService = false,
  }) async {
    try {
      // 检查服务提供商可用性
      final provider = await _providerService.getServiceProviderById(
        serviceProviderId,
      );
      if (provider == null) {
        return Left(MaintenanceFailure.providerNotFound());
      }
      
      // 检查时间段可用性
      final isAvailable = await _checkTimeSlotAvailability(
        providerId: serviceProviderId,
        dateTime: preferredDateTime,
        serviceTypes: serviceTypes,
      );
      
      if (!isAvailable) {
        return Left(MaintenanceFailure.timeSlotNotAvailable());
      }
      
      // 估算服务费用
      final costEstimate = await _calculateServiceCost(
        serviceTypes: serviceTypes,
        providerId: serviceProviderId,
        vehicleId: vehicleId,
      );
      
      // 创建预约
      final appointment = MaintenanceAppointment(
        id: generateId(),
        userId: userId,
        vehicleId: vehicleId,
        serviceProviderId: serviceProviderId,
        serviceTypes: serviceTypes,
        customerInfo: customerInfo,
        preferredDateTime: preferredDateTime,
        alternativeDateTime: alternativeDateTime,
        specialRequests: specialRequests,
        pickupService: pickupService,
        costEstimate: costEstimate,
        status: AppointmentStatus.pending,
        createdAt: DateTime.now(),
      );
      
      await _repository.createMaintenanceAppointment(appointment);
      
      // 发送确认通知
      await _notificationService.sendAppointmentConfirmation(
        userId: userId,
        appointment: appointment,
      );
      
      // 通知服务提供商
      await _notifyServiceProvider(appointment);
      
      return Right(appointment);
    } catch (e) {
      return Left(MaintenanceFailure.appointmentCreationFailed(e.toString()));
    }
  }
  
  // 获取可用时间段
  Future<Result<List<TimeSlot>>> getAvailableTimeSlots({
    required String serviceProviderId,
    required List<String> serviceTypes,
    required DateTime date,
  }) async {
    try {
      final provider = await _providerService.getServiceProviderById(
        serviceProviderId,
      );
      if (provider == null) {
        return Left(MaintenanceFailure.providerNotFound());
      }
      
      // 获取营业时间
      final businessHours = provider.getBusinessHours(date.weekday - 1);
      
      // 获取已预约时间段
      final bookedSlots = await _repository.getBookedTimeSlots(
        providerId: serviceProviderId,
        date: date,
      );
      
      // 计算服务所需时间
      final estimatedDuration = await _calculateServiceDuration(
        serviceTypes: serviceTypes,
        providerId: serviceProviderId,
      );
      
      // 生成可用时间段
      final availableSlots = _generateAvailableTimeSlots(
        businessHours: businessHours,
        bookedSlots: bookedSlots,
        serviceDuration: estimatedDuration,
      );
      
      return Right(availableSlots);
    } catch (e) {
      return Left(MaintenanceFailure.timeSlotsLoadFailed(e.toString()));
    }
  }
  
  // 取消预约
  Future<Result<void>> cancelAppointment({
    required String appointmentId,
    required String reason,
    String? userId,
  }) async {
    try {
      final appointment = await _repository.getAppointmentById(appointmentId);
      if (appointment == null) {
        return Left(MaintenanceFailure.appointmentNotFound());
      }
      
      // 检查取消权限
      if (userId != null && appointment.userId != userId) {
        return Left(MaintenanceFailure.permissionDenied());
      }
      
      // 检查是否可以取消
      if (!appointment.canBeCancelled) {
        return Left(MaintenanceFailure.cannotBeCancelled());
      }
      
      // 更新预约状态
      await _repository.updateAppointmentStatus(
        appointmentId: appointmentId,
        status: AppointmentStatus.cancelled,
        reason: reason,
        updatedAt: DateTime.now(),
      );
      
      // 发送取消通知
      await _notificationService.sendAppointmentCancellation(
        userId: appointment.userId,
        appointment: appointment,
        reason: reason,
      );
      
      return Right(unit);
    } catch (e) {
      return Left(MaintenanceFailure.cancellationFailed(e.toString()));
    }
  }
}
```

### 3. 保养记录管理

#### 保养记录服务
```dart
// 保养记录管理服务
class MaintenanceRecordService {
  final RecordRepository _repository;
  final TrackingService _trackingService;
  
  MaintenanceRecordService(this._repository, this._trackingService);
  
  // 创建保养记录
  Future<Result<MaintenanceRecord>> createMaintenanceRecord({
    required String vehicleId,
    required String serviceProviderId,
    required List<String> servicesPerformed,
    required DateTime serviceDate,
    required int mileageAtService,
    required double totalCost,
    required List<MaintenanceItem> items,
    String? notes,
    List<String>? images,
    String? invoiceNumber,
    String? technicianName,
  }) async {
    try {
      final record = MaintenanceRecord(
        id: generateId(),
        vehicleId: vehicleId,
        serviceProviderId: serviceProviderId,
        servicesPerformed: servicesPerformed,
        serviceDate: serviceDate,
        mileageAtService: mileageAtService,
        totalCost: totalCost,
        items: items,
        notes: notes,
        images: images ?? [],
        invoiceNumber: invoiceNumber,
        technicianName: technicianName,
        status: RecordStatus.completed,
        createdAt: DateTime.now(),
      );
      
      await _repository.createMaintenanceRecord(record);
      
      // 记录用户行为
      await _trackingService.trackMaintenanceCompleted(
        vehicleId: vehicleId,
        servicesPerformed: servicesPerformed,
        totalCost: totalCost,
      );
      
      return Right(record);
    } catch (e) {
      return Left(MaintenanceFailure.recordCreationFailed(e.toString()));
    }
  }
  
  // 获取车辆保养历史
  Future<Result<List<MaintenanceRecord>>> getVehicleMaintenanceHistory({
    required String vehicleId,
    DateTime? startDate,
    DateTime? endDate,
    List<String>? serviceTypes,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final records = await _repository.getVehicleMaintenanceRecords(
        vehicleId: vehicleId,
        startDate: startDate,
        endDate: endDate,
        serviceTypes: serviceTypes,
        page: page,
        pageSize: pageSize,
      );
      
      return Right(records);
    } catch (e) {
      return Left(MaintenanceFailure.historyLoadFailed(e.toString()));
    }
  }
  
  // 获取保养统计信息
  Future<Result<MaintenanceStatistics>> getMaintenanceStatistics({
    required String vehicleId,
    required StatisticsPeriod period,
  }) async {
    try {
      final records = await _repository.getVehicleMaintenanceRecords(
        vehicleId: vehicleId,
        startDate: period.startDate,
        endDate: period.endDate,
      );
      
      final statistics = _calculateStatistics(records, period);
      return Right(statistics);
    } catch (e) {
      return Left(MaintenanceFailure.statisticsLoadFailed(e.toString()));
    }
  }
  
  // 计算保养统计信息
  MaintenanceStatistics _calculateStatistics(
    List<MaintenanceRecord> records,
    StatisticsPeriod period,
  ) {
    final totalCost = records.fold<double>(
      0.0,
      (sum, record) => sum + record.totalCost,
    );
    
    final serviceFrequency = records.length / period.durationInMonths;
    
    final serviceTypeCount = <String, int>{};
    for (final record in records) {
      for (final service in record.servicesPerformed) {
        serviceTypeCount[service] = (serviceTypeCount[service] ?? 0) + 1;
      }
    }
    
    final mostCommonService = serviceTypeCount.entries
        .reduce((a, b) => a.value > b.value ? a : b)
        .key;
    
    final averageCostPerService = records.isNotEmpty ? totalCost / records.length : 0.0;
    
    return MaintenanceStatistics(
      period: period,
      totalRecords: records.length,
      totalCost: totalCost,
      averageCostPerService: averageCostPerService,
      serviceFrequency: serviceFrequency,
      mostCommonService: mostCommonService,
      serviceTypeBreakdown: serviceTypeCount,
    );
  }
}

// 保养记录模型
class MaintenanceRecord {
  final String id;
  final String vehicleId;
  final String serviceProviderId;
  final List<String> servicesPerformed;
  final DateTime serviceDate;
  final int mileageAtService;
  final double totalCost;
  final List<MaintenanceItem> items;
  final String? notes;
  final List<String> images;
  final String? invoiceNumber;
  final String? technicianName;
  final RecordStatus status;
  final DateTime createdAt;
  
  const MaintenanceRecord({
    required this.id,
    required this.vehicleId,
    required this.serviceProviderId,
    required this.servicesPerformed,
    required this.serviceDate,
    required this.mileageAtService,
    required this.totalCost,
    required this.items,
    this.notes,
    required this.images,
    this.invoiceNumber,
    this.technicianName,
    required this.status,
    required this.createdAt,
  });
  
  Duration get ageOfRecord => DateTime.now().difference(serviceDate);
  bool get hasInvoice => invoiceNumber != null;
  bool get hasImages => images.isNotEmpty;
}
```

### 4. 服务提供商管理

#### 服务提供商服务
```dart
// 服务提供商管理服务
class ServiceProviderService {
  final ProviderRepository _repository;
  final GeoService _geoService;
  
  ServiceProviderService(this._repository, this._geoService);
  
  // 查找附近的服务提供商
  Future<Result<List<ServiceProvider>>> findNearbyServiceProviders({
    required LatLng userLocation,
    double radiusKm = 20,
    List<String>? serviceTypes,
    ServiceProviderType? providerType,
    double? minRating,
  }) async {
    try {
      final providers = await _repository.findProvidersNearLocation(
        location: userLocation,
        radius: radiusKm,
        serviceTypes: serviceTypes,
        providerType: providerType,
        minRating: minRating,
      );
      
      // 计算距离并排序
      final providersWithDistance = providers.map((provider) {
        final distance = _geoService.calculateDistance(
          userLocation,
          provider.location,
        );
        return ProviderWithDistance(provider: provider, distance: distance);
      }).toList();
      
      providersWithDistance.sort((a, b) => a.distance.compareTo(b.distance));
      
      return Right(providersWithDistance.map((p) => p.provider).toList());
    } catch (e) {
      return Left(MaintenanceFailure.providerSearchFailed(e.toString()));
    }
  }
  
  // 获取服务提供商详情
  Future<Result<ServiceProviderDetail>> getServiceProviderDetail(
    String providerId,
  ) async {
    try {
      final provider = await _repository.getServiceProviderById(providerId);
      if (provider == null) {
        return Left(MaintenanceFailure.providerNotFound());
      }
      
      final reviews = await _repository.getProviderReviews(providerId);
      final services = await _repository.getProviderServices(providerId);
      final certifications = await _repository.getProviderCertifications(providerId);
      
      final detail = ServiceProviderDetail(
        provider: provider,
        reviews: reviews,
        services: services,
        certifications: certifications,
      );
      
      return Right(detail);
    } catch (e) {
      return Left(MaintenanceFailure.providerDetailLoadFailed(e.toString()));
    }
  }
}

// 服务提供商模型
class ServiceProvider {
  final String id;
  final String name;
  final String description;
  final ServiceProviderType type;
  final Address address;
  final LatLng location;
  final ContactInfo contactInfo;
  final List<BusinessHours> businessHours;
  final List<String> serviceTypes;
  final double rating;
  final int reviewCount;
  final List<String> certifications;
  final List<String> images;
  final bool isAuthorized;
  final bool isActive;
  final bool offersPickupService;
  final bool offers24HourService;
  
  const ServiceProvider({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.address,
    required this.location,
    required this.contactInfo,
    required this.businessHours,
    required this.serviceTypes,
    required this.rating,
    required this.reviewCount,
    required this.certifications,
    required this.images,
    required this.isAuthorized,
    required this.isActive,
    required this.offersPickupService,
    required this.offers24HourService,
  });
  
  bool get isOpen {
    if (offers24HourService) return true;
    
    final now = DateTime.now();
    final todayHours = businessHours[now.weekday - 1];
    return todayHours.isOpen(now);
  }
  
  bool get isOfficialDealer => type == ServiceProviderType.officialDealer;
  bool get isCertified => certifications.isNotEmpty;
}
```

## 页面组件设计

### 保养计划页面
```dart
// 保养计划页面
class MaintenancePlanPage extends StatefulWidget {
  final String vehicleId;
  
  const MaintenancePlanPage({required this.vehicleId});
  
  @override
  _MaintenancePlanPageState createState() => _MaintenancePlanPageState();
}

class _MaintenancePlanPageState extends State<MaintenancePlanPage> {
  late MaintenancePlanBloc _planBloc;
  
  @override
  void initState() {
    super.initState();
    _planBloc = context.read<MaintenancePlanBloc>();
    _planBloc.add(LoadMaintenancePlan(widget.vehicleId));
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('保养计划'),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications),
            onPressed: () => _navigateToReminders(),
          ),
        ],
      ),
      body: BlocBuilder<MaintenancePlanBloc, MaintenancePlanState>(
        builder: (context, state) {
          if (state is MaintenancePlanLoaded) {
            return _buildPlanContent(state.plan);
          } else if (state is MaintenancePlanError) {
            return _buildErrorState(state.message);
          }
          return _buildLoadingState();
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateToServiceBooking(),
        child: Icon(Icons.add),
        tooltip: '预约保养',
      ),
    );
  }
  
  Widget _buildPlanContent(MaintenancePlan plan) {
    return RefreshIndicator(
      onRefresh: () async {
        _planBloc.add(RefreshMaintenancePlan(widget.vehicleId));
      },
      child: ListView(
        padding: EdgeInsets.all(16),
        children: [
          _buildOverviewCard(plan),
          SizedBox(height: 16),
          _buildUpcomingServicesSection(plan.upcomingServices),
          SizedBox(height: 16),
          _buildMaintenanceHistorySection(),
          SizedBox(height: 16),
          _buildMaintenanceStatisticsSection(),
        ],
      ),
    );
  }
  
  Widget _buildOverviewCard(MaintenancePlan plan) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '保养概览',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    '已完成保养',
                    '${plan.totalServicesCompleted}次',
                    Icons.check_circle,
                    Colors.green,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    '待处理项目',
                    '${plan.upcomingServices.length}项',
                    Icons.schedule,
                    Colors.orange,
                  ),
                ),
              ],
            ),
            if (plan.hasOverdueServices) ...[
              SizedBox(height: 12),
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning, color: Colors.red),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '您有 ${plan.overdueServicesCount} 项逾期保养需要处理',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  Widget _buildUpcomingServicesSection(List<MaintenanceService> services) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '即将到期的保养',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 12),
        ...services.take(5).map((service) {
          return Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: MaintenanceServiceCard(
              service: service,
              onTap: () => _navigateToServiceDetail(service),
              onBookService: () => _bookService(service),
            ),
          );
        }).toList(),
        if (services.length > 5)
          TextButton(
            onPressed: () => _showAllUpcomingServices(services),
            child: Text('查看全部 ${services.length} 项'),
          ),
      ],
    );
  }
}

// 保养服务卡片组件
class MaintenanceServiceCard extends StatelessWidget {
  final MaintenanceService service;
  final VoidCallback? onTap;
  final VoidCallback? onBookService;
  
  const MaintenanceServiceCard({
    Key? key,
    required this.service,
    this.onTap,
    this.onBookService,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      service.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: service.priorityColor.withOpacity(0.1),
                      border: Border.all(color: service.priorityColor),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      service.priorityDisplayName,
                      style: TextStyle(
                        fontSize: 12,
                        color: service.priorityColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 8),
              Text(
                service.description,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  SizedBox(width: 4),
                  Text(
                    service.dueDate != null
                        ? DateFormat('yyyy-MM-dd').format(service.dueDate!)
                        : '根据里程',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  SizedBox(width: 16),
                  Icon(
                    Icons.attach_money,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  SizedBox(width: 4),
                  Text(
                    '约 ¥${service.estimatedCost.toStringAsFixed(0)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  Spacer(),
                  TextButton(
                    onPressed: onBookService,
                    child: Text('预约'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 保养日历页面
```dart
// 保养日历页面
class MaintenanceCalendarPage extends StatefulWidget {
  final String vehicleId;
  
  const MaintenanceCalendarPage({required this.vehicleId});
  
  @override
  _MaintenanceCalendarPageState createState() => _MaintenanceCalendarPageState();
}

class _MaintenanceCalendarPageState extends State<MaintenanceCalendarPage> {
  late DateTime _selectedDay;
  late DateTime _focusedDay;
  Map<DateTime, List<MaintenanceEvent>> _events = {};
  
  @override
  void initState() {
    super.initState();
    _selectedDay = DateTime.now();
    _focusedDay = DateTime.now();
    _loadMaintenanceEvents();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('保养日历'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => _addMaintenanceEvent(),
          ),
        ],
      ),
      body: Column(
        children: [
          TableCalendar<MaintenanceEvent>(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            eventLoader: (day) => _getEventsForDay(day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },
            onPageChanged: (focusedDay) {
              _focusedDay = focusedDay;
            },
            calendarBuilders: CalendarBuilders(
              markerBuilder: (context, day, events) {
                if (events.isNotEmpty) {
                  return _buildEventMarkers(events.cast<MaintenanceEvent>());
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 8.0),
          Expanded(
            child: ListView.builder(
              itemCount: _getEventsForDay(_selectedDay).length,
              itemBuilder: (context, index) {
                final event = _getEventsForDay(_selectedDay)[index];
                return MaintenanceEventCard(
                  event: event,
                  onTap: () => _showEventDetail(event),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildEventMarkers(List<MaintenanceEvent> events) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: events.take(3).map((event) {
        return Container(
          margin: EdgeInsets.only(top: 5, right: 2),
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: event.type.color,
            shape: BoxShape.circle,
          ),
        );
      }).toList(),
    );
  }
}
```

## 状态管理

### 保养计划状态管理
```dart
// 保养计划状态 BLoC
class MaintenancePlanBloc extends Bloc<MaintenancePlanEvent, MaintenancePlanState> {
  final MaintenancePlanService _planService;
  
  MaintenancePlanBloc(this._planService) : super(MaintenancePlanInitial()) {
    on<LoadMaintenancePlan>(_onLoadMaintenancePlan);
    on<RefreshMaintenancePlan>(_onRefreshMaintenancePlan);
    on<UpdateMaintenancePlan>(_onUpdateMaintenancePlan);
  }
  
  Future<void> _onLoadMaintenancePlan(
    LoadMaintenancePlan event,
    Emitter<MaintenancePlanState> emit,
  ) async {
    emit(MaintenancePlanLoading());
    
    final result = await _planService.getVehicleMaintenancePlan(event.vehicleId);
    result.fold(
      (failure) => emit(MaintenancePlanError(failure.message)),
      (plan) => emit(MaintenancePlanLoaded(plan)),
    );
  }
}
```

## 依赖管理

### 核心依赖
- **basic_modular**: 模块化框架
- **basic_intl**: 国际化支持
- **clr_maintenance**: 维护保养服务 SDK
- **clr_geo**: 地理位置服务

### UI 相关依赖
- **flutter_pickers**: 选择器组件
- **ui_mapview**: 地图视图组件
- **table_calendar**: 日历组件
- **scroll_to_index**: 滚动定位组件

### 工具依赖
- **dartz**: 函数式编程支持
- **freezed_annotation**: 不可变类生成
- **json_annotation**: JSON 序列化
- **url_launcher**: 链接打开
- **basic_track**: 行为追踪

## 错误处理

### 维护保养异常
```dart
// 维护保养功能异常
abstract class MaintenanceFailure {
  const MaintenanceFailure();
  
  factory MaintenanceFailure.vehicleNotFound() = VehicleNotFoundFailure;
  factory MaintenanceFailure.planLoadFailed(String message) = PlanLoadFailure;
  factory MaintenanceFailure.appointmentCreationFailed(String message) = AppointmentCreationFailure;
  factory MaintenanceFailure.providerNotFound() = ProviderNotFoundFailure;
  factory MaintenanceFailure.timeSlotNotAvailable() = TimeSlotNotAvailableFailure;
  factory MaintenanceFailure.permissionDenied() = PermissionDeniedFailure;
}
```

## 总结

`app_maintenance` 模块为 OneApp 提供了完整的车辆维护保养解决方案，通过保养计划管理、服务预约、记录跟踪和统计分析，帮助用户科学合理地维护车辆。模块集成了地图服务、日历组件等功能，提供了直观易用的保养管理体验。
