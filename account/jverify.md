# JVerify 极验验证插件文档

## 插件概述

`jverify` 是 OneApp 集成的极验验证 Flutter 插件，提供一键登录、短信验证等安全认证功能。该插件封装了极验验证的 Android 和 iOS SDK，为 Flutter 应用提供统一的验证接口。

### 基本信息
- **插件名称**: jverify
- **类型**: Flutter Plugin
- **平台支持**: Android, iOS
- **功能**: 一键登录、短信验证、SDK 初始化

## 目录结构

```
jverify/
├── lib/
│   └── jverify.dart              # Flutter 接口层
├── android/                      # Android 原生实现
│   ├── src/main/
│   │   ├── AndroidManifest.xml  # Android 清单文件
│   │   ├── java/                 # Java/Kotlin 源码
│   │   └── libs/                 # 第三方库文件
│   └── build.gradle             # Android 构建配置
├── ios/                          # iOS 原生实现
│   ├── Classes/                  # Objective-C/Swift 源码
│   ├── Assets/                   # iOS 资源文件
│   └── jverify.podspec          # CocoaPods 配置
├── documents/                    # 文档目录
├── pubspec.yaml                  # Flutter 插件配置
└── README.md                     # 项目说明
```

## Flutter 接口层 (lib/jverify.dart)

### 核心回调类型定义

#### 1. 事件监听器定义
```dart
// 自定义控件点击事件监听器
typedef JVClickWidgetEventListener = void Function(String widgetId);

// 授权页事件回调监听器
typedef JVAuthPageEventListener = void Function(JVAuthPageEvent event);

// 一键登录回调监听器
typedef JVLoginAuthCallBackListener = void Function(JVListenerEvent event);

// 短信登录回调监听器
typedef JVSMSListener = void Function(JVSMSEvent event);

// SDK 初始化回调监听器
typedef JVSDKSetupCallBackListener = void Function(JVSDKSetupEvent event);
```

#### 2. 事件数据模型
```dart
// 一键登录事件
class JVListenerEvent {
  final int code;        // 返回码：6000成功，6001失败
  final String message;  // 返回信息或loginToken
  final String operator; // 运营商：CM移动，CU联通，CT电信
}

// 短信验证事件
class JVSMSEvent {
  final int code;        // 返回码
  final String message;  // 返回信息
  final String phone;    // 手机号
}

// SDK 初始化事件
class JVSDKSetupEvent {
  final int code;        // 返回码：8000成功
  final String message;  // 返回信息
}

// 授权页事件
class JVAuthPageEvent {
  final String eventType; // 事件类型
  final Map<String, dynamic> data; // 事件数据
}
```

### 主要接口方法

#### 1. SDK 初始化
```dart
class Jverify {
  // 初始化 SDK
  static Future<void> setup({
    required String appKey,
    required String channel,
    bool isProduction = true,
    JVSDKSetupCallBackListener? setupListener,
  });
  
  // 检查初始化状态
  static Future<bool> isSetup();
}
```

#### 2. 一键登录
```dart
// 预初始化
static Future<void> preLogin({
  int timeOut = 5000,
  JVLoginAuthCallBackListener? preLoginListener,
});

// 判断网络环境是否支持
static Future<void> checkVerifyEnable({
  JVLoginAuthCallBackListener? checkListener,
});

// 获取登录 Token
static Future<void> loginAuth({
  bool autoDismiss = true,
  int timeOut = 5000,
  JVLoginAuthCallBackListener? loginListener,
});

// 自定义授权页面
static Future<void> setCustomAuthorizationView({
  required Map<String, dynamic> config,
  JVClickWidgetEventListener? clickListener,
  JVAuthPageEventListener? authPageEventListener,
});
```

#### 3. 短信验证
```dart
// 获取短信验证码
static Future<void> getSMSCode({
  required String phoneNumber,
  String? signID,
  String? tempID,
  JVSMSListener? smsListener,
});

// 短信验证登录
static Future<void> smsAuth({
  required String phoneNumber,
  required String smsCode,
  JVSMSListener? smsListener,
});
```

#### 4. 页面控制
```dart
// 关闭授权页面
static Future<void> dismissLoginAuth();

// 清除预取号缓存
static Future<void> clearPreLoginCache();

// 设置调试模式
static Future<void> setDebugMode(bool enable);
```

## Android 原生实现

### 项目结构
```
android/
├── src/main/
│   ├── AndroidManifest.xml      # 权限和组件配置
│   ├── java/com/jverify/        # Java 实现代码
│   │   ├── JverifyPlugin.java   # 插件主类
│   │   ├── JVerifyHelper.java   # 辅助工具类
│   │   └── utils/               # 工具类
│   └── libs/                    # 极验 SDK 库文件
│       ├── jverify-android-*.jar
│       └── jcore-android-*.jar
└── build.gradle                 # 构建配置
```

### 关键实现文件

#### 1. JverifyPlugin.java - 插件主类
```java
public class JverifyPlugin implements FlutterPlugin, MethodCallHandler {
    
    // 方法通道
    private MethodChannel channel;
    
    // 极验 SDK API 接口
    private JVerifyInterface jVerifyInterface;
    
    @Override
    public void onAttachedToEngine(@NonNull FlutterPluginBinding binding) {
        channel = new MethodChannel(binding.getBinaryMessenger(), "jverify");
        channel.setMethodCallHandler(this);
    }
    
    @Override
    public void onMethodCall(@NonNull MethodCall call, @NonNull Result result) {
        switch (call.method) {
            case "setup":
                initSDK(call, result);
                break;
            case "checkVerifyEnable":
                checkVerifyEnable(call, result);
                break;
            case "preLogin":
                preLogin(call, result);
                break;
            case "loginAuth":
                loginAuth(call, result);
                break;
            case "getSMSCode":
                getSMSCode(call, result);
                break;
            case "smsAuth":
                smsAuth(call, result);
                break;
            case "dismissLoginAuth":
                dismissLoginAuth(result);
                break;
            default:
                result.notImplemented();
        }
    }
}
```

#### 2. 核心功能实现
```java
// SDK 初始化
private void initSDK(MethodCall call, Result result) {
    String appKey = call.argument("appKey");
    String channel = call.argument("channel");
    boolean isProduction = call.argument("isProduction");
    
    JVerifyInterface.init(getApplicationContext(), appKey, channel, isProduction);
    JVerifyInterface.setDebugMode(true);
    
    // 设置初始化回调
    JVerifyInterface.setInitListener(new InitListener() {
        @Override
        public void onResult(int code, String message) {
            // 回调到 Flutter
            Map<String, Object> args = new HashMap<>();
            args.put("code", code);
            args.put("message", message);
            channel.invokeMethod("onSDKSetup", args);
        }
    });
}

// 一键登录
private void loginAuth(MethodCall call, Result result) {
    boolean autoDismiss = call.argument("autoDismiss");
    int timeOut = call.argument("timeOut");
    
    JVerifyInterface.loginAuth(getCurrentActivity(), autoDismiss, timeOut, 
        new LoginAuthListener() {
            @Override
            public void onResult(int code, String content, String operator) {
                Map<String, Object> args = new HashMap<>();
                args.put("code", code);
                args.put("message", content);
                args.put("operator", operator);
                channel.invokeMethod("onLoginAuth", args);
            }
        });
}
```

### Android 配置

#### AndroidManifest.xml 权限配置
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    
    <!-- 电话权限 -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    
    <!-- 其他权限 -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <application>
        <!-- 极验服务配置 -->
        <meta-data
            android:name="JVERIFY_CHANNEL"
            android:value="${JVERIFY_CHANNEL}" />
        <meta-data
            android:name="JVERIFY_APPKEY"
            android:value="${JVERIFY_APPKEY}" />
    </application>
</manifest>
```

#### build.gradle 配置
```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        minSdkVersion 19
        targetSdkVersion 33
    }
    
    buildTypes {
        release {
            manifestPlaceholders = [
                JVERIFY_APPKEY: project.hasProperty('JVERIFY_APPKEY') ? JVERIFY_APPKEY : '',
                JVERIFY_CHANNEL: project.hasProperty('JVERIFY_CHANNEL') ? JVERIFY_CHANNEL : 'developer-default'
            ]
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.4.0'
    implementation fileTree(dir: 'libs', include: ['*.jar'])
}
```

## iOS 原生实现

### 项目结构
```
ios/
├── Classes/
│   ├── JverifyPlugin.h          # 插件头文件
│   ├── JverifyPlugin.m          # 插件实现文件
│   └── JVerifyHelper.h/m        # 辅助工具类
├── Assets/                      # 资源文件
├── Frameworks/                  # 极验 SDK 框架
│   └── JVERIFYService.framework
└── jverify.podspec             # CocoaPods 配置
```

### 关键实现文件

#### 1. JverifyPlugin.h - 插件头文件
```objc
#import <Flutter/Flutter.h>
#import <JVERIFYService/JVERIFYService.h>

@interface JverifyPlugin : NSObject<FlutterPlugin>

@property (nonatomic, strong) FlutterMethodChannel *channel;

@end
```

#### 2. JverifyPlugin.m - 插件实现
```objc
@implementation JverifyPlugin

+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
    FlutterMethodChannel* channel = [FlutterMethodChannel
        methodChannelWithName:@"jverify"
        binaryMessenger:[registrar messenger]];
    
    JverifyPlugin* instance = [[JverifyPlugin alloc] init];
    instance.channel = channel;
    [registrar addMethodCallDelegate:instance channel:channel];
}

- (void)handleMethodCall:(FlutterMethodCall*)call result:(FlutterResult)result {
    if ([@"setup" isEqualToString:call.method]) {
        [self initSDK:call result:result];
    } else if ([@"checkVerifyEnable" isEqualToString:call.method]) {
        [self checkVerifyEnable:call result:result];
    } else if ([@"preLogin" isEqualToString:call.method]) {
        [self preLogin:call result:result];
    } else if ([@"loginAuth" isEqualToString:call.method]) {
        [self loginAuth:call result:result];
    } else if ([@"getSMSCode" isEqualToString:call.method]) {
        [self getSMSCode:call result:result];
    } else if ([@"smsAuth" isEqualToString:call.method]) {
        [self smsAuth:call result:result];
    } else if ([@"dismissLoginAuth" isEqualToString:call.method]) {
        [self dismissLoginAuth:result];
    } else {
        result(FlutterMethodNotImplemented);
    }
}

// SDK 初始化
- (void)initSDK:(FlutterMethodCall*)call result:(FlutterResult)result {
    NSString *appKey = call.arguments[@"appKey"];
    NSString *channel = call.arguments[@"channel"];
    BOOL isProduction = [call.arguments[@"isProduction"] boolValue];
    
    [JVERIFYService setupWithAppkey:appKey channel:channel apsForProduction:isProduction];
    
    // 设置初始化回调
    [JVERIFYService setInitHandler:^(JVInitResultModel *result) {
        NSDictionary *args = @{
            @"code": @(result.code),
            @"message": result.message ?: @""
        };
        [self.channel invokeMethod:@"onSDKSetup" arguments:args];
    }];
    
    result(@(YES));
}

// 一键登录
- (void)loginAuth:(FlutterMethodCall*)call result:(FlutterResult)result {
    BOOL autoDismiss = [call.arguments[@"autoDismiss"] boolValue];
    NSTimeInterval timeOut = [call.arguments[@"timeOut"] doubleValue] / 1000.0;
    
    [JVERIFYService getAuthorizationWithController:[self getCurrentViewController]
                                          completion:^(JVAuthorizationResultModel *result) {
        NSDictionary *args = @{
            @"code": @(result.code),
            @"message": result.content ?: @"",
            @"operator": result.operator ?: @""
        };
        [self.channel invokeMethod:@"onLoginAuth" arguments:args];
    }];
    
    result(@(YES));
}

@end
```

### iOS 配置

#### jverify.podspec
```ruby
Pod::Spec.new do |s|
  s.name             = 'jverify'
  s.version          = '1.0.0'
  s.summary          = 'JVerify Flutter Plugin'
  s.description      = 'A Flutter plugin for JVerify SDK'
  s.homepage         = 'https://www.jiguang.cn'
  s.license          = { :file => '../LICENSE' }
  s.author           = { 'JiGuang' => 'support@jiguang.cn' }
  
  s.source           = { :path => '.' }
  s.source_files     = 'Classes/**/*'
  s.public_header_files = 'Classes/**/*.h'
  
  s.dependency 'Flutter'
  s.dependency 'JVerify', '~> 2.8.0'
  
  s.platform = :ios, '9.0'
  s.ios.deployment_target = '9.0'
  
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.swift_version = '5.0'
end
```

#### Info.plist 配置
```xml
<dict>
    <!-- 应用传输安全设置 -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    
    <!-- 网络使用说明 -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>此应用需要访问相册来选择头像</string>
    
    <!-- 电话权限说明 -->
    <key>NSContactsUsageDescription</key>
    <string>此应用需要访问通讯录进行一键登录</string>
</dict>
```

## 使用示例

### 基本集成
```dart
import 'package:jverify/jverify.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  
  @override
  void initState() {
    super.initState();
    _initJVerify();
  }
  
  // 初始化 JVerify SDK
  void _initJVerify() async {
    await Jverify.setup(
      appKey: "your_app_key",
      channel: "developer-default",
      isProduction: false,
      setupListener: (JVSDKSetupEvent event) {
        if (event.code == 8000) {
          print("SDK 初始化成功");
          _preLogin();
        } else {
          print("SDK 初始化失败: ${event.message}");
        }
      },
    );
  }
  
  // 预登录
  void _preLogin() async {
    await Jverify.preLogin(
      preLoginListener: (JVListenerEvent event) {
        if (event.code == 6000) {
          print("预登录成功");
        }
      },
    );
  }
  
  // 一键登录
  void _oneClickLogin() async {
    await Jverify.loginAuth(
      loginListener: (JVListenerEvent event) {
        if (event.code == 6000) {
          String loginToken = event.message;
          // 使用 loginToken 进行后续验证
          _verifyTokenWithServer(loginToken);
        } else {
          print("一键登录失败: ${event.message}");
        }
      },
    );
  }
  
  // 短信登录
  void _smsLogin(String phoneNumber, String smsCode) async {
    await Jverify.smsAuth(
      phoneNumber: phoneNumber,
      smsCode: smsCode,
      smsListener: (JVSMSEvent event) {
        if (event.code == 6000) {
          print("短信登录成功");
        }
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          ElevatedButton(
            onPressed: _oneClickLogin,
            child: Text("一键登录"),
          ),
          ElevatedButton(
            onPressed: () => _getSMSCode("13800138000"),
            child: Text("获取验证码"),
          ),
        ],
      ),
    );
  }
}
```

## 错误码说明

### 通用错误码
- **8000**: SDK 初始化成功
- **8001**: SDK 初始化失败
- **6000**: 登录获取 loginToken 成功
- **6001**: 登录获取 loginToken 失败
- **6002**: 网络连接失败
- **6003**: 请求超时
- **6004**: 运营商网络未知

### 一键登录错误码
- **6005**: 手机号不支持此运营商
- **6006**: 用户取消登录
- **6007**: 登录环境异常
- **6008**: 登录失败，未知异常

### 短信验证错误码
- **3000**: 短信验证码发送成功
- **3001**: 短信验证码发送失败
- **3002**: 短信验证码验证成功
- **3003**: 短信验证码验证失败

## 性能优化

### 网络优化
- 预登录机制减少用户等待时间
- 智能重试机制提高成功率
- 网络状态检测优化用户体验

### 内存优化
- 及时释放不用的资源
- 避免内存泄漏
- 合理管理生命周期

### 用户体验优化
- 自定义授权页面样式
- 加载状态指示
- 错误提示优化

## 安全特性

### 数据安全
- 通信数据加密传输
- 敏感信息本地加密存储
- 防止中间人攻击

### 业务安全
- 防刷机制
- 设备指纹验证
- 异常行为检测

## 测试指南

### 单元测试
- SDK 接口调用测试
- 错误处理测试
- 边界条件测试

### 集成测试
- 端到端登录流程测试
- 多平台兼容性测试
- 网络异常处理测试

### 性能测试
- 初始化耗时测试
- 内存使用测试
- 并发请求测试

## 故障排除

### 常见问题
1. **初始化失败**: 检查 AppKey 和渠道配置
2. **网络错误**: 检查网络权限和网络连接
3. **登录失败**: 检查运营商网络环境
4. **权限不足**: 检查必要权限的授权状态

### 调试技巧
- 开启调试模式查看详细日志
- 使用网络抓包工具分析请求
- 检查设备网络环境和运营商

## 版本更新

### 当前版本特性
- 支持三大运营商一键登录
- 支持短信验证码登录
- 支持自定义授权页面
- 完善的错误处理机制

### 后续规划
- 支持更多认证方式
- 优化用户体验
- 增强安全防护

## 总结

`jverify` 插件为 OneApp 提供了完整的极验验证解决方案，通过封装原生 SDK，为 Flutter 应用提供了统一、便捷的验证接口。插件具有良好的跨平台兼容性和完善的错误处理机制，能够满足移动应用的各种验证场景需求。
