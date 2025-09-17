# Basic Logger - 日志系统模块文档

## 模块概述

`basic_logger` 是 OneApp 基础工具模块群中的日志系统核心模块，提供统一的日志记录、管理和分析功能。该模块支持多级别日志、文件存储、网络上传、崩溃日志收集等功能，并提供了 Android 和 iOS 的原生日志监控能力。

### 基本信息
- **模块名称**: basic_logger
- **版本**: 0.2.5
- **类型**: Flutter Plugin
- **Flutter 版本**: >=2.10.5
- **Dart 版本**: >=2.16.2 <4.0.0

## 目录结构

```
basic_logger/
├── lib/
│   ├── basic_logger.dart         # 主导出文件
│   └── src/                      # 源代码目录
│       ├── logger/               # 日志核心实现
│       ├── appenders/            # 日志输出器
│       ├── formatters/           # 日志格式化器
│       ├── filters/              # 日志过滤器
│       ├── models/               # 数据模型
│       └── utils/                # 工具类
├── android/                      # Android 原生实现
│   ├── src/main/
│   │   ├── kotlin/               # Kotlin 源码
│   │   └── java/                 # Java 源码 (遗留)
│   └── build.gradle             # Android 构建配置
├── ios/                          # iOS 原生实现
│   ├── Classes/                  # Objective-C/Swift 源码
│   └── basic_logger.podspec     # CocoaPods 配置
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 日志记录器核心

#### 日志记录器实现
```dart
// 日志记录器核心类
class BasicLogger {
  static BasicLogger? _instance;
  static BasicLogger get instance => _instance ??= BasicLogger._internal();
  
  BasicLogger._internal();
  
  final List<LogAppender> _appenders = [];
  final List<LogFilter> _filters = [];
  LogLevel _minimumLevel = LogLevel.info;
  LogFormatter _formatter = DefaultLogFormatter();
  
  // 初始化日志系统
  Future<void> initialize({
    LogLevel minimumLevel = LogLevel.info,
    List<LogAppender>? appenders,
    List<LogFilter>? filters,
    LogFormatter? formatter,
  }) async {
    _minimumLevel = minimumLevel;
    
    if (appenders != null) {
      _appenders.clear();
      _appenders.addAll(appenders);
    } else {
      // 默认添加控制台和文件输出器
      _appenders.addAll([
        ConsoleAppender(),
        FileAppender(),
      ]);
    }
    
    if (filters != null) {
      _filters.clear();
      _filters.addAll(filters);
    }
    
    if (formatter != null) {
      _formatter = formatter;
    }
    
    // 初始化各个输出器
    for (final appender in _appenders) {
      await appender.initialize();
    }
  }
  
  // 记录日志
  void log(
    LogLevel level,
    String message, {
    String? tag,
    Object? error,
    StackTrace? stackTrace,
    Map<String, dynamic>? context,
  }) {
    if (level.index < _minimumLevel.index) {
      return;
    }
    
    final logEntry = LogEntry(
      level: level,
      message: message,
      tag: tag ?? 'BasicLogger',
      error: error,
      stackTrace: stackTrace,
      context: context,
      timestamp: DateTime.now(),
      thread: _getCurrentThread(),
    );
    
    // 应用过滤器
    bool shouldLog = true;
    for (final filter in _filters) {
      if (!filter.shouldLog(logEntry)) {
        shouldLog = false;
        break;
      }
    }
    
    if (shouldLog) {
      final formattedLog = _formatter.format(logEntry);
      
      // 发送到所有输出器
      for (final appender in _appenders) {
        appender.append(formattedLog, logEntry);
      }
    }
  }
  
  // 便捷方法
  void debug(String message, {String? tag, Map<String, dynamic>? context}) {
    log(LogLevel.debug, message, tag: tag, context: context);
  }
  
  void info(String message, {String? tag, Map<String, dynamic>? context}) {
    log(LogLevel.info, message, tag: tag, context: context);
  }
  
  void warning(String message, {String? tag, Object? error, Map<String, dynamic>? context}) {
    log(LogLevel.warning, message, tag: tag, error: error, context: context);
  }
  
  void error(String message, {String? tag, Object? error, StackTrace? stackTrace, Map<String, dynamic>? context}) {
    log(LogLevel.error, message, tag: tag, error: error, stackTrace: stackTrace, context: context);
  }
  
  void fatal(String message, {String? tag, Object? error, StackTrace? stackTrace, Map<String, dynamic>? context}) {
    log(LogLevel.fatal, message, tag: tag, error: error, stackTrace: stackTrace, context: context);
  }
  
  String _getCurrentThread() {
    // 获取当前线程信息
    return 'main'; // 简化实现
  }
}

// 日志级别枚举
enum LogLevel {
  debug,
  info,
  warning,
  error,
  fatal;
  
  String get name {
    switch (this) {
      case LogLevel.debug:
        return 'DEBUG';
      case LogLevel.info:
        return 'INFO';
      case LogLevel.warning:
        return 'WARN';
      case LogLevel.error:
        return 'ERROR';
      case LogLevel.fatal:
        return 'FATAL';
    }
  }
  
  Color get color {
    switch (this) {
      case LogLevel.debug:
        return Colors.grey;
      case LogLevel.info:
        return Colors.blue;
      case LogLevel.warning:
        return Colors.orange;
      case LogLevel.error:
        return Colors.red;
      case LogLevel.fatal:
        return Colors.purple;
    }
  }
}

// 日志条目模型
class LogEntry {
  final LogLevel level;
  final String message;
  final String tag;
  final Object? error;
  final StackTrace? stackTrace;
  final Map<String, dynamic>? context;
  final DateTime timestamp;
  final String thread;
  
  const LogEntry({
    required this.level,
    required this.message,
    required this.tag,
    this.error,
    this.stackTrace,
    this.context,
    required this.timestamp,
    required this.thread,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'level': level.name,
      'message': message,
      'tag': tag,
      'error': error?.toString(),
      'stackTrace': stackTrace?.toString(),
      'context': context,
      'timestamp': timestamp.toIso8601String(),
      'thread': thread,
    };
  }
}
```

### 2. 日志输出器 (Appenders)

#### 控制台输出器
```dart
// 控制台日志输出器
class ConsoleAppender implements LogAppender {
  bool _enableColors = true;
  
  ConsoleAppender({bool enableColors = true}) : _enableColors = enableColors;
  
  @override
  Future<void> initialize() async {
    // 控制台输出器无需初始化
  }
  
  @override
  void append(String formattedLog, LogEntry entry) {
    if (kDebugMode) {
      if (_enableColors) {
        _printWithColor(formattedLog, entry.level);
      } else {
        print(formattedLog);
      }
    }
  }
  
  void _printWithColor(String message, LogLevel level) {
    // ANSI 颜色代码
    const String reset = '\x1B[0m';
    String colorCode;
    
    switch (level) {
      case LogLevel.debug:
        colorCode = '\x1B[37m'; // 白色
        break;
      case LogLevel.info:
        colorCode = '\x1B[36m'; // 青色
        break;
      case LogLevel.warning:
        colorCode = '\x1B[33m'; // 黄色
        break;
      case LogLevel.error:
        colorCode = '\x1B[31m'; // 红色
        break;
      case LogLevel.fatal:
        colorCode = '\x1B[35m'; // 紫色
        break;
    }
    
    print('$colorCode$message$reset');
  }
  
  @override
  Future<void> close() async {
    // 控制台输出器无需关闭
  }
}
```

#### 文件输出器
```dart
// 文件日志输出器
class FileAppender implements LogAppender {
  late File _logFile;
  late RandomAccessFile _fileHandle;
  final int _maxFileSize;
  final int _maxBackupFiles;
  final Duration _flushInterval;
  Timer? _flushTimer;
  final List<String> _buffer = [];
  final int _bufferSize;
  
  FileAppender({
    int maxFileSize = 10 * 1024 * 1024, // 10MB
    int maxBackupFiles = 5,
    Duration flushInterval = const Duration(seconds: 5),
    int bufferSize = 100,
  }) : _maxFileSize = maxFileSize,
       _maxBackupFiles = maxBackupFiles,
       _flushInterval = flushInterval,
       _bufferSize = bufferSize;
  
  @override
  Future<void> initialize() async {
    final directory = await getApplicationDocumentsDirectory();
    final logDir = Directory('${directory.path}/logs');
    
    if (!await logDir.exists()) {
      await logDir.create(recursive: true);
    }
    
    _logFile = File('${logDir.path}/app.log');
    _fileHandle = await _logFile.open(mode: FileMode.append);
    
    // 启动定时刷新
    _flushTimer = Timer.periodic(_flushInterval, (_) => _flush());
  }
  
  @override
  void append(String formattedLog, LogEntry entry) {
    _buffer.add(formattedLog);
    
    // 缓冲区满时立即刷新
    if (_buffer.length >= _bufferSize) {
      _flush();
    }
  }
  
  Future<void> _flush() async {
    if (_buffer.isEmpty) return;
    
    try {
      final content = _buffer.join('\n') + '\n';
      await _fileHandle.writeString(content);
      await _fileHandle.flush();
      _buffer.clear();
      
      // 检查文件大小，必要时进行轮转
      await _checkFileRotation();
    } catch (e) {
      print('Failed to flush log buffer: $e');
    }
  }
  
  Future<void> _checkFileRotation() async {
    final fileSize = await _logFile.length();
    if (fileSize > _maxFileSize) {
      await _rotateLogFiles();
    }
  }
  
  Future<void> _rotateLogFiles() async {
    await _fileHandle.close();
    
    // 轮转备份文件
    for (int i = _maxBackupFiles - 1; i >= 1; i--) {
      final oldFile = File('${_logFile.path}.$i');
      final newFile = File('${_logFile.path}.${i + 1}');
      
      if (await oldFile.exists()) {
        if (i == _maxBackupFiles - 1) {
          await oldFile.delete();
        } else {
          await oldFile.rename(newFile.path);
        }
      }
    }
    
    // 将当前日志文件重命名为 .1
    await _logFile.rename('${_logFile.path}.1');
    
    // 创建新的日志文件
    _logFile = File(_logFile.path.replaceAll('.1', ''));
    _fileHandle = await _logFile.open(mode: FileMode.write);
  }
  
  @override
  Future<void> close() async {
    _flushTimer?.cancel();
    await _flush();
    await _fileHandle.close();
  }
}
```

#### 网络输出器
```dart
// 网络日志输出器
class NetworkAppender implements LogAppender {
  final String _endpoint;
  final Map<String, String> _headers;
  final Duration _batchInterval;
  final int _batchSize;
  final List<LogEntry> _batch = [];
  Timer? _batchTimer;
  final Dio _dio;
  
  NetworkAppender({
    required String endpoint,
    Map<String, String>? headers,
    Duration batchInterval = const Duration(seconds: 30),
    int batchSize = 50,
  }) : _endpoint = endpoint,
       _headers = headers ?? {},
       _batchInterval = batchInterval,
       _batchSize = batchSize,
       _dio = Dio();
  
  @override
  Future<void> initialize() async {
    _batchTimer = Timer.periodic(_batchInterval, (_) => _sendBatch());
  }
  
  @override
  void append(String formattedLog, LogEntry entry) {
    _batch.add(entry);
    
    if (_batch.length >= _batchSize) {
      _sendBatch();
    }
  }
  
  Future<void> _sendBatch() async {
    if (_batch.isEmpty) return;
    
    final batch = List<LogEntry>.from(_batch);
    _batch.clear();
    
    try {
      final payload = {
        'logs': batch.map((entry) => entry.toJson()).toList(),
        'device_info': await _getDeviceInfo(),
        'app_info': await _getAppInfo(),
        'timestamp': DateTime.now().toIso8601String(),
      };
      
      await _dio.post(
        _endpoint,
        data: payload,
        options: Options(headers: _headers),
      );
    } catch (e) {
      print('Failed to send log batch: $e');
      // 可以考虑将失败的日志保存到本地，稍后重试
    }
  }
  
  Future<Map<String, dynamic>> _getDeviceInfo() async {
    // 获取设备信息
    return {
      'platform': Platform.isAndroid ? 'android' : 'ios',
      'version': Platform.operatingSystemVersion,
      // 更多设备信息...
    };
  }
  
  Future<Map<String, dynamic>> _getAppInfo() async {
    final packageInfo = await PackageInfo.fromPlatform();
    return {
      'app_name': packageInfo.appName,
      'package_name': packageInfo.packageName,
      'version': packageInfo.version,
      'build_number': packageInfo.buildNumber,
    };
  }
  
  @override
  Future<void> close() async {
    _batchTimer?.cancel();
    await _sendBatch();
  }
}
```

### 3. 日志格式化器

#### 默认格式化器
```dart
// 日志格式化器接口
abstract class LogFormatter {
  String format(LogEntry entry);
}

// 默认日志格式化器
class DefaultLogFormatter implements LogFormatter {
  final String _pattern;
  final DateFormat _dateFormat;
  
  DefaultLogFormatter({
    String pattern = '{timestamp} [{level}] {tag}: {message}',
  }) : _pattern = pattern,
       _dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss.SSS');
  
  @override
  String format(LogEntry entry) {
    String result = _pattern;
    
    result = result.replaceAll('{timestamp}', _dateFormat.format(entry.timestamp));
    result = result.replaceAll('{level}', entry.level.name);
    result = result.replaceAll('{tag}', entry.tag);
    result = result.replaceAll('{message}', entry.message);
    result = result.replaceAll('{thread}', entry.thread);
    
    // 添加错误信息
    if (entry.error != null) {
      result += '\nError: ${entry.error}';
    }
    
    // 添加堆栈跟踪
    if (entry.stackTrace != null) {
      result += '\nStackTrace:\n${entry.stackTrace}';
    }
    
    // 添加上下文信息
    if (entry.context != null && entry.context!.isNotEmpty) {
      result += '\nContext: ${jsonEncode(entry.context)}';
    }
    
    return result;
  }
}

// JSON 格式化器
class JsonLogFormatter implements LogFormatter {
  final bool _prettyPrint;
  
  JsonLogFormatter({bool prettyPrint = false}) : _prettyPrint = prettyPrint;
  
  @override
  String format(LogEntry entry) {
    final json = entry.toJson();
    
    if (_prettyPrint) {
      const encoder = JsonEncoder.withIndent('  ');
      return encoder.convert(json);
    } else {
      return jsonEncode(json);
    }
  }
}
```

### 4. 崩溃日志处理

#### 崩溃日志收集器
```dart
// 崩溃日志收集器
class CrashLogCollector {
  static CrashLogCollector? _instance;
  static CrashLogCollector get instance => _instance ??= CrashLogCollector._internal();
  
  CrashLogCollector._internal();
  
  late BasicLogger _logger;
  bool _isInitialized = false;
  
  Future<void> initialize(BasicLogger logger) async {
    if (_isInitialized) return;
    
    _logger = logger;
    
    // 捕获 Flutter 框架错误
    FlutterError.onError = (FlutterErrorDetails details) {
      _logFlutterError(details);
    };
    
    // 捕获其他未处理的异常
    PlatformDispatcher.instance.onError = (error, stack) {
      _logUnhandledException(error, stack);
      return true;
    };
    
    // 捕获 Zone 错误
    runZonedGuarded(() {
      // 应用代码在这里运行
    }, (error, stack) {
      _logZoneError(error, stack);
    });
    
    _isInitialized = true;
  }
  
  void _logFlutterError(FlutterErrorDetails details) {
    _logger.fatal(
      'Flutter Error: ${details.summary}',
      tag: 'CrashLogger',
      error: details.exception,
      stackTrace: details.stack,
      context: {
        'library': details.library,
        'context': details.context?.toString(),
        'information_collector': details.informationCollector?.toString(),
      },
    );
  }
  
  void _logUnhandledException(Object error, StackTrace stack) {
    _logger.fatal(
      'Unhandled Exception: $error',
      tag: 'CrashLogger',
      error: error,
      stackTrace: stack,
    );
  }
  
  void _logZoneError(Object error, StackTrace stack) {
    _logger.fatal(
      'Zone Error: $error',
      tag: 'CrashLogger',
      error: error,
      stackTrace: stack,
    );
  }
  
  // 手动记录崩溃
  void logCrash({
    required String message,
    Object? error,
    StackTrace? stackTrace,
    Map<String, dynamic>? context,
  }) {
    _logger.fatal(
      message,
      tag: 'ManualCrash',
      error: error,
      stackTrace: stackTrace,
      context: context,
    );
  }
}
```

## Android 原生实现

### Android 日志监控
```kotlin
// Android ���志监控插件
class LogcatMonitorPlugin : FlutterPlugin, MethodCallHandler {
    private lateinit var channel: MethodChannel
    private var logcatMonitor: LogcatMonitor? = null
    
    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(binding.binaryMessenger, "basic_logger")
        channel.setMethodCallHandler(this)
    }
    
    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "startLogcatMonitor" -> {
                startLogcatMonitor(result)
            }
            "stopLogcatMonitor" -> {
                stopLogcatMonitor(result)
            }
            "getNativeLogs" -> {
                getNativeLogs(result)
            }
            else -> {
                result.notImplemented()
            }
        }
    }
    
    private fun startLogcatMonitor(result: MethodChannel.Result) {
        try {
            logcatMonitor = LogcatMonitor { logEntry ->
                // 将原生日志传递到 Flutter
                channel.invokeMethod("onNativeLog", logEntry.toMap())
            }
            logcatMonitor?.start()
            result.success(true)
        } catch (e: Exception) {
            result.error("MONITOR_ERROR", "Failed to start logcat monitor", e.message)
        }
    }
    
    private fun stopLogcatMonitor(result: MethodChannel.Result) {
        logcatMonitor?.stop()
        logcatMonitor = null
        result.success(true)
    }
    
    private fun getNativeLogs(result: MethodChannel.Result) {
        try {
            val logs = logcatMonitor?.getRecentLogs() ?: emptyList()
            result.success(logs.map { it.toMap() })
        } catch (e: Exception) {
            result.error("LOG_ERROR", "Failed to get native logs", e.message)
        }
    }
}

// Logcat 监控器
class LogcatMonitor(private val onLogEntry: (LogEntry) -> Unit) {
    private var process: Process? = null
    private var isRunning = false
    private val logBuffer = mutableListOf<LogEntry>()
    
    fun start() {
        if (isRunning) return
        
        isRunning = true
        thread {
            try {
                process = Runtime.getRuntime().exec("logcat -v time")
                val reader = BufferedReader(InputStreamReader(process!!.inputStream))
                
                reader.useLines { lines ->
                    lines.forEach { line ->
                        if (isRunning) {
                            parseLogLine(line)?.let { logEntry ->
                                logBuffer.add(logEntry)
                                onLogEntry(logEntry)
                                
                                // 保持缓冲区大小
                                if (logBuffer.size > 1000) {
                                    logBuffer.removeAt(0)
                                }
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e("LogcatMonitor", "Error reading logcat", e)
            }
        }
    }
    
    fun stop() {
        isRunning = false
        process?.destroy()
        process = null
    }
    
    fun getRecentLogs(): List<LogEntry> {
        return logBuffer.toList()
    }
    
    private fun parseLogLine(line: String): LogEntry? {
        // 解析 logcat 输出格式
        // 示例: "01-01 12:00:00.000 D/Tag(12345): Message"
        val pattern = Regex("""(\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\s+([VDIWEF])/([^(]+)\((\d+)\):\s+(.*)""")
        val match = pattern.find(line) ?: return null
        
        val (timestamp, level, tag, pid, message) = match.destructured
        
        return LogEntry(
            timestamp = timestamp,
            level = level,
            tag = tag,
            pid = pid.toInt(),
            message = message
        )
    }
}
```

## iOS 原生实现

### iOS 日志监控
```objc
// iOS 日志监控插件
@implementation KitLoggerIosPlugin

+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
    FlutterMethodChannel* channel = [FlutterMethodChannel
        methodChannelWithName:@"basic_logger"
        binaryMessenger:[registrar messenger]];
    
    KitLoggerIosPlugin* instance = [[KitLoggerIosPlugin alloc] init];
    instance.channel = channel;
    [registrar addMethodCallDelegate:instance channel:channel];
}

- (void)handleMethodCall:(FlutterMethodCall*)call result:(FlutterResult)result {
    if ([@"startSystemLogMonitor" isEqualToString:call.method]) {
        [self startSystemLogMonitor:result];
    } else if ([@"stopSystemLogMonitor" isEqualToString:call.method]) {
        [self stopSystemLogMonitor:result];
    } else if ([@"getSystemLogs" isEqualToString:call.method]) {
        [self getSystemLogs:result];
    } else {
        result(FlutterMethodNotImplemented);
    }
}

- (void)startSystemLogMonitor:(FlutterResult)result {
    // iOS 系统日志监控实现
    self.logStore = [[OSLogStore alloc] initWithScope:OSLogStoreCurrentProcessIdentifier
                                                error:nil];
    
    if (self.logStore) {
        [self startLogMonitoring];
        result(@YES);
    } else {
        result([FlutterError errorWithCode:@"MONITOR_ERROR"
                                   message:@"Failed to initialize log store"
                                   details:nil]);
    }
}

- (void)startLogMonitoring {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSPredicate *predicate = [NSPredicate predicateWithFormat:@"subsystem == %@", 
                                  [[NSBundle mainBundle] bundleIdentifier]];
        
        OSLogEnumerator *enumerator = [self.logStore entriesEnumeratorWithOptions:0
                                                                        position:nil
                                                                       predicate:predicate
                                                                           error:nil];
        
        for (OSLogEntryLog *entry in enumerator) {
            NSDictionary *logData = @{
                @"timestamp": @([entry.date timeIntervalSince1970]),
                @"level": [self logLevelString:entry.level],
                @"category": entry.category,
                @"message": entry.composedMessage
            };
            
            dispatch_async(dispatch_get_main_queue(), ^{
                [self.channel invokeMethod:@"onSystemLog" arguments:logData];
            });
        }
    });
}

@end
```

## 使用示例

### 基本使用
```dart
// 初始化日志系统
await BasicLogger.instance.initialize(
  minimumLevel: LogLevel.debug,
  appenders: [
    ConsoleAppender(enableColors: true),
    FileAppender(
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxBackupFiles: 3,
    ),
    NetworkAppender(
      endpoint: 'https://api.example.com/logs',
      headers: {'Authorization': 'Bearer token'},
    ),
  ],
  formatter: DefaultLogFormatter(
    pattern: '{timestamp} [{level}] {tag}: {message}',
  ),
);

// 初始化崩溃日志收集
await CrashLogCollector.instance.initialize(BasicLogger.instance);

// 记录不同级别的日志
BasicLogger.instance.debug('Debug message');
BasicLogger.instance.info('Info message', context: {'user_id': '123'});
BasicLogger.instance.warning('Warning message');
BasicLogger.instance.error('Error occurred', error: exception);
BasicLogger.instance.fatal('Fatal error', error: exception, stackTrace: stackTrace);
```

### 高级配置
```dart
// 自定义过滤器
class TagFilter implements LogFilter {
  final Set<String> _allowedTags;
  
  TagFilter(this._allowedTags);
  
  @override
  bool shouldLog(LogEntry entry) {
    return _allowedTags.contains(entry.tag);
  }
}

// 使用自定义配置
await BasicLogger.instance.initialize(
  minimumLevel: LogLevel.info,
  appenders: [
    ConsoleAppender(),
    FileAppender(),
    NetworkAppender(
      endpoint: 'https://log-server.com/api/logs',
      batchSize: 20,
      batchInterval: Duration(seconds: 10),
    ),
  ],
  filters: [
    TagFilter({'NetworkService', 'UserAction', 'CrashLogger'}),
  ],
  formatter: JsonLogFormatter(prettyPrint: false),
);
```

## 依赖管理

### 核心依赖
- **flutter**: Flutter SDK
- **archive**: 压缩功能支持

### 开发依赖
- **flutter_test**: 测试框架
- **flutter_lints**: 代码检查
- **mockito**: Mock 测试
- **build_runner**: 代码生成

## 性能优化

### 日志性能优化
- 异步日志写入
- 批量网络上传
- 内存缓冲区管理
- 日志文件轮转

### 内存管理
- 限制内存缓冲区大小
- 及时释放不用的日志数据
- 压缩历史日志文件

## 总结

`basic_logger` 模块为 OneApp 提供了强大而灵活的日志系统，支持多种输出方式、格式化选项和过滤机制。通过原生平台集成，能够收集系统级日志信息，为应用调试、性能监控和问题诊断提供了完整的解决方案。
