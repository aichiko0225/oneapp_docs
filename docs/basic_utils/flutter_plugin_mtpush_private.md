# Flutter Plugin MTPush Private 美团云推送插件

## 模块概述

`flutter_plugin_mtpush_private` 是 OneApp 基础工具模块群中的美团云推送私有版插件，基于 EngageLab 的推送服务开发。该插件为 Flutter 应用提供了完整的推送消息功能，包括通知推送、透传消息、标签管理等功能，支持 Android 和 iOS 双平台。

### 基本信息
- **模块名称**: flutter_plugin_mtpush_private
- **版本**: 3.0.1+2
- **类型**: Flutter Plugin（原生插件）
- **描述**: 美团云推送私有版插件
- **Flutter 版本**: >=1.20.0
- **Dart 版本**: >=2.12.0 <4.0.0
- **服务提供商**: EngageLab (https://www.engagelab.com/)

## 功能特性

### 核心功能
1. **推送消息接收**
   - 通知消息接收和展示
   - 透传消息接收和处理
   - 富媒体消息支持
   - 自定义消息格式

2. **设备管理**
   - 设备注册和注销
   - 设备别名设置
   - 设备标签管理
   - 推送开关控制

3. **标签和别名**
   - 用户标签设置
   - 别名绑定管理
   - 标签分组推送
   - 个性化推送

4. **统计和分析**
   - 推送到达统计
   - 用户点击统计
   - 设备活跃统计
   - 自定义事件统计

## 技术架构

### 目录结构
```
flutter_plugin_mtpush_private/
├── lib/                        # Dart代码
│   ├── flutter_plugin_mtpush_private.dart # 插件入口
│   ├── src/                    # 源代码
│   │   ├── mtpush_flutter.dart # 主要接口
│   │   ├── mtpush_models.dart  # 数据模型
│   │   ├── mtpush_constants.dart # 常量定义
│   │   └── mtpush_utils.dart   # 工具类
│   └── flutter_plugin_mtpush_private_platform_interface.dart
├── android/                    # Android原生实现
│   ├── src/main/kotlin/
│   │   └── com/engagelab/privates/flutter_plugin_mtpush_private/
│   │       ├── FlutterPluginMTPushPrivatePlugin.kt
│   │       ├── MTPushReceiver.kt
│   │       ├── NotificationHelper.kt
│   │       └── Utils.kt
│   └── build.gradle
├── ios/                        # iOS原生实现
│   ├── Classes/
│   │   ├── FlutterPluginMTPushPrivatePlugin.h
│   │   ├── FlutterPluginMTPushPrivatePlugin.m
│   │   ├── MTPushNotificationDelegate.h
│   │   └── MTPushNotificationDelegate.m
│   └── flutter_plugin_mtpush_private.podspec
├── example/                    # 示例应用
└── test/                       # 测试文件
```

### 依赖关系

#### 核心依赖
- Flutter SDK

#### 原生 SDK 依赖
- **Android**: EngageLab Android Push SDK
- **iOS**: EngageLab iOS Push SDK

## 核心模块分析

### 1. Flutter端实现

#### 主接口 (`src/mtpush_flutter.dart`)
```dart
class MTFlutterPush {
  static const MethodChannel _channel = 
      MethodChannel('flutter_plugin_mtpush_private');
  
  static const EventChannel _eventChannel = 
      EventChannel('flutter_plugin_mtpush_private_event');
  
  // 初始化推送服务
  static Future<void> initialize({
    required String appKey,
    required String appSecret,
    String? channel,
    bool enableDebug = false,
  }) async {
    await _channel.invokeMethod('initialize', {
      'appKey': appKey,
      'appSecret': appSecret,
      'channel': channel ?? 'default',
      'enableDebug': enableDebug,
    });
  }
  
  // 获取设备注册ID
  static Future<String?> getRegistrationId() async {
    return await _channel.invokeMethod('getRegistrationId');
  }
  
  // 设置别名
  static Future<bool> setAlias(String alias) async {
    final result = await _channel.invokeMethod('setAlias', {'alias': alias});
    return result == true;
  }
  
  // 删除别名
  static Future<bool> deleteAlias() async {
    final result = await _channel.invokeMethod('deleteAlias');
    return result == true;
  }
  
  // 设置标签
  static Future<bool> setTags(Set<String> tags) async {
    final result = await _channel.invokeMethod('setTags', {'tags': tags.toList()});
    return result == true;
  }
  
  // 添加标签
  static Future<bool> addTags(Set<String> tags) async {
    final result = await _channel.invokeMethod('addTags', {'tags': tags.toList()});
    return result == true;
  }
  
  // 删除标签
  static Future<bool> deleteTags(Set<String> tags) async {
    final result = await _channel.invokeMethod('deleteTags', {'tags': tags.toList()});
    return result == true;
  }
  
  // 清空所有标签
  static Future<bool> cleanTags() async {
    final result = await _channel.invokeMethod('cleanTags');
    return result == true;
  }
  
  // 获取所有标签
  static Future<Set<String>?> getAllTags() async {
    final result = await _channel.invokeMethod('getAllTags');
    if (result is List) {
      return result.cast<String>().toSet();
    }
    return null;
  }
  
  // 开启推送
  static Future<void> resumePush() async {
    await _channel.invokeMethod('resumePush');
  }
  
  // 停止推送
  static Future<void> stopPush() async {
    await _channel.invokeMethod('stopPush');
  }
  
  // 检查推送是否停止
  static Future<bool> isPushStopped() async {
    final result = await _channel.invokeMethod('isPushStopped');
    return result == true;
  }
  
  // 发送本地通知
  static Future<void> sendLocalNotification(LocalNotification notification) async {
    await _channel.invokeMethod('sendLocalNotification', notification.toMap());
  }
  
  // 添加推送消息监听器
  static void addReceiveNotificationListener(
    void Function(Map<String, dynamic> message) onReceive,
  ) {
    _eventChannel.receiveBroadcastStream('receiveNotification').listen((data) {
      if (data is Map<String, dynamic>) {
        onReceive(data);
      }
    });
  }
  
  // 添加推送消息点击监听器
  static void addReceiveOpenNotificationListener(
    void Function(Map<String, dynamic> message) onOpen,
  ) {
    _eventChannel.receiveBroadcastStream('openNotification').listen((data) {
      if (data is Map<String, dynamic>) {
        onOpen(data);
      }
    });
  }
  
  // 添加透传消息监听器
  static void addReceiveMessageListener(
    void Function(Map<String, dynamic> message) onMessage,
  ) {
    _eventChannel.receiveBroadcastStream('receiveMessage').listen((data) {
      if (data is Map<String, dynamic>) {
        onMessage(data);
      }
    });
  }
  
  // 设置通知栏样式
  static Future<void> setNotificationStyle({
    int? notificationStyle,
    int? notificationMaxNumber,
  }) async {
    await _channel.invokeMethod('setNotificationStyle', {
      'notificationStyle': notificationStyle,
      'notificationMaxNumber': notificationMaxNumber,
    });
  }
  
  // 设置静默时间
  static Future<void> setSilenceTime({
    required int startHour,
    required int startMinute,
    required int endHour,
    required int endMinute,
  }) async {
    await _channel.invokeMethod('setSilenceTime', {
      'startHour': startHour,
      'startMinute': startMinute,
      'endHour': endHour,
      'endMinute': endMinute,
    });
  }
  
  // 清理通知
  static Future<void> clearAllNotifications() async {
    await _channel.invokeMethod('clearAllNotifications');
  }
  
  // 清理指定通知
  static Future<void> clearNotificationById(int notificationId) async {
    await _channel.invokeMethod('clearNotificationById', {
      'notificationId': notificationId,
    });
  }
}
```

#### 数据模型 (`src/mtpush_models.dart`)
```dart
class LocalNotification {
  final int id;
  final String title;
  final String content;
  final String? subtitle;
  final Map<String, dynamic>? extras;
  final DateTime? fireTime;
  final int? builderId;
  
  const LocalNotification({
    required this.id,
    required this.title,
    required this.content,
    this.subtitle,
    this.extras,
    this.fireTime,
    this.builderId,
  });
  
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'subtitle': subtitle,
      'extras': extras,
      'fireTime': fireTime?.millisecondsSinceEpoch,
      'builderId': builderId,
    };
  }
  
  factory LocalNotification.fromMap(Map<String, dynamic> map) {
    return LocalNotification(
      id: map['id'] as int,
      title: map['title'] as String,
      content: map['content'] as String,
      subtitle: map['subtitle'] as String?,
      extras: map['extras'] as Map<String, dynamic>?,
      fireTime: map['fireTime'] != null ? 
          DateTime.fromMillisecondsSinceEpoch(map['fireTime'] as int) : null,
      builderId: map['builderId'] as int?,
    );
  }
}

class PushMessage {
  final String messageId;
  final String title;
  final String content;
  final Map<String, dynamic> extras;
  final int platform;
  final DateTime receivedTime;
  
  const PushMessage({
    required this.messageId,
    required this.title,
    required this.content,
    required this.extras,
    required this.platform,
    required this.receivedTime,
  });
  
  factory PushMessage.fromMap(Map<String, dynamic> map) {
    return PushMessage(
      messageId: map['messageId'] as String,
      title: map['title'] as String,
      content: map['content'] as String,
      extras: map['extras'] as Map<String, dynamic>? ?? {},
      platform: map['platform'] as int,
      receivedTime: DateTime.fromMillisecondsSinceEpoch(
        map['receivedTime'] as int,
      ),
    );
  }
  
  Map<String, dynamic> toMap() {
    return {
      'messageId': messageId,
      'title': title,
      'content': content,
      'extras': extras,
      'platform': platform,
      'receivedTime': receivedTime.millisecondsSinceEpoch,
    };
  }
}

class TagAliasResult {
  final bool success;
  final String? errorMessage;
  final int? errorCode;
  final Set<String>? tags;
  final String? alias;
  
  const TagAliasResult({
    required this.success,
    this.errorMessage,
    this.errorCode,
    this.tags,
    this.alias,
  });
  
  factory TagAliasResult.fromMap(Map<String, dynamic> map) {
    return TagAliasResult(
      success: map['success'] as bool,
      errorMessage: map['errorMessage'] as String?,
      errorCode: map['errorCode'] as int?,
      tags: (map['tags'] as List<dynamic>?)?.cast<String>().toSet(),
      alias: map['alias'] as String?,
    );
  }
}
```

### 2. Android端实现

#### 主插件类 (`FlutterPluginMTPushPrivatePlugin.kt`)
```kotlin
class FlutterPluginMTPushPrivatePlugin: FlutterPlugin, MethodCallHandler {
    private lateinit var channel: MethodChannel
    private lateinit var eventChannel: EventChannel
    private lateinit var context: Context
    private var eventSink: EventChannel.EventSink? = null

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(binding.binaryMessenger, "flutter_plugin_mtpush_private")
        eventChannel = EventChannel(binding.binaryMessenger, "flutter_plugin_mtpush_private_event")
        
        context = binding.applicationContext
        channel.setMethodCallHandler(this)
        
        eventChannel.setStreamHandler(object : EventChannel.StreamHandler {
            override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                eventSink = events
            }
            
            override fun onCancel(arguments: Any?) {
                eventSink = null
            }
        })
        
        // 设置推送消息接收器
        MTPushReceiver.setEventSink(eventSink)
    }

    override fun onMethodCall(call: MethodCall, result: Result) {
        when (call.method) {
            "initialize" -> initialize(call, result)
            "getRegistrationId" -> getRegistrationId(result)
            "setAlias" -> setAlias(call, result)
            "deleteAlias" -> deleteAlias(result)
            "setTags" -> setTags(call, result)
            "addTags" -> addTags(call, result)
            "deleteTags" -> deleteTags(call, result)
            "cleanTags" -> cleanTags(result)
            "getAllTags" -> getAllTags(result)
            "resumePush" -> resumePush(result)
            "stopPush" -> stopPush(result)
            "isPushStopped" -> isPushStopped(result)
            "sendLocalNotification" -> sendLocalNotification(call, result)
            "setNotificationStyle" -> setNotificationStyle(call, result)
            "setSilenceTime" -> setSilenceTime(call, result)
            "clearAllNotifications" -> clearAllNotifications(result)
            "clearNotificationById" -> clearNotificationById(call, result)
            else -> result.notImplemented()
        }
    }
    
    private fun initialize(call: MethodCall, result: Result) {
        val appKey = call.argument<String>("appKey")
        val appSecret = call.argument<String>("appSecret")
        val channel = call.argument<String>("channel") ?: "default"
        val enableDebug = call.argument<Boolean>("enableDebug") ?: false
        
        if (appKey == null || appSecret == null) {
            result.error("INVALID_ARGUMENTS", "AppKey and AppSecret are required", null)
            return
        }
        
        try {
            // 初始化美团云推送SDK
            MTPushInterface.setDebugMode(enableDebug)
            MTPushInterface.init(context, appKey, appSecret, channel)
            
            // 注册推送服务
            MTPushInterface.register(context)
            
            result.success(true)
        } catch (e: Exception) {
            result.error("INITIALIZATION_FAILED", e.message, null)
        }
    }
    
    private fun getRegistrationId(result: Result) {
        val registrationId = MTPushInterface.getRegistrationId(context)
        result.success(registrationId)
    }
    
    private fun setAlias(call: MethodCall, result: Result) {
        val alias = call.argument<String>("alias")
        if (alias == null) {
            result.error("INVALID_ARGUMENTS", "Alias is required", null)
            return
        }
        
        MTPushInterface.setAlias(context, alias, object : TagAliasCallback {
            override fun gotResult(code: Int, alias: String?, tags: MutableSet<String>?) {
                result.success(code == 0)
            }
        })
    }
    
    private fun setTags(call: MethodCall, result: Result) {
        val tagsList = call.argument<List<String>>("tags")
        if (tagsList == null) {
            result.error("INVALID_ARGUMENTS", "Tags are required", null)
            return
        }
        
        val tags = tagsList.toMutableSet()
        MTPushInterface.setTags(context, tags, object : TagAliasCallback {
            override fun gotResult(code: Int, alias: String?, tags: MutableSet<String>?) {
                result.success(code == 0)
            }
        })
    }
    
    private fun sendLocalNotification(call: MethodCall, result: Result) {
        val id = call.argument<Int>("id") ?: 0
        val title = call.argument<String>("title")
        val content = call.argument<String>("content")
        val fireTime = call.argument<Long>("fireTime")
        
        if (title == null || content == null) {
            result.error("INVALID_ARGUMENTS", "Title and content are required", null)
            return
        }
        
        val notification = LocalNotification.Builder(context)
            .setNotificationId(id)
            .setTitle(title)
            .setContent(content)
        
        fireTime?.let {
            notification.setFireTime(Date(it))
        }
        
        MTPushInterface.addLocalNotification(context, notification.build())
        result.success(true)
    }
}
```

#### 推送消息接收器 (`MTPushReceiver.kt`)
```kotlin
class MTPushReceiver : BroadcastReceiver() {
    companion object {
        private var eventSink: EventChannel.EventSink? = null
        
        fun setEventSink(sink: EventChannel.EventSink?) {
            eventSink = sink
        }
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        val bundle = intent.extras ?: return
        
        when (intent.action) {
            MTPushInterface.ACTION_REGISTRATION_ID -> {
                handleRegistration(bundle)
            }
            MTPushInterface.ACTION_MESSAGE_RECEIVED -> {
                handleMessageReceived(bundle)
            }
            MTPushInterface.ACTION_NOTIFICATION_RECEIVED -> {
                handleNotificationReceived(bundle)
            }
            MTPushInterface.ACTION_NOTIFICATION_OPENED -> {
                handleNotificationOpened(bundle)
            }
        }
    }
    
    private fun handleRegistration(bundle: Bundle) {
        val registrationId = bundle.getString(MTPushInterface.EXTRA_REGISTRATION_ID)
        // 处理注册ID
    }
    
    private fun handleMessageReceived(bundle: Bundle) {
        val message = parseMessage(bundle)
        eventSink?.success(mapOf(
            "event" to "receiveMessage",
            "data" to message
        ))
    }
    
    private fun handleNotificationReceived(bundle: Bundle) {
        val notification = parseNotification(bundle)
        eventSink?.success(mapOf(
            "event" to "receiveNotification",
            "data" to notification
        ))
    }
    
    private fun handleNotificationOpened(bundle: Bundle) {
        val notification = parseNotification(bundle)
        eventSink?.success(mapOf(
            "event" to "openNotification",
            "data" to notification
        ))
    }
    
    private fun parseMessage(bundle: Bundle): Map<String, Any> {
        return mapOf(
            "messageId" to (bundle.getString(MTPushInterface.EXTRA_MSG_ID) ?: ""),
            "title" to (bundle.getString(MTPushInterface.EXTRA_TITLE) ?: ""),
            "content" to (bundle.getString(MTPushInterface.EXTRA_MESSAGE) ?: ""),
            "extras" to parseExtras(bundle),
            "platform" to 0, // Android
            "receivedTime" to System.currentTimeMillis()
        )
    }
    
    private fun parseNotification(bundle: Bundle): Map<String, Any> {
        return mapOf(
            "messageId" to (bundle.getString(MTPushInterface.EXTRA_MSG_ID) ?: ""),
            "title" to (bundle.getString(MTPushInterface.EXTRA_NOTIFICATION_TITLE) ?: ""),
            "content" to (bundle.getString(MTPushInterface.EXTRA_ALERT) ?: ""),
            "extras" to parseExtras(bundle),
            "platform" to 0, // Android
            "receivedTime" to System.currentTimeMillis()
        )
    }
    
    private fun parseExtras(bundle: Bundle): Map<String, Any> {
        val extras = mutableMapOf<String, Any>()
        val extrasString = bundle.getString(MTPushInterface.EXTRA_EXTRA)
        
        extrasString?.let {
            try {
                val jsonObject = JSONObject(it)
                val keys = jsonObject.keys()
                while (keys.hasNext()) {
                    val key = keys.next()
                    extras[key] = jsonObject.get(key)
                }
            } catch (e: JSONException) {
                // 解析失败，返回空Map
            }
        }
        
        return extras
    }
}
```

### 3. iOS端实现

#### 主插件类 (`FlutterPluginMTPushPrivatePlugin.m`)
```objc
@implementation FlutterPluginMTPushPrivatePlugin

+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
    FlutterMethodChannel* channel = [FlutterMethodChannel
        methodChannelWithName:@"flutter_plugin_mtpush_private"
              binaryMessenger:[registrar messenger]];
              
    FlutterEventChannel* eventChannel = [FlutterEventChannel
        eventChannelWithName:@"flutter_plugin_mtpush_private_event"
              binaryMessenger:[registrar messenger]];
              
    FlutterPluginMTPushPrivatePlugin* instance = [[FlutterPluginMTPushPrivatePlugin alloc] init];
    [registrar addMethodCallDelegate:instance channel:channel];
    [eventChannel setStreamHandler:instance];
}

- (void)handleMethodCall:(FlutterMethodCall*)call result:(FlutterResult)result {
    if ([@"initialize" isEqualToString:call.method]) {
        [self initialize:call result:result];
    } else if ([@"getRegistrationId" isEqualToString:call.method]) {
        [self getRegistrationId:result];
    } else if ([@"setAlias" isEqualToString:call.method]) {
        [self setAlias:call result:result];
    } else if ([@"setTags" isEqualToString:call.method]) {
        [self setTags:call result:result];
    } else if ([@"sendLocalNotification" isEqualToString:call.method]) {
        [self sendLocalNotification:call result:result];
    } else {
        result(FlutterMethodNotImplemented);
    }
}

- (void)initialize:(FlutterMethodCall*)call result:(FlutterResult)result {
    NSString* appKey = call.arguments[@"appKey"];
    NSString* appSecret = call.arguments[@"appSecret"];
    NSString* channel = call.arguments[@"channel"] ?: @"default";
    BOOL enableDebug = [call.arguments[@"enableDebug"] boolValue];
    
    if (!appKey || !appSecret) {
        result([FlutterError errorWithCode:@"INVALID_ARGUMENTS"
                                  message:@"AppKey and AppSecret are required"
                                  details:nil]);
        return;
    }
    
    // 初始化美团云推送SDK
    [MTPushService setupWithOption:nil
                            appKey:appKey
                            appSecret:appSecret
                            channel:channel
                            apsForProduction:NO];
    
    if (enableDebug) {
        [MTPushService setDebugMode];
    }
    
    // 注册推送服务
    [MTPushService registerForRemoteNotificationTypes:(UIUserNotificationTypeBadge |
                                                       UIUserNotificationTypeSound |
                                                       UIUserNotificationTypeAlert)
                                            categories:nil];
    
    result(@YES);
}

- (void)getRegistrationId:(FlutterResult)result {
    NSString* registrationId = [MTPushService registrationID];
    result(registrationId);
}

- (void)setAlias:(FlutterMethodCall*)call result:(FlutterResult)result {
    NSString* alias = call.arguments[@"alias"];
    
    [MTPushService setAlias:alias
                 completion:^(NSInteger iResCode, NSString *iAlias, NSInteger seq) {
                     result(@(iResCode == 0));
                 }
                        seq:0];
}

- (void)setTags:(FlutterMethodCall*)call result:(FlutterResult)result {
    NSArray* tagsArray = call.arguments[@"tags"];
    NSSet* tags = [NSSet setWithArray:tagsArray];
    
    [MTPushService setTags:tags
                completion:^(NSInteger iResCode, NSSet *iTags, NSInteger seq) {
                    result(@(iResCode == 0));
                }
                       seq:0];
}

#pragma mark - FlutterStreamHandler

- (FlutterError*)onListenWithArguments:(id)arguments eventSink:(FlutterEventSink)events {
    _eventSink = events;
    return nil;
}

- (FlutterError*)onCancelWithArguments:(id)arguments {
    _eventSink = nil;
    return nil;
}

@end
```

## 使用示例

### 基础推送功能
```dart
class PushExample extends StatefulWidget {
  @override
  _PushExampleState createState() => _PushExampleState();
}

class _PushExampleState extends State<PushExample> {
  String? _registrationId;
  List<PushMessage> _receivedMessages = [];
  
  @override
  void initState() {
    super.initState();
    _initializePush();
  }
  
  Future<void> _initializePush() async {
    // 初始化推送服务
    await MTFlutterPush.initialize(
      appKey: 'your_app_key',
      appSecret: 'your_app_secret',
      channel: 'default',
      enableDebug: true,
    );
    
    // 获取注册ID
    final regId = await MTFlutterPush.getRegistrationId();
    setState(() {
      _registrationId = regId;
    });
    
    // 设置用户别名
    await MTFlutterPush.setAlias('user_123');
    
    // 设置用户标签
    await MTFlutterPush.setTags({'VIP', 'iOS', 'Beijing'});
    
    // 监听推送消息
    _setupPushListeners();
  }
  
  void _setupPushListeners() {
    // 监听通知消息接收
    MTFlutterPush.addReceiveNotificationListener((message) {
      print('Received notification: $message');
      _addMessage(PushMessage.fromMap(message));
    });
    
    // 监听通知消息点击
    MTFlutterPush.addReceiveOpenNotificationListener((message) {
      print('Opened notification: $message');
      _handleNotificationClick(PushMessage.fromMap(message));
    });
    
    // 监听透传消息
    MTFlutterPush.addReceiveMessageListener((message) {
      print('Received message: $message');
      _handleTransparentMessage(PushMessage.fromMap(message));
    });
  }
  
  void _addMessage(PushMessage message) {
    setState(() {
      _receivedMessages.insert(0, message);
    });
  }
  
  void _handleNotificationClick(PushMessage message) {
    // 处理通知点击事件
    if (message.extras.containsKey('page')) {
      String targetPage = message.extras['page'];
      // 根据页面参数进行跳转
      _navigateToPage(targetPage);
    }
  }
  
  void _handleTransparentMessage(PushMessage message) {
    // 处理透传消息
    if (message.extras.containsKey('action')) {
      String action = message.extras['action'];
      switch (action) {
        case 'refresh_data':
          _refreshAppData();
          break;
        case 'show_dialog':
          _showCustomDialog(message.content);
          break;
      }
    }
  }
  
  void _navigateToPage(String page) {
    // 页面跳转逻辑
  }
  
  void _refreshAppData() {
    // 刷新应用数据
  }
  
  void _showCustomDialog(String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('推送消息'),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('确定'),
          ),
        ],
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('推送示例')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('注册ID: ${_registrationId ?? "获取中..."}'),
                SizedBox(height: 16),
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: _sendLocalNotification,
                      child: Text('发送本地通知'),
                    ),
                    SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _clearAllNotifications,
                      child: Text('清除所有通知'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _receivedMessages.length,
              itemBuilder: (context, index) {
                final message = _receivedMessages[index];
                return ListTile(
                  title: Text(message.title),
                  subtitle: Text(message.content),
                  trailing: Text(
                    DateFormat('HH:mm:ss').format(message.receivedTime),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
  
  void _sendLocalNotification() {
    final notification = LocalNotification(
      id: DateTime.now().millisecondsSinceEpoch,
      title: '本地通知',
      content: '这是一条本地推送通知',
      fireTime: DateTime.now().add(Duration(seconds: 5)),
    );
    
    MTFlutterPush.sendLocalNotification(notification);
  }
  
  void _clearAllNotifications() {
    MTFlutterPush.clearAllNotifications();
  }
}
```

### 高级推送管理
```dart
class AdvancedPushManager {
  static final AdvancedPushManager _instance = AdvancedPushManager._internal();
  factory AdvancedPushManager() => _instance;
  AdvancedPushManager._internal();
  
  bool _isInitialized = false;
  String? _currentUserId;
  Set<String> _currentTags = {};
  
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    await MTFlutterPush.initialize(
      appKey: Config.mtpushAppKey,
      appSecret: Config.mtpushAppSecret,
      enableDebug: Config.isDebugMode,
    );
    
    _setupMessageHandlers();
    _isInitialized = true;
  }
  
  Future<void> setUser({
    required String userId,
    Set<String>? tags,
    Map<String, dynamic>? userInfo,
  }) async {
    _currentUserId = userId;
    
    // 设置别名
    await MTFlutterPush.setAlias(userId);
    
    // 设置标签
    if (tags != null) {
      _currentTags = tags;
      await MTFlutterPush.setTags(tags);
    }
    
    // 可以将用户信息发送到服务器
    if (userInfo != null) {
      await _uploadUserInfo(userId, userInfo);
    }
  }
  
  Future<void> addUserTags(Set<String> tags) async {
    _currentTags.addAll(tags);
    await MTFlutterPush.addTags(tags);
  }
  
  Future<void> removeUserTags(Set<String> tags) async {
    _currentTags.removeAll(tags);
    await MTFlutterPush.deleteTags(tags);
  }
  
  Future<void> logout() async {
    _currentUserId = null;
    _currentTags.clear();
    
    await MTFlutterPush.deleteAlias();
    await MTFlutterPush.cleanTags();
  }
  
  void _setupMessageHandlers() {
    // 设置通知消息处理
    MTFlutterPush.addReceiveNotificationListener(_handleNotification);
    MTFlutterPush.addReceiveOpenNotificationListener(_handleNotificationClick);
    MTFlutterPush.addReceiveMessageListener(_handleTransparentMessage);
  }
  
  void _handleNotification(Map<String, dynamic> message) {
    // 记录通知接收事件
    _trackEvent('notification_received', message);
    
    // 更新应用角标
    _updateAppBadge();
  }
  
  void _handleNotificationClick(Map<String, dynamic> message) {
    // 记录通知点击事件
    _trackEvent('notification_clicked', message);
    
    // 处理深度链接
    if (message['extras'] != null) {
      final extras = message['extras'] as Map<String, dynamic>;
      _handleDeepLink(extras);
    }
  }
  
  void _handleTransparentMessage(Map<String, dynamic> message) {
    // 记录透传消息事件
    _trackEvent('message_received', message);
    
    // 处理业务逻辑
    final extras = message['extras'] as Map<String, dynamic>? ?? {};
    _processBusinessMessage(extras);
  }
  
  void _handleDeepLink(Map<String, dynamic> extras) {
    if (extras.containsKey('deeplink')) {
      final deeplink = extras['deeplink'] as String;
      // 处理深度链接跳转
      DeepLinkHandler.handle(deeplink);
    }
  }
  
  void _processBusinessMessage(Map<String, dynamic> extras) {
    final action = extras['action'] as String?;
    
    switch (action) {
      case 'refresh_user_info':
        UserService.refreshUserInfo();
        break;
      case 'update_config':
        ConfigService.updateRemoteConfig();
        break;
      case 'force_logout':
        AuthService.forceLogout();
        break;
    }
  }
  
  void _trackEvent(String eventName, Map<String, dynamic> data) {
    // 发送事件统计
    AnalyticsService.trackEvent(eventName, data);
  }
  
  void _updateAppBadge() {
    // 更新应用角标数量
    // 可以调用原生方法或使用其他插件
  }
  
  Future<void> _uploadUserInfo(String userId, Map<String, dynamic> userInfo) async {
    // 将用户信息上传到推送服务器
    // 用于精准推送
  }
  
  Future<void> schedulePushSettings({
    int? silenceStartHour,
    int? silenceStartMinute,
    int? silenceEndHour,
    int? silenceEndMinute,
  }) async {
    if (silenceStartHour != null && silenceEndHour != null) {
      await MTFlutterPush.setSilenceTime(
        startHour: silenceStartHour,
        startMinute: silenceStartMinute ?? 0,
        endHour: silenceEndHour,
        endMinute: silenceEndMinute ?? 0,
      );
    }
  }
}
```

## 配置和部署

### Android配置
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

<application>
    <!-- 美团云推送服务配置 -->
    <meta-data
        android:name="MTPUSH_APPKEY"
        android:value="your_app_key" />
    <meta-data
        android:name="MTPUSH_CHANNEL"
        android:value="default" />
        
    <!-- 推送消息接收器 -->
    <receiver android:name="com.engagelab.privates.flutter_plugin_mtpush_private.MTPushReceiver">
        <intent-filter android:priority="1000">
            <action android:name="cn.mtpush.android.intent.REGISTRATION" />
            <action android:name="cn.mtpush.android.intent.MESSAGE_RECEIVED" />
            <action android:name="cn.mtpush.android.intent.NOTIFICATION_RECEIVED" />
            <action android:name="cn.mtpush.android.intent.NOTIFICATION_OPENED" />
            <category android:name="your_package_name" />
        </intent-filter>
    </receiver>
</application>
```

### iOS配置
```xml
<!-- ios/Runner/Info.plist -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

### 推送证书配置
- **开发环境**: 配置开发推送证书
- **生产环境**: 配置生产推送证书
- **证书管理**: 定期更新推送证书

## 安全特性

### 数据安全
- **传输加密**: 推送消息传输加密
- **身份验证**: 设备身份验证机制
- **防重放**: 防止推送消息重放攻击
- **数据校验**: 推送消息完整性校验

### 隐私保护
- **用户同意**: 明确的推送权限申请
- **数据最小化**: 仅收集必要的设备信息
- **匿名化**: 用户数据匿名化处理
- **透明度**: 清晰的隐私政策说明

## 性能优化

### 推送优化
- **智能推送**: 基于用户行为的智能推送
- **频率控制**: 推送频率限制机制
- **时段控制**: 静默时间设置
- **内容优化**: 推送内容个性化

### 资源管理
- **内存优化**: 及时释放推送相关资源
- **电池优化**: 减少推送服务电池消耗
- **网络优化**: 优化推送网络请求
- **存储优化**: 合理管理推送数据存储

## 总结

`flutter_plugin_mtpush_private` 模块作为 OneApp 的美团云推送私有版插件，提供了完整的跨平台推送解决方案。通过与 EngageLab 推送服务的深度集成，实现了高效、可靠的消息推送功能。模块支持丰富的推送类型、精准的用户定位和完善的统计分析，能够满足各种推送场景的需求。良好的安全保护和性能优化机制确保了推送服务的稳定性和用户体验。
