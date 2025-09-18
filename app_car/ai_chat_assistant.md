# AI Chat Assistant - AI 聊天助手模块文档

## 模块概述

`ai_chat_assistant` 是 OneApp 车辆模块群中的智能交互模块，提供基于人工智能的语音和文字聊天功能。该模块集成了语音识别、自然语言处理、车辆控制等技术，为用户提供智能化的车辆助手服务。

### 基本信息
- **模块名称**: ai_chat_assistant  
- **模块路径**: oneapp_app_car/ai_chat_assistant
- **类型**: Flutter Package Module
- **主要功能**: 智能语音交互、车辆控制、自然语言问答

### 核心特性
- **智能语音识别**: 集成阿里云语音识别SDK
- **车辆智能控制**: 支持20+种车辆控制命令
- **自然语言处理**: 基于OpenAI GPT的智能问答
- **多语言支持**: 中英文双语交互
- **实时流式响应**: 基于SSE的实时对话体验
- **权限智能管理**: 自动处理麦克风等系统权限

## 目录结构

```
ai_chat_assistant/
├── lib/
│   ├── ai_chat_assistant.dart    # 模块入口文件
│   ├── app.dart                  # 应用配置
│   ├── manager.dart              # 全局管理器
│   ├── bloc/                     # BLoC状态管理
│   │   ├── ai_chat_cubit.dart
│   │   ├── easy_bloc.dart
│   │   └── command_state.dart
│   ├── enums/                    # 枚举定义
│   │   ├── message_status.dart
│   │   ├── message_service_state.dart
│   │   └── vehicle_command_type.dart
│   ├── models/                   # 数据模型
│   │   ├── chat_message.dart
│   │   ├── vehicle_cmd.dart
│   │   ├── vehicle_cmd_response.dart
│   │   └── vehicle_status_info.dart
│   ├── screens/                  # 界面组件
│   │   ├── full_screen.dart
│   │   ├── part_screen.dart
│   │   └── main_screen.dart
│   ├── services/                 # 业务服务层
│   │   ├── message_service.dart
│   │   ├── command_service.dart
│   │   ├── chat_sse_service.dart
│   │   └── classification_service.dart
│   ├── utils/                    # 工具类
│   │   ├── common_util.dart
│   │   └── tts_util.dart
│   └── widgets/                  # UI组件
│       ├── chat_box.dart
│       ├── chat_bubble.dart
│       ├── assistant_avatar.dart
│       └── floating_icon.dart
└── pubspec.yaml                  # 依赖配置
```

## 核心架构组件

### 1. 消息状态枚举 (MessageStatus)

```dart
enum MessageStatus {
  normal('普通消息', 'Normal'),
  listening('聆听中', 'Listening'),
  recognizing('识别中', 'Recognizing'),
  thinking('思考中', 'Thinking'),
  completed('完成回答', 'Completed'),
  executing('执行中', 'Executing'),
  success('执行成功', 'Success'),
  failure('执行失败', 'Failure'),
  aborted('已中止', 'Aborted');

  const MessageStatus(this.chinese, this.english);
  final String chinese;
  final String english;
}
```

### 2. 车辆控制命令枚举 (VehicleCommandType)

```dart
enum VehicleCommandType {
  unknown('未知', 'unknown'),
  lock('上锁车门', 'lock'),
  unlock('解锁车门', 'unlock'),
  openWindow('打开车窗', 'open window'),
  closeWindow('关闭车窗', 'close window'),
  appointAC('预约空调', 'appoint AC'),
  openAC('打开空调', 'open AC'),
  closeAC('关闭空调', 'close AC'),
  changeACTemp('修改空调温度', 'change AC temperature'),
  coolSharply('极速降温', 'cool sharply'),
  prepareCar('一键备车', 'prepare car'),
  meltSnow('一键融雪', 'melt snow'),
  openTrunk('打开后备箱', 'open trunk'),
  closeTrunk('关闭后备箱', 'close trunk'),
  honk('鸣笛', 'honk'),
  locateCar('定位车辆', 'locate car'),
  openWheelHeat('开启方向盘加热', 'open wheel heat'),
  closeWheelHeat('关闭方向盘加热', 'close wheel heat'),
  openMainSeatHeat('开启主座椅加热', 'open main seat heat'),
  closeMainSeatHeat('关闭主座椅加热', 'close main seat heat'),
  openMinorSeatHeat('开启副座椅加热', 'open minor seat heat'),
  closeMinorSeatHeat('关闭副座椅加热', 'close minor seat heat');

  const VehicleCommandType(this.chinese, this.english);
  final String chinese;
  final String english;
}
```

### 3. 聊天消息模型 (ChatMessage)

```dart
class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  MessageStatus status;

  ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.status = MessageStatus.normal,
  });
}
```

## 核心服务类

### 1. 消息服务 (MessageService)

MessageService是AI聊天助手的核心服务，采用单例模式，负责管理整个对话流程：

```dart
class MessageService extends ChangeNotifier {
  static MessageService? _instance;
  static MessageService get instance => _instance ??= MessageService._internal();
  factory MessageService() => instance;

  // 核心方法
  Future<void> startVoiceInput() async
  Future<void> stopAndProcessVoiceInput() async  
  Future<void> reply(String text) async
  Future<void> handleVehicleControl(String text, bool isChinese) async
  Future<bool> processCommand(VehicleCommand command, bool isChinese) async
}
```

**主要功能模块:**

#### 语音交互流程
1. **录音开始**: `startVoiceInput()` - 检查麦克风权限，开启阿里云ASR
2. **录音识别**: `stopAndProcessVoiceInput()` - 停止录音并获取识别结果
3. **文本分类**: 通过 `TextClassificationService` 判断用户意图
4. **响应生成**: 根据分类结果调用相应处理方法

#### 消息状态管理
- **listening**: 正在聆听用户语音输入
- **recognizing**: 语音识别中
- **thinking**: AI思考回复中  
- **executing**: 车辆控制命令执行中
- **completed**: 对话完成

#### 车辆控制处理
```dart
Future<void> handleVehicleControl(String text, bool isChinese) async {
  final vehicleCommandResponse = await _vehicleCommandService.getCommandFromText(text);
  if (vehicleCommandResponse != null) {
    // 更新消息状态为执行中
    replaceMessage(id: _latestAssistantMessageId!, 
                   text: vehicleCommandResponse.tips!, 
                   status: MessageStatus.executing);
    
    // 执行车辆控制命令
    for (var command in vehicleCommandResponse.commands) {
      if (command.type != VehicleCommandType.unknown && command.error.isEmpty) {
        bool isSuccess = await processCommand(command, isChinese);
        // 处理执行结果
      }
    }
  }
}
```

### 2. BLoC状态管理 (AIChatCommandCubit)

```dart
class AIChatCommandCubit extends EasyCubit<AIChatCommandState> {
  AIChatCommandCubit() : super(const AIChatCommandState());

  void reset() {
    emit(const AIChatCommandState());
  }

  String _generateCommandId() {
    return '${DateTime.now().millisecondsSinceEpoch}_${state.commandType?.name ?? 'unknown'}';
  }

  bool get isExecuting => state.status == AIChatCommandStatus.executing;
  String? get currentCommandId => state.commandId;
}
```

### 3. 主屏幕界面 (MainScreen)

```dart
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/bg.jpg', package: 'ai_chat_assistant'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          FloatingIcon(), // 浮动聊天入口
        ],
      ),
    );
  }
}
```

## 技术集成

### 阿里云语音识别集成
```dart
// 方法通道配置
static const MethodChannel _asrChannel = MethodChannel('com.example.ai_chat_assistant/ali_sdk');

// ASR回调处理
Future<dynamic> _handleMethodCall(MethodCall call) async {
  switch (call.method) {
    case "onAsrResult":
      replaceMessage(id: _latestUserMessageId!, 
                     text: call.arguments, 
                     status: MessageStatus.normal);
      break;
    case "onAsrStop":
      if (_asrCompleter != null && !_asrCompleter!.isCompleted) {
        _asrCompleter!.complete(messages.last.text);
      }
      break;
  }
}
```

### 权限管理
```dart
Future<void> startVoiceInput() async {
  if (await Permission.microphone.status == PermissionStatus.denied) {
    PermissionStatus status = await Permission.microphone.request();
    if (status == PermissionStatus.permanentlyDenied) {
      await Fluttertoast.showToast(msg: "请在设置中开启麦克风权限");
    }
    return;
  }
  // 继续语音输入流程
}
```

## 使用方式

### 1. 模块导入
```dart
import 'package:ai_chat_assistant/ai_chat_assistant.dart';
```

### 2. 服务初始化
```dart
// 获取消息服务实例
final messageService = MessageService.instance;

// 监听消息变化
messageService.addListener(() {
  // 处理消息更新
});
```

### 3. 语音交互
```dart
// 开始语音输入
await messageService.startVoiceInput();

// 停止并处理语音输入
await messageService.stopAndProcessVoiceInput();
```

### 4. 文本交互
```dart
// 直接发送文本消息
await messageService.reply("帮我打开空调");
```

## 依赖配置

### pubspec.yaml 关键依赖
```yaml
dependencies:
  flutter:
    sdk: flutter
  # 状态管理
  provider: ^6.0.0
  
  # 权限管理
  permission_handler: ^10.0.0
  
  # 网络请求
  dio: ^5.0.0
  
  # 提示消息
  fluttertoast: ^8.0.0
  
  # UUID生成
  uuid: ^3.0.0
  
  # 国际化
  basic_intl:
    path: ../../oneapp_basic_utils/basic_intl
```

## 扩展开发指南

### 1. 新增车辆控制命令

1. 在 `VehicleCommandType` 枚举中添加新命令：
```dart
enum VehicleCommandType {
  // 现有命令...
  newCommand('新命令', 'new command'),
}
```

2. 在 `MessageService.processCommand` 中添加处理逻辑。

### 2. 自定义对话界面

继承或修改现有的Screen组件，实现自定义的对话界面布局。

### 3. 集成其他AI服务

通过修改 `ChatSseService` 或新增服务类，可以集成其他AI对话服务。

## 性能优化建议

1. **内存管理**: MessageService使用单例模式，注意在适当时机清理消息历史
2. **网络优化**: SSE连接在不使用时应及时断开
3. **权限缓存**: 避免重复请求已获取的权限
4. **语音资源**: 及时释放语音录制和播放资源

## 问题排查

### 常见问题
1. **语音识别失效**: 检查麦克风权限和阿里云SDK配置
2. **车辆控制失败**: 确认车辆连接状态和控制权限
3. **SSE连接断开**: 检查网络状态和服务端配置

### 调试技巧
- 启用详细日志输出
- 使用Flutter Inspector检查Widget状态
- 通过MethodChannel调试原生交互
