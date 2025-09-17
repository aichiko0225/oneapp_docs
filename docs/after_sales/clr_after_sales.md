# CLR After Sales 售后服务SDK

## 模块概述

`clr_after_sales` 是 OneApp 售后服务模块群中的核心服务SDK，负责封装售后服务的业务逻辑、API接口调用和数据模型定义。该模块为售后服务应用层提供统一的服务接口和数据处理能力。

### 基本信息
- **模块名称**: clr_after_sales
- **版本**: 0.0.1
- **描述**: 售后服务核心SDK
- **Flutter 版本**: >=1.17.0
- **Dart 版本**: >=3.0.0 <4.0.0

## 功能特性

### 核心功能
1. **API接口封装**
   - 售后服务API统一封装
   - 网络请求统一处理
   - 错误处理和重试机制
   - 数据缓存和同步

2. **业务逻辑封装**
   - 预约业务逻辑
   - 服务流程管理
   - 支付结算逻辑
   - 数据验证规则

3. **数据模型管理**
   - 统一数据模型定义
   - JSON序列化支持
   - 数据转换和映射
   - 模型验证机制

4. **状态管理**
   - 业务状态统一管理
   - 事件驱动更新
   - 状态持久化
   - 状态同步机制

## 技术架构

### 目录结构
```
lib/
├── clr_after_sales.dart       # 模块入口文件
├── src/                       # 源代码目录
│   ├── services/              # 业务服务
│   ├── repositories/          # 数据仓库
│   ├── models/                # 数据模型
│   ├── enums/                 # 枚举定义
│   ├── exceptions/            # 异常定义
│   ├── utils/                 # 工具类
│   └── constants/             # 常量定义
├── test/                      # 测试文件
└── generated/                 # 代码生成文件
```

### 依赖关系

#### 基础框架依赖
- `basic_network: ^0.2.3+4` - 网络通信框架
- `common_utils: ^2.1.0` - 通用工具库

#### 内部依赖 (dependency_overrides)
- `ui_basic` - 基础UI组件（本地路径）
- `basic_platform` - 平台适配（本地路径）
- `basic_utils` - 基础工具（本地路径）
- `basic_uis` - 基础UI集合（本地路径）
- `base_mvvm` - MVVM架构（本地路径）

## 核心模块分析

### 1. 业务服务 (`src/services/`)

#### 预约服务
```dart
class AppointmentService {
  final AppointmentRepository _repository;
  final NetworkService _networkService;
  
  AppointmentService(this._repository, this._networkService);
  
  /// 创建预约
  Future<Result<Appointment>> createAppointment(
    AppointmentCreateRequest request,
  ) async {
    try {
      // 1. 验证请求数据
      final validationResult = _validateCreateRequest(request);
      if (validationResult.isFailure) {
        return Result.failure(validationResult.error);
      }
      
      // 2. 检查时间可用性
      final availability = await checkTimeAvailability(
        request.storeId,
        request.appointmentTime,
      );
      
      if (!availability.isAvailable) {
        return Result.failure(
          AppointmentException('预约时间不可用'),
        );
      }
      
      // 3. 调用API创建预约
      final apiResponse = await _networkService.post(
        '/appointments',
        data: request.toJson(),
      );
      
      // 4. 解析响应数据
      final appointment = Appointment.fromJson(apiResponse.data);
      
      // 5. 缓存到本地
      await _repository.saveAppointment(appointment);
      
      return Result.success(appointment);
    } catch (e) {
      return Result.failure(AppointmentException(e.toString()));
    }
  }
  
  /// 获取用户预约列表
  Future<Result<List<Appointment>>> getUserAppointments({
    String? status,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      // 1. 先从缓存获取
      final cachedAppointments = await _repository.getCachedAppointments(
        status: status,
        page: page,
        pageSize: pageSize,
      );
      
      // 2. 如果缓存存在且未过期，直接返回
      if (cachedAppointments.isNotEmpty && !_isCacheExpired()) {
        return Result.success(cachedAppointments);
      }
      
      // 3. 从网络获取最新数据
      final apiResponse = await _networkService.get(
        '/appointments',
        queryParameters: {
          'status': status,
          'page': page,
          'pageSize': pageSize,
        },
      );
      
      // 4. 解析并缓存数据
      final appointments = (apiResponse.data['items'] as List)
          .map((json) => Appointment.fromJson(json))
          .toList();
      
      await _repository.cacheAppointments(appointments);
      
      return Result.success(appointments);
    } catch (e) {
      return Result.failure(AppointmentException(e.toString()));
    }
  }
  
  /// 取消预约
  Future<Result<bool>> cancelAppointment(String appointmentId) async {
    try {
      await _networkService.put(
        '/appointments/$appointmentId/cancel',
      );
      
      // 更新本地缓存
      await _repository.updateAppointmentStatus(
        appointmentId,
        AppointmentStatus.cancelled,
      );
      
      return Result.success(true);
    } catch (e) {
      return Result.failure(AppointmentException(e.toString()));
    }
  }
}
```

#### 服务进度服务
```dart
class ServiceProgressService {
  final ServiceProgressRepository _repository;
  final NetworkService _networkService;
  
  ServiceProgressService(this._repository, this._networkService);
  
  /// 获取服务进度
  Future<Result<ServiceProgress>> getServiceProgress(
    String appointmentId,
  ) async {
    try {
      final apiResponse = await _networkService.get(
        '/appointments/$appointmentId/progress',
      );
      
      final progress = ServiceProgress.fromJson(apiResponse.data);
      
      // 缓存进度数据
      await _repository.saveProgress(progress);
      
      return Result.success(progress);
    } catch (e) {
      return Result.failure(ServiceException(e.toString()));
    }
  }
  
  /// 更新服务步骤
  Future<Result<ServiceStep>> updateServiceStep(
    String appointmentId,
    String stepId,
    ServiceStepUpdate update,
  ) async {
    try {
      final apiResponse = await _networkService.put(
        '/appointments/$appointmentId/steps/$stepId',
        data: update.toJson(),
      );
      
      final updatedStep = ServiceStep.fromJson(apiResponse.data);
      
      // 更新本地缓存
      await _repository.updateStep(appointmentId, updatedStep);
      
      return Result.success(updatedStep);
    } catch (e) {
      return Result.failure(ServiceException(e.toString()));
    }
  }
  
  /// 上传服务照片
  Future<Result<ServicePhoto>> uploadServicePhoto(
    String appointmentId,
    String stepId,
    File photoFile,
  ) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(photoFile.path),
        'appointmentId': appointmentId,
        'stepId': stepId,
      });
      
      final apiResponse = await _networkService.post(
        '/service-photos/upload',
        data: formData,
      );
      
      final photo = ServicePhoto.fromJson(apiResponse.data);
      
      return Result.success(photo);
    } catch (e) {
      return Result.failure(ServiceException(e.toString()));
    }
  }
}
```

### 2. 数据仓库 (`src/repositories/`)

#### 预约数据仓库
```dart
abstract class AppointmentRepository {
  Future<void> saveAppointment(Appointment appointment);
  Future<List<Appointment>> getCachedAppointments({
    String? status,
    int page = 1,
    int pageSize = 20,
  });
  Future<void> cacheAppointments(List<Appointment> appointments);
  Future<void> updateAppointmentStatus(String id, AppointmentStatus status);
  Future<void> clearCache();
}

class AppointmentRepositoryImpl implements AppointmentRepository {
  final LocalStorage _localStorage;
  final DatabaseHelper _databaseHelper;
  
  AppointmentRepositoryImpl(this._localStorage, this._databaseHelper);
  
  @override
  Future<void> saveAppointment(Appointment appointment) async {
    try {
      // 保存到数据库
      await _databaseHelper.insertAppointment(appointment);
      
      // 更新缓存
      final cacheKey = 'appointment_${appointment.id}';
      await _localStorage.setString(cacheKey, jsonEncode(appointment.toJson()));
    } catch (e) {
      throw RepositoryException('保存预约失败: $e');
    }
  }
  
  @override
  Future<List<Appointment>> getCachedAppointments({
    String? status,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      return await _databaseHelper.getAppointments(
        status: status,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      );
    } catch (e) {
      throw RepositoryException('获取缓存预约失败: $e');
    }
  }
  
  @override
  Future<void> updateAppointmentStatus(String id, AppointmentStatus status) async {
    try {
      await _databaseHelper.updateAppointmentStatus(id, status);
      
      // 更新内存缓存
      final cacheKey = 'appointment_$id';
      final cachedData = await _localStorage.getString(cacheKey);
      if (cachedData != null) {
        final appointment = Appointment.fromJson(jsonDecode(cachedData));
        final updatedAppointment = appointment.copyWith(status: status);
        await _localStorage.setString(
          cacheKey,
          jsonEncode(updatedAppointment.toJson()),
        );
      }
    } catch (e) {
      throw RepositoryException('更新预约状态失败: $e');
    }
  }
}
```

### 3. 数据模型 (`src/models/`)

#### 预约模型
```dart
@freezed
class Appointment with _$Appointment {
  const factory Appointment({
    required String id,
    required String userId,
    required String storeId,
    required ServiceType serviceType,
    required DateTime appointmentTime,
    required AppointmentStatus status,
    required VehicleInfo vehicleInfo,
    String? description,
    List<String>? attachments,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    Store? store,
    List<ServiceItem>? serviceItems,
    PaymentInfo? paymentInfo,
  }) = _Appointment;

  factory Appointment.fromJson(Map<String, dynamic> json) =>
      _$AppointmentFromJson(json);
}

@freezed
class AppointmentCreateRequest with _$AppointmentCreateRequest {
  const factory AppointmentCreateRequest({
    required String storeId,
    required ServiceType serviceType,
    required DateTime appointmentTime,
    required VehicleInfo vehicleInfo,
    String? description,
    List<String>? attachments,
    List<String>? serviceItemIds,
  }) = _AppointmentCreateRequest;

  factory AppointmentCreateRequest.fromJson(Map<String, dynamic> json) =>
      _$AppointmentCreateRequestFromJson(json);
}
```

#### 服务进度模型
```dart
@freezed
class ServiceProgress with _$ServiceProgress {
  const factory ServiceProgress({
    required String appointmentId,
    required ServiceStatus status,
    required List<ServiceStep> steps,
    required double progressPercentage,
    @JsonKey(name: 'estimated_completion') DateTime? estimatedCompletion,
    @JsonKey(name: 'actual_completion') DateTime? actualCompletion,
    Technician? assignedTechnician,
    List<ServicePhoto>? photos,
    String? currentStepNote,
  }) = _ServiceProgress;

  factory ServiceProgress.fromJson(Map<String, dynamic> json) =>
      _$ServiceProgressFromJson(json);
}

@freezed
class ServiceStep with _$ServiceStep {
  const factory ServiceStep({
    required String id,
    required String name,
    required String description,
    required ServiceStepStatus status,
    required int orderIndex,
    @JsonKey(name: 'started_at') DateTime? startedAt,
    @JsonKey(name: 'completed_at') DateTime? completedAt,
    String? note,
    List<String>? photoIds,
    Duration? estimatedDuration,
    Duration? actualDuration,
  }) = _ServiceStep;

  factory ServiceStep.fromJson(Map<String, dynamic> json) =>
      _$ServiceStepFromJson(json);
}
```

### 4. 枚举定义 (`src/enums/`)

```dart
enum AppointmentStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('confirmed')
  confirmed,
  @JsonValue('inProgress')
  inProgress,
  @JsonValue('completed')
  completed,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('noShow')
  noShow,
}

enum ServiceType {
  @JsonValue('maintenance')
  maintenance,
  @JsonValue('repair')
  repair,
  @JsonValue('inspection')
  inspection,
  @JsonValue('bodywork')
  bodywork,
  @JsonValue('insurance')
  insurance,
  @JsonValue('emergency')
  emergency,
  @JsonValue('recall')
  recall,
}

enum ServiceStatus {
  @JsonValue('waiting')
  waiting,
  @JsonValue('inProgress')
  inProgress,
  @JsonValue('completed')
  completed,
  @JsonValue('paused')
  paused,
  @JsonValue('cancelled')
  cancelled,
}

enum ServiceStepStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('inProgress')
  inProgress,
  @JsonValue('completed')
  completed,
  @JsonValue('skipped')
  skipped,
}
```

### 5. 异常定义 (`src/exceptions/`)

```dart
abstract class AfterSalesException implements Exception {
  final String message;
  final String? code;
  final dynamic details;
  
  const AfterSalesException(this.message, {this.code, this.details});
  
  @override
  String toString() => 'AfterSalesException: $message';
}

class AppointmentException extends AfterSalesException {
  const AppointmentException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ServiceException extends AfterSalesException {
  const ServiceException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class PaymentException extends AfterSalesException {
  const PaymentException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class NetworkException extends AfterSalesException {
  const NetworkException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class RepositoryException extends AfterSalesException {
  const RepositoryException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}
```

### 6. 结果封装 (`src/utils/result.dart`)

```dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(Exception error) = Failure<T>;
  
  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;
  
  T? get data => mapOrNull(success: (success) => success.data);
  Exception? get error => mapOrNull(failure: (failure) => failure.error);
}

extension ResultExtensions<T> on Result<T> {
  R fold<R>(
    R Function(T data) onSuccess,
    R Function(Exception error) onFailure,
  ) {
    return when(
      success: onSuccess,
      failure: onFailure,
    );
  }
  
  Future<Result<R>> mapAsync<R>(
    Future<R> Function(T data) mapper,
  ) async {
    return fold(
      (data) async {
        try {
          final result = await mapper(data);
          return Result.success(result);
        } catch (e) {
          return Result.failure(Exception(e.toString()));
        }
      },
      (error) => Future.value(Result.failure(error)),
    );
  }
}
```

## 使用示例

### 基础使用
```dart
class AfterSalesExample {
  final AppointmentService _appointmentService;
  final ServiceProgressService _progressService;
  
  AfterSalesExample(this._appointmentService, this._progressService);
  
  Future<void> createAppointmentExample() async {
    final request = AppointmentCreateRequest(
      storeId: 'store_123',
      serviceType: ServiceType.maintenance,
      appointmentTime: DateTime.now().add(Duration(days: 1)),
      vehicleInfo: VehicleInfo(
        vin: 'WVWAA71K08W201030',
        licensePlate: '京A12345',
        model: 'ID.4 CROZZ',
      ),
      description: '常规保养',
    );
    
    final result = await _appointmentService.createAppointment(request);
    
    result.fold(
      (appointment) {
        print('预约创建成功: ${appointment.id}');
      },
      (error) {
        print('预约创建失败: ${error.toString()}');
      },
    );
  }
  
  Future<void> trackServiceProgressExample(String appointmentId) async {
    final result = await _progressService.getServiceProgress(appointmentId);
    
    result.fold(
      (progress) {
        print('服务进度: ${progress.progressPercentage}%');
        print('当前步骤: ${progress.steps.where((s) => s.status == ServiceStepStatus.inProgress).first.name}');
      },
      (error) {
        print('获取进度失败: ${error.toString()}');
      },
    );
  }
}
```

### 依赖注入配置
```dart
class AfterSalesDI {
  static void setupDependencies(GetIt locator) {
    // 注册仓库
    locator.registerLazySingleton<AppointmentRepository>(
      () => AppointmentRepositoryImpl(
        locator<LocalStorage>(),
        locator<DatabaseHelper>(),
      ),
    );
    
    locator.registerLazySingleton<ServiceProgressRepository>(
      () => ServiceProgressRepositoryImpl(
        locator<LocalStorage>(),
        locator<DatabaseHelper>(),
      ),
    );
    
    // 注册服务
    locator.registerLazySingleton<AppointmentService>(
      () => AppointmentService(
        locator<AppointmentRepository>(),
        locator<NetworkService>(),
      ),
    );
    
    locator.registerLazySingleton<ServiceProgressService>(
      () => ServiceProgressService(
        locator<ServiceProgressRepository>(),
        locator<NetworkService>(),
      ),
    );
  }
}
```

## 测试策略

### 单元测试
```dart
void main() {
  group('AppointmentService', () {
    late AppointmentService appointmentService;
    late MockAppointmentRepository mockRepository;
    late MockNetworkService mockNetworkService;
    
    setUp(() {
      mockRepository = MockAppointmentRepository();
      mockNetworkService = MockNetworkService();
      appointmentService = AppointmentService(mockRepository, mockNetworkService);
    });
    
    test('should create appointment successfully', () async {
      // Arrange
      final request = AppointmentCreateRequest(
        storeId: 'store_123',
        serviceType: ServiceType.maintenance,
        appointmentTime: DateTime.now().add(Duration(days: 1)),
        vehicleInfo: VehicleInfo(vin: 'TEST123'),
      );
      
      final expectedAppointment = Appointment(
        id: 'appointment_123',
        userId: 'user_123',
        storeId: request.storeId,
        serviceType: request.serviceType,
        appointmentTime: request.appointmentTime,
        status: AppointmentStatus.pending,
        vehicleInfo: request.vehicleInfo,
      );
      
      when(mockNetworkService.post('/appointments', data: any))
          .thenAnswer((_) async => ApiResponse(data: expectedAppointment.toJson()));
      
      // Act
      final result = await appointmentService.createAppointment(request);
      
      // Assert
      expect(result.isSuccess, true);
      expect(result.data?.id, 'appointment_123');
      verify(mockRepository.saveAppointment(any)).called(1);
    });
  });
}
```

## 最佳实践

### API设计原则
1. **统一响应格式**: 所有API使用统一的响应格式
2. **错误处理**: 完善的错误码和错误信息
3. **数据验证**: 严格的输入数据验证
4. **幂等性**: 关键操作支持幂等性

### 缓存策略
1. **多级缓存**: 内存缓存 + 本地存储 + 网络
2. **缓存失效**: 基于时间和事件的缓存失效
3. **数据一致性**: 保证缓存与服务器数据一致
4. **离线支持**: 关键数据支持离线访问

## 总结

`clr_after_sales` 模块作为售后服务的核心SDK，通过完善的架构设计和标准化的接口封装，为售后服务应用提供了稳定可靠的技术支撑。模块采用了领域驱动设计思想，具有良好的可测试性和可维护性，能够支撑复杂的售后业务场景。
