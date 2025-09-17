# App Configuration - 应用配置管理模块

## 模块概述

`app_configuration` 是 OneApp 的应用配置管理模块，提供了完整的配置管理解决方案。该模块支持远程配置下发、本地配置缓存、配置热更新和多环境配置切换等功能，为应用的配置管理提供了统一的接口和可靠的实现。

## 核心功能

### 1. 远程配置管理
- **配置下发**：从服务端动态下发配置信息
- **版本控制**：配置版本管理和回滚机制
- **灰度发布**：支持配置的灰度发布策略
- **实时同步**：配置变更的实时同步

### 2. 本地配置缓存
- **离线支持**：配置本地缓存确保离线可用
- **持久化存储**：配置数据持久化存储
- **缓存策略**：智能缓存策略优化性能
- **数据压缩**：配置数据压缩存储

### 3. 配置热更新
- **实时更新**：配置变更无需重启应用
- **增量更新**：只更新变化的配置项
- **更新通知**：配置更新事件通知机制
- **回滚机制**：配置更新失败自动回滚

### 4. 环境配置切换
- **多环境支持**：开发、测试、生产环境配置
- **环境隔离**：不同环境配置完全隔离
- **动态切换**：运行时动态切换配置环境
- **配置验证**：配置有效性验证机制

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            应用层                    │
│         (UI Components)             │
├─────────────────────────────────────┤
│       App Configuration             │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 配置管理 │ 缓存服务 │ 更新服务 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 环境切换 │ 数据同步 │ 事件通知 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│         CLR Configuration           │
│           (配置服务SDK)              │
├─────────────────────────────────────┤
│           网络服务层                 │
│      (HTTP/WebSocket/GraphQL)       │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 配置管理器 (ConfigurationManager)
```dart
class ConfigurationManager {
  // 初始化配置管理器
  Future<bool> initialize(ConfigurationConfig config);
  
  // 获取配置值
  T? getValue<T>(String key, {T? defaultValue});
  
  // 设置配置值
  Future<bool> setValue<T>(String key, T value);
  
  // 删除配置
  Future<bool> removeValue(String key);
  
  // 获取所有配置
  Map<String, dynamic> getAllConfigurations();
}
```

#### 2. 远程配置服务 (RemoteConfigService)
```dart
class RemoteConfigService {
  // 从服务端获取配置
  Future<ConfigurationResult> fetchRemoteConfig();
  
  // 检查配置更新
  Future<bool> checkForUpdates();
  
  // 应用远程配置
  Future<bool> applyRemoteConfig(Map<String, dynamic> config);
  
  // 获取配置版本信息
  Future<ConfigVersion> getConfigVersion();
}
```

#### 3. 本地缓存管理器 (LocalCacheManager)
```dart
class LocalCacheManager {
  // 缓存配置到本地
  Future<bool> cacheConfiguration(String key, dynamic value);
  
  // 从缓存获取配置
  T? getCachedConfiguration<T>(String key);
  
  // 清除缓存
  Future<bool> clearCache([String? key]);
  
  // 获取缓存大小
  Future<int> getCacheSize();
  
  // 压缩缓存数据
  Future<bool> compressCache();
}
```

#### 4. 环境管理器 (EnvironmentManager)
```dart
class EnvironmentManager {
  // 设置当前环境
  Future<bool> setCurrentEnvironment(Environment environment);
  
  // 获取当前环境
  Environment getCurrentEnvironment();
  
  // 获取环境配置
  Map<String, dynamic> getEnvironmentConfig(Environment environment);
  
  // 验证环境配置
  Future<bool> validateEnvironmentConfig(Environment environment);
}
```

## 数据模型

### 配置模型
```dart
class Configuration {
  final String key;
  final dynamic value;
  final ConfigurationType type;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String version;
  final Map<String, dynamic> metadata;
  final bool isRemote;
  final bool isEncrypted;
}

enum ConfigurationType {
  string,
  integer,
  double,
  boolean,
  json,
  list
}
```

### 环境模型
```dart
enum Environment {
  development,
  testing,
  staging,
  production
}

class EnvironmentConfig {
  final Environment environment;
  final String baseUrl;
  final String apiKey;
  final Map<String, String> headers;
  final int timeout;
  final bool enableLogging;
  final Map<String, dynamic> features;
}
```

### 配置版本模型
```dart
class ConfigVersion {
  final String version;
  final DateTime publishTime;
  final String description;
  final List<String> changedKeys;
  final Map<String, dynamic> changeset;
  final bool isForced;
  final DateTime expireTime;
}
```

## API 接口

### 配置管理接口
```dart
abstract class ConfigurationService {
  // 初始化配置服务
  Future<ApiResponse<bool>> initialize(InitConfigRequest request);
  
  // 获取配置
  Future<ApiResponse<ConfigurationResult>> getConfiguration(GetConfigRequest request);
  
  // 批量获取配置
  Future<ApiResponse<Map<String, dynamic>>> getBatchConfiguration(BatchConfigRequest request);
  
  // 更新配置
  Future<ApiResponse<bool>> updateConfiguration(UpdateConfigRequest request);
}
```

### 远程配置接口
```dart
abstract class RemoteConfigurationService {
  // 获取远程配置
  Future<ApiResponse<Map<String, dynamic>>> fetchRemoteConfiguration(FetchConfigRequest request);
  
  // 检查配置更新
  Future<ApiResponse<UpdateCheckResult>> checkConfigurationUpdate(CheckUpdateRequest request);
  
  // 上报配置使用情况
  Future<ApiResponse<bool>> reportConfigurationUsage(UsageReportRequest request);
}
```

## 配置管理

### 默认配置
```dart
class DefaultConfiguration {
  static const Map<String, dynamic> defaultConfig = {
    'app': {
      'name': 'OneApp',
      'version': '1.0.0',
      'debug': false,
    },
    'network': {
      'timeout': 30000,
      'retryCount': 3,
      'enableCache': true,
    },
    'ui': {
      'theme': 'auto',
      'language': 'auto',
      'animations': true,
    },
    'features': {
      'enableAnalytics': true,
      'enablePush': true,
      'enableLocation': false,
    },
  };
}
```

### 环境配置
```dart
class EnvironmentConfiguration {
  static const Map<Environment, EnvironmentConfig> environments = {
    Environment.development: EnvironmentConfig(
      environment: Environment.development,
      baseUrl: 'https://dev-api.oneapp.com',
      apiKey: 'dev_api_key',
      enableLogging: true,
    ),
    Environment.production: EnvironmentConfig(
      environment: Environment.production,
      baseUrl: 'https://api.oneapp.com',
      apiKey: 'prod_api_key',
      enableLogging: false,
    ),
  };
}
```

## 使用示例

### 基本配置管理
```dart
// 初始化配置管理器
final configManager = ConfigurationManager.instance;
await configManager.initialize(ConfigurationConfig.defaultConfig);

// 获取配置值
final appName = configManager.getValue<String>('app.name', defaultValue: 'OneApp');
final timeout = configManager.getValue<int>('network.timeout', defaultValue: 30000);
final enableAnalytics = configManager.getValue<bool>('features.enableAnalytics', defaultValue: true);

// 设置配置值
await configManager.setValue('ui.theme', 'dark');
await configManager.setValue('features.enablePush', false);

// 监听配置变化
configManager.onConfigurationChanged.listen((change) {
  print('配置变更: ${change.key} = ${change.newValue}');
});
```

### 远程配置更新
```dart
// 检查远程配置更新
final remoteConfigService = RemoteConfigService.instance;
final hasUpdate = await remoteConfigService.checkForUpdates();

if (hasUpdate) {
  // 获取远程配置
  final remoteConfig = await remoteConfigService.fetchRemoteConfig();
  
  if (remoteConfig.isSuccess) {
    // 应用远程配置
    await remoteConfigService.applyRemoteConfig(remoteConfig.data);
    print('远程配置已更新');
  }
}

// 监听远程配置更新
remoteConfigService.onRemoteConfigUpdated.listen((config) {
  print('收到远程配置更新');
  // 处理配置更新逻辑
});
```

### 环境配置切换
```dart
// 获取当前环境
final currentEnv = EnvironmentManager.instance.getCurrentEnvironment();
print('当前环境: $currentEnv');

// 切换到测试环境
await EnvironmentManager.instance.setCurrentEnvironment(Environment.testing);

// 获取环境配置
final envConfig = EnvironmentManager.instance.getEnvironmentConfig(Environment.testing);
print('测试环境配置: $envConfig');

// 验证环境配置
final isValid = await EnvironmentManager.instance.validateEnvironmentConfig(Environment.testing);
if (!isValid) {
  print('环境配置验证失败');
}
```

### 配置缓存管理
```dart
// 缓存配置
final cacheManager = LocalCacheManager.instance;
await cacheManager.cacheConfiguration('user_preferences', userPreferences);

// 获取缓存配置
final cachedPreferences = cacheManager.getCachedConfiguration<Map<String, dynamic>>('user_preferences');

// 获取缓存大小
final cacheSize = await cacheManager.getCacheSize();
print('缓存大小: ${cacheSize}KB');

// 清理缓存
if (cacheSize > 1024 * 1024) { // 超过1MB
  await cacheManager.compressCache();
}
```

## 测试策略

### 单元测试
```dart
group('ConfigurationManager Tests', () {
  test('should get and set configuration values', () async {
    // Given
    final configManager = ConfigurationManager();
    await configManager.initialize(ConfigurationConfig.defaultConfig);
    
    // When
    await configManager.setValue('test.key', 'test_value');
    final value = configManager.getValue<String>('test.key');
    
    // Then
    expect(value, 'test_value');
  });
  
  test('should return default value when key not found', () {
    // Given
    final configManager = ConfigurationManager();
    
    // When
    final value = configManager.getValue<String>('nonexistent.key', defaultValue: 'default');
    
    // Then
    expect(value, 'default');
  });
});
```

### 集成测试
```dart
group('Configuration Integration Tests', () {
  testWidgets('configuration update flow', (tester) async {
    // 1. 初始化配置
    await ConfigurationManager.instance.initialize(ConfigurationConfig.defaultConfig);
    
    // 2. 模拟远程配置更新
    final mockRemoteConfig = {'feature.newFeature': true};
    await RemoteConfigService.instance.applyRemoteConfig(mockRemoteConfig);
    
    // 3. 验证配置已更新
    final newFeatureEnabled = ConfigurationManager.instance.getValue<bool>('feature.newFeature');
    expect(newFeatureEnabled, true);
  });
});
```

## 性能优化

### 缓存策略
- **内存缓存**：热点配置内存缓存
- **磁盘缓存**：所有配置磁盘持久化
- **缓存过期**：配置缓存过期机制
- **预加载**：应用启动时预加载关键配置

### 网络优化
- **增量同步**：只同步变化的配置项
- **压缩传输**：配置数据压缩传输
- **批量操作**：批量获取和更新配置
- **连接池**：网络连接池优化

## 安全考虑

### 数据安全
- **配置加密**：敏感配置加密存储
- **传输加密**：配置传输使用HTTPS
- **签名验证**：配置数据签名验证
- **访问控制**：配置访问权限控制

### 隐私保护
- **数据最小化**：只收集必要的配置数据
- **匿名化**：用户相关配置匿名化
- **数据清理**：定期清理过期配置
- **透明度**：配置使用透明化

## 监控和诊断

### 性能监控
- **配置使用统计**：统计配置项使用频率
- **更新性能**：监控配置更新性能
- **缓存命中率**：监控缓存命中率
- **网络性能**：监控配置网络请求性能

### 故障诊断
- **配置验证**：配置数据有效性验证
- **更新失败恢复**：配置更新失败自动恢复
- **异常监控**：配置相关异常监控
- **健康检查**：配置服务健康检查

## 版本历史

### v0.2.6+8 (当前版本)
- 新增配置热更新功能
- 优化缓存性能
- 支持配置分组管理
- 修复环境切换问题

### v0.2.5
- 支持远程配置灰度发布
- 新增配置使用统计
- 优化配置同步机制
- 改进错误处理

## 依赖关系

### 内部依赖
- `clr_configuration`: 配置服务SDK
- `basic_storage`: 本地存储服务
- `basic_network`: 网络请求服务
- `basic_error`: 错误处理框架

### 外部依赖
- `shared_preferences`: 本地配置存储
- `dio`: HTTP客户端
- `encrypt`: 数据加密
- `rxdart`: 响应式编程

## 总结

`app_configuration` 作为应用配置管理的核心模块，提供了完整的配置管理解决方案。通过远程配置、本地缓存、热更新和环境切换等功能，为 OneApp 提供了灵活、可靠、高效的配置管理能力，确保应用能够快速响应业务需求变化，同时保证用户体验的一致性和稳定性。
