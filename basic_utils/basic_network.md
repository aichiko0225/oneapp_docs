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

#### Dio 客户端配置
```dart
// 网络客户端配置
class NetworkClient {
  late Dio _dio;
  
  NetworkClient({
    String? baseUrl,
    Duration? connectTimeout,
    Duration? receiveTimeout,
    Duration? sendTimeout,
  }) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl ?? '',
      connectTimeout: connectTimeout ?? Duration(seconds: 30),
      receiveTimeout: receiveTimeout ?? Duration(seconds: 30),
      sendTimeout: sendTimeout ?? Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
      },
    ));
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    // 请求/响应拦截器
    _dio.interceptors.add(RequestInterceptor());
    _dio.interceptors.add(ResponseInterceptor());
    
    // 错误处理拦截器
    _dio.interceptors.add(ErrorInterceptor());
    
    // 日志拦截器（仅调试模式）
    if (kDebugMode) {
      _dio.interceptors.add(PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        responseHeader: false,
        error: true,
        compact: true,
      ));
    }
  }
}
```

#### 统一请求接口
```dart
// 统一的 HTTP 请求接口
abstract class INetworkService {
  Future<Result<T>> get<T>({
    required String path,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic)? fromJson,
  });
  
  Future<Result<T>> post<T>({
    required String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic)? fromJson,
  });
  
  Future<Result<T>> put<T>({
    required String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic)? fromJson,
  });
  
  Future<Result<T>> delete<T>({
    required String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic)? fromJson,
  });
}

// 网络服务实现
class NetworkService implements INetworkService {
  final NetworkClient _client;
  
  NetworkService(this._client);
  
  @override
  Future<Result<T>> get<T>({
    required String path,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _client._dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      
      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return Left(_handleError(e));
    }
  }
  
  Result<T> _handleResponse<T>(
    Response response,
    T Function(dynamic)? fromJson,
  ) {
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
      if (fromJson != null) {
        try {
          final data = fromJson(response.data);
          return Right(data);
        } catch (e) {
          return Left(NetworkFailure.parseError(e.toString()));
        }
      } else {
        return Right(response.data as T);
      }
    } else {
      return Left(NetworkFailure.httpError(
        response.statusCode!,
        response.statusMessage ?? '',
      ));
    }
  }
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

#### 网络异常定义
```dart
// 网络异常基类
@freezed
class NetworkFailure with _$NetworkFailure {
  const factory NetworkFailure.connectionError(String message) = ConnectionError;
  const factory NetworkFailure.timeoutError(String message) = TimeoutError;
  const factory NetworkFailure.httpError(int statusCode, String message) = HttpError;
  const factory NetworkFailure.parseError(String message) = ParseError;
  const factory NetworkFailure.businessError(int code, String message) = BusinessError;
  const factory NetworkFailure.unknownError(String message) = UnknownError;
}

// 业务异常
class BusinessException implements Exception {
  final int code;
  final String message;
  final dynamic data;
  
  const BusinessException(this.code, this.message, [this.data]);
  
  @override
  String toString() => 'BusinessException($code, $message)';
}

// 网络异常处理器
class NetworkErrorHandler {
  static NetworkFailure handleError(dynamic error) {
    if (error is DioException) {
      return _handleDioError(error);
    } else if (error is BusinessException) {
      return NetworkFailure.businessError(error.code, error.message);
    } else if (error is FormatException) {
      return NetworkFailure.parseError('数据解析失败: ${error.message}');
    } else {
      return NetworkFailure.unknownError(error.toString());
    }
  }
  
  static NetworkFailure _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkFailure.timeoutError('请求超时，请检查网络连接');
      
      case DioExceptionType.connectionError:
        return NetworkFailure.connectionError('网络连接失败，请检查网络设置');
      
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode ?? 0;
        final message = _getHttpErrorMessage(statusCode);
        return NetworkFailure.httpError(statusCode, message);
      
      case DioExceptionType.cancel:
        return NetworkFailure.unknownError('请求已取消');
      
      default:
        return NetworkFailure.unknownError('网络请求失败: ${error.message}');
    }
  }
  
  static String _getHttpErrorMessage(int statusCode) {
    switch (statusCode) {
      case 400:
        return '请求参数错误';
      case 401:
        return '未授权，请重新登录';
      case 403:
        return '禁止访问';
      case 404:
        return '请求的资源不存在';
      case 500:
        return '服务器内部错误';
      case 502:
        return '网关错误';
      case 503:
        return '服务暂时不可用';
      default:
        return 'HTTP错误: $statusCode';
    }
  }
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

### 基本用法
```dart
// 初始化网络服务
final config = NetworkConfig.forEnvironment(NetworkEnvironment.production);
final client = NetworkClient(
  baseUrl: config.baseUrl,
  connectTimeout: config.connectTimeout,
  receiveTimeout: config.receiveTimeout,
);
final networkService = NetworkService(client);

// GET 请求
final result = await networkService.get<List<User>>(
  path: '/users',
  queryParameters: {'page': 1, 'limit': 20},
  fromJson: (data) => (data as List)
      .map((item) => User.fromJson(item))
      .toList(),
);

result.fold(
  (failure) => print('请求失败: ${failure.toString()}'),
  (users) => print('获取到 ${users.length} 个用户'),
);

// POST 请求
final createResult = await networkService.post<User>(
  path: '/users',
  data: {
    'name': 'John Doe',
    'email': 'john@example.com',
  },
  fromJson: (data) => User.fromJson(data),
);
```

### 高级用法
```dart
// 带缓存的请求
final cachedResult = await networkService.getWithCache<List<Article>>(
  path: '/articles',
  cacheKey: 'articles_list',
  cacheDuration: Duration(minutes: 10),
  fromJson: (data) => (data as List)
      .map((item) => Article.fromJson(item))
      .toList(),
);

// 文件上传
final uploadResult = await networkService.upload<UploadResponse>(
  path: '/upload',
  file: File('path/to/file.jpg'),
  fileName: 'avatar.jpg',
  fromJson: (data) => UploadResponse.fromJson(data),
);

// 批量请求
final batchResults = await Future.wait([
  networkService.get<UserProfile>(path: '/profile'),
  networkService.get<List<Notification>>(path: '/notifications'),
  networkService.get<AppConfig>(path: '/config'),
]);
```

## 依赖管理

### 核心依赖
- **dio**: HTTP 客户端库
- **http_parser**: HTTP 解析工具
- **pretty_dio_logger**: 美化的请求日志

### 代码生成依赖
- **freezed**: 不可变类生成
- **json_annotation**: JSON 序列化注解
- **json_serializable**: JSON 序列化生成器

### 开发依赖
- **build_runner**: 代码生成引擎
- **test**: 单元测试框架
- **coverage**: 测试覆盖率工具

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
