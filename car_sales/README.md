# OneApp Car Sales - 汽车销售模块文档

## 模块概述

`oneapp_car_sales` 是 OneApp 的汽车销售核心模块，提供车型展示、在线选车、试驾预约、销售线索管理、经销商服务等功能。该模块集成了地图服务、触点管理、售后服务等，为用户提供完整的购车体验。

### 基本信息
- **模块名称**: oneapp_car_sales
- **版本**: 0.0.1
- **类型**: Flutter Package
- **Dart 版本**: >=3.0.0 <4.0.0
- **Flutter 版本**: >=3.0.0

## 目录结构

```
oneapp_car_sales/
├── lib/
│   ├── oneapp_car_sales.dart     # 主导出文件
│   └── src/                      # 源代码目录
│       ├── pages/                # 销售页面
│       ├── widgets/              # 销售组件
│       ├── models/               # 数据模型
│       ├── services/             # 服务层
│       ├── blocs/                # 状态管理
│       ├── utils/                # 工具类
│       └── constants/            # 常量定义
├── assets/                       # 静态资源
├── ios/                          # iOS 配置
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 车型展示与选择

#### 车型目录服务
```dart
// 车型目录服务
class VehicleCatalogService {
  final CatalogRepository _repository;
  final ConfigurationService _configService;
  
  VehicleCatalogService(this._repository, this._configService);
  
  // 获取车型列表
  Future<Result<List<VehicleModel>>> getVehicleModels({
    VehicleBrand? brand,
    VehicleCategory? category,
    PriceRange? priceRange,
    List<String>? features,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final filters = VehicleFilters(
        brand: brand,
        category: category,
        priceRange: priceRange,
        features: features,
      );
      
      final models = await _repository.getVehicleModels(
        filters: filters,
        page: page,
        pageSize: pageSize,
      );
      
      return Right(models);
    } catch (e) {
      return Left(SalesFailure.catalogLoadFailed(e.toString()));
    }
  }
  
  // 获取车型详情
  Future<Result<VehicleDetail>> getVehicleDetail(String modelId) async {
    try {
      final detail = await _repository.getVehicleDetail(modelId);
      return Right(detail);
    } catch (e) {
      return Left(SalesFailure.detailLoadFailed(e.toString()));
    }
  }
  
  // 获取车型配置选项
  Future<Result<VehicleConfiguration>> getVehicleConfiguration(
    String modelId,
  ) async {
    try {
      final configuration = await _configService.getModelConfiguration(modelId);
      return Right(configuration);
    } catch (e) {
      return Left(SalesFailure.configurationLoadFailed(e.toString()));
    }
  }
  
  // 计算车型价格
  Future<Result<VehiclePricing>> calculateVehiclePrice({
    required String modelId,
    required Map<String, String> selectedOptions,
    String? dealerCode,
    List<String>? promotions,
  }) async {
    try {
      final pricing = await _repository.calculatePrice(
        modelId: modelId,
        options: selectedOptions,
        dealerCode: dealerCode,
        promotions: promotions,
      );
      
      return Right(pricing);
    } catch (e) {
      return Left(SalesFailure.pricingCalculationFailed(e.toString()));
    }
  }
}

// 车型数据模型
class VehicleModel {
  final String id;
  final String name;
  final VehicleBrand brand;
  final VehicleCategory category;
  final String description;
  final List<String> images;
  final String mainImage;
  final PriceRange priceRange;
  final VehicleSpecs specifications;
  final List<String> features;
  final List<String> colors;
  final double rating;
  final int reviewCount;
  final bool isAvailable;
  final DateTime? launchDate;
  
  const VehicleModel({
    required this.id,
    required this.name,
    required this.brand,
    required this.category,
    required this.description,
    required this.images,
    required this.mainImage,
    required this.priceRange,
    required this.specifications,
    required this.features,
    required this.colors,
    required this.rating,
    required this.reviewCount,
    required this.isAvailable,
    this.launchDate,
  });
  
  String get displayPrice => '${priceRange.min.toStringAsFixed(1)}万起';
  bool get isNewModel => launchDate != null && 
      DateTime.now().difference(launchDate!).inDays < 90;
}
```

### 2. 试驾预约管理

#### 试驾预约服务
```dart
// 试驾预约服务
class TestDriveService {
  final TestDriveRepository _repository;
  final DealerService _dealerService;
  final NotificationService _notificationService;
  
  TestDriveService(
    this._repository,
    this._dealerService,
    this._notificationService,
  );
  
  // 创建试驾预约
  Future<Result<TestDriveAppointment>> createTestDriveAppointment({
    required String userId,
    required String vehicleModelId,
    required String dealerId,
    required DateTime preferredDateTime,
    String? alternativeDateTime,
    required CustomerInfo customerInfo,
    String? specialRequests,
  }) async {
    try {
      // 检查时间段可用性
      final isAvailable = await _checkTimeSlotAvailability(
        dealerId: dealerId,
        dateTime: preferredDateTime,
        vehicleModelId: vehicleModelId,
      );
      
      if (!isAvailable) {
        return Left(SalesFailure.timeSlotNotAvailable());
      }
      
      // 创建预约
      final appointment = TestDriveAppointment(
        id: generateId(),
        userId: userId,
        vehicleModelId: vehicleModelId,
        dealerId: dealerId,
        customerInfo: customerInfo,
        preferredDateTime: preferredDateTime,
        alternativeDateTime: alternativeDateTime != null 
            ? DateTime.tryParse(alternativeDateTime) 
            : null,
        specialRequests: specialRequests,
        status: TestDriveStatus.pending,
        createdAt: DateTime.now(),
      );
      
      await _repository.createTestDriveAppointment(appointment);
      
      // 发送确认通知
      await _notificationService.sendTestDriveConfirmation(
        userId: userId,
        appointment: appointment,
      );
      
      // 通知经销商
      await _notifyDealer(appointment);
      
      return Right(appointment);
    } catch (e) {
      return Left(SalesFailure.appointmentCreationFailed(e.toString()));
    }
  }
  
  // 获取可用时间段
  Future<Result<List<TimeSlot>>> getAvailableTimeSlots({
    required String dealerId,
    required String vehicleModelId,
    required DateTime date,
  }) async {
    try {
      final dealer = await _dealerService.getDealerById(dealerId);
      if (dealer == null) {
        return Left(SalesFailure.dealerNotFound());
      }
      
      final businessHours = dealer.businessHours[date.weekday - 1];
      final bookedSlots = await _repository.getBookedTimeSlots(
        dealerId: dealerId,
        date: date,
      );
      
      final availableSlots = _generateAvailableSlots(
        businessHours: businessHours,
        bookedSlots: bookedSlots,
        vehicleModelId: vehicleModelId,
      );
      
      return Right(availableSlots);
    } catch (e) {
      return Left(SalesFailure.timeSlotsLoadFailed(e.toString()));
    }
  }
  
  // 获取用户试驾历史
  Future<Result<List<TestDriveAppointment>>> getUserTestDriveHistory(
    String userId,
  ) async {
    try {
      final appointments = await _repository.getUserTestDriveAppointments(userId);
      return Right(appointments);
    } catch (e) {
      return Left(SalesFailure.historyLoadFailed(e.toString()));
    }
  }
}

// 试驾预约模型
class TestDriveAppointment {
  final String id;
  final String userId;
  final String vehicleModelId;
  final String dealerId;
  final CustomerInfo customerInfo;
  final DateTime preferredDateTime;
  final DateTime? alternativeDateTime;
  final String? specialRequests;
  final TestDriveStatus status;
  final DateTime createdAt;
  final DateTime? confirmedAt;
  final DateTime? completedAt;
  final String? salesRepId;
  final TestDriveFeedback? feedback;
  
  const TestDriveAppointment({
    required this.id,
    required this.userId,
    required this.vehicleModelId,
    required this.dealerId,
    required this.customerInfo,
    required this.preferredDateTime,
    this.alternativeDateTime,
    this.specialRequests,
    required this.status,
    required this.createdAt,
    this.confirmedAt,
    this.completedAt,
    this.salesRepId,
    this.feedback,
  });
  
  bool get isUpcoming => status == TestDriveStatus.confirmed && 
      preferredDateTime.isAfter(DateTime.now());
  
  bool get isPast => completedAt != null || 
      (status == TestDriveStatus.confirmed && 
       preferredDateTime.isBefore(DateTime.now().subtract(Duration(hours: 2))));
}
```

### 3. 经销商管理

#### 经销商服务
```dart
// 经销商服务
class DealerService {
  final DealerRepository _repository;
  final LocationService _locationService;
  
  DealerService(this._repository, this._locationService);
  
  // 查找附近经销商
  Future<Result<List<Dealer>>> findNearbyDealers({
    required LatLng userLocation,
    double radiusKm = 50,
    VehicleBrand? brand,
    List<DealerService>? services,
  }) async {
    try {
      final dealers = await _repository.findDealersNearLocation(
        location: userLocation,
        radius: radiusKm,
        brand: brand,
        services: services,
      );
      
      // 计算距离并排序
      final dealersWithDistance = dealers.map((dealer) {
        final distance = _locationService.calculateDistance(
          userLocation,
          dealer.location,
        );
        return DealerWithDistance(dealer: dealer, distance: distance);
      }).toList();
      
      dealersWithDistance.sort((a, b) => a.distance.compareTo(b.distance));
      
      return Right(dealersWithDistance.map((d) => d.dealer).toList());
    } catch (e) {
      return Left(SalesFailure.dealerSearchFailed(e.toString()));
    }
  }
  
  // 获取经销商详情
  Future<Result<DealerDetail>> getDealerDetail(String dealerId) async {
    try {
      final dealer = await _repository.getDealerById(dealerId);
      if (dealer == null) {
        return Left(SalesFailure.dealerNotFound());
      }
      
      final detail = DealerDetail(
        dealer: dealer,
        salesReps: await _repository.getDealerSalesReps(dealerId),
        reviews: await _repository.getDealerReviews(dealerId),
        inventory: await _repository.getDealerInventory(dealerId),
      );
      
      return Right(detail);
    } catch (e) {
      return Left(SalesFailure.dealerDetailLoadFailed(e.toString()));
    }
  }
  
  // 获取经销商库存
  Future<Result<List<VehicleInventory>>> getDealerInventory({
    required String dealerId,
    String? modelId,
    bool availableOnly = true,
  }) async {
    try {
      final inventory = await _repository.getDealerInventory(
        dealerId,
        modelId: modelId,
        availableOnly: availableOnly,
      );
      return Right(inventory);
    } catch (e) {
      return Left(SalesFailure.inventoryLoadFailed(e.toString()));
    }
  }
}

// 经销商数据模型
class Dealer {
  final String id;
  final String name;
  final String code;
  final VehicleBrand primaryBrand;
  final List<VehicleBrand> supportedBrands;
  final DealerType type;
  final Address address;
  final LatLng location;
  final ContactInfo contactInfo;
  final List<BusinessHours> businessHours;
  final List<DealerService> services;
  final double rating;
  final int reviewCount;
  final List<String> certifications;
  final List<String> images;
  final bool isAuthorized;
  final bool isActive;
  
  const Dealer({
    required this.id,
    required this.name,
    required this.code,
    required this.primaryBrand,
    required this.supportedBrands,
    required this.type,
    required this.address,
    required this.location,
    required this.contactInfo,
    required this.businessHours,
    required this.services,
    required this.rating,
    required this.reviewCount,
    required this.certifications,
    required this.images,
    required this.isAuthorized,
    required this.isActive,
  });
  
  bool get isOpen {
    final now = DateTime.now();
    final todayHours = businessHours[now.weekday - 1];
    return todayHours.isOpen(now);
  }
  
  bool get supportsTestDrive => services.contains(DealerService.testDrive);
  bool get supportsService => services.contains(DealerService.afterSales);
}
```

### 4. 销售线索管理

#### 线索管理服务
```dart
// 销售线索管理服务
class SalesLeadService {
  final LeadRepository _repository;
  final CrmIntegrationService _crmService;
  final NotificationService _notificationService;
  
  SalesLeadService(
    this._repository,
    this._crmService,
    this._notificationService,
  );
  
  // 创建销售线索
  Future<Result<SalesLead>> createSalesLead({
    required String userId,
    required LeadSource source,
    required String vehicleModelId,
    String? dealerId,
    required CustomerInfo customerInfo,
    LeadType type = LeadType.inquiry,
    String? notes,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final lead = SalesLead(
        id: generateId(),
        userId: userId,
        source: source,
        type: type,
        vehicleModelId: vehicleModelId,
        dealerId: dealerId,
        customerInfo: customerInfo,
        status: LeadStatus.new_,
        priority: _calculateLeadPriority(source, type, customerInfo),
        notes: notes,
        metadata: metadata,
        createdAt: DateTime.now(),
      );
      
      await _repository.createSalesLead(lead);
      
      // 同步到 CRM 系统
      await _crmService.syncLead(lead);
      
      // 分配给销售代表
      await _assignToSalesRep(lead);
      
      return Right(lead);
    } catch (e) {
      return Left(SalesFailure.leadCreationFailed(e.toString()));
    }
  }
  
  // 更新线索状态
  Future<Result<void>> updateLeadStatus({
    required String leadId,
    required LeadStatus status,
    String? salesRepId,
    String? notes,
  }) async {
    try {
      await _repository.updateLeadStatus(
        leadId: leadId,
        status: status,
        salesRepId: salesRepId,
        notes: notes,
        updatedAt: DateTime.now(),
      );
      
      // 发送状态更新通知
      await _notificationService.sendLeadStatusUpdate(
        leadId: leadId,
        status: status,
      );
      
      return Right(unit);
    } catch (e) {
      return Left(SalesFailure.leadUpdateFailed(e.toString()));
    }
  }
  
  // 获取用户销售线索
  Future<Result<List<SalesLead>>> getUserSalesLeads(String userId) async {
    try {
      final leads = await _repository.getUserSalesLeads(userId);
      return Right(leads);
    } catch (e) {
      return Left(SalesFailure.leadsLoadFailed(e.toString()));
    }
  }
  
  // 计算线索优先级
  LeadPriority _calculateLeadPriority(
    LeadSource source,
    LeadType type,
    CustomerInfo customerInfo,
  ) {
    int score = 0;
    
    // 根据来源计分
    switch (source) {
      case LeadSource.testDrive:
        score += 40;
        break;
      case LeadSource.configurationTool:
        score += 30;
        break;
      case LeadSource.dealerInquiry:
        score += 35;
        break;
      case LeadSource.websiteBrowsing:
        score += 20;
        break;
    }
    
    // 根据类型计分
    switch (type) {
      case LeadType.purchaseIntent:
        score += 30;
        break;
      case LeadType.testDriveRequest:
        score += 25;
        break;
      case LeadType.priceInquiry:
        score += 20;
        break;
      case LeadType.generalInquiry:
        score += 10;
        break;
    }
    
    // 根据客户信息计分
    if (customerInfo.hasValidPhone) score += 10;
    if (customerInfo.hasValidEmail) score += 10;
    if (customerInfo.preferredContactTime != null) score += 5;
    
    if (score >= 70) return LeadPriority.high;
    if (score >= 50) return LeadPriority.medium;
    return LeadPriority.low;
  }
}

// 销售线索模型
class SalesLead {
  final String id;
  final String userId;
  final LeadSource source;
  final LeadType type;
  final String vehicleModelId;
  final String? dealerId;
  final CustomerInfo customerInfo;
  final LeadStatus status;
  final LeadPriority priority;
  final String? notes;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? salesRepId;
  final List<LeadActivity> activities;
  
  const SalesLead({
    required this.id,
    required this.userId,
    required this.source,
    required this.type,
    required this.vehicleModelId,
    this.dealerId,
    required this.customerInfo,
    required this.status,
    required this.priority,
    this.notes,
    this.metadata,
    required this.createdAt,
    this.updatedAt,
    this.salesRepId,
    this.activities = const [],
  });
  
  bool get isActive => ![LeadStatus.closed, LeadStatus.lost].contains(status);
  bool get hasAssignedRep => salesRepId != null;
  Duration get age => DateTime.now().difference(createdAt);
}
```

## 页面组件设计

### 车型展示页面
```dart
// 车型展示页面
class VehicleCatalogPage extends StatefulWidget {
  @override
  _VehicleCatalogPageState createState() => _VehicleCatalogPageState();
}

class _VehicleCatalogPageState extends State<VehicleCatalogPage> {
  late VehicleCatalogBloc _catalogBloc;
  final SwiperController _swiperController = SwiperController();
  
  @override
  void initState() {
    super.initState();
    _catalogBloc = context.read<VehicleCatalogBloc>();
    _catalogBloc.add(LoadVehicleModels());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          _buildFilterSection(),
          _buildVehicleGrid(),
        ],
      ),
    );
  }
  
  Widget _buildVehicleGrid() {
    return BlocBuilder<VehicleCatalogBloc, VehicleCatalogState>(
      builder: (context, state) {
        if (state is VehicleCatalogLoaded) {
          return SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                return VehicleCard(
                  vehicle: state.vehicles[index],
                  onTap: () => _navigateToVehicleDetail(state.vehicles[index]),
                );
              },
              childCount: state.vehicles.length,
            ),
          );
        }
        return SliverToBoxAdapter(child: VehicleGridSkeleton());
      },
    );
  }
}

// 车型卡片组件
class VehicleCard extends StatelessWidget {
  final VehicleModel vehicle;
  final VoidCallback? onTap;
  
  const VehicleCard({
    Key? key,
    required this.vehicle,
    this.onTap,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildImageSection(),
            _buildInfoSection(),
            _buildActionSection(),
          ],
        ),
      ),
    );
  }
  
  Widget _buildImageSection() {
    return Expanded(
      flex: 3,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
          image: DecorationImage(
            image: NetworkImage(vehicle.mainImage),
            fit: BoxFit.cover,
          ),
        ),
        child: Stack(
          children: [
            if (vehicle.isNewModel)
              Positioned(
                top: 8,
                left: 8,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '新车',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            Positioned(
              bottom: 8,
              right: 8,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, color: Colors.yellow, size: 14),
                    SizedBox(width: 4),
                    Text(
                      vehicle.rating.toStringAsFixed(1),
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildInfoSection() {
    return Expanded(
      flex: 2,
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              vehicle.name,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 4),
            Text(
              vehicle.brand.name,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            Spacer(),
            Text(
              vehicle.displayPrice,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 试驾预约页面
```dart
// 试驾预约页面
class TestDriveBookingPage extends StatefulWidget {
  final VehicleModel vehicle;
  
  const TestDriveBookingPage({required this.vehicle});
  
  @override
  _TestDriveBookingPageState createState() => _TestDriveBookingPageState();
}

class _TestDriveBookingPageState extends State<TestDriveBookingPage> {
  late TestDriveBloc _testDriveBloc;
  final _formKey = GlobalKey<FormState>();
  final _customerInfoController = CustomerInfoController();
  
  Dealer? _selectedDealer;
  DateTime? _selectedDate;
  TimeSlot? _selectedTimeSlot;
  
  @override
  void initState() {
    super.initState();
    _testDriveBloc = context.read<TestDriveBloc>();
    _loadNearbyDealers();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('预约试驾 - ${widget.vehicle.name}'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            _buildVehicleSection(),
            SizedBox(height: 24),
            _buildDealerSelection(),
            SizedBox(height: 24),
            _buildDateTimeSelection(),
            SizedBox(height: 24),
            _buildCustomerInfoForm(),
            SizedBox(height: 24),
            _buildSpecialRequestsField(),
            SizedBox(height: 32),
            _buildSubmitButton(),
          ],
        ),
      ),
    );
  }
  
  Widget _buildDealerSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '选择经销商',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 12),
        BlocBuilder<TestDriveBloc, TestDriveState>(
          builder: (context, state) {
            if (state is DealersLoaded) {
              return Column(
                children: state.dealers.map((dealer) {
                  return DealerSelectionCard(
                    dealer: dealer,
                    isSelected: _selectedDealer?.id == dealer.id,
                    onSelected: () => _selectDealer(dealer),
                  );
                }).toList(),
              );
            }
            return DealerSelectionSkeleton();
          },
        ),
      ],
    );
  }
  
  Widget _buildDateTimeSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '选择时间',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 12),
        DatePickerWidget(
          onDateSelected: (date) => _selectDate(date),
          minDate: DateTime.now(),
          maxDate: DateTime.now().add(Duration(days: 30)),
        ),
        if (_selectedDate != null) ...[
          SizedBox(height: 16),
          TimeSlotGrid(
            availableSlots: _getAvailableTimeSlots(),
            selectedSlot: _selectedTimeSlot,
            onSlotSelected: (slot) => _selectTimeSlot(slot),
          ),
        ],
      ],
    );
  }
}
```

## 状态管理

### 车型目录状态管理
```dart
// 车型目录状态 BLoC
class VehicleCatalogBloc extends Bloc<VehicleCatalogEvent, VehicleCatalogState> {
  final VehicleCatalogService _catalogService;
  
  VehicleCatalogBloc(this._catalogService) : super(VehicleCatalogInitial()) {
    on<LoadVehicleModels>(_onLoadVehicleModels);
    on<FilterVehicles>(_onFilterVehicles);
    on<SearchVehicles>(_onSearchVehicles);
  }
  
  Future<void> _onLoadVehicleModels(
    LoadVehicleModels event,
    Emitter<VehicleCatalogState> emit,
  ) async {
    emit(VehicleCatalogLoading());
    
    final result = await _catalogService.getVehicleModels(
      brand: event.brand,
      category: event.category,
      priceRange: event.priceRange,
    );
    
    result.fold(
      (failure) => emit(VehicleCatalogError(failure.message)),
      (vehicles) => emit(VehicleCatalogLoaded(vehicles)),
    );
  }
}
```

## 依赖管理

### 核心模块依赖
- **basic_utils**: 基础工具类
- **basic_uis**: 基础 UI 组件
- **app_configuration**: 应用配置
- **oneapp_after_sales**: 售后服务集成
- **oneapp_touch_point**: 触点管理集成

### UI 相关依赖
- **card_swiper**: 卡片轮播组件，用于车型图片展示
- **flutter_pickers**: 选择器组件，用于日期时间选择
- **ui_mapview**: 地图视图组件，用于经销商位置展示

### 定位相关依赖
- **amap_flutter_location**: 高德地图定位服务
- **permission_handler**: 权限管理

### 框架依赖
- **basic_modular**: 模块化框架
- **flutter_localizations**: 国际化支持

## 错误处理

### 销售模块异常
```dart
// 销售功能异常
abstract class SalesFailure {
  const SalesFailure();
  
  factory SalesFailure.catalogLoadFailed(String message) = CatalogLoadFailure;
  factory SalesFailure.dealerNotFound() = DealerNotFoundFailure;
  factory SalesFailure.timeSlotNotAvailable() = TimeSlotNotAvailableFailure;
  factory SalesFailure.appointmentCreationFailed(String message) = AppointmentCreationFailure;
  factory SalesFailure.leadCreationFailed(String message) = LeadCreationFailure;
}
```

## 总结

`oneapp_car_sales` 模块为 OneApp 提供了完整的汽车销售解决方案，通过车型展示、试驾预约、经销商服务和销售线索管理，构建了完整的数字化购车体验。模块与地图服务、触点管理、售后服务等深度集成，为用户和经销商提供了高效的销售服务平台。
