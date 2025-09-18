# CLR Account 账户服务 SDK 文档

## 模块概述

`clr_account` 是 OneApp 账户系统的核心 SDK，提供用户认证、登录、注册、权限管理等基础服务。该模块采用领域驱动设计（DDD）架构，提供清晰的接口抽象和业务逻辑封装。

### 基本信息
- **模块名称**: clr_account
- **版本**: 0.2.24
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-clr-account

## 目录结构

```
clr_account/
├── lib/
│   ├── account.dart              # 主要导出文件
│   ├── account_event.dart        # 账户事件定义
│   ├── third_account.dart        # 第三方账户集成
│   ├── generated/                # 代码生成文件
│   ├── l10n/                     # 国际化文件
│   └── src/                      # 源代码目录
│       ├── data/                 # 数据层
│       ├── domain/               # 领域层
│       ├── presentation/         # 表示层
│       └── infrastructure/       # 基础设施层
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 账户认证 (Authentication)

#### 功能概述
- 用户登录/登出
- 密码认证
- 生物识别认证
- 多因素认证

#### 主要接口
```dart
// 基于实际项目的认证门面接口
abstract class IAuthFacade {
  /// 当前登录状态
  bool get isLogin;
  
  /// 用户登出
  Future<void> logout();
  
  /// 撤销注销
  Future<Either<AuthFailure, Unit>> undoSignOut(String refCode);
}

// 实际的认证异常类型
sealed class AuthFailure {
  const AuthFailure();
}

class OtherError extends AuthFailure {
  final dynamic error;
  const OtherError(this.error);
}
```

### 2. 用户注册 (Registration)

#### 功能概述
- 新用户注册
- 手机号验证
- 邮箱验证
- 用户信息收集

#### 主要接口
```dart
// 基于实际项目的配置文件门面接口
abstract class IProfileFacade {
  /// 获取本地用户配置文件
  Either<ProfileFailure, UserProfile> getUserProfileLocal();
  
  /// 从云端获取用户配置文件
  Future<Either<ProfileFailure, UserProfile>> fetchUserProfile();
}

// 实际的配置文件异常类型
sealed class ProfileFailure {
  const ProfileFailure();
}

// 实际的用户配置模型
class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? avatar;
  
  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
  });
}
```

### 3. 用户信息管理 (Profile)

#### 功能概述
- 个人信息查看和编辑
- 头像管理
- 偏好设置
- 隐私设置

#### 主要接口
```dart
// 基于实际项目的车库门面接口
abstract class IGarageFacade {
  /// 获取车库绑车列表
  /// [refresh]为 true 则强制从网络获取，并刷新本地数据
  Future<Either<GarageFailure, List<VehicleDto>>> getEnrollmentVehicleList({
    bool refresh = false,
    bool local = false,
  });
  
  /// 获取默认车辆
  Future<Either<GarageFailure, VehicleDto?>> getDefaultEnrolledVehicle({
    bool refresh = false,
  });
  
  /// 快速获取默认车辆
  VehicleDto? getDefaultVehicleLocal();
  
  /// 设置车辆是否默认
  Future<Either<GarageFailure, bool>> setVehicleDefault({
    required String vin,
    required bool isDefault,
  });
  
  /// 修改车牌号
  Future<Either<GarageFailure, bool>> setVehiclePlateNo(
    String plateNo,
    String vin,
  );
  
  /// 扫码登录车机
  Future<Either<GarageFailure, Unit>> signInHUWithQrCode({
    required String uuid,
    required int? timestamp,
    required String? signature,
  });
}

// 实际的车辆数据传输对象
class VehicleDto {
  final String vin;
  final String? plateNo;
  final VehicleModel vehicleModel;
  final String accountType;
  
  const VehicleDto({
    required this.vin,
    this.plateNo,
    required this.vehicleModel,
    required this.accountType,
  });
  
  static const String accountTypeP = 'P'; // 主账户
  static const String accountTypeS = 'S'; // 从账户
}
```

### 4. 权限管理 (Authorization)

#### 功能概述
- 角色权限管理
- 功能权限控制
- 资源访问控制

#### 主要接口
```dart
abstract class AuthorizationService {
  Future<Result<bool>> hasPermission(String permission);
  Future<Result<List<String>>> getUserRoles();
  Future<Result<bool>> canAccessResource(String resource);
}
```

## 技术架构

### 分层架构

#### 1. 表示层 (Presentation Layer)
- **功能**: 用户界面相关的状态管理和事件处理
- **组件**: 
  - Widget 组件
  - State 管理
  - Event 处理器

#### 2. 领域层 (Domain Layer)
- **功能**: 业务逻辑和业务规则
- **组件**:
  - Entity 实体
  - Value Object 值对象
  - Domain Service 领域服务
  - Repository 接口

#### 3. 数据层 (Data Layer)
- **功能**: 数据访问和存储
- **组件**:
  - Repository 实现
  - Data Source 数据源
  - Model 数据模型

#### 4. 基础设施层 (Infrastructure Layer)
- **功能**: 外部服务集成
- **组件**:
  - 网络服务
  - 存储服务
  - 第三方 SDK 集成

### 状态管理

#### 事件驱动架构
基于 OneApp 事件总线系统，使用真实的账户事件处理机制。

```dart
// 实际项目中的事件处理示例（从 PersonalCenterBloc）
class PersonalCenterBloc extends Bloc<PersonalCenterEvent, PersonalCenterState> {
  PersonalCenterBloc(
    this._signInFacade,
    this._profileFacade,
    this._garageFacade,
  ) : super(PersonalCenterState.initial()) {
    // 监听推送事件
    _eventListener = pushFacade.subscribeOn(
      topics: [
        userProfileChangedTopic,
        logoutTopic,
        loginSuccessTopic,
        loginFailedTopic,
      ],
    ).listen((event) async {
      // 当收到用户信息更变、登出事件、登录成功事件时，重新加载用户信息
      if (event.topic == logoutTopic || event.topic == loginSuccessTopic) {
        OneAppEventBus.fireEvent(UserLoginEvent(loginType: LoginOutType.all));
        add(const PersonalCenterEvent.loadUserProfile());
        add(const PersonalCenterEvent.loadSocialInfor());
      }
    });
    
    // 监听积分变更事件
    _pointsChageEvent = OneAppEventBus.addListen<PointsChangeEvent>((event) {
      add(const PersonalCenterEvent.loadUserPoints());
    });
  }
}

// 实际的账户事件类型
abstract class AccountEvent {
  const AccountEvent();
}

class UserLoginEvent extends AccountEvent {
  final LoginOutType loginType;
  const UserLoginEvent({required this.loginType});
}

enum LoginOutType { all }
```

### 数据持久化

#### 本地存储
- 基于 `basic_storage` 的统一存储接口
- 用户信息安全存储
- 登录凭证加密存储

#### 缓存策略
- 用户信息内存缓存
- 权限信息缓存
- 网络请求缓存

## 依赖关系

### 核心依赖
- `basic_network`: 网络请求服务
- `basic_storage`: 本地存储服务
- `basic_modular`: 模块化框架
- `basic_error`: 错误处理
- `basic_consent`: 用户同意管理

### 第三方集成
- `fluwx`: 微信 SDK 集成
- `dartz`: 函数式编程支持
- `freezed_annotation`: 不可变类生成

### 业务依赖
- `clr_setting`: 设置服务
- `basic_track`: 埋点追踪
- `basic_webview`: WebView 服务

## API 接口设计

### 认证接口
```dart
// 登录
POST /api/v1/auth/login
{
  "username": "string",
  "password": "string",
  "deviceId": "string"
}

// 登出
POST /api/v1/auth/logout
{
  "token": "string"
}

// 刷新令牌
POST /api/v1/auth/refresh
{
  "refreshToken": "string"
}
```

### 用户信息接口
```dart
// 获取用户信息
GET /api/v1/user/profile

// 更新用户信息
PUT /api/v1/user/profile
{
  "nickname": "string",
  "avatar": "string",
  "birthday": "string"
}
```

## 安全特性

### 数据安全
- 密码哈希存储
- 敏感信息加密
- 通信 HTTPS 加密

### 认证安全
- JWT 令牌机制
- 令牌过期机制
- 设备绑定验证

### 隐私保护
- 用户同意管理
- 数据最小化收集
- 隐私设置支持

## 错误处理

### 错误分类
- 网络错误
- 认证错误
- 业务逻辑错误
- 系统错误

### 错误处理策略
基于实际项目中的异常处理模式，使用 Functional Programming 的 Either 模式。

```dart
// 实际项目中的异常处理示例
sealed class AuthFailure {
  const AuthFailure();
}

class OtherError extends AuthFailure {
  final dynamic error;
  const OtherError(this.error);
}

sealed class ProfileFailure {
  const ProfileFailure();
}

sealed class GarageFailure {
  const GarageFailure();
}

// 错误处理方法示例（来自 PersonalCenterBloc）
void _onLoginFailed(LoginFailure failure) {
  final authFailure = failure.cause;
  
  if (authFailure is OtherError) {
    // 其他异常
    _handleOtherAuthFailure(authFailure.error);
  }
}

void _handleOtherAuthFailure(dynamic error) {
  if (error is ErrorGlobalBusiness) {
    // 云端异常
    final Map<String, dynamic> errorConfig = error.errorConfig;
    final String? originalCode = errorConfig['originalCode'] as String?;
    
    // 处理特定错误码
    if (originalCode == '10444105') {
      // 预注销状态处理
      _showPreSignOutDialog(/*参数*/);
    }
  }
}

// 使用 Either 模式的接口返回值
Future<Either<ProfileFailure, UserProfile>> fetchUserProfile();
Future<Either<GarageFailure, List<VehicleDto>>> getEnrollmentVehicleList();
Future<Either<AuthFailure, Unit>> undoSignOut(String refCode);
```

## 国际化支持

### 支持语言
- 中文（简体）
- 英文
- 其他地区语言扩展

### 配置方式
- 基于 `basic_intl` 的国际化框架
- 动态语言切换
- 文本资源管理

## 测试策略

### 单元测试
- 领域逻辑测试
- 服务接口测试
- 工具类测试

### 集成测试
- API 接口测试
- 数据存储测试
- 第三方服务集成测试

### UI 测试
- 登录流程测试
- 注册流程测试
- 用户信息管理测试

## 性能优化

### 网络优化
- 请求缓存
- 批量请求
- 网络重试机制

### 内存优化
- 对象池管理
- 图片缓存优化
- 内存泄漏防护

### 启动优化
- 懒加载机制
- 预加载策略
- 冷启动优化

## 监控与统计

### 用户行为统计
- 登录成功率
- 注册转化率
- 功能使用统计

### 性能监控
- 接口响应时间
- 错误率统计
- 崩溃率监控

### 业务指标
- 活跃用户数
- 用户留存率
- 功能使用频次

## 开发指南

### 环境搭建
1. 安装 Flutter SDK >=2.10.5
2. 配置依赖项目路径
3. 运行 `flutter pub get`

### 代码规范
- 遵循 Dart 编码规范
- 使用 `analysis_options.yaml` 静态分析
- 提交前代码格式化

### 调试技巧
- 使用 `basic_logger` 记录日志
- 网络请求调试
- 状态变更追踪

## 版本历史

### v0.2.24 (当前版本)
- 支持微信登录集成
- 优化用户信息缓存机制
- 增强安全认证流程

### 后续规划
- 支持更多第三方登录
- 增强生物识别认证
- 优化性能和用户体验

## 总结

`clr_account` 作为 OneApp 的账户核心 SDK，提供了完整的用户认证和管理功能。模块采用清晰的分层架构，具有良好的可扩展性和可维护性，为整个应用的用户体系提供了坚实的基础。
