# CLR Configuration - 配置服务SDK

## 模块概述

`clr_configuration` 是 OneApp 配置服务的核心 SDK，为应用配置管理提供底层的 API 封装和数据处理能力。该 SDK 封装了配置服务的网络接口、数据模型、同步机制和变更通知等功能，为上层的配置管理模块提供稳定可靠的服务支撑。

## 核心功能

### 1. 配置 API 封装
- **RESTful API**：配置服务 REST API 封装
- **GraphQL API**：配置查询 GraphQL 接口
- **WebSocket API**：实时配置更新接口
- **批量操作**：配置批量读写操作

### 2. 配置数据模型
- **数据结构**：标准化的配置数据结构
- **类型系统**：强类型配置值系统
- **序列化**：配置数据序列化和反序列化
- **验证机制**：配置数据有效性验证

### 3. 配置同步机制
- **增量同步**：配置变更增量同步
- **冲突解决**：配置冲突解决策略
- **版本控制**：配置版本管理机制
- **事务支持**：配置操作事务保证

### 4. 配置变更通知
- **事件驱动**：基于事件的变更通知
- **订阅机制**：配置变更订阅管理
- **推送通知**：实时推送配置变更
- **回调处理**：配置变更回调处理

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│          配置管理应用层              │
│      (app_configuration)           │
├─────────────────────────────────────┤
│         CLR Configuration           │
│  ┌──────────┬──────────┬──────────┐ │
│  │ API封装  │ 数据模型 │ 同步引擎 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 事件系统 │ 缓存层   │ 安全模块 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           网络通信层                │
│    (HTTP/WebSocket/GraphQL)         │
├─────────────────────────────────────┤
│           配置服务后端              │
│        (Configuration Server)       │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. API 客户端 (ApiClient)
```dart
class ConfigurationApiClient {
  // 获取配置
  Future<ApiResponse<ConfigData>> getConfiguration(GetConfigRequest request);
  
  // 设置配置
  Future<ApiResponse<bool>> setConfiguration(SetConfigRequest request);
  
  // 批量获取配置
  Future<ApiResponse<Map<String, ConfigData>>> getBatchConfiguration(BatchGetRequest request);
  
  // 订阅配置变更
  Stream<ConfigurationChange> subscribeConfigurationChanges(String key);
}
```

#### 2. 数据模型管理器 (DataModelManager)
```dart
class ConfigurationDataModel {
  // 序列化配置数据
  Map<String, dynamic> serialize(ConfigData data);
  
  // 反序列化配置数据
  ConfigData deserialize(Map<String, dynamic> json);
  
  // 验证配置数据
  ValidationResult validate(ConfigData data);
  
  // 转换配置数据类型
  T convertValue<T>(dynamic value, ConfigType targetType);
}
```

#### 3. 同步引擎 (SyncEngine)
```dart
class ConfigurationSyncEngine {
  // 开始同步
  Future<SyncResult> startSync(SyncOptions options);
  
  // 增量同步
  Future<SyncResult> incrementalSync(String lastSyncVersion);
  
  // 解决冲突
  Future<ConflictResolution> resolveConflict(ConfigurationConflict conflict);
  
  // 回滚配置
  Future<bool> rollbackConfiguration(String version);
}
```

#### 4. 事件系统 (EventSystem)
```dart
class ConfigurationEventSystem {
  // 发布事件
  void publishEvent(ConfigurationEvent event);
  
  // 订阅事件
  StreamSubscription<T> subscribe<T extends ConfigurationEvent>(EventHandler<T> handler);
  
  // 取消订阅
  void unsubscribe(StreamSubscription subscription);
  
  // 清理事件
  void clearEvents([String? eventType]);
}
```

## 数据模型

### 配置数据模型
```dart
class ConfigData {
  final String key;
  final dynamic value;
  final ConfigType type;
  final String version;
  final DateTime timestamp;
  final Map<String, String> metadata;
  final List<String> tags;
  final ConfigScope scope;
  final bool isEncrypted;
  final String? description;
}

enum ConfigType {
  string,
  integer,
  double,
  boolean,
  json,
  array,
  binary
}

enum ConfigScope {
  global,
  user,
  device,
  session
}
```

### 配置变更模型
```dart
class ConfigurationChange {
  final String key;
  final dynamic oldValue;
  final dynamic newValue;
  final ChangeType changeType;
  final String version;
  final DateTime timestamp;
  final String? userId;
  final String? source;
  final Map<String, dynamic> context;
}

enum ChangeType {
  created,
  updated,
  deleted,
  restored
}
```

### API 请求模型
```dart
class GetConfigRequest {
  final String key;
  final ConfigScope? scope;
  final String? version;
  final bool includeMetadata;
  final List<String>? tags;
}

class SetConfigRequest {
  final String key;
  final dynamic value;
  final ConfigType type;
  final ConfigScope scope;
  final Map<String, String>? metadata;
  final List<String>? tags;
  final bool encrypt;
}
```

## API 接口

### 配置操作接口
```dart
abstract class ConfigurationApi {
  // 获取单个配置
  Future<ApiResponse<ConfigData>> getConfig(String key, {ConfigScope? scope});
  
  // 设置单个配置
  Future<ApiResponse<bool>> setConfig(String key, dynamic value, {ConfigType? type, ConfigScope? scope});
  
  // 删除配置
  Future<ApiResponse<bool>> deleteConfig(String key, {ConfigScope? scope});
  
  // 检查配置是否存在
  Future<ApiResponse<bool>> hasConfig(String key, {ConfigScope? scope});
}
```

### 批量操作接口
```dart
abstract class BatchConfigurationApi {
  // 批量获取配置
  Future<ApiResponse<Map<String, ConfigData>>> getBatchConfigs(List<String> keys);
  
  // 批量设置配置
  Future<ApiResponse<BatchResult>> setBatchConfigs(Map<String, dynamic> configs);
  
  // 批量删除配置
  Future<ApiResponse<BatchResult>> deleteBatchConfigs(List<String> keys);
}
```

### 同步接口
```dart
abstract class ConfigurationSyncApi {
  // 获取配置版本
  Future<ApiResponse<ConfigVersion>> getConfigVersion();
  
  // 同步配置
  Future<ApiResponse<SyncResult>> syncConfigurations(SyncRequest request);
  
  // 获取配置变更历史
  Future<ApiResponse<List<ConfigurationChange>>> getChangeHistory(ChangeHistoryRequest request);
}
```

## 配置管理

### SDK 配置
```dart
class ConfigurationSdkConfig {
  final String serverUrl;
  final String apiKey;
  final String clientId;
  final Duration timeout;
  final int maxRetries;
  final bool enableCache;
  final bool enableEncryption;
  final LogLevel logLevel;
  
  static const ConfigurationSdkConfig defaultConfig = ConfigurationSdkConfig(
    serverUrl: 'https://config-api.oneapp.com',
    timeout: Duration(seconds: 30),
    maxRetries: 3,
    enableCache: true,
    enableEncryption: true,
    logLevel: LogLevel.info,
  );
}
```

### 缓存配置
```dart
class CacheConfig {
  final Duration ttl;
  final int maxSize;
  final bool enableCompression;
  final CacheEvictionPolicy evictionPolicy;
  
  static const CacheConfig defaultCacheConfig = CacheConfig(
    ttl: Duration(minutes: 30),
    maxSize: 1000,
    enableCompression: true,
    evictionPolicy: CacheEvictionPolicy.lru,
  );
}
```

## 使用示例

### 基本配置操作
```dart
// 初始化 SDK
final configSdk = ConfigurationSdk.instance;
await configSdk.initialize(ConfigurationSdkConfig.defaultConfig);

// 获取配置
try {
  final config = await configSdk.getConfig('app.theme');
  print('当前主题: ${config.value}');
} catch (e) {
  print('获取配置失败: $e');
}

// 设置配置
await configSdk.setConfig(
  'user.language', 
  'zh-CN',
  type: ConfigType.string,
  scope: ConfigScope.user,
);

// 删除配置
await configSdk.deleteConfig('temp.data');
```

### 批量配置操作
```dart
// 批量获取配置
final keys = ['app.theme', 'app.language', 'app.version'];
final batchResult = await configSdk.getBatchConfigs(keys);

for (final entry in batchResult.entries) {
  print('${entry.key}: ${entry.value.value}');
}

// 批量设置配置
final batchConfigs = {
  'ui.showTips': true,
  'ui.animationSpeed': 1.0,
  'ui.darkMode': false,
};

await configSdk.setBatchConfigs(batchConfigs);
```

### 配置变更监听
```dart
// 监听特定配置变更
configSdk.subscribeConfigurationChanges('app.theme').listen((change) {
  print('主题配置变更: ${change.oldValue} -> ${change.newValue}');
  // 应用新的主题配置
  applyThemeConfig(change.newValue);
});

// 监听所有配置变更
configSdk.onConfigurationChanged.listen((change) {
  print('配置变更: ${change.key}');
  logConfigurationChange(change);
});
```

### 配置同步
```dart
// 检查是否有配置更新
final currentVersion = await configSdk.getConfigVersion();
final hasUpdate = await configSdk.checkForUpdates(currentVersion.version);

if (hasUpdate) {
  // 执行增量同步
  final syncResult = await configSdk.incrementalSync(currentVersion.version);
  
  if (syncResult.isSuccess) {
    print('配置同步成功，更新了 ${syncResult.updatedCount} 个配置');
  } else {
    print('配置同步失败: ${syncResult.error}');
  }
}
```

## 测试策略

### 单元测试
```dart
group('ConfigurationSdk Tests', () {
  test('should get configuration successfully', () async {
    // Given
    final sdk = ConfigurationSdk();
    await sdk.initialize(ConfigurationSdkConfig.defaultConfig);
    
    // When
    final result = await sdk.getConfig('test.key');
    
    // Then
    expect(result.key, 'test.key');
    expect(result.value, isNotNull);
  });
  
  test('should handle configuration not found', () async {
    // Given
    final sdk = ConfigurationSdk();
    
    // When & Then
    expect(
      () => sdk.getConfig('nonexistent.key'),
      throwsA(isA<ConfigurationNotFoundException>()),
    );
  });
});
```

### 集成测试
```dart
group('Configuration Integration Tests', () {
  testWidgets('configuration sync flow', (tester) async {
    // 1. 初始化 SDK
    await ConfigurationSdk.instance.initialize(testConfig);
    
    // 2. 设置配置
    await ConfigurationSdk.instance.setConfig('test.sync', 'value1');
    
    // 3. 模拟远程配置变更
    await simulateRemoteConfigChange('test.sync', 'value2');
    
    // 4. 执行同步
    final syncResult = await ConfigurationSdk.instance.sync();
    
    // 5. 验证同步结果
    expect(syncResult.isSuccess, true);
    
    final updatedConfig = await ConfigurationSdk.instance.getConfig('test.sync');
    expect(updatedConfig.value, 'value2');
  });
});
```

## 性能优化

### 缓存策略
- **多级缓存**：内存 + 磁盘多级缓存
- **智能预加载**：预测性配置预加载
- **缓存压缩**：配置数据压缩存储
- **缓存更新**：增量缓存更新机制

### 网络优化
- **连接复用**：HTTP 连接池复用
- **请求合并**：相关配置请求合并
- **数据压缩**：传输数据 gzip 压缩
- **离线模式**：离线配置访问支持

## 错误处理

### 错误类型
```dart
abstract class ConfigurationException implements Exception {
  final String message;
  final String? errorCode;
  final Map<String, dynamic>? details;
  
  const ConfigurationException(this.message, [this.errorCode, this.details]);
}

class ConfigurationNotFoundException extends ConfigurationException {
  const ConfigurationNotFoundException(String key) 
      : super('Configuration not found: $key', 'CONFIG_NOT_FOUND');
}

class ConfigurationValidationException extends ConfigurationException {
  const ConfigurationValidationException(String message, Map<String, dynamic> details)
      : super(message, 'VALIDATION_ERROR', details);
}

class ConfigurationSyncException extends ConfigurationException {
  const ConfigurationSyncException(String message)
      : super(message, 'SYNC_ERROR');
}
```

### 重试机制
```dart
class RetryConfig {
  final int maxRetries;
  final Duration initialDelay;
  final double backoffMultiplier;
  final Duration maxDelay;
  
  static const RetryConfig defaultRetryConfig = RetryConfig(
    maxRetries: 3,
    initialDelay: Duration(seconds: 1),
    backoffMultiplier: 2.0,
    maxDelay: Duration(seconds: 30),
  );
}
```

## 安全机制

### 数据加密
```dart
class ConfigurationEncryption {
  // 加密配置值
  String encryptValue(String value, String key);
  
  // 解密配置值
  String decryptValue(String encryptedValue, String key);
  
  // 生成加密密钥
  String generateEncryptionKey();
  
  // 验证数据完整性
  bool verifyIntegrity(String data, String signature);
}
```

### 访问控制
```dart
class ConfigurationAccessControl {
  // 检查读权限
  bool hasReadPermission(String key, String userId);
  
  // 检查写权限
  bool hasWritePermission(String key, String userId);
  
  // 检查删除权限
  bool hasDeletePermission(String key, String userId);
  
  // 获取用户权限
  List<Permission> getUserPermissions(String userId);
}
```

## 监控和诊断

### 性能监控
- **API 响应时间**：配置 API 响应时间监控
- **缓存命中率**：配置缓存命中率统计
- **错误率**：配置操作错误率监控
- **同步性能**：配置同步性能指标

### 使用统计
- **配置访问频率**：统计配置项访问频率
- **热点配置**：识别热点配置项
- **用户行为**：分析用户配置使用模式
- **性能瓶颈**：识别性能瓶颈点

## 版本历史

### v0.2.8+5 (当前版本)
- 新增 GraphQL 查询支持
- 优化配置同步性能
- 支持配置数据压缩
- 修复并发访问问题

### v0.2.7
- 支持配置数据加密
- 新增批量操作接口
- 优化缓存机制
- 改进错误处理

## 依赖关系

### 内部依赖
- `basic_network`: 网络请求基础库
- `basic_storage`: 本地存储服务
- `basic_error`: 错误处理框架
- `basic_logger`: 日志记录服务

### 外部依赖
- `dio`: HTTP 客户端
- `json_annotation`: JSON 序列化
- `encrypt`: 数据加密库
- `rxdart`: 响应式编程支持

## 总结

`clr_configuration` 作为配置服务的核心 SDK，为 OneApp 的配置管理提供了强大的底层支撑。通过标准化的 API 接口、完善的数据模型、可靠的同步机制和实时的变更通知，该 SDK 确保了配置服务的高性能、高可用和高安全性，为上层应用提供了稳定可靠的配置管理能力。
