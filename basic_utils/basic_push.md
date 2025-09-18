# Basic Push - 推送通知模块文档

## 模块概述

`basic_push` 是 OneApp 基础工具模块群中的推送通知核心模块，提供统一的推送消息接收、处理和分发功能。该模块集成了极光推送SDK、本地通知、事件总线、心跳管理等功能，支持iOS和Android平台的推送服务。

### 基本信息
- **模块名称**: basic_push
- **模块路径**: oneapp_basic_utils/basic_push
- **类型**: Flutter Package Module
- **主要功能**: 推送消息接收、事件总线、本地通知、心跳管理

### 核心特性
- **推送服务集成**: 集成极光推送SDK，支持远程推送消息
- **事件总线系统**: 基于RxDart的事件发布订阅机制
- **本地通知**: 支持本地通知的发送和管理
- **心跳管理**: 前后台切换时的心跳上报机制
- **用户绑定**: 用户登录后的推送设备绑定和解绑
- **权限管理**: 推送权限检查和设置跳转
- **多平台支持**: iOS和Android平台适配

## 目录结构

```
basic_push/
├── lib/
│   ├── basic_push.dart             # 模块入口文件
│   └── src/
│       ├── push_facade.dart       # 推送门面服务
│       ├── push_topic.dart        # 主题定义
│       ├── push_config.dart       # 配置管理
│       ├── constant.dart          # 常量定义
│       ├── connector.dart         # 连接器
│       ├── channel/               # 通道实现
│       │   ├── core/
│       │   │   └── i_push_channel.dart
│       │   ├── push_channel.dart
│       │   └── local_channel.dart
│       ├── domain/                # 领域对象
│       │   ├── do/
│       │   │   ├── push/
│       │   │   │   ├── push_init_params.dart
│       │   │   │   └── query/
│       │   │   │       └── setting_push_query_do.dart
│       │   │   └── setting_has_success_do.dart
│       │   ├── errors/
│       │   │   └── setting_errors.dart
│       │   └── push_device_info.dart
│       ├── eventbus/              # 事件总线
│       │   ├── event_bus.dart
│       │   ├── event_bus.freezed.dart
│       │   └── event_bus.g.dart
│       ├── heart_beat/            # 心跳管理
│       │   └── heart_beat_mgmt.dart
│       ├── infrastructure/        # 基础设施层
│       │   ├── push_repository.dart
│       │   ├── remote_api.dart
│       │   └── remoteapi/
│       │       └── push_repository_remote.dart
│       └── push_parser/           # 消息解析
│           └── push_message_parser.dart
├── basic_push_uml.puml           # UML图定义
├── basic_push_uml.svg            # UML图
└── pubspec.yaml                  # 依赖配置
```

## 核心架构组件

### 1. 推送初始化参数 (PushInitParams)

定义推送服务初始化所需的参数：

```dart
/// 初始化需要的参数
class PushInitParams {
  const PushInitParams({
    this.privateCloud = true,
    this.isProduction = false,
    this.isDebug = false,
    this.appKey = '',
    this.channel = '',
    this.connIp = '',
    this.connHost,
    this.connPort = 0,
    this.reportUrl = '',
    this.badgeUrl = '',
    this.heartbeatInterval,
  });

  /// iOS环境：生产环境设置
  /// TestFlight/In-house/Ad-hoc/AppStore为生产环境(true)
  /// Xcode直接编译为开发环境(false)
  final bool isProduction;

  /// 是否是私有云
  final bool privateCloud;

  /// debug开关
  final bool isDebug;

  /// 应用Key
  final String appKey;

  /// 渠道标识
  final String channel;

  /// 连接IP地址
  final String connIp;

  /// 连接主机
  final String? connHost;

  /// 连接端口
  final int connPort;

  /// 上报URL
  final String reportUrl;

  /// 角标URL
  final String badgeUrl;

  /// 推送心跳间隔(毫秒)，默认4分50秒
  final int? heartbeatInterval;
}
```

### 2. 事件总线系统 (EventBus)

基于RxDart实现的事件发布订阅系统：

```dart
/// 事件总线接口
abstract class IEventBus {
  /// 监听多个主题的事件
  Stream<Event> on(List<Topic> topics);

  /// 发布新事件
  void fire(Event event);

  /// 销毁事件总线
  void destroy();

  /// 获取发送端口用于连接器连接
  SendPort get sendPort;
}

/// 事件总线实现
class EventBus implements IEventBus {
  factory EventBus({bool sync = false}) => EventBus._(
        PublishSubject<Event>(
          onListen: () => Logger.d('Event Bus has a listener', tag),
          onCancel: () => Logger.d('Event Bus has no listener', tag),
          sync: sync,
        ),
      );

  @override
  void fire(Event event) {
    Logger.d('Fire a event, $event');
    if (_checkEvent(event)) {
      streamController.add(event);
    }
  }

  @override
  Stream<Event> on(List<Topic> topics) =>
      streamController.stream.where((event) {
        final firstWhere = topics.firstWhere(
          (element) => (element & event.topic).isHit,
          orElse: Topic.zero,
        );
        return firstWhere != Topic.zero();
      });
}
```

### 3. 事件和主题定义 (Event & Topic)

使用Freezed定义的不可变数据类：

```dart
/// 事件对象
@freezed
class Event with _$Event {
  const factory Event({
    required Topic topic,
    required DateTime timestamp,
    dynamic payload,
    @Default('') String description,
    @Default(EventSource.local) EventSource sources,
    @Default(false) bool notificationInApp,
  }) = _Event;

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);
}

/// 主题对象
@freezed
class Topic with _$Topic {
  const factory Topic({
    @Default(maxInt) int scope,
    @Default(maxInt) int product,
    @Default(maxInt) int index,
    @Default(maxInt) int subIndex,
  }) = _Topic;

  const Topic._();

  factory Topic.zero() => const Topic(scope: 0, product: 0, index: 0, subIndex: 0);

  /// 主题合并操作
  Topic operator |(Topic other) => Topic(
        scope: scope | other.scope,
        product: product | other.product,
        index: index | other.index,
        subIndex: subIndex | other.subIndex,
      );

  /// 主题匹配操作
  Topic operator &(Topic other) => Topic(
        scope: scope & other.scope,
        product: product & other.product,
        index: index & other.index,
        subIndex: subIndex & other.subIndex,
      );

  /// 是否命中
  bool get isHit => scope > 0 && product > 0 && index > 0 && subIndex > 0;
}

/// 事件来源
enum EventSource {
  /// 远程推送
  push,
  /// 本地
  local,
}
```

### 4. 推送门面服务 (IPushFacade)

推送模块的核心接口定义：

```dart
/// push模块的接口
abstract class IPushFacade {
  /// 初始化模块
  /// 开启心跳上报
  void initPush({
    ILoginDeps loginDeps = const DefaultLoginDeps(),
    PushInitParams pushInitParams = const PushInitParams(),
  });

  /// 系统通知权限是否授予
  bool get isNotificationEnabled;

  /// 返回推送SDK里的regId
  Future<String?> get pushRegId;

  /// 调用此API跳转至系统设置中应用设置界面
  void openSettingsForNotification();

  /// 将bizId与推送regId传至服务端绑定
  Future<bool> bindPush();

  /// 将bizId与推送RegId传至服务端解绑
  Future<bool> unbindPush();

  /// 发布一个事件
  void postEvent({
    required Topic topic,
    dynamic payload,
    String description = '',
  });

  /// 订阅对应topic的事件消息
  Stream<Event> subscribeOn({required List<Topic> topics});

  /// 取消订阅topic的事件消息
  void unsubscribe(StreamSubscription<dynamic> stream);

  /// 获取服务器通知开关列表
  Future<Either<SettingError, SettingPushQueryModel>> fetchPushQuery();

  /// 设置服务器通知开关列表
  Future<Either<SettingError, SettingHasSuccessModel>> fetchPushSet({
    List<SettingDetailSwitchModel> detailSwitchList,
  });

  /// 告知当前在前台
  void enableHearBeatForeground();

  /// 告知当前在后台
  void enableHearBeatBackground();

  /// 发送本地通知
  Future<String> sendLocalNotification(LocalNotification notification);

  /// 设置应用角标
  Future<dynamic> setBadgeNumber(int badgeNumber);

  /// 清除缓存
  Future<bool> clearCache();
}

/// 全局推送门面实例
IPushFacade get pushFacade => _pushFacade ??= biuldPushFacade();
```

### 5. 预定义主题 (Push Topics)

```dart
/// 通知点击主题
const Topic notificationOnClickTopic =
    Topic(scope: shift2, product: shift0, index: shift0);

/// 点击事件里payload里的跳转协议
const keyLaunchScheme = 'launchScheme';

/// 全部主题
const Topic allTopic = Topic();

/// 零主题
const Topic zeroTopic = Topic(scope: 0, product: 0, index: 0, subIndex: 0);
```

## 使用指南

### 1. 推送服务初始化

```dart
import 'package:basic_push/basic_push.dart';

// 配置推送初始化参数
final pushInitParams = PushInitParams(
  isProduction: true,          // iOS生产环境
  privateCloud: true,          // 使用私有云
  isDebug: false,              // 关闭调试模式
  appKey: 'your_app_key',      // 应用密钥
  channel: 'official',         // 渠道标识
  connHost: 'push.example.com', // 推送服务器
  connPort: 8080,              // 连接端口
  heartbeatInterval: 290000,   // 心跳间隔(4分50秒)
);

// 初始化推送服务
pushFacade.initPush(
  loginDeps: MyLoginDeps(),
  pushInitParams: pushInitParams,
);
```

### 2. 用户绑定和解绑

```dart
// 用户登录后绑定推送
try {
  final success = await pushFacade.bindPush();
  if (success) {
    print('推送绑定成功');
  } else {
    print('推送绑定失败');
  }
} catch (e) {
  print('推送绑定异常: $e');
}

// 用户登出时解绑推送
try {
  final success = await pushFacade.unbindPush();
  if (success) {
    print('推送解绑成功');
  } else {
    print('推送解绑失败');
  }
} catch (e) {
  print('推送解绑异常: $e');
}
```

### 3. 权限管理

```dart
// 检查通知权限
if (pushFacade.isNotificationEnabled) {
  print('通知权限已授予');
} else {
  print('通知权限未授予，请手动开启');
  
  // 跳转到系统设置页面
  pushFacade.openSettingsForNotification();
}

// 获取推送注册ID
final regId = await pushFacade.pushRegId;
print('推送注册ID: $regId');
```

### 4. 事件发布和订阅

```dart
// 发布事件
pushFacade.postEvent(
  topic: notificationOnClickTopic,
  payload: {
    keyLaunchScheme: 'oneapp://car/control',
    'userId': '12345',
    'action': 'open_door',
  },
  description: '用户点击推送通知',
);

// 订阅事件
final subscription = pushFacade.subscribeOn(
  topics: [notificationOnClickTopic],
).listen((event) {
  print('接收到事件: ${event.description}');
  
  // 处理跳转协议
  final scheme = event.payload[keyLaunchScheme] as String?;
  if (scheme != null) {
    handleDeepLink(scheme);
  }
});

// 取消订阅
pushFacade.unsubscribe(subscription);
```

### 5. 本地通知

```dart
// 发送本地通知
final notification = LocalNotification(
  title: '车辆提醒',
  body: '您的车辆充电已完成',
  payload: jsonEncode({
    'type': 'charging_complete',
    'vehicleId': 'VIN123456',
  }),
);

final notificationId = await pushFacade.sendLocalNotification(notification);
print('本地通知已发送，ID: $notificationId');

// 设置应用角标
await pushFacade.setBadgeNumber(5);
```

### 6. 应用生命周期管理

```dart
class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        // 应用进入前台
        pushFacade.enableHearBeatForeground();
        break;
      case AppLifecycleState.paused:
        // 应用进入后台
        pushFacade.enableHearBeatBackground();
        break;
      default:
        break;
    }
  }
}
```

### 7. 推送设置管理

```dart
// 获取推送设置
final result = await pushFacade.fetchPushQuery();
result.fold(
  (error) => print('获取推送设置失败: ${error.message}'),
  (settings) => {
    print('当前推送设置: ${settings.detailSwitchList}'),
    // 显示推送设置界面
  },
);

// 更新推送设置
final updateResult = await pushFacade.fetchPushSet(
  detailSwitchList: [
    SettingDetailSwitchModel(
      key: 'vehicle_notification',
      enabled: true,
      name: '车辆通知',
    ),
    SettingDetailSwitchModel(
      key: 'charging_notification', 
      enabled: false,
      name: '充电通知',
    ),
  ],
);

updateResult.fold(
  (error) => print('更新推送设置失败: ${error.message}'),
  (success) => print('推送设置更新成功'),
);
```

## 依赖配置

### pubspec.yaml 关键依赖

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 函数式编程
  dartz: ^0.10.1
  
  # 响应式编程
  rxdart: ^0.27.0
  
  # 不可变数据类
  freezed_annotation: ^2.0.0
  
  # JSON序列化
  json_annotation: ^4.0.0
  
  # 基础日志
  basic_logger:
    path: ../basic_logger
    
  # 基础平台
  basic_platform:
    path: ../basic_platform

dev_dependencies:
  # 代码生成
  freezed: ^2.0.0
  json_serializable: ^6.0.0
  build_runner: ^2.0.0
```

## 高级功能

### 1. 自定义登录依赖

```dart
class MyLoginDeps with ILoginDeps {
  @override
  bool get isLogin {
    // 实现自定义的登录状态检查逻辑
    return UserManager.instance.isLoggedIn;
  }
}

// 使用自定义登录依赖
pushFacade.initPush(
  loginDeps: MyLoginDeps(),
  pushInitParams: pushInitParams,
);
```

### 2. 复杂主题组合

```dart
// 定义自定义主题
const Topic carNotificationTopic = Topic(
  scope: shift1,
  product: shift2,
  index: shift1,
  subIndex: shift1,
);

const Topic chargingNotificationTopic = Topic(
  scope: shift1,
  product: shift2,
  index: shift2,
  subIndex: shift1,
);

// 组合多个主题
final combinedTopic = carNotificationTopic | chargingNotificationTopic;

// 订阅组合主题
final subscription = pushFacade.subscribeOn(
  topics: [combinedTopic],
).listen((event) {
  // 处理车辆或充电相关的通知
});
```

### 3. 推送消息解析

```dart
// 自定义推送消息解析器
class MyPushMessageParser {
  static Map<String, dynamic> parse(Map<String, dynamic> rawMessage) {
    // 解析推送消息的自定义格式
    return {
      'type': rawMessage['msg_type'],
      'data': jsonDecode(rawMessage['data']),
      'timestamp': DateTime.parse(rawMessage['timestamp']),
    };
  }
}
```

## 性能优化建议

### 1. 事件订阅管理
- 及时取消不需要的事件订阅，避免内存泄漏
- 使用合适的主题过滤，减少不必要的事件处理
- 在Widget销毁时记得取消订阅

### 2. 心跳优化
- 根据应用特性调整心跳间隔
- 在后台时降低心跳频率
- 监听网络状态变化，暂停心跳服务

### 3. 本地通知限制
- 避免频繁发送本地通知
- 合理设置通知的声音和震动
- 控制通知的数量和频率

## 最佳实践

### 1. 推送权限处理
```dart
// 推荐：友好的权限请求
void requestNotificationPermission() {
  if (!pushFacade.isNotificationEnabled) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('开启通知权限'),
        content: Text('为了及时收到重要消息，请开启通知权限'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('稍后设置'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              pushFacade.openSettingsForNotification();
            },
            child: Text('去设置'),
          ),
        ],
      ),
    );
  }
}
```

### 2. 错误处理
```dart
// 推荐：完整的错误处理
Future<void> handlePushBinding() async {
  try {
    final success = await pushFacade.bindPush();
    if (!success) {
      // 绑定失败的用户友好提示
      showSnackBar('推送服务暂时不可用，请稍后重试');
    }
  } catch (e) {
    // 记录错误日志
    Logger.e('推送绑定异常: $e', tagPush);
    // 用户友好的错误提示
    showSnackBar('网络连接异常，请检查网络后重试');
  }
}
```

### 3. 事件处理优化
```dart
// 推荐：使用StreamBuilder处理事件
class NotificationHandler extends StatefulWidget {
  @override
  _NotificationHandlerState createState() => _NotificationHandlerState();
}

class _NotificationHandlerState extends State<NotificationHandler> {
  late StreamSubscription _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = pushFacade.subscribeOn(
      topics: [notificationOnClickTopic],
    ).listen(_handleNotificationClick);
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }

  void _handleNotificationClick(Event event) {
    // 安全的事件处理
    if (mounted && event.payload != null) {
      final scheme = event.payload[keyLaunchScheme] as String?;
      if (scheme != null) {
        NavigationService.handleDeepLink(scheme);
      }
    }
  }
}
```

## 问题排查

### 常见问题
1. **推送收不到**: 检查应用权限、网络连接和推送配置
2. **事件订阅失效**: 确认订阅没有被意外取消，检查主题匹配逻辑
3. **心跳断开**: 检查网络稳定性和服务器配置

### 调试技巧
- 启用debug模式查看详细日志
- 使用推送测试工具验证配置
- 监控应用生命周期事件

