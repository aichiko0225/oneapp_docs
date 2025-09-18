# Basic Network - 网络通信模块文档

## 模块概述

`basic_network` 是 OneApp 基础工具模块群中的网络通信核心模块，基于 Dio 框架封装，提供统一的 HTTP 请求接口、拦截器机制、错误处理和日志记录功能。该模块为整个应用提供标准化的网络通信能力。

### 基本信息
- **模块名称**: basic_network
- **版本**: 0.2.3+4
- **仓库**: https://gitlab-rd0.maezia.com/eziahz/oneapp/ezia-oneapp-basic-network
- **Dart 版本**: >=2.17.0 <4.0.0

## 目录结构

```
basic_network/
├── lib/
│   ├── basic_network.dart    # 主导出文件
│   ├── common_dos.dart       # 通用数据对象
│   ├── common_dtos.dart      # 通用数据传输对象
│   └── src/                  # 源代码目录
│       ├── client/           # HTTP 客户端实现
│       ├── interceptors/     # 请求拦截器
│       ├── models/           # 数据模型
│       ├── exceptions/       # 异常定义
│       └── utils/            # 工具类
├── pubspec.yaml              # 依赖配置
└── README.md                 # 项目说明
```

## 核心功能模块

### 1. HTTP 客户端封装

基于真实项目的网络引擎架构，使用工厂模式和依赖注入。

#### 网络引擎初始化 (`facade.dart`)
```dart
// 实际的网络引擎初始化
bool initNetwork({NetworkEngineOption? option, NetworkLogOutput? networkLog}) =>
    NetworkEngineContext().init(option: option, networkLog: networkLog);

/// 根据自定义option获取NetworkEngine
RequestApi customNetworkEngine(NetworkEngineOption option) =>
    RequestApi(NetworkEngineFactory.createBy(option));

/// 统一的请求接口
Future<T> request<T>(RequestOptions requestOptions) async =>
    NetworkEngineContext.networkEngine.request<T>(requestOptions);

/// 带回调的请求方法
Future<void> requestWithCallback<T>(
  RequestOptions requestOptions,
  RequestOnSuccessCallback<T> onSuccess,
  RequestOnErrorCallback onError,
) async {
  try {
    final res = await NetworkEngineContext.networkEngine.request<T>(
      requestOptions,
    );
    onSuccess(res);
  } on ErrorBase catch (e) {
    onError(e);
  } catch (e) {
    logger.e(e);
    onError(ErrorGlobalCommon(GlobalCommonErrorType.other, e));
  }
}
```

#### 默认网络引擎配置 (`common_options.dart`)
```dart
// 实际的默认网络引擎选项
class DefaultNetworkEngineOption extends NetworkEngineOption {
  final Headers _headers = Headers();

  final BaseDtoResponseConvertor _baseDtoResponseConvertor =
      const DefaultBaseJsonResponseConvertor();

  final GlobalErrorBusinessFactory _globalBusinessErrorFactory =
      defaultGlobalBusinessErrorFactory;

  @override
  BaseDtoResponseConvertor get baseDtoConvertor => _baseDtoResponseConvertor;

  @override
  String get baseUrl => '';

  @override
  Headers get headers => _headers;

  @override
  List<Interceptor> get interceptors => [];

  @override
  ProxyConfig? get proxyConfig => null;

  @override
  int get receiveTimeout => 10000;

  @override
  int get retryTime => 3;

  @override
  int get sendTimeout => 10000;

  @override
  int get connectTimeout => 10000;

  @override
  SslConfig? get sslConfig => null;

  @override
  List<GlobalErrorHandler> get globalErrorHandlers => [];

  @override
  GlobalErrorBusinessFactory get globalErrorBusinessFactory =>
      _globalBusinessErrorFactory;

  @override
  bool get debuggable => false;

  @override
  String get environment => 'sit';

  @override
  List<PreRequestInterceptor> get preRequestInterceptors => [];
}
```

#### RequestApi 类实现
```dart
// 实际的请求API封装类
class RequestApi {
  RequestApi(this._engine);

  final NetworkEngine _engine;

  /// 异步请求，等待结果或抛出异常
  Future<T> request<T>(RequestOptions requestOptions) async =>
      _engine.request(requestOptions);

  /// 带回调的请求方法
  Future<void> requestWithCallback<T>(
    RequestOptions requestOptions,
    RequestOnSuccessCallback<T> onSuccess,
    RequestOnErrorCallback onError,
  ) async {
    try {
      final res = await _engine.request<T>(requestOptions);
      onSuccess(res);
    } on ErrorBase catch (e) {
      onError(e);
    } catch (e) {
      logger.e(e);
      onError(ErrorGlobalCommon(GlobalCommonErrorType.other, e));
    }
  }

  /// 文件下载，带进度回调
  Future<HttpResponse> download({
    required dynamic savePath,
    required RequestOptions options,
    ProgressCallback? onReceiveProgress,
    CancelToken? cancelToken,
  }) =>
      _engine.download(
        savePath: savePath,
        options: options,
        onReceiveProgress: onReceiveProgress,
        cancelToken: cancelToken,
      );

  /// 文件上传，带进度回调
  Future<HttpResponse> upload({
    required RequestOptions options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
  }) =>
      _engine.upload(
        options: options,
        onSendProgress: onSendProgress,
        cancelToken: cancelToken,
      );

  /// 获取当前引擎配置
  NetworkEngineOption get option => _engine.option;
}
```

### 2. 请求拦截器系统

#### 请求拦截器
```dart
// 请求拦截器
class RequestInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // 添加公共请求头
    _addCommonHeaders(options);
    
    // 添加认证信息
    _addAuthenticationHeaders(options);
    
    // 添加设备信息
    _addDeviceInfo(options);
    
    // 请求签名
    _signRequest(options);
    
    super.onRequest(options, handler);
  }
  
  void _addCommonHeaders(RequestOptions options) {
    options.headers.addAll({
      'User-Agent': _getUserAgent(),
      'Accept-Language': _getAcceptLanguage(),
      'X-Request-ID': _generateRequestId(),
      'X-Timestamp': DateTime.now().millisecondsSinceEpoch.toString(),
    });
  }
  
  void _addAuthenticationHeaders(RequestOptions options) {
    final token = AuthManager.instance.accessToken;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
  }
  
  void _addDeviceInfo(RequestOptions options) {
    options.headers.addAll({
      'X-Device-ID': DeviceInfo.instance.deviceId,
      'X-App-Version': AppInfo.instance.version,
      'X-Platform': Platform.isAndroid ? 'android' : 'ios',
    });
  }
}
```

#### 响应拦截器
```dart
// 响应拦截器
class ResponseInterceptor extends Interceptor {
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    // 统一响应格式处理
    _processCommonResponse(response);
    
    // 更新认证状态
    _updateAuthenticationStatus(response);
    
    // 缓存响应数据
    _cacheResponseIfNeeded(response);
    
    super.onResponse(response, handler);
  }
  
  void _processCommonResponse(Response response) {
    if (response.data is Map<String, dynamic>) {
      final data = response.data as Map<String, dynamic>;
      
      // 检查业务状态码
      final code = data['code'] as int?;
      final message = data['message'] as String?;
      
      if (code != null && code != 0) {
        throw BusinessException(code, message ?? '业务处理失败');
      }
      
      // 提取实际数据
      if (data.containsKey('data')) {
        response.data = data['data'];
      }
    }
  }
}
```

#### 错误拦截器
```dart
// 错误拦截器
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // 网络错误处理
    if (_isNetworkError(err)) {
      _handleNetworkError(err);
    }
    
    // 认证错误处理
    if (_isAuthenticationError(err)) {
      _handleAuthenticationError(err);
    }
    
    // 服务器错误处理
    if (_isServerError(err)) {
      _handleServerError(err);
    }
    
    // 请求重试机制
    if (_shouldRetry(err)) {
      _retryRequest(err, handler);
      return;
    }
    
    super.onError(err, handler);
  }
  
  bool _shouldRetry(DioException err) {
    // 网络超时重试
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout) {
      return _getRetryCount(err) < 3;
    }
    
    // 5xx 服务器错误重试
    if (err.response?.statusCode != null &&
        err.response!.statusCode! >= 500) {
      return _getRetryCount(err) < 2;
    }
    
    return false;
  }
  
  Future<void> _retryRequest(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final retryCount = _getRetryCount(err) + 1;
    final delay = Duration(seconds: retryCount * 2);
    
    await Future.delayed(delay);
    
    try {
      final options = err.requestOptions;
      options.extra['retry_count'] = retryCount;
      
      final response = await Dio().request(
        options.path,
        data: options.data,
        queryParameters: options.queryParameters,
        options: Options(
          method: options.method,
          headers: options.headers,
          extra: options.extra,
        ),
      );
      
      handler.resolve(response);
    } catch (e) {
      handler.next(err);
    }
  }
}
```

### 3. 数据传输对象 (DTOs)

#### 通用响应模型
```dart
// 通用 API 响应模型
@freezed
class ApiResponse<T> with _$ApiResponse<T> {
  const factory ApiResponse({
    required int code,
    required String message,
    T? data,
    @JsonKey(name: 'request_id') String? requestId,
    @JsonKey(name: 'timestamp') int? timestamp,
  }) = _ApiResponse<T>;
  
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);
}

// 分页响应模型
@freezed
class PagedResponse<T> with _$PagedResponse<T> {
  const factory PagedResponse({
    required List<T> items,
    required int total,
    required int page,
    required int pageSize,
    @JsonKey(name: 'has_more') required bool hasMore,
  }) = _PagedResponse<T>;
  
  factory PagedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) => _$PagedResponseFromJson(json, fromJsonT);
}
```

#### 请求参数模型
```dart
// 分页请求参数
@freezed
class PageRequest with _$PageRequest {
  const factory PageRequest({
    @Default(1) int page,
    @Default(20) int pageSize,
    String? sortBy,
    @Default('desc') String sortOrder,
  }) = _PageRequest;
  
  factory PageRequest.fromJson(Map<String, dynamic> json) =>
      _$PageRequestFromJson(json);
}

// 搜索请求参数
@freezed
class SearchRequest with _$SearchRequest {
  const factory SearchRequest({
    required String keyword,
    List<String>? filters,
    @Default(1) int page,
    @Default(20) int pageSize,
  }) = _SearchRequest;
  
  factory SearchRequest.fromJson(Map<String, dynamic> json) =>
      _$SearchRequestFromJson(json);
}
```

### 4. 错误处理系统

基于真实项目的多层次错误处理架构，包含全局错误、业务错误和自定义错误。

#### 错误基类定义 (`model/error.dart`)
```dart
// 实际的错误基类
abstract class ErrorBase implements Exception {
  /// 调用栈
  StackTrace? stackTrace;

  /// 错误消息
  String get errorMessage;
}

/// 全局的错误基类
abstract class ErrorGlobal extends ErrorBase {}

/// 通用全局错误
class ErrorGlobalCommon extends ErrorGlobal {
  ErrorGlobalCommon(
    this.errorType,
    this._originalCause, {
    this.httpCode,
    this.response,
    this.message,
  }) {
    stackTrace = StackTrace.current;
  }

  /// 封装的原始error
  final dynamic _originalCause;

  /// 错误类型
  final GlobalCommonErrorType errorType;

  /// http返回的值
  final int? httpCode;

  /// 返回的response
  final HttpResponse? response;

  /// 返回的消息
  late String? message;

  /// 返回原始的错误原因，如DioError
  dynamic get originalCause => _originalCause;

  @override
  String get errorMessage => message ?? response?.statusMessage ?? '';

  @override
  String toString() => 'ErrorGlobalCommon{_originalCause: $_originalCause, '
      'errorType: $errorType, httpCode: $httpCode, response: $response}';
}

/// 业务错误通用基类
abstract class ErrorGlobalBusiness extends ErrorGlobal {
  /// 业务错误码
  String get businessCode;

  @override
  String get errorMessage;

  /// 错误配置
  Map<String, dynamic> get errorConfig;

  @override
  String toString() =>
      'ErrorGlobalBusiness{businessCode:$businessCode, message:$errorMessage}';
}

/// 自定义错误
class ErrorCustom extends ErrorBase {
  // 自定义错误实现
  // ...
}
```

#### 全局错误处理器
```dart
// 错误工厂方法类型定义
typedef GlobalErrorBusinessFactory = ErrorGlobalBusiness? Function(
  BaseDtoModel model,
);

typedef CustomErrorFactory = ErrorCustom? Function(BaseDtoModel model);

// 全局错误处理流程
// 在网络引擎中自动调用错误处理器链
// 支持自定义全局错误处理器扩展
```

#### 错误类型枚举
```dart
// 全局通用错误类型
enum GlobalCommonErrorType {
  timeout,
  noNetwork,
  serverError,
  parseError,
  other,
}
```

### 5. 缓存机制

#### 请求缓存管理
```dart
// 网络缓存管理器
class NetworkCacheManager {
  static final Map<String, CacheItem> _cache = {};
  static const Duration defaultCacheDuration = Duration(minutes: 5);
  
  // 设置缓存
  static void setCache(
    String key,
    dynamic data, {
    Duration? duration,
  }) {
    _cache[key] = CacheItem(
      data: data,
      timestamp: DateTime.now(),
      duration: duration ?? defaultCacheDuration,
    );
  }
  
  // 获取缓存
  static T? getCache<T>(String key) {
    final item = _cache[key];
    if (item == null) return null;
    
    if (item.isExpired) {
      _cache.remove(key);
      return null;
    }
    
    return item.data as T?;
  }
  
  // 清除缓存
  static void clearCache([String? key]) {
    if (key != null) {
      _cache.remove(key);
    } else {
      _cache.clear();
    }
  }
  
  // 生成缓存键
  static String generateCacheKey(
    String path,
    Map<String, dynamic>? queryParameters,
  ) {
    final uri = Uri(path: path, queryParameters: queryParameters);
    return uri.toString();
  }
}

// 缓存项
class CacheItem {
  final dynamic data;
  final DateTime timestamp;
  final Duration duration;
  
  CacheItem({
    required this.data,
    required this.timestamp,
    required this.duration,
  });
  
  bool get isExpired => DateTime.now().difference(timestamp) > duration;
}
```

### 6. 请求配置管理

#### 环境配置
```dart
// 网络环境配置
enum NetworkEnvironment {
  development,
  testing,
  staging,
  production,
}

class NetworkConfig {
  final String baseUrl;
  final Duration connectTimeout;
  final Duration receiveTimeout;
  final Duration sendTimeout;
  final bool enableLogging;
  final bool enableCache;
  final int maxRetries;
  
  const NetworkConfig({
    required this.baseUrl,
    this.connectTimeout = const Duration(seconds: 30),
    this.receiveTimeout = const Duration(seconds: 30),
    this.sendTimeout = const Duration(seconds: 30),
    this.enableLogging = false,
    this.enableCache = true,
    this.maxRetries = 3,
  });
  
  // 开发环境配置
  static const NetworkConfig development = NetworkConfig(
    baseUrl: 'https://dev-api.oneapp.com',
    enableLogging: true,
    enableCache: false,
  );
  
  // 测试环境配置
  static const NetworkConfig testing = NetworkConfig(
    baseUrl: 'https://test-api.oneapp.com',
    enableLogging: true,
  );
  
  // 生产环境配置
  static const NetworkConfig production = NetworkConfig(
    baseUrl: 'https://api.oneapp.com',
    enableLogging: false,
  );
  
  static NetworkConfig forEnvironment(NetworkEnvironment env) {
    switch (env) {
      case NetworkEnvironment.development:
        return development;
      case NetworkEnvironment.testing:
        return testing;
      case NetworkEnvironment.staging:
        return testing; // 使用测试环境配置
      case NetworkEnvironment.production:
        return production;
    }
  }
}
```

## 使用示例

基于实际项目的网络请求使用方法。

### 基本初始化和使用
```dart
// 初始化网络库
final option = DefaultNetworkEngineOption()
  ..baseUrl = 'https://api.oneapp.com'
  ..debuggable = true
  ..environment = 'production';

// 初始化默认网络引擎
initNetwork(option: option);

// 直接使用全局方法发起请求
try {
  final response = await request<UserModel>(
    RequestOptions(
      path: '/users/profile',
      method: 'GET',
    ),
  );
  print('用户信息: ${response.name}');
} on ErrorBase catch (e) {
  print('请求失败: ${e.errorMessage}');
}
```

### 使用RequestApi
```dart
// 创建自定义网络引擎
final customOption = DefaultNetworkEngineOption()
  ..baseUrl = 'https://custom-api.com'
  ..retryTime = 5
  ..connectTimeout = 15000;

final api = customNetworkEngine(customOption);

// 使用回调方式处理请求
await api.requestWithCallback<List<ArticleModel>>(
  RequestOptions(
    path: '/articles',
    method: 'GET',
    queryParameters: {'page': 1, 'limit': 20},
  ),
  (articles) {
    print('获取到 ${articles.length} 篇文章');
  },
  (error) {
    print('请求失败: ${error.errorMessage}');
    
    // 处理特定类型的错误
    if (error is ErrorGlobalBusiness) {
      print('业务错误码: ${error.businessCode}');
    }
  },
);
```

### 文件上传和下载
```dart
// 文件上传
final uploadResponse = await api.upload(
  options: RequestOptions(
    path: '/upload',
    method: 'POST',
    data: FormData.fromMap({
      'file': await MultipartFile.fromFile('/path/to/file.jpg'),
      'description': '头像上传',
    }),
  ),
  onSendProgress: (sent, total) {
    final progress = (sent / total * 100).toStringAsFixed(1);
    print('上传进度: $progress%');
  },
);

// 文件下载
await download(
  savePath: '/path/to/save/file.pdf',
  options: RequestOptions(
    path: '/download/document.pdf',
    method: 'GET',
  ),
  onReceiveProgress: (received, total) {
    final progress = (received / total * 100).toStringAsFixed(1);
    print('下载进度: $progress%');
  },
);
```

### 自定义配置示例
```dart
// 创建带有自定义拦截器的配置
class MyNetworkOption extends DefaultNetworkEngineOption {
  @override
  String get baseUrl => 'https://my-api.com';

  @override
  List<Interceptor> get interceptors => [
    MyAuthInterceptor(),
    MyLoggingInterceptor(),
  ];

  @override
  List<GlobalErrorHandler> get globalErrorHandlers => [
    MyCustomErrorHandler(),
  ];

  @override
  bool get debuggable => kDebugMode;

  @override
  int get retryTime => 3;
}
```

## 依赖管理

基于实际的pubspec.yaml配置，展示真实的项目依赖关系。

### 核心依赖
```yaml
# 实际项目依赖配置
dependencies:
  http_parser: ^4.0.2          # HTTP 解析工具
  dio: ^5.7.0                  # HTTP 客户端库（核心）
  pretty_dio_logger: ^1.3.1    # 美化的请求日志
  freezed_annotation: ^2.2.0   # 不可变类注解
  json_annotation: ^4.8.1      # JSON 序列化注解

dev_dependencies:
  json_serializable: ^6.7.0    # JSON 序列化生成器
  build_runner: ^2.4.5         # 代码生成引擎
  test: ^1.24.3                # 单元测试框架
  coverage: ^1.6.3             # 测试覆盖率工具
  freezed: ^2.3.5              # 不可变类生成器
  flutter_lints: ^5.0.0        # 代码规范检查
```

### 实际的版本信息
- **模块名称**: basic_network
- **版本**: 0.2.3+4
- **仓库**: https://gitlab-rd0.maezia.com/eziahz/oneapp/ezia-oneapp-basic-network
- **Dart 版本**: >=2.17.0 <4.0.0

## 性能优化

### 网络性能优化
- 连接池复用
- HTTP/2 支持
- 请求合并和批处理
- 智能重试机制

### 缓存优化
- 多级缓存策略
- 缓存过期管理
- 条件请求支持
- 离线缓存机制

### 内存优化
- 流式数据处理
- 大文件分块传输
- 及时释放响应数据
- 内存泄漏检测

## 测试策略

### 单元测试
- 网络服务接口测试
- 拦截器功能测试
- 错误处理测试
- 缓存机制测试

### 集成测试
- 端到端请求测试
- 网络环境切换测试
- 错误恢复测试

### Mock 测试
- 网络请求 Mock
- 错误场景模拟
- 性能测试

## 总结

`basic_network` 模块为 OneApp 提供了强大而灵活的网络通信能力。通过统一的接口抽象、完善的错误处理、智能的缓存机制和丰富的拦截器功能，大大简化了网络请求的开发工作，提高了应用的稳定性和用户体验。模块的设计充分考虑了可扩展性和可维护性，为大型应用的网络通信提供了坚实的基础。
