# Basic Logger - 日志系统模块文档

## 模块概述

`basic_logger` 是 OneApp 基础工具模块群中的日志系统核心模块，提供统一的日志记录、管理和分析功能。该模块支持多级别日志、文件存储、网络上传、事件打点等功能，并提供了 Android 和 iOS 的原生日志监控能力。

### 基本信息
- **模块名称**: basic_logger
- **模块路径**: oneapp_basic_utils/basic_logger
- **类型**: Flutter Plugin Module
- **主要功能**: 日志记录、事件打点、文件上传、原生日志监控

### 核心特性
- **多级别日志**: 支持debug、info、warn、error四个级别
- **业务标签**: 预定义车联网、账户、充电等业务场景标签
- **文件记录**: 支持日志文件记录和轮转机制
- **网络上传**: 支持日志文件网络上传功能
- **事件打点**: 专门的事件日志记录能力
- **原生监控**: Android/iOS原生日志监控和采集
- **性能优化**: 支持日志级别过滤和调试开关

## 目录结构

```
basic_logger/
├── lib/
│   ├── basic_logger.dart           # 模块入口文件
│   ├── logcat_monitor.dart         # 原生日志监控
│   ├── kit_logger_ios.dart         # iOS特定实现
│   └── src/                        # 源代码目录
│       ├── event_log/              # 事件日志
│       │   └── one_event_log.dart
│       ├── function/               # 核心功能
│       │   └── one_app_log.dart    # 主日志类
│       ├── model/                  # 数据模型
│       │   ├── upload_config.dart
│       │   └── upload_file_info.dart
│       ├── record/                 # 记录功能
│       │   ├── core.dart
│       │   ├── record_delegate.dart
│       │   └── impl_dart/
│       │       ├── dart_record.dart
│       │       └── dart_file_record_.dart
│       └── upload/                 # 上传功能
│           ├── core.dart
│           └── upload_handler.dart
├── android/                        # Android原生实现
├── ios/                           # iOS原生实现
└── pubspec.yaml                   # 依赖配置
```

## 核心架构组件

### 1. 日志级别枚举 (Level)

定义应用日志的级别：

```dart
/// Log Level
enum Level {
  /// none - 无日志
  none,
  /// info - 信息日志
  info,
  /// debug - 调试日志  
  debug,
  /// warn - 警告日志
  warn,
  /// error - 错误日志
  error,
}
```

### 2. 主日志类 (OneAppLog)

应用日志的核心实现类：

```dart
/// application层：日志
class OneAppLog {
  OneAppLog._();

  /// logger flag
  static const int loggerFlag = 1;
  static const String _defaultTag = 'default';
  
  static bool _debuggable = false;
  static Level _filterLevel = Level.none;

  /// 配置日志系统
  /// [debuggable] 调试开关
  /// [filterLevel] 日志过滤级别
  static void config({
    bool debuggable = false,
    Level filterLevel = Level.none,
  }) {
    _debuggable = debuggable;
    _filterLevel = filterLevel;
  }

  /// info级别日志
  /// [msg] 日志内容
  /// [tag] 日志标签
  static void i(String msg, [String tag = _defaultTag]) {
    if (Level.info.index > _filterLevel.index) {
      _log(Level.info, msg, tag);
    }
  }

  /// debug级别日志
  /// [msg] 日志内容
  /// [tag] 日志标签
  static void d(String msg, [String tag = _defaultTag]) {
    if (_debuggable && Level.debug.index > _filterLevel.index) {
      _log(Level.debug, msg, tag);
    }
  }

  /// warn级别日志
  /// [msg] 日志内容
  /// [tag] 日志标签
  static void w(String msg, [String tag = _defaultTag]) {
    if (Level.warn.index > _filterLevel.index) {
      _log(Level.warn, msg, tag);
    }
  }

  /// error级别日志
  /// [msg] 日志内容
  /// [tag] 日志标签
  static void e(String msg, [String tag = _defaultTag]) {
    _log(Level.error, msg, tag);
  }

  /// 上传日志文件
  /// [fileName] 文件名，如果为空内部自动生成
  /// [handler] 上传处理器
  /// [config] 上传配置
  static Future<UploadFileResult> upload(
    String? fileName,
    UploadHandler handler,
    UploadConfig config,
  ) => UploadManager().upload(fileName, handler, config);

  // 内部日志记录实现
  static void _log(Level level, String msg, String tag) {
    final time = DateTime.now();
    final emoji = _levelEmojis[level];
    recordIns.record(loggerFlag, '$time: $emoji[$tag] $msg');
  }
}
```

### 3. 业务标签定义

为不同业务场景预定义的日志标签：

```dart
/// App通用标签
const tagApp = 'App';           // App全局日志
const tagRoute = 'Route';       // 路由跳转
const tagNetwork = 'Network';   // 网络请求
const tagWebView = 'WebView';   // WebView相关

/// 业务标签
const tagCommunity = 'Community';       // 社区功能
const tagCarSale = 'CarSale';          // 汽车销售
const tagAfterSale = 'AfterSale';      // 售后服务
const tagMall = 'Mall';                // 商城
const tagOrder = 'Order';              // 订单
const tagMaintenance = 'Maintenance';   // 保养维护

/// 车联网标签
const tagVehicleSDK = 'VehicleSDK';     // CEA/MM SDK
const tagAccount = 'Account';           // 账户系统
const tagCarHome = 'CarHome';           // 爱车首页
const tagMDK = 'MDK';                   // MDK相关
const tagRemoteControl = 'RemoteControl'; // 远程控制
const tagHVAC = 'HVAC';                 // 空调系统
const tagCarFind = 'CarFind';           // 寻车功能
const tag3DModel = '3DModel';           // 3D模型
const tagRPA = 'RPA';                   // RPA功能
const tagCamera = 'Camera';             // 摄像头
const tagIntelligentScene = 'IntelligentScene'; // 智能场景
const tagRVS = 'RVS';                   // 远程车辆状态
const tagVUR = 'VUR';                   // 用车报告
const tagAvatar = 'Avatar';             // 虚拟形象
const tagTouchGo = 'TouchGo';           // 小组件
const tagFridge = 'Fridge';             // 冰箱
const tagWallbox = 'Wallbox';           // 壁挂充电盒
const tagOTA = 'OTA';                   // 空中升级
const tagCharging = 'Charging';         // 充电功能
const tagMessage = 'Message';           // 通知消息
```

### 4. 日志级别表情符号映射

```dart
final Map<Level, String> _levelEmojis = {
  Level.debug: '🐛',
  Level.info: '💡💡',
  Level.warn: '⚠️⚠️⚠️',
  Level.error: '❌❌❌',
};
```

### 5. Logger类型别名

```dart
typedef Logger = OneAppLog;
```

## 使用指南

### 1. 日志系统初始化

```dart
import 'package:basic_logger/basic_logger.dart';

// 配置日志系统
OneAppLog.config(
  debuggable: true,           // 开启调试模式
  filterLevel: Level.debug,   // 设置过滤级别
);
```

### 2. 基础日志记录

```dart
// 使用预定义标签
OneAppLog.i('用户登录成功', tagAccount);
OneAppLog.d('调试信息：用户ID = 12345', tagAccount);
OneAppLog.w('网络请求超时，正在重试', tagNetwork);
OneAppLog.e('登录失败：用户名或密码错误', tagAccount);

// 使用默认标签
OneAppLog.i('应用启动完成');
OneAppLog.e('未知错误发生');
```

### 3. 车联网业务日志

```dart
// 车辆控制相关
OneAppLog.i('开始远程启动车辆', tagRemoteControl);
OneAppLog.w('车辆锁定状态异常', tagVehicleSDK);
OneAppLog.e('空调控制指令失败', tagHVAC);

// 充电相关
OneAppLog.i('开始充电', tagCharging);
OneAppLog.w('充电桩连接不稳定', tagCharging);
OneAppLog.e('充电异常停止', tagCharging);

// 3D模型相关
OneAppLog.d('3D模型加载中', tag3DModel);
OneAppLog.i('3D模型渲染完成', tag3DModel);

// 虚拟形象相关
OneAppLog.i('虚拟形象初始化', tagAvatar);
OneAppLog.w('虚拟形象动画加载超时', tagAvatar);
```

### 4. 日志文件上传

```dart
// 创建上传配置
final uploadConfig = UploadConfig(
  serverUrl: 'https://api.example.com/logs',
  apiKey: 'your_api_key',
  timeout: Duration(seconds: 30),
);

// 创建上传处理器
final uploadHandler = CustomUploadHandler();

// 上传日志文件
try {
  final result = await OneAppLog.upload(
    'app_logs_20231201.log',
    uploadHandler,
    uploadConfig,
  );
  
  if (result.success) {
    OneAppLog.i('日志上传成功', tagApp);
  } else {
    OneAppLog.e('日志上传失败: ${result.error}', tagApp);
  }
} catch (e) {
  OneAppLog.e('日志上传异常: $e', tagApp);
}
```

### 5. 条件日志记录

```dart
// 仅在调试模式下记录
if (kDebugMode) {
  OneAppLog.d('这是调试信息，仅开发时可见', tagApp);
}

// 根据业务条件记录
void onUserAction(String action) {
  OneAppLog.i('用户执行操作: $action', tagApp);
  
  if (action == 'high_risk_operation') {
    OneAppLog.w('用户执行高风险操作', tagApp);
  }
}
```

## 依赖配置

### pubspec.yaml 配置

```yaml
dependencies:
  flutter:
    sdk: flutter
    
  # 基础日志模块
  basic_logger:
    path: ../oneapp_basic_utils/basic_logger

dev_dependencies:
  flutter_test:
    sdk: flutter
```

## 高级功能

### 1. 自定义上传处理器

```dart
class CustomUploadHandler extends UploadHandler {
  @override
  Future<UploadFileResult> upload(
    String filePath, 
    UploadConfig config
  ) async {
    // 实现自定义上传逻辑
    try {
      // 发送HTTP请求上传文件
      final response = await http.post(
        Uri.parse(config.serverUrl),
        headers: {'Authorization': 'Bearer ${config.apiKey}'},
        body: await File(filePath).readAsBytes(),
      );
      
      if (response.statusCode == 200) {
        return UploadFileResult.success();
      } else {
        return UploadFileResult.failure('上传失败: ${response.statusCode}');
      }
    } catch (e) {
      return UploadFileResult.failure('上传异常: $e');
    }
  }
}
```

### 2. 事件日志记录

```dart
import 'package:basic_logger/basic_logger.dart';

// 记录事件日志
OneEventLog.record({
  'event_type': 'user_click',
  'element_id': 'login_button',
  'timestamp': DateTime.now().millisecondsSinceEpoch,
  'user_id': '12345',
});
```

### 3. 原生日志监控

```dart
import 'package:basic_logger/logcat_monitor.dart';

// 开启原生日志监控
final monitor = LogcatMonitor();
await monitor.startMonitoring();

// 停止监控
await monitor.stopMonitoring();
```

## 性能优化建议

### 1. 日志级别管理
- 生产环境关闭debug日志：`debuggable: false`
- 设置合适的过滤级别：`filterLevel: Level.warn`
- 避免在循环中大量打印日志

### 2. 文件管理
- 定期清理过期日志文件
- 控制日志文件大小，避免占用过多存储空间
- 使用日志轮转机制

### 3. 网络上传优化
- 在WiFi环境下上传日志
- 压缩日志文件减少网络开销
- 实现上传失败重试机制

## 最佳实践

### 1. 标签使用规范
```dart
// 推荐：使用预定义业务标签
OneAppLog.i('充电状态更新', tagCharging);

// 避免：使用无意义的标签
OneAppLog.i('充电状态更新', 'test');
```

### 2. 敏感信息保护
```dart
// 推荐：脱敏处理
OneAppLog.i('用户登录: ${userId.substring(0, 3)}***', tagAccount);

// 避免：直接记录敏感信息
OneAppLog.i('用户登录: $userPassword', tagAccount);
```

### 3. 错误日志详细性
```dart
// 推荐：提供详细上下文
OneAppLog.e('网络请求失败: $url, 状态码: $statusCode, 错误: $error', tagNetwork);

// 避免：信息不足的错误日志
OneAppLog.e('请求失败', tagNetwork);
```

## 问题排查

### 常见问题
1. **日志不显示**: 检查debuggable配置和filterLevel设置
2. **文件上传失败**: 确认网络权限和上传配置
3. **性能影响**: 避免高频日志输出，合理设置日志级别

### 调试技巧
- 使用Android Studio/Xcode查看原生日志
- 通过文件系统检查日志文件生成
- 监控应用内存使用避免日志系统影响性能
