# Basic Config - 配置管理模块文档

## 模块概述

`basic_config` 是 OneApp 基础工具模块群中的配置管理核心模块，提供统一的应用配置管理、环境切换、远程配置下发、配置缓存等功能。该模块支持多环境配置、动态配置更新、配置版本管理等特性，为整个应用提供灵活的配置管理能力。

### 基本信息
- **模块名称**: basic_config
- **版本**: 0.2.2
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-basic-config
- **Flutter 版本**: >=2.5.0
- **Dart 版本**: >=2.16.2 <4.0.0

## 目录结构

```
basic_config/
├── lib/
│   ├── basic_config.dart         # 主导出文件
│   └── src/                      # 源代码目录
│       ├── config/               # 配置核心实现
│       ├── providers/            # 配置提供者
│       ├── models/               # 数据模型
│       ├── storage/              # 配置存储
│       ├── parsers/              # 配置解析器
│       └── utils/                # 工具类
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 配置管理器核心

#### 配置管理器实现
```dart
// 配置管理器核心类
class BasicConfigManager {
  static BasicConfigManager? _instance;
  static BasicConfigManager get instance => _instance ??= BasicConfigManager._internal();
  
  BasicConfigManager._internal();
  
  final Map<String, ConfigProvider> _providers = {};
  final ConfigStorage _storage = ConfigStorage();
  final ConfigCache _cache = ConfigCache();
  Environment _currentEnvironment = Environment.production;
  
  // 初始化配置管理器
  Future<void> initialize({
    required Environment environment,
    List<ConfigProvider>? providers,
    Map<String, dynamic>? defaultConfigs,
  }) async {
    _currentEnvironment = environment;
    
    // 初始化存储
    await _storage.initialize();
    
    // 注册默认配置提供者
    _providers['local'] = LocalConfigProvider();
    _providers['remote'] = RemoteConfigProvider();
    _providers['asset'] = AssetConfigProvider();
    
    // 注册自定义配置提供者
    if (providers != null) {
      for (final provider in providers) {
        _providers[provider.name] = provider;
        await provider.initialize();
      }
    }
    
    // 加载默认配置
    if (defaultConfigs != null) {
      await _loadDefaultConfigs(defaultConfigs);
    }
    
    // 从存储中加载配置
    await _loadConfigsFromStorage();
    
    // 从远程加载配置
    await _loadRemoteConfigs();
  }
  
  // 获取配置值
  T? get<T>(String key, {T? defaultValue}) {
    // 首先从缓存中获取
    final cachedValue = _cache.get<T>(key);
    if (cachedValue != null) {
      return cachedValue;
    }
    
    // 按优先级从配置提供者获取
    final providers = _getProvidersInPriority();
    for (final provider in providers) {
      final value = provider.get<T>(key);
      if (value != null) {
        _cache.set(key, value);
        return value;
      }
    }
    
    return defaultValue;
  }
  
  // 设置配置值
  Future<void> set<T>(String key, T value, {bool persistent = true}) async {
    // 更新缓存
    _cache.set(key, value);
    
    // 持久化存储
    if (persistent) {
      await _storage.set(key, value);
    }
    
    // 通知配置变更
    _notifyConfigChanged(key, value);
  }
  
  // 批量更新配置
  Future<void> updateConfigs(Map<String, dynamic> configs, {bool persistent = true}) async {
    for (final entry in configs.entries) {
      await set(entry.key, entry.value, persistent: persistent);
    }
  }
  
  // 刷新远程配置
  Future<void> refreshRemoteConfigs() async {
    final remoteProvider = _providers['remote'] as RemoteConfigProvider?;
    if (remoteProvider != null) {
      await remoteProvider.refresh();
      _cache.clear(); // 清除缓存以使用新配置
    }
  }
  
  // 获取环境特定的配置
  T? getEnvironmentConfig<T>(String key, {T? defaultValue}) {
    final envKey = '${_currentEnvironment.name}.$key';
    return get<T>(envKey, defaultValue: get<T>(key, defaultValue: defaultValue));
  }
  
  // 监听配置变更
  Stream<ConfigChangeEvent> get configChanges => _configChangesController.stream;
  final StreamController<ConfigChangeEvent> _configChangesController = 
      StreamController.broadcast();
  
  void _notifyConfigChanged(String key, dynamic value) {
    _configChangesController.add(ConfigChangeEvent(key, value));
  }
  
  List<ConfigProvider> _getProvidersInPriority() {
    return [
      _providers['remote']!,
      _providers['local']!,
      _providers['asset']!,
    ];
  }
}

// 环境枚举
enum Environment {
  development,
  testing,
  staging,
  production;
  
  String get name {
    switch (this) {
      case Environment.development:
        return 'dev';
      case Environment.testing:
        return 'test';
      case Environment.staging:
        return 'staging';
      case Environment.production:
        return 'prod';
    }
  }
}

// 配置变更事件
class ConfigChangeEvent {
  final String key;
  final dynamic value;
  final DateTime timestamp;
  
  ConfigChangeEvent(this.key, this.value) : timestamp = DateTime.now();
}
```

### 2. 配置提供者

#### 远程配置提供者
```dart
// 远程配置提供者
class RemoteConfigProvider implements ConfigProvider {
  final NetworkService _networkService;
  final ConfigStorage _storage;
  final Duration _refreshInterval;
  Timer? _refreshTimer;
  Map<String, dynamic> _configs = {};
  
  RemoteConfigProvider({
    required NetworkService networkService,
    required ConfigStorage storage,
    Duration refreshInterval = const Duration(hours: 1),
  }) : _networkService = networkService,
       _storage = storage,
       _refreshInterval = refreshInterval;
  
  @override
  String get name => 'remote';
  
  @override
  Future<void> initialize() async {
    // 从本地存储加载缓存的远程配置
    _configs = await _storage.getAll('remote_config') ?? {};
    
    // 启动定时刷新
    _startPeriodicRefresh();
    
    // 立即执行一次刷新
    await refresh();
  }
  
  @override
  T? get<T>(String key) {
    final value = _configs[key];
    if (value == null) return null;
    
    try {
      return value as T;
    } catch (e) {
      return null;
    }
  }
  
  @override
  Future<void> set<T>(String key, T value) async {
    _configs[key] = value;
    await _storage.set('remote_config.$key', value);
  }
  
  // 刷新远程配置
  Future<void> refresh() async {
    try {
      final response = await _networkService.get(
        path: '/api/v1/configs',
        queryParameters: {
          'app_version': await _getAppVersion(),
          'platform': Platform.isAndroid ? 'android' : 'ios',
          'environment': BasicConfigManager.instance._currentEnvironment.name,
        },
      );
      
      response.fold(
        (failure) {
          BasicLogger.instance.warning('Failed to fetch remote configs: ${failure.message}');
        },
        (data) async {
          final remoteConfigs = data['configs'] as Map<String, dynamic>? ?? {};
          
          // 检查配置版本
          final remoteVersion = data['version'] as String?;
          final localVersion = await _storage.get('remote_config_version');
          
          if (remoteVersion != null && remoteVersion != localVersion) {
            // 更新配置
            _configs = remoteConfigs;
            await _storage.setAll('remote_config', _configs);
            await _storage.set('remote_config_version', remoteVersion);
            
            BasicLogger.instance.info('Remote configs updated to version: $remoteVersion');
          }
        },
      );
    } catch (e) {
      BasicLogger.instance.error('Error refreshing remote configs', error: e);
    }
  }
  
  void _startPeriodicRefresh() {
    _refreshTimer = Timer.periodic(_refreshInterval, (_) => refresh());
  }
  
  @override
  Future<void> dispose() async {
    _refreshTimer?.cancel();
  }
}
```

#### 本地配置提供者
```dart
// 本地配置提供者
class LocalConfigProvider implements ConfigProvider {
  final ConfigStorage _storage;
  Map<String, dynamic> _configs = {};
  
  LocalConfigProvider({required ConfigStorage storage}) : _storage = storage;
  
  @override
  String get name => 'local';
  
  @override
  Future<void> initialize() async {
    _configs = await _storage.getAll('local_config') ?? {};
  }
  
  @override
  T? get<T>(String key) {
    final value = _configs[key];
    if (value == null) return null;
    
    try {
      return value as T;
    } catch (e) {
      return null;
    }
  }
  
  @override
  Future<void> set<T>(String key, T value) async {
    _configs[key] = value;
    await _storage.set('local_config.$key', value);
  }
  
  @override
  Future<void> dispose() async {
    // 本地配置无需清理
  }
}
```

#### 资产配置提供者
```dart
// 资产配置提供者
class AssetConfigProvider implements ConfigProvider {
  Map<String, dynamic> _configs = {};
  
  @override
  String get name => 'asset';
  
  @override
  Future<void> initialize() async {
    await _loadAssetConfigs();
  }
  
  Future<void> _loadAssetConfigs() async {
    try {
      // 加载默认配置文件
      final defaultConfigJson = await rootBundle.loadString('assets/config/default.json');
      final defaultConfig = jsonDecode(defaultConfigJson) as Map<String, dynamic>;
      
      // 加载环境特定配置
      final environment = BasicConfigManager.instance._currentEnvironment.name;
      try {
        final envConfigJson = await rootBundle.loadString('assets/config/$environment.json');
        final envConfig = jsonDecode(envConfigJson) as Map<String, dynamic>;
        
        // 合并配置
        _configs = {...defaultConfig, ...envConfig};
      } catch (e) {
        // 环境特定配置文件不存在，使用默认配置
        _configs = defaultConfig;
      }
    } catch (e) {
      BasicLogger.instance.error('Failed to load asset configs', error: e);
      _configs = {};
    }
  }
  
  @override
  T? get<T>(String key) {
    return _getNestedValue<T>(_configs, key);
  }
  
  @override
  Future<void> set<T>(String key, T value) async {
    // 资产配置是只读的
    throw UnsupportedError('Asset configs are read-only');
  }
  
  // 获取嵌套配置值
  T? _getNestedValue<T>(Map<String, dynamic> map, String key) {
    final keys = key.split('.');
    dynamic current = map;
    
    for (final k in keys) {
      if (current is Map<String, dynamic> && current.containsKey(k)) {
        current = current[k];
      } else {
        return null;
      }
    }
    
    try {
      return current as T;
    } catch (e) {
      return null;
    }
  }
  
  @override
  Future<void> dispose() async {
    // 资产配置无需清理
  }
}
```

### 3. 配置存储

#### 配置存储实现
```dart
// 配置存储实现
class ConfigStorage {
  final BasicStorage _storage = BasicStorage.instance;
  static const String _configPrefix = 'config_';
  
  Future<void> initialize() async {
    await _storage.initialize();
  }
  
  // 设置配置值
  Future<void> set<T>(String key, T value) async {
    final storageKey = '$_configPrefix$key';
    
    if (value is String) {
      await _storage.setString(storageKey, value);
    } else if (value is int) {
      await _storage.setInt(storageKey, value);
    } else if (value is double) {
      await _storage.setDouble(storageKey, value);
    } else if (value is bool) {
      await _storage.setBool(storageKey, value);
    } else {
      // 复杂对象序列化为 JSON
      final jsonValue = jsonEncode(value);
      await _storage.setString(storageKey, jsonValue);
    }
  }
  
  // 获取配置值
  Future<T?> get<T>(String key) async {
    final storageKey = '$_configPrefix$key';
    
    if (T == String) {
      return await _storage.getString(storageKey) as T?;
    } else if (T == int) {
      return await _storage.getInt(storageKey) as T?;
    } else if (T == double) {
      return await _storage.getDouble(storageKey) as T?;
    } else if (T == bool) {
      return await _storage.getBool(storageKey) as T?;
    } else {
      // 复杂对象从 JSON 反序列化
      final jsonValue = await _storage.getString(storageKey);
      if (jsonValue != null) {
        try {
          return jsonDecode(jsonValue) as T;
        } catch (e) {
          return null;
        }
      }
      return null;
    }
  }
  
  // 批量设置配置
  Future<void> setAll(String namespace, Map<String, dynamic> configs) async {
    for (final entry in configs.entries) {
      await set('$namespace.${entry.key}', entry.value);
    }
  }
  
  // 批量获取配置
  Future<Map<String, dynamic>?> getAll(String namespace) async {
    final configs = <String, dynamic>{};
    final keys = await _storage.getKeys();
    final namespacePrefix = '$_configPrefix$namespace.';
    
    for (final key in keys) {
      if (key.startsWith(namespacePrefix)) {
        final configKey = key.substring(namespacePrefix.length);
        final value = await _storage.getString(key);
        if (value != null) {
          try {
            configs[configKey] = jsonDecode(value);
          } catch (e) {
            configs[configKey] = value;
          }
        }
      }
    }
    
    return configs.isNotEmpty ? configs : null;
  }
  
  // 删除配置
  Future<void> remove(String key) async {
    final storageKey = '$_configPrefix$key';
    await _storage.remove(storageKey);
  }
  
  // 清除所有配置
  Future<void> clear() async {
    final keys = await _storage.getKeys();
    for (final key in keys) {
      if (key.startsWith(_configPrefix)) {
        await _storage.remove(key);
      }
    }
  }
}
```

### 4. 配置缓存

#### 内存缓存实现
```dart
// 配置缓存实现
class ConfigCache {
  final Map<String, CacheItem> _cache = {};
  final Duration _defaultTtl;
  Timer? _cleanupTimer;
  
  ConfigCache({
    Duration defaultTtl = const Duration(minutes: 30),
  }) : _defaultTtl = defaultTtl {
    _startCleanupTimer();
  }
  
  // 设置缓存
  void set<T>(String key, T value, {Duration? ttl}) {
    final expiry = DateTime.now().add(ttl ?? _defaultTtl);
    _cache[key] = CacheItem(value, expiry);
  }
  
  // 获取缓存
  T? get<T>(String key) {
    final item = _cache[key];
    if (item == null) return null;
    
    if (item.isExpired) {
      _cache.remove(key);
      return null;
    }
    
    try {
      return item.value as T;
    } catch (e) {
      return null;
    }
  }
  
  // 清除缓存
  void clear() {
    _cache.clear();
  }
  
  // 清除过期缓存
  void clearExpired() {
    final now = DateTime.now();
    _cache.removeWhere((key, item) => item.expiry.isBefore(now));
  }
  
  void _startCleanupTimer() {
    _cleanupTimer = Timer.periodic(Duration(minutes: 5), (_) {
      clearExpired();
    });
  }
  
  void dispose() {
    _cleanupTimer?.cancel();
    _cache.clear();
  }
}

// 缓存项
class CacheItem {
  final dynamic value;
  final DateTime expiry;
  
  CacheItem(this.value, this.expiry);
  
  bool get isExpired => DateTime.now().isAfter(expiry);
}
```

### 5. 配置模型

#### 配置接口和模型
```dart
// 配置提供者接口
abstract class ConfigProvider {
  String get name;
  
  Future<void> initialize();
  T? get<T>(String key);
  Future<void> set<T>(String key, T value);
  Future<void> dispose();
}

// 应用配置模型
class AppConfig {
  final String apiBaseUrl;
  final String environment;
  final bool debugMode;
  final int requestTimeout;
  final int maxRetries;
  final Map<String, dynamic> features;
  final ThemeConfig theme;
  final SecurityConfig security;
  
  const AppConfig({
    required this.apiBaseUrl,
    required this.environment,
    required this.debugMode,
    required this.requestTimeout,
    required this.maxRetries,
    required this.features,
    required this.theme,
    required this.security,
  });
  
  factory AppConfig.fromJson(Map<String, dynamic> json) {
    return AppConfig(
      apiBaseUrl: json['api_base_url'] ?? '',
      environment: json['environment'] ?? 'production',
      debugMode: json['debug_mode'] ?? false,
      requestTimeout: json['request_timeout'] ?? 30000,
      maxRetries: json['max_retries'] ?? 3,
      features: json['features'] ?? {},
      theme: ThemeConfig.fromJson(json['theme'] ?? {}),
      security: SecurityConfig.fromJson(json['security'] ?? {}),
    );
  }
}

// 主题配置模型
class ThemeConfig {
  final String primaryColor;
  final String accentColor;
  final String fontFamily;
  final double fontSize;
  final bool darkMode;
  
  const ThemeConfig({
    required this.primaryColor,
    required this.accentColor,
    required this.fontFamily,
    required this.fontSize,
    required this.darkMode,
  });
  
  factory ThemeConfig.fromJson(Map<String, dynamic> json) {
    return ThemeConfig(
      primaryColor: json['primary_color'] ?? '#007AFF',
      accentColor: json['accent_color'] ?? '#FF3B30',
      fontFamily: json['font_family'] ?? 'system',
      fontSize: (json['font_size'] ?? 16.0).toDouble(),
      darkMode: json['dark_mode'] ?? false,
    );
  }
}

// 安全配置模型
class SecurityConfig {
  final bool enableEncryption;
  final bool enableCertificatePinning;
  final List<String> trustedCertificates;
  final int sessionTimeout;
  final bool enableBiometric;
  
  const SecurityConfig({
    required this.enableEncryption,
    required this.enableCertificatePinning,
    required this.trustedCertificates,
    required this.sessionTimeout,
    required this.enableBiometric,
  });
  
  factory SecurityConfig.fromJson(Map<String, dynamic> json) {
    return SecurityConfig(
      enableEncryption: json['enable_encryption'] ?? true,
      enableCertificatePinning: json['enable_certificate_pinning'] ?? false,
      trustedCertificates: List<String>.from(json['trusted_certificates'] ?? []),
      sessionTimeout: json['session_timeout'] ?? 1800,
      enableBiometric: json['enable_biometric'] ?? false,
    );
  }
}
```

## 使用示例

### 基本配置管理
```dart
// 初始化配置管理器
await BasicConfigManager.instance.initialize(
  environment: Environment.production,
  defaultConfigs: {
    'api_base_url': 'https://api.oneapp.com',
    'debug_mode': false,
    'request_timeout': 30000,
  },
);

// 获取配置值
final apiUrl = BasicConfigManager.instance.get<String>('api_base_url');
final debugMode = BasicConfigManager.instance.get<bool>('debug_mode', defaultValue: false);
final timeout = BasicConfigManager.instance.get<int>('request_timeout', defaultValue: 30000);

// 设置配置值
await BasicConfigManager.instance.set('user_preference', 'dark_mode');

// 获取环境特定配置
final devApiUrl = BasicConfigManager.instance.getEnvironmentConfig<String>('api_base_url');

// 监听配置变更
BasicConfigManager.instance.configChanges.listen((event) {
  print('Config changed: ${event.key} = ${event.value}');
});
```

### ���级配置使用
```dart
// 加载应用配置
class AppConfigService {
  static AppConfig? _appConfig;
  
  static Future<void> initialize() async {
    final configJson = BasicConfigManager.instance.get<Map<String, dynamic>>('app_config');
    if (configJson != null) {
      _appConfig = AppConfig.fromJson(configJson);
    }
  }
  
  static AppConfig get config => _appConfig ?? _getDefaultConfig();
  
  static AppConfig _getDefaultConfig() {
    return AppConfig(
      apiBaseUrl: 'https://api.oneapp.com',
      environment: 'production',
      debugMode: false,
      requestTimeout: 30000,
      maxRetries: 3,
      features: {},
      theme: ThemeConfig.fromJson({}),
      security: SecurityConfig.fromJson({}),
    );
  }
}

// 特性开关管理
class FeatureToggle {
  static bool isEnabled(String feature) {
    final features = BasicConfigManager.instance.get<Map<String, dynamic>>('features') ?? {};
    return features[feature] == true;
  }
  
  static Future<void> enableFeature(String feature) async {
    final features = BasicConfigManager.instance.get<Map<String, dynamic>>('features') ?? {};
    features[feature] = true;
    await BasicConfigManager.instance.set('features', features);
  }
}
```

## 依赖管理

### 核心依赖
- **flutter**: Flutter SDK
- **basic_modular**: 模块化框架
- **basic_network**: 网络请求服务
- **basic_storage**: 本地存储服务

### 工具依赖
- **json_annotation**: JSON 序列化注解
- **dartz**: 函数式编程支持
- **path_provider**: 文件路径管理

### 开发依赖
- **flutter_test**: 测试框架

## 配置文件结构

### 默认配置文件 (assets/config/default.json)
```json
{
  "api_base_url": "https://api.oneapp.com",
  "request_timeout": 30000,
  "max_retries": 3,
  "debug_mode": false,
  "features": {
    "dark_mode": true,
    "biometric_auth": false,
    "offline_mode": true
  },
  "theme": {
    "primary_color": "#007AFF",
    "accent_color": "#FF3B30",
    "font_family": "system",
    "font_size": 16.0
  },
  "security": {
    "enable_encryption": true,
    "session_timeout": 1800,
    "enable_biometric": false
  }
}
```

### 开发环境配置 (assets/config/dev.json)
```json
{
  "api_base_url": "https://dev-api.oneapp.com",
  "debug_mode": true,
  "features": {
    "debug_tools": true,
    "mock_data": true
  }
}
```

## 性能优化

### 配置缓存策略
- 内存缓存常用配置
- 设置合理的 TTL
- 定期清理过期缓存

### 网络优化
- 批量获取远程配置
- 增量更新配置
- 配置版本管理

### 存储优化
- 压缩大型配置数据
- 异步读写操作
- 分类存储配置

## 总结

`basic_config` 模块为 OneApp 提供了强大而灵活的配置管理能力，支持多环境配置、远程配置下发、配置缓存等特性。通过统一的配置管理接口，简化了应用配置的使用和维护，提高了开发效率和运维灵活性。
