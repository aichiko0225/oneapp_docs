# Kit App Monitor 应用监控工具包

## 模块概述

`kit_app_monitor` 是 OneApp 基础工具模块群中的应用监控工具包，负责实时监控应用的性能指标、异常情况、用户行为等关键数据。该插件通过原生平台能力，为应用提供全面的监控和分析功能。

### 基本信息
- **模块名称**: kit_app_monitor
- **版本**: 0.0.2+1
- **类型**: Flutter Plugin（原生插件）
- **描述**: 应用监控工具包
- **Flutter 版本**: >=3.0.0
- **Dart 版本**: >=3.0.0<4.0.0

## 功能特性

### 核心功能
1. **性能监控**
   - CPU使用率监控
   - 内存使用监控
   - 网络请求性能
   - 帧率(FPS)监控

2. **异常监控**
   - Crash崩溃监控
   - ANR(应用无响应)检测
   - 网络异常监控
   - 自定义异常上报

3. **用户行为分析**
   - 页面访问统计
   - 用户操作轨迹
   - 功能使用频率
   - 用户留存分析

4. **设备信息收集**
   - 设备硬件信息
   - 系统版本信息
   - 应用版本信息
   - 网络环境信息

## 技术架构

### 目录结构
```
kit_app_monitor/
├── lib/                        # Dart代码
│   ├── kit_app_monitor.dart    # 插件入口
│   ├── src/                    # 源代码
│   │   ├── platform_interface.dart # 平台接口定义
│   │   ├── method_channel.dart     # 方法通道实现
│   │   ├── models/                 # 数据模型
│   │   │   ├── performance_data.dart
│   │   │   ├── crash_report.dart
│   │   │   └── user_behavior.dart
│   │   └── utils/                  # 工具类
│   └── kit_app_monitor_platform_interface.dart
├── android/                    # Android原生代码
│   ├── src/main/kotlin/
│   │   └── com/cariadcn/kit_app_monitor/
│   │       ├── KitAppMonitorPlugin.kt
│   │       ├── PerformanceMonitor.kt
│   │       ├── CrashHandler.kt
│   │       └── BehaviorTracker.kt
│   └── build.gradle
├── ios/                        # iOS原生代码
│   ├── Classes/
│   │   ├── KitAppMonitorPlugin.swift
│   │   ├── PerformanceMonitor.swift
│   │   ├── CrashHandler.swift
│   │   └── BehaviorTracker.swift
│   └── kit_app_monitor.podspec
├── example/                    # 示例应用
└── test/                       # 测试文件
```

### 依赖关系

#### 核心依赖
- `plugin_platform_interface: ^2.0.2` - 插件平台接口
- `json_annotation: ^4.8.1` - JSON序列化

#### 开发依赖
- `json_serializable: ^6.7.0` - JSON序列化代码生成
- `build_runner: any` - 代码生成引擎

## 核心模块分析

### 1. Flutter端实现

#### 插件入口 (`lib/kit_app_monitor.dart`)
```dart
class KitAppMonitor {
  static const MethodChannel _channel = MethodChannel('kit_app_monitor');
  
  static bool _isInitialized = false;
  static StreamController<PerformanceData>? _performanceController;
  static StreamController<CrashReport>? _crashController;
  static StreamController<UserBehavior>? _behaviorController;
  
  /// 初始化监控
  static Future<void> initialize({
    bool enablePerformanceMonitoring = true,
    bool enableCrashReporting = true,
    bool enableBehaviorTracking = true,
    String? userId,
    Map<String, dynamic>? customProperties,
  }) async {
    if (_isInitialized) return;
    
    await _channel.invokeMethod('initialize', {
      'enablePerformanceMonitoring': enablePerformanceMonitoring,
      'enableCrashReporting': enableCrashReporting,
      'enableBehaviorTracking': enableBehaviorTracking,
      'userId': userId,
      'customProperties': customProperties,
    });
    
    _setupEventChannels();
    _isInitialized = true;
  }
  
  /// 设置用户ID
  static Future<void> setUserId(String userId) async {
    await _channel.invokeMethod('setUserId', {'userId': userId});
  }
  
  /// 设置自定义属性
  static Future<void> setCustomProperty(String key, dynamic value) async {
    await _channel.invokeMethod('setCustomProperty', {
      'key': key,
      'value': value,
    });
  }
  
  /// 记录自定义事件
  static Future<void> recordEvent(String eventName, Map<String, dynamic>? parameters) async {
    await _channel.invokeMethod('recordEvent', {
      'eventName': eventName,
      'parameters': parameters,
    });
  }
  
  /// 记录页面访问
  static Future<void> recordPageView(String pageName) async {
    await _channel.invokeMethod('recordPageView', {'pageName': pageName});
  }
  
  /// 记录网络请求
  static Future<void> recordNetworkRequest({
    required String url,
    required String method,
    required int statusCode,
    required int responseTime,
    int? requestSize,
    int? responseSize,
  }) async {
    await _channel.invokeMethod('recordNetworkRequest', {
      'url': url,
      'method': method,
      'statusCode': statusCode,
      'responseTime': responseTime,
      'requestSize': requestSize,
      'responseSize': responseSize,
    });
  }
  
  /// 手动记录异常
  static Future<void> recordException({
    required String name,
    required String reason,
    String? stackTrace,
    Map<String, dynamic>? customData,
  }) async {
    await _channel.invokeMethod('recordException', {
      'name': name,
      'reason': reason,
      'stackTrace': stackTrace,
      'customData': customData,
    });
  }
  
  /// 获取性能数据流
  static Stream<PerformanceData> get performanceStream {
    _performanceController ??= StreamController<PerformanceData>.broadcast();
    return _performanceController!.stream;
  }
  
  /// 获取崩溃报告流
  static Stream<CrashReport> get crashStream {
    _crashController ??= StreamController<CrashReport>.broadcast();
    return _crashController!.stream;
  }
  
  /// 获取用户行为流
  static Stream<UserBehavior> get behaviorStream {
    _behaviorController ??= StreamController<UserBehavior>.broadcast();
    return _behaviorController!.stream;
  }
  
  /// 强制上报数据
  static Future<void> flush() async {
    await _channel.invokeMethod('flush');
  }
  
  /// 设置事件通道
  static void _setupEventChannels() {
    const performanceChannel = EventChannel('kit_app_monitor/performance');
    const crashChannel = EventChannel('kit_app_monitor/crash');
    const behaviorChannel = EventChannel('kit_app_monitor/behavior');
    
    performanceChannel.receiveBroadcastStream().listen((data) {
      final performanceData = PerformanceData.fromJson(data);
      _performanceController?.add(performanceData);
    });
    
    crashChannel.receiveBroadcastStream().listen((data) {
      final crashReport = CrashReport.fromJson(data);
      _crashController?.add(crashReport);
    });
    
    behaviorChannel.receiveBroadcastStream().listen((data) {
      final userBehavior = UserBehavior.fromJson(data);
      _behaviorController?.add(userBehavior);
    });
  }
  
  /// 清理资源
  static void dispose() {
    _performanceController?.close();
    _crashController?.close();
    _behaviorController?.close();
    _isInitialized = false;
  }
}
```

#### 数据模型 (`src/models/`)

##### 性能数据模型
```dart
@JsonSerializable()
class PerformanceData {
  final double cpuUsage;
  final int memoryUsage;
  final int totalMemory;
  final double fps;
  final int networkLatency;
  final DateTime timestamp;
  final String? pageName;
  
  const PerformanceData({
    required this.cpuUsage,
    required this.memoryUsage,
    required this.totalMemory,
    required this.fps,
    required this.networkLatency,
    required this.timestamp,
    this.pageName,
  });
  
  factory PerformanceData.fromJson(Map<String, dynamic> json) =>
      _$PerformanceDataFromJson(json);
  
  Map<String, dynamic> toJson() => _$PerformanceDataToJson(this);
  
  double get memoryUsagePercentage => (memoryUsage / totalMemory) * 100;
  
  bool get isHighCpuUsage => cpuUsage > 80.0;
  
  bool get isHighMemoryUsage => memoryUsagePercentage > 90.0;
  
  bool get isLowFps => fps < 30.0;
}
```

##### 崩溃报告模型
```dart
@JsonSerializable()
class CrashReport {
  final String crashId;
  final String type;
  final String message;
  final String stackTrace;
  final DateTime timestamp;
  final String appVersion;
  final String deviceModel;
  final String osVersion;
  final Map<String, dynamic> customData;
  final String? userId;
  
  const CrashReport({
    required this.crashId,
    required this.type,
    required this.message,
    required this.stackTrace,
    required this.timestamp,
    required this.appVersion,
    required this.deviceModel,
    required this.osVersion,
    required this.customData,
    this.userId,
  });
  
  factory CrashReport.fromJson(Map<String, dynamic> json) =>
      _$CrashReportFromJson(json);
  
  Map<String, dynamic> toJson() => _$CrashReportToJson(this);
  
  bool get isFatal => type.toLowerCase().contains('fatal');
  
  bool get isNativeCrash => type.toLowerCase().contains('native');
}
```

##### 用户行为模型
```dart
@JsonSerializable()
class UserBehavior {
  final String eventType;
  final String? pageName;
  final String? elementName;
  final Map<String, dynamic> parameters;
  final DateTime timestamp;
  final String? userId;
  final String sessionId;
  
  const UserBehavior({
    required this.eventType,
    this.pageName,
    this.elementName,
    required this.parameters,
    required this.timestamp,
    this.userId,
    required this.sessionId,
  });
  
  factory UserBehavior.fromJson(Map<String, dynamic> json) =>
      _$UserBehaviorFromJson(json);
  
  Map<String, dynamic> toJson() => _$UserBehaviorToJson(this);
  
  bool get isPageView => eventType == 'page_view';
  
  bool get isButtonClick => eventType == 'button_click';
  
  bool get isUserAction => ['click', 'tap', 'swipe', 'scroll'].contains(eventType);
}
```

### 2. Android端实现

#### 主插件类 (`KitAppMonitorPlugin.kt`)
```kotlin
class KitAppMonitorPlugin: FlutterPlugin, MethodCallHandler, ActivityAware {
    private lateinit var channel: MethodChannel
    private lateinit var context: Context
    private var activity: Activity? = null
    
    private var performanceMonitor: PerformanceMonitor? = null
    private var crashHandler: CrashHandler? = null
    private var behaviorTracker: BehaviorTracker? = null
    
    private var performanceEventChannel: EventChannel? = null
    private var crashEventChannel: EventChannel? = null
    private var behaviorEventChannel: EventChannel? = null

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(binding.binaryMessenger, "kit_app_monitor")
        context = binding.applicationContext
        channel.setMethodCallHandler(this)
        
        // 设置事件通道
        setupEventChannels(binding.binaryMessenger)
    }
    
    private fun setupEventChannels(messenger: BinaryMessenger) {
        performanceEventChannel = EventChannel(messenger, "kit_app_monitor/performance")
        crashEventChannel = EventChannel(messenger, "kit_app_monitor/crash")
        behaviorEventChannel = EventChannel(messenger, "kit_app_monitor/behavior")
    }

    override fun onMethodCall(call: MethodCall, result: Result) {
        when (call.method) {
            "initialize" -> initialize(call, result)
            "setUserId" -> setUserId(call, result)
            "setCustomProperty" -> setCustomProperty(call, result)
            "recordEvent" -> recordEvent(call, result)
            "recordPageView" -> recordPageView(call, result)
            "recordNetworkRequest" -> recordNetworkRequest(call, result)
            "recordException" -> recordException(call, result)
            "flush" -> flush(result)
            else -> result.notImplemented()
        }
    }
    
    private fun initialize(call: MethodCall, result: Result) {
        val enablePerformanceMonitoring = call.argument<Boolean>("enablePerformanceMonitoring") ?: true
        val enableCrashReporting = call.argument<Boolean>("enableCrashReporting") ?: true
        val enableBehaviorTracking = call.argument<Boolean>("enableBehaviorTracking") ?: true
        val userId = call.argument<String>("userId")
        val customProperties = call.argument<Map<String, Any>>("customProperties")
        
        try {
            if (enablePerformanceMonitoring) {
                performanceMonitor = PerformanceMonitor(context)
                performanceMonitor?.initialize(performanceEventChannel)
            }
            
            if (enableCrashReporting) {
                crashHandler = CrashHandler(context)
                crashHandler?.initialize(crashEventChannel)
            }
            
            if (enableBehaviorTracking) {
                behaviorTracker = BehaviorTracker(context)
                behaviorTracker?.initialize(behaviorEventChannel)
            }
            
            userId?.let { setUserId(it) }
            customProperties?.forEach { (key, value) ->
                setCustomProperty(key, value)
            }
            
            result.success(true)
        } catch (e: Exception) {
            result.error("INITIALIZATION_FAILED", e.message, null)
        }
    }
    
    private fun recordEvent(call: MethodCall, result: Result) {
        val eventName = call.argument<String>("eventName")
        val parameters = call.argument<Map<String, Any>>("parameters")
        
        behaviorTracker?.recordEvent(eventName ?: "", parameters ?: emptyMap())
        result.success(true)
    }
    
    private fun recordPageView(call: MethodCall, result: Result) {
        val pageName = call.argument<String>("pageName")
        behaviorTracker?.recordPageView(pageName ?: "")
        result.success(true)
    }
    
    override fun onAttachedToActivity(binding: ActivityPluginBinding) {
        activity = binding.activity
        performanceMonitor?.setActivity(activity)
        behaviorTracker?.setActivity(activity)
    }
    
    override fun onDetachedFromActivity() {
        activity = null
        performanceMonitor?.setActivity(null)
        behaviorTracker?.setActivity(null)
    }
}
```

#### 性能监控器 (`PerformanceMonitor.kt`)
```kotlin
class PerformanceMonitor(private val context: Context) {
    private var eventSink: EventChannel.EventSink? = null
    private var monitoringHandler: Handler? = null
    private var activity: Activity? = null
    private val updateInterval = 5000L // 5秒更新一次
    
    fun initialize(eventChannel: EventChannel?) {
        eventChannel?.setStreamHandler(object : EventChannel.StreamHandler {
            override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                eventSink = events
                startMonitoring()
            }
            
            override fun onCancel(arguments: Any?) {
                eventSink = null
                stopMonitoring()
            }
        })
    }
    
    fun setActivity(activity: Activity?) {
        this.activity = activity
    }
    
    private fun startMonitoring() {
        monitoringHandler = Handler(Looper.getMainLooper())
        monitoringHandler?.post(monitoringRunnable)
    }
    
    private fun stopMonitoring() {
        monitoringHandler?.removeCallbacks(monitoringRunnable)
        monitoringHandler = null
    }
    
    private val monitoringRunnable = object : Runnable {
        override fun run() {
            collectPerformanceData()
            monitoringHandler?.postDelayed(this, updateInterval)
        }
    }
    
    private fun collectPerformanceData() {
        try {
            val cpuUsage = getCpuUsage()
            val memoryInfo = getMemoryInfo()
            val fps = getFps()
            val networkLatency = getNetworkLatency()
            
            val performanceData = mapOf(
                "cpuUsage" to cpuUsage,
                "memoryUsage" to memoryInfo.first,
                "totalMemory" to memoryInfo.second,
                "fps" to fps,
                "networkLatency" to networkLatency,
                "timestamp" to System.currentTimeMillis(),
                "pageName" to getCurrentPageName()
            )
            
            eventSink?.success(performanceData)
        } catch (e: Exception) {
            eventSink?.error("PERFORMANCE_ERROR", e.message, null)
        }
    }
    
    private fun getCpuUsage(): Double {
        // 获取CPU使用率的实现
        return try {
            val runtime = Runtime.getRuntime()
            val usedMemory = runtime.totalMemory() - runtime.freeMemory()
            val maxMemory = runtime.maxMemory()
            (usedMemory.toDouble() / maxMemory.toDouble()) * 100
        } catch (e: Exception) {
            0.0
        }
    }
    
    private fun getMemoryInfo(): Pair<Long, Long> {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)
        
        val usedMemory = memoryInfo.totalMem - memoryInfo.availMem
        return Pair(usedMemory, memoryInfo.totalMem)
    }
    
    private fun getFps(): Double {
        // 获取FPS的实现
        return activity?.let {
            // 使用Choreographer或其他方式计算FPS
            60.0 // 默认返回60FPS
        } ?: 0.0
    }
    
    private fun getNetworkLatency(): Int {
        // 获取网络延迟的实现
        return 0 // 默认返回0
    }
    
    private fun getCurrentPageName(): String? {
        return activity?.let { 
            it.javaClass.simpleName
        }
    }
}
```

#### 崩溃处理器 (`CrashHandler.kt`)
```kotlin
class CrashHandler(private val context: Context) : Thread.UncaughtExceptionHandler {
    private var eventSink: EventChannel.EventSink? = null
    private var defaultExceptionHandler: Thread.UncaughtExceptionHandler? = null
    
    fun initialize(eventChannel: EventChannel?) {
        eventChannel?.setStreamHandler(object : EventChannel.StreamHandler {
            override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                eventSink = events
                setupCrashHandler()
            }
            
            override fun onCancel(arguments: Any?) {
                eventSink = null
                restoreDefaultHandler()
            }
        })
    }
    
    private fun setupCrashHandler() {
        defaultExceptionHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler(this)
    }
    
    private fun restoreDefaultHandler() {
        defaultExceptionHandler?.let {
            Thread.setDefaultUncaughtExceptionHandler(it)
        }
    }
    
    override fun uncaughtException(thread: Thread, exception: Throwable) {
        try {
            val crashReport = createCrashReport(exception)
            eventSink?.success(crashReport)
            
            // 保存崩溃信息到本地
            saveCrashToLocal(crashReport)
        } catch (e: Exception) {
            // 处理崩溃报告生成失败的情况
        } finally {
            // 调用默认的异常处理器
            defaultExceptionHandler?.uncaughtException(thread, exception)
        }
    }
    
    private fun createCrashReport(exception: Throwable): Map<String, Any> {
        return mapOf(
            "crashId" to UUID.randomUUID().toString(),
            "type" to exception.javaClass.simpleName,
            "message" to (exception.message ?: ""),
            "stackTrace" to getStackTraceString(exception),
            "timestamp" to System.currentTimeMillis(),
            "appVersion" to getAppVersion(),
            "deviceModel" to Build.MODEL,
            "osVersion" to Build.VERSION.RELEASE,
            "customData" to getCustomData()
        )
    }
    
    private fun getStackTraceString(exception: Throwable): String {
        val stringWriter = StringWriter()
        val printWriter = PrintWriter(stringWriter)
        exception.printStackTrace(printWriter)
        return stringWriter.toString()
    }
    
    private fun getAppVersion(): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            packageInfo.versionName ?: "unknown"
        } catch (e: Exception) {
            "unknown"
        }
    }
    
    private fun getCustomData(): Map<String, Any> {
        return mapOf(
            "freeMemory" to Runtime.getRuntime().freeMemory(),
            "totalMemory" to Runtime.getRuntime().totalMemory(),
            "maxMemory" to Runtime.getRuntime().maxMemory()
        )
    }
    
    private fun saveCrashToLocal(crashReport: Map<String, Any>) {
        // 将崩溃信息保存到本地文件
        // 用于离线上报
    }
}
```

### 3. iOS端实现

#### 主插件类 (`KitAppMonitorPlugin.swift`)
```swift
public class KitAppMonitorPlugin: NSObject, FlutterPlugin {
    private var performanceMonitor: PerformanceMonitor?
    private var crashHandler: CrashHandler?
    private var behaviorTracker: BehaviorTracker?
    
    public static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(name: "kit_app_monitor", 
                                         binaryMessenger: registrar.messenger())
        let instance = KitAppMonitorPlugin()
        registrar.addMethodCallDelegate(instance, channel: channel)
        
        instance.setupEventChannels(with: registrar.messenger())
    }
    
    private func setupEventChannels(with messenger: FlutterBinaryMessenger) {
        let performanceChannel = FlutterEventChannel(name: "kit_app_monitor/performance", 
                                                   binaryMessenger: messenger)
        let crashChannel = FlutterEventChannel(name: "kit_app_monitor/crash", 
                                             binaryMessenger: messenger)
        let behaviorChannel = FlutterEventChannel(name: "kit_app_monitor/behavior", 
                                                binaryMessenger: messenger)
        
        performanceMonitor = PerformanceMonitor()
        crashHandler = CrashHandler()
        behaviorTracker = BehaviorTracker()
        
        performanceChannel.setStreamHandler(performanceMonitor)
        crashChannel.setStreamHandler(crashHandler)
        behaviorChannel.setStreamHandler(behaviorTracker)
    }
    
    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "initialize":
            initialize(call: call, result: result)
        case "setUserId":
            setUserId(call: call, result: result)
        case "recordEvent":
            recordEvent(call: call, result: result)
        case "recordPageView":
            recordPageView(call: call, result: result)
        case "flush":
            flush(result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }
    
    private func initialize(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any] else {
            result(FlutterError(code: "INVALID_ARGUMENTS", 
                               message: "Invalid arguments", 
                               details: nil))
            return
        }
        
        let enablePerformanceMonitoring = args["enablePerformanceMonitoring"] as? Bool ?? true
        let enableCrashReporting = args["enableCrashReporting"] as? Bool ?? true
        let enableBehaviorTracking = args["enableBehaviorTracking"] as? Bool ?? true
        
        if enablePerformanceMonitoring {
            performanceMonitor?.startMonitoring()
        }
        
        if enableCrashReporting {
            crashHandler?.setupCrashHandler()
        }
        
        if enableBehaviorTracking {
            behaviorTracker?.startTracking()
        }
        
        result(true)
    }
}
```

## 使用示例

### 基础使用
```dart
class MonitorExample extends StatefulWidget {
  @override
  _MonitorExampleState createState() => _MonitorExampleState();
}

class _MonitorExampleState extends State<MonitorExample> {
  StreamSubscription<PerformanceData>? _performanceSubscription;
  StreamSubscription<CrashReport>? _crashSubscription;
  
  @override
  void initState() {
    super.initState();
    _initializeMonitoring();
  }
  
  Future<void> _initializeMonitoring() async {
    // 初始化监控
    await KitAppMonitor.initialize(
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      enableBehaviorTracking: true,
      userId: 'user_123',
      customProperties: {
        'app_version': '1.0.0',
        'build_number': '100',
      },
    );
    
    // 监听性能数据
    _performanceSubscription = KitAppMonitor.performanceStream.listen((data) {
      if (data.isHighCpuUsage || data.isHighMemoryUsage || data.isLowFps) {
        _handlePerformanceIssue(data);
      }
    });
    
    // 监听崩溃报告
    _crashSubscription = KitAppMonitor.crashStream.listen((crash) {
      _handleCrashReport(crash);
    });
    
    // 记录应用启动事件
    await KitAppMonitor.recordEvent('app_start', {
      'launch_time': DateTime.now().millisecondsSinceEpoch,
      'is_cold_start': true,
    });
  }
  
  void _handlePerformanceIssue(PerformanceData data) {
    // 处理性能问题
    print('Performance issue detected: '
          'CPU: ${data.cpuUsage}%, '
          'Memory: ${data.memoryUsagePercentage}%, '
          'FPS: ${data.fps}');
    
    // 记录性能问题事件
    KitAppMonitor.recordEvent('performance_issue', {
      'cpu_usage': data.cpuUsage,
      'memory_usage': data.memoryUsagePercentage,
      'fps': data.fps,
      'page_name': data.pageName,
    });
  }
  
  void _handleCrashReport(CrashReport crash) {
    // 处理崩溃报告
    print('Crash detected: ${crash.type} - ${crash.message}');
    
    // 可以在这里实现自定义的崩溃处理逻辑
    // 例如发送到自定义的崩溃收集服务
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Monitor Example')),
      body: Column(
        children: [
          ElevatedButton(
            onPressed: () => _simulateHighCpuUsage(),
            child: Text('Simulate High CPU'),
          ),
          ElevatedButton(
            onPressed: () => _simulateMemoryLeak(),
            child: Text('Simulate Memory Issue'),
          ),
          ElevatedButton(
            onPressed: () => _simulateCrash(),
            child: Text('Simulate Crash'),
          ),
          ElevatedButton(
            onPressed: () => _recordCustomEvent(),
            child: Text('Record Custom Event'),
          ),
        ],
      ),
    );
  }
  
  void _simulateHighCpuUsage() {
    // 模拟高CPU使用
    Timer.periodic(Duration(milliseconds: 1), (timer) {
      // 执行密集计算
      for (int i = 0; i < 1000000; i++) {
        math.sqrt(i);
      }
      
      if (timer.tick > 1000) {
        timer.cancel();
      }
    });
  }
  
  void _simulateMemoryLeak() {
    // 模拟内存泄漏
    List<List<int>> memoryHog = [];
    for (int i = 0; i < 1000; i++) {
      memoryHog.add(List.filled(1000000, i));
    }
  }
  
  void _simulateCrash() {
    // 模拟崩溃
    throw Exception('Simulated crash for testing');
  }
  
  void _recordCustomEvent() {
    KitAppMonitor.recordEvent('button_clicked', {
      'button_name': 'custom_event_button',
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'user_action': 'tap',
    });
  }
  
  @override
  void dispose() {
    _performanceSubscription?.cancel();
    _crashSubscription?.cancel();
    super.dispose();
  }
}
```

### 高级监控配置
```dart
class AdvancedMonitorConfig {
  static Future<void> setupAdvancedMonitoring() async {
    // 初始化高级监控配置
    await KitAppMonitor.initialize(
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      enableBehaviorTracking: true,
      userId: await _getUserId(),
      customProperties: await _getCustomProperties(),
    );
    
    // 设置性能监控阈值
    _setupPerformanceThresholds();
    
    // 设置自动页面跟踪
    _setupAutomaticPageTracking();
    
    // 设置网络监控
    _setupNetworkMonitoring();
  }
  
  static void _setupPerformanceThresholds() {
    KitAppMonitor.performanceStream.listen((data) {
      // CPU使用率过高
      if (data.cpuUsage > 80) {
        KitAppMonitor.recordEvent('high_cpu_usage', {
          'cpu_usage': data.cpuUsage,
          'page_name': data.pageName,
          'severity': 'warning',
        });
      }
      
      // 内存使用率过高
      if (data.memoryUsagePercentage > 90) {
        KitAppMonitor.recordEvent('high_memory_usage', {
          'memory_usage': data.memoryUsagePercentage,
          'total_memory': data.totalMemory,
          'severity': 'critical',
        });
      }
      
      // FPS过低
      if (data.fps < 30) {
        KitAppMonitor.recordEvent('low_fps', {
          'fps': data.fps,
          'page_name': data.pageName,
          'severity': 'warning',
        });
      }
    });
  }
  
  static void _setupAutomaticPageTracking() {
    // 可以与路由系统集成，自动记录页面访问
    // 这里是一个简化的示例
    NavigatorObserver observer = RouteObserver<PageRoute<dynamic>>();
    // 实现路由监听，自动调用 KitAppMonitor.recordPageView
  }
  
  static void _setupNetworkMonitoring() {
    // 可以与网络请求库集成，自动记录网络请求
    // 例如与 Dio 集成
    // dio.interceptors.add(MonitoringInterceptor());
  }
  
  static Future<String> _getUserId() async {
    // 获取用户ID的逻辑
    return 'user_123';
  }
  
  static Future<Map<String, dynamic>> _getCustomProperties() async {
    return {
      'app_version': await _getAppVersion(),
      'device_model': await _getDeviceModel(),
      'os_version': await _getOSVersion(),
      'network_type': await _getNetworkType(),
    };
  }
}
```

## 性能优化

### 数据采集优化
- **采样策略**: 根据性能影响调整数据采集频率
- **批量上报**: 批量发送监控数据减少网络请求
- **本地缓存**: 离线时缓存数据，联网后上报
- **数据压缩**: 压缩监控数据减少传输量

### 内存管理
- **及时清理**: 及时清理监控数据和临时对象
- **内存监控**: 监控自身内存使用避免影响应用
- **弱引用**: 使用弱引用避免内存泄漏
- **资源复用**: 复用监控相关对象

## 安全和隐私

### 数据安全
- **敏感信息过滤**: 过滤用户敏感信息
- **数据加密**: 加密存储和传输监控数据
- **访问控制**: 严格的数据访问权限控制
- **数据脱敏**: 对敏感数据进行脱敏处理

### 隐私合规
- **用户同意**: 明确的数据收集用户同意
- **数据最小化**: 仅收集必要的监控数据
- **透明度**: 清晰的隐私政策说明
- **用户控制**: 用户可控制监控功能开关

## 总结

`kit_app_monitor` 模块作为 OneApp 的应用监控工具包，提供了全面的应用性能监控、异常检测和用户行为分析能力。通过原生平台的深度集成，实现了高效、准确的应用监控功能。模块具有良好的性能优化和隐私保护机制，能够帮助开发团队及时发现和解决应用问题，提升用户体验。
