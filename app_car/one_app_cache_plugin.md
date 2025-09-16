# OneApp Cache Plugin 缓存插件

## 模块概述

`one_app_cache_plugin` 是 OneApp 车联网生态中的原生缓存插件，负责为 Flutter 应用提供高效的原生缓存能力。该插件通过平台通道实现 Flutter 与 Android/iOS 原生缓存系统的交互，为应用数据缓存提供底层支持。

### 基本信息
- **模块名称**: one_app_cache_plugin
- **版本**: 0.0.4
- **类型**: Flutter Plugin（原生插件）
- **Flutter 版本**: >=3.3.0
- **Dart 版本**: >=3.0.0 <4.0.0

## 功能特性

### 核心功能
1. **多级缓存系统**
   - 内存缓存（L1 Cache）
   - 磁盘缓存（L2 Cache）
   - 网络缓存（L3 Cache）
   - 分布式缓存支持

2. **缓存策略管理**
   - LRU（最近最少使用）淘汰
   - LFU（最少使用频率）淘汰
   - TTL（生存时间）过期
   - 自定义淘汰策略

3. **数据类型支持**
   - 字符串数据缓存
   - 二进制数据缓存
   - JSON对象缓存
   - 文件资源缓存

4. **性能优化**
   - 异步操作支持
   - 批量操作优化
   - 预加载机制
   - 智能压缩存储

## 技术架构

### 目录结构
```
one_app_cache_plugin/
├── lib/                        # Dart代码
│   ├── one_app_cache_plugin.dart    # 插件入口
│   ├── src/                    # 源代码
│   │   ├── cache_manager.dart       # 缓存管理器
│   │   ├── cache_strategy.dart      # 缓存策略
│   │   ├── cache_models.dart        # 数据模型
│   │   └── platform_interface.dart  # 平台接口
│   └── one_app_cache_plugin_platform_interface.dart
├── android/                    # Android原生代码
│   ├── src/main/kotlin/
│   │   └── com/oneapp/cache/
│   │       ├── OneAppCachePlugin.kt     # 主插件类
│   │       ├── MemoryCache.kt           # 内存缓存
│   │       ├── DiskCache.kt             # 磁盘缓存
│   │       ├── CacheStrategy.kt         # 缓存策略
│   │       └── CacheUtils.kt            # 缓存工具
│   └── build.gradle
├── ios/                        # iOS原生代码
│   ├── Classes/
│   │   ├── OneAppCachePlugin.swift      # 主插件类
│   │   ├── MemoryCache.swift            # 内存缓存
│   │   ├── DiskCache.swift              # 磁盘缓存
│   │   ├── CacheStrategy.swift          # 缓存策略
│   │   └── CacheUtils.swift             # 缓存工具
│   └── one_app_cache_plugin.podspec
├── example/                    # 示例应用
└── test/                       # 测试文件
```

### 依赖关系

#### 核心依赖
- `plugin_platform_interface: ^2.0.2` - 插件平台接口

## 核心模块分析

### 1. Flutter端实现

#### 插件入口 (`lib/one_app_cache_plugin.dart`)
```dart
class OneAppCachePlugin {
  static const MethodChannel _channel = MethodChannel('one_app_cache_plugin');
  
  /// 获取缓存数据
  static Future<String?> get(String key) async {
    return await _channel.invokeMethod('get', {'key': key});
  }
  
  /// 设置缓存数据
  static Future<bool> set(String key, String value, {Duration? ttl}) async {
    final result = await _channel.invokeMethod('set', {
      'key': key,
      'value': value,
      'ttl': ttl?.inMilliseconds,
    });
    return result ?? false;
  }
  
  /// 删除缓存数据
  static Future<bool> delete(String key) async {
    final result = await _channel.invokeMethod('delete', {'key': key});
    return result ?? false;
  }
  
  /// 清空所有缓存
  static Future<bool> clear() async {
    final result = await _channel.invokeMethod('clear');
    return result ?? false;
  }
  
  /// 获取缓存统计信息
  static Future<CacheStats> getStats() async {
    final result = await _channel.invokeMethod('getStats');
    return CacheStats.fromMap(result);
  }
}
```

#### 缓存管理器 (`lib/src/cache_manager.dart`)
```dart
class CacheManager {
  static final CacheManager _instance = CacheManager._internal();
  factory CacheManager() => _instance;
  CacheManager._internal();
  
  /// 配置缓存策略
  Future<void> configure(CacheConfig config) async {
    await OneAppCachePlugin.configure(config);
  }
  
  /// 智能缓存获取
  Future<T?> getOrSet<T>(
    String key,
    Future<T> Function() valueFactory, {
    Duration? ttl,
    CacheLevel level = CacheLevel.all,
  }) async {
    // 先尝试从缓存获取
    final cached = await get<T>(key, level: level);
    if (cached != null) return cached;
    
    // 缓存未命中，获取新值并缓存
    final value = await valueFactory();
    await set(key, value, ttl: ttl, level: level);
    return value;
  }
  
  /// 批量操作
  Future<Map<String, T?>> getBatch<T>(List<String> keys) async {
    return await OneAppCachePlugin.getBatch(keys);
  }
  
  /// 预热缓存
  Future<void> preload(Map<String, dynamic> data) async {
    await OneAppCachePlugin.preload(data);
  }
}
```

### 2. Android端实现

#### 主插件类 (`OneAppCachePlugin.kt`)
```kotlin
class OneAppCachePlugin: FlutterPlugin, MethodCallHandler {
    private lateinit var context: Context
    private lateinit var memoryCache: MemoryCache
    private lateinit var diskCache: DiskCache
    private lateinit var cacheStrategy: CacheStrategy
    
    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        context = binding.applicationContext
        initializeCaches()
        
        val channel = MethodChannel(binding.binaryMessenger, "one_app_cache_plugin")
        channel.setMethodCallHandler(this)
    }
    
    private fun initializeCaches() {
        memoryCache = MemoryCache(context)
        diskCache = DiskCache(context)
        cacheStrategy = CacheStrategy()
    }
    
    override fun onMethodCall(call: MethodCall, result: Result) {
        when (call.method) {
            "get" -> handleGet(call, result)
            "set" -> handleSet(call, result)
            "delete" -> handleDelete(call, result)
            "clear" -> handleClear(call, result)
            "getStats" -> handleGetStats(call, result)
            "configure" -> handleConfigure(call, result)
            else -> result.notImplemented()
        }
    }
    
    private fun handleGet(call: MethodCall, result: Result) {
        val key = call.argument<String>("key")
        if (key == null) {
            result.error("INVALID_ARGUMENT", "Key cannot be null", null)
            return
        }
        
        // 多级缓存查找
        var value = memoryCache.get(key)
        if (value == null) {
            value = diskCache.get(key)
            if (value != null) {
                // 将磁盘缓存的数据提升到内存缓存
                memoryCache.set(key, value)
            }
        }
        
        result.success(value)
    }
    
    private fun handleSet(call: MethodCall, result: Result) {
        val key = call.argument<String>("key")
        val value = call.argument<String>("value")
        val ttl = call.argument<Long>("ttl")
        
        if (key == null || value == null) {
            result.error("INVALID_ARGUMENT", "Key and value cannot be null", null)
            return
        }
        
        val success = try {
            memoryCache.set(key, value, ttl)
            diskCache.set(key, value, ttl)
            true
        } catch (e: Exception) {
            false
        }
        
        result.success(success)
    }
}
```

#### 内存缓存 (`MemoryCache.kt`)
```kotlin
class MemoryCache(private val context: Context) {
    private val cache = LruCache<String, CacheEntry>(getMaxMemoryCacheSize())
    
    fun get(key: String): String? {
        val entry = cache.get(key) ?: return null
        
        // 检查是否过期
        if (entry.isExpired()) {
            cache.remove(key)
            return null
        }
        
        return entry.value
    }
    
    fun set(key: String, value: String, ttl: Long? = null) {
        val expiryTime = ttl?.let { System.currentTimeMillis() + it }
        val entry = CacheEntry(value, expiryTime)
        cache.put(key, entry)
    }
    
    private fun getMaxMemoryCacheSize(): Int {
        val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
        return maxMemory / 8  // 使用最大内存的1/8作为缓存大小
    }
}

data class CacheEntry(
    val value: String,
    val expiryTime: Long? = null
) {
    fun isExpired(): Boolean {
        return expiryTime?.let { System.currentTimeMillis() > it } ?: false
    }
}
```

#### 磁盘缓存 (`DiskCache.kt`)
```kotlin
class DiskCache(private val context: Context) {
    private val cacheDir = File(context.cacheDir, "one_app_cache")
    private val metadataFile = File(cacheDir, "metadata.json")
    private val metadata = mutableMapOf<String, CacheMetadata>()
    
    init {
        if (!cacheDir.exists()) {
            cacheDir.mkdirs()
        }
        loadMetadata()
    }
    
    fun get(key: String): String? {
        val meta = metadata[key] ?: return null
        
        // 检查是否过期
        if (meta.isExpired()) {
            delete(key)
            return null
        }
        
        val file = File(cacheDir, meta.filename)
        return if (file.exists()) {
            try {
                file.readText()
            } catch (e: Exception) {
                null
            }
        } else null
    }
    
    fun set(key: String, value: String, ttl: Long? = null) {
        val filename = generateFilename(key)
        val file = File(cacheDir, filename)
        
        try {
            file.writeText(value)
            val expiryTime = ttl?.let { System.currentTimeMillis() + it }
            metadata[key] = CacheMetadata(filename, expiryTime, System.currentTimeMillis())
            saveMetadata()
        } catch (e: Exception) {
            // 处理写入错误
        }
    }
    
    private fun generateFilename(key: String): String {
        return key.hashCode().toString() + ".cache"
    }
}
```

### 3. iOS端实现

#### 主插件类 (`OneAppCachePlugin.swift`)
```swift
public class OneAppCachePlugin: NSObject, FlutterPlugin {
    private var memoryCache: MemoryCache!
    private var diskCache: DiskCache!
    
    public static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(name: "one_app_cache_plugin", 
                                         binaryMessenger: registrar.messenger())
        let instance = OneAppCachePlugin()
        instance.initializeCaches()
        registrar.addMethodCallDelegate(instance, channel: channel)
    }
    
    private func initializeCaches() {
        memoryCache = MemoryCache()
        diskCache = DiskCache()
    }
    
    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "get":
            handleGet(call: call, result: result)
        case "set":
            handleSet(call: call, result: result)
        case "delete":
            handleDelete(call: call, result: result)
        case "clear":
            handleClear(call: call, result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }
    
    private func handleGet(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let key = args["key"] as? String else {
            result(FlutterError(code: "INVALID_ARGUMENT", 
                               message: "Key is required", 
                               details: nil))
            return
        }
        
        // 多级缓存查找
        if let value = memoryCache.get(key: key) {
            result(value)
            return
        }
        
        if let value = diskCache.get(key: key) {
            // 提升到内存缓存
            memoryCache.set(key: key, value: value)
            result(value)
            return
        }
        
        result(nil)
    }
}
```

## 缓存策略设计

### 淘汰策略
1. **LRU (Least Recently Used)**
   - 淘汰最近最少使用的数据
   - 适用于访问模式相对稳定的场景
   - 实现简单，性能良好

2. **LFU (Least Frequently Used)**
   - 淘汰使用频率最低的数据
   - 适用于热点数据明显的场景
   - 需要维护访问频率统计

3. **TTL (Time To Live)**
   - 基于时间的自动过期
   - 适用于时效性数据
   - 可与其他策略组合使用

4. **FIFO (First In First Out)**
   - 先进先出的简单策略
   - 实现简单但效果有限
   - 适用于对缓存效果要求不高的场景

### 多级缓存架构
```
应用层
    ↓
Flutter缓存管理器
    ↓
L1: 内存缓存 (NSCache/LruCache)
    ↓
L2: 磁盘缓存 (本地文件系统)
    ↓
L3: 网络缓存 (HTTP缓存/CDN)
```

## 性能优化

### 内存优化
- **智能大小调整**: 根据可用内存动态调整缓存大小
- **内存压力监控**: 监听系统内存压力事件
- **延迟加载**: 按需加载缓存数据
- **压缩存储**: 对大数据进行压缩存储

### 磁盘优化
- **异步I/O**: 所有磁盘操作异步执行
- **批量操作**: 批量读写减少I/O次数
- **文件压缩**: 压缩存储节省空间
- **定期清理**: 定期清理过期和无效文件

### 网络优化
- **预加载**: 预测性数据预加载
- **增量更新**: 仅传输变化数据
- **并发控制**: 限制并发网络请求
- **断点续传**: 支持大文件断点续传

## 数据安全

### 加密存储
- **敏感数据加密**: 对敏感缓存数据进行加密
- **密钥管理**: 安全的密钥存储和管理
- **完整性验证**: 数据完整性校验
- **安全擦除**: 安全删除敏感数据

### 权限控制
- **访问控制**: 基于权限的缓存访问
- **沙盒隔离**: 应用间缓存数据隔离
- **审计日志**: 缓存访问审计记录
- **异常监控**: 异常访问行为监控

## 监控和诊断

### 性能指标
```dart
class CacheStats {
  final int hitCount;      // 命中次数
  final int missCount;     // 未命中次数
  final int evictionCount; // 淘汰次数
  final double hitRate;    // 命中率
  final int size;          // 当前大小
  final int maxSize;       // 最大大小
  
  double get hitRate => hitCount / (hitCount + missCount);
}
```

### 诊断工具
- **缓存命中率监控**: 实时监控缓存效果
- **内存使用分析**: 分析内存使用模式
- **性能分析器**: 分析缓存操作性能
- **调试界面**: 可视化缓存状态

## 测试策略

### 单元测试
- **缓存操作测试**: 基本CRUD操作
- **过期策略测试**: TTL和淘汰策略
- **并发安全测试**: 多线程访问安全
- **边界条件测试**: 极限情况处理

### 集成测试
- **平台集成测试**: 原生平台功能
- **性能测试**: 大数据量性能
- **稳定性测试**: 长时间运行稳定性
- **兼容性测试**: 不同设备和系统版本

### 压力测试
- **高并发测试**: 大量并发访问
- **大数据测试**: 大容量数据处理
- **内存压力测试**: 低内存环境测试
- **存储压力测试**: 存储空间不足测试

## 最佳实践

### 使用建议
1. **合理设置TTL**: 根据数据特性设置合适的过期时间
2. **选择合适策略**: 根据访问模式选择淘汰策略
3. **监控缓存效果**: 定期检查命中率和性能指标
4. **控制缓存大小**: 避免缓存过大影响性能

### 性能优化建议
1. **预加载热点数据**: 应用启动时预加载重要数据
2. **批量操作**: 尽量使用批量API减少开销
3. **异步操作**: 避免阻塞主线程
4. **合理清理**: 定期清理过期和不需要的缓存

## 总结

`one_app_cache_plugin` 作为 OneApp 的原生缓存插件，为Flutter应用提供了高效、可靠的多级缓存能力。通过智能的缓存策略、完善的性能优化和安全的数据保护，显著提升了应用的数据访问性能和用户体验。插件设计考虑了跨平台兼容性和可扩展性，能够适应不同的应用场景和性能要求。
