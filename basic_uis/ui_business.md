# UI Business - 业务UI组件模块文档

## 模块概述

`ui_business` 是 OneApp 基础UI模块群中的业务UI组件库，提供与具体业务场景相关的UI组件和工具。该模块包含账户相关组件、订单相关组件、同意书组件等业务特定的界面元素和交互逻辑。

### 基本信息
- **模块名称**: ui_business
- **模块路径**: oneapp_basic_uis/ui_business
- **类型**: Flutter Package Module
- **主要功能**: 业务UI组件、账户组件、订单组件、同意书组件

### 核心特性
- **账户UI组件**: 提供登录、短信验证、证书拍照等账户相关UI
- **订单UI组件**: 订单相关的业务界面组件
- **同意书组件**: 用户协议和同意书相关UI
- **国际化支持**: 支持中英文多语言
- **表单验证**: 集成表单验证和数据处理
- **路由守卫**: 业务路由保护和权限控制

## 目录结构

```
ui_business/
├── lib/
│   ├── ui_account.dart            # 账户相关组件导出
│   ├── ui_order.dart             # 订单相关组件导出
│   ├── ui_consent.dart           # 同意书相关组件导出
│   ├── ui_common.dart            # 通用业务组件导出
│   ├── route_guard.dart          # 路由守卫
│   ├── customer_care.dart        # 客服相关
│   ├── poi_to_car.dart          # POI到车功能
│   ├── src/                      # 源代码目录
│   │   ├── ui_account/          # 账户相关组件
│   │   │   ├── widgets/         # 账户UI组件
│   │   │   │   ├── sms_auth/    # 短信验证组件
│   │   │   │   ├── check_spin/  # 验证转动组件
│   │   │   │   ├── certificates_photo/ # 证书拍照
│   │   │   │   └── time_picker/ # 时间选择器
│   │   │   ├── models/          # 账户数据模型
│   │   │   ├── mgmt/           # 账户管理
│   │   │   └── ui_config.dart  # UI配置
│   │   ├── ui_order/           # 订单相关组件
│   │   └── constants/          # 常量定义
│   ├── generated/              # 生成的国际化文件
│   └── l10n/                   # 国际化资源
├── assets/                     # 资源文件
└── pubspec.yaml               # 依赖配置
```

## 核心架构组件

### 1. 短信验证组件 (SmsAuthWidget)

提供短信验证码输入和验证功能的完整UI组件：

```dart
/// 短信验证组件
class SmsAuthWidget extends StatelessWidget {
  /// 构造器
  ///
  /// [verificationType] 验证码类型：1-登录注册 2-重置密码 3-设置/重置spin
  /// [callback] 事件回调
  /// [formKey] 表单键
  /// [onSubmitBtnLockChanged] 确认按钮锁定回调
  /// [smsCallbackOverride] 覆盖默认操作
  /// [lockPhoneEdit] 是否锁定手机号修改
  SmsAuthWidget({
    required this.verificationType,
    required this.formKey,
    required this.callback,
    required this.lockPhoneEdit,
    this.onSubmitBtnLockChanged,
    this.smsCallbackOverride,
    Key? key,
  }) : super(key: key);

  /// 默认超时时间
  static const defaultTimeout = 60;

  /// 类型：1-登录注册 2-重置密码 3-设置/重置spin
  final String verificationType;

  /// 表单键
  final SmsAuthFormKey formKey;

  /// 结果回调
  final void Function(SmsAuthResult result) callback;

  /// 确认按钮锁定状态变化回调
  final OnSubmitBtnLockChanged? onSubmitBtnLockChanged;

  /// 短信校验覆盖回调
  final SmsCallbackOverride? smsCallbackOverride;

  /// 是否锁定手机号修改
  final bool lockPhoneEdit;

  @override
  Widget build(BuildContext context) => BlocProvider(
        create: (ctx) => _bloc = SmsAuthBloc(smsCallbackOverride)
          ..add(const SmsAuthEvent.getLocalProfile()),
        child: BlocConsumer<SmsAuthBloc, SmsAuthState>(
          listener: _pageListener,
          builder: _createLayout,
        ),
      );
}
```

### 2. 回调类型定义

```dart
/// 确认按钮锁定状态变化回调
typedef OnSubmitBtnLockChanged = void Function(bool locked);

/// 用于覆盖短信校验接口的回调
typedef SmsCallbackOverride = Future<bool> Function(
  PhoneNumber phone,
  VerificationCode smsCode,
);
```

### 3. 手机号掩码扩展

```dart
extension _PhoneStringExtension on String {
  /// 手机号掩码显示，中间4位用*替换
  String get maskPhone {
    final buffer = StringBuffer();
    int i = 0;
    for (final c in characters) {
      if ([3, 4, 5, 6].contains(i)) {
        buffer.write('*');
      } else {
        buffer.write(c);
      }
      i++;
    }
    return buffer.toString();
  }
}
```

### 4. 通用项目组件 (ItemAComponent)

来自general_ui_component模块的通用组件：

```dart
/// 通用项目组件A
class ItemAComponent extends StatelessWidget {
  ItemAComponent({
    required this.title,
    required this.logoImg,
    required this.onItemAClick,
    required this.index,
    this.size,
  });

  /// Logo图片URL
  String logoImg = '';
  
  /// 标题文本
  String title = '';
  
  /// 点击回调
  OnItemAClick onItemAClick;
  
  /// 索引
  int index;
  
  /// 自定义尺寸
  double? size;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      highlightColor: Colors.transparent,
      splashColor: Colors.transparent,
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: width(designWidgetWidth: 48),
                height: width(designWidgetWidth: 48),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: OneColors.bgcSub2,
                ),
              ),
              SizedBox(
                height: size ?? width(designWidgetWidth: 40),
                width: size ?? width(designWidgetWidth: 40),
                child: CacheImageComponent(
                  imageUrl: logoImg,
                ),
              ),
            ],
          ),
          Padding(
            padding: EdgeInsets.only(top: 5.0),
            child: Text(
              title,
              style: OneTextStyle.content(
                color: const Color(0xFF7C7F81),
              ),
            ),
          )
        ],
      ),
      onTap: () => onItemAClick(index),
    );
  }
}

typedef OnItemAClick = Function(int index);
```

## 使用指南

### 1. 短信验证组件使用

```dart
import 'package:ui_business/ui_account.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late SmsAuthFormKey _formKey;
  bool _submitBtnLocked = true;

  @override
  void initState() {
    super.initState();
    _formKey = SmsAuthFormKey();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('短信验证')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            SmsAuthWidget(
              verificationType: '1', // 登录注册类型
              formKey: _formKey,
              lockPhoneEdit: false,
              callback: _handleSmsResult,
              onSubmitBtnLockChanged: (locked) {
                setState(() {
                  _submitBtnLocked = locked;
                });
              },
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _submitBtnLocked ? null : _handleSubmit,
              child: Text('确认'),
            ),
          ],
        ),
      ),
    );
  }

  void _handleSmsResult(SmsAuthResult result) {
    switch (result.state) {
      case SmsAuthResultEnum.success:
        // 验证成功，处理登录逻辑
        print('验证成功，UUID: ${result.uuid}');
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case SmsAuthResultEnum.failed:
        // 验证失败
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('验证失败，请重试')),
        );
        break;
    }
  }

  void _handleSubmit() {
    // 触发表单验证和提交
    _formKey.controllerList.forEach((controller) => controller());
  }
}
```

### 2. 自定义短信验证回调

```dart
// 自定义短信验证逻辑
Future<bool> customSmsVerification(
  PhoneNumber phone, 
  VerificationCode smsCode
) async {
  try {
    // 调用自定义API进行验证
    final response = await MyApiService.verifySms(
      phone: phone.value,
      code: smsCode.value,
    );
    return response.success;
  } catch (e) {
    print('短信验证异常: $e');
    return false;
  }
}

// 使用自定义验证回调
SmsAuthWidget(
  verificationType: '1',
  formKey: _formKey,
  lockPhoneEdit: false,
  callback: _handleSmsResult,
  smsCallbackOverride: customSmsVerification, // 使用自定义验证
)
```

### 3. 通用组件列表使用

```dart
import 'package:general_ui_component/ItemAComponent.dart';

class ServiceListPage extends StatelessWidget {
  final List<ServiceItem> services = [
    ServiceItem('充电服务', 'assets/images/charging.png'),
    ServiceItem('维修保养', 'assets/images/maintenance.png'),
    ServiceItem('道路救援', 'assets/images/rescue.png'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('服务列表')),
      body: GridView.builder(
        padding: EdgeInsets.all(16.0),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          childAspectRatio: 1.0,
          crossAxisSpacing: 16.0,
          mainAxisSpacing: 16.0,
        ),
        itemCount: services.length,
        itemBuilder: (context, index) {
          final service = services[index];
          return ItemAComponent(
            title: service.name,
            logoImg: service.iconUrl,
            index: index,
            onItemAClick: _handleServiceClick,
          );
        },
      ),
    );
  }

  void _handleServiceClick(int index) {
    final service = services[index];
    print('点击了服务: ${service.name}');
    // 处理服务点击逻辑
  }
}
```

### 4. 国际化支持

```dart
import 'package:ui_business/generated/l10n.dart';

class LocalizedWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(S.of(context).smsVerificationPage_hint_code),
        Text(S.of(context).smsVerificationPage_btn_get),
      ],
    );
  }
}
```

## 依赖配置

### pubspec.yaml 关键依赖

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 基础UI组件
  ui_basic:
    path: ../ui_basic
    
  # 基础工具
  basic_utils:
    path: ../../oneapp_basic_utils/basic_utils
    
  # 模块化路由
  basic_modular:
    path: ../../oneapp_basic_utils/basic_modular
    
  # 账户服务
  clr_account:
    path: ../../oneapp_account/clr_account
    
  # 状态管理
  flutter_bloc: ^8.0.0
  
  # 国际化
  flutter_localizations:
    sdk: flutter
  intl: ^0.17.0

dev_dependencies:
  # 国际化代码生成
  intl_utils: ^2.8.0
```

## 国际化配置

### l10n/intl_zh.arb (中文)
```json
{
  "smsVerificationPage_hint_code": "请输入验证码",
  "smsVerificationPage_btn_get": "获取验证码",
  "smsVerificationsPage_error_invalidCode": "验证码格式不正确"
}
```

### l10n/intl_en.arb (英文)
```json
{
  "smsVerificationPage_hint_code": "Please enter verification code",
  "smsVerificationPage_btn_get": "Get Code",
  "smsVerificationsPage_error_invalidCode": "Invalid verification code format"
}
```

## 表单验证

### SmsAuthFormKey 使用

```dart
class CustomFormPage extends StatefulWidget {
  @override
  _CustomFormPageState createState() => _CustomFormPageState();
}

class _CustomFormPageState extends State<CustomFormPage> {
  late SmsAuthFormKey _formKey;

  @override
  void initState() {
    super.initState();
    _formKey = SmsAuthFormKey();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // 表单字段
          ElevatedButton(
            onPressed: () {
              if (_formKey.validate()) {
                _formKey.save();
                // 使用表单数据
                print('手机号: ${_formKey.phone}');
                print('短信码: ${_formKey.sms}');
              }
            },
            child: Text('提交'),
          ),
        ],
      ),
    );
  }
}
```

## 最佳实践

### 1. 错误处理
```dart
// 推荐：完整的错误处理
void _handleSmsResult(SmsAuthResult result) {
  switch (result.state) {
    case SmsAuthResultEnum.success:
      // 成功处理
      _navigateToNextPage(result);
      break;
    case SmsAuthResultEnum.failed:
      // 失败处理，显示用户友好的错误信息
      _showErrorMessage('验证失败，请检查验证码是否正确');
      break;
    case SmsAuthResultEnum.timeout:
      // 超时处理
      _showErrorMessage('验证超时，请重新获取验证码');
      break;
  }
}
```

### 2. 资源管理
```dart
// 推荐：及时释放资源
@override
void dispose() {
  _formKey.dispose();
  super.dispose();
}
```

### 3. 无障碍支持
```dart
// 推荐：添加语义标签
Semantics(
  label: '验证码输入框',
  hint: '请输入6位数字验证码',
  child: SmsAuthWidget(
    // 配置参数
  ),
)
```

## 问题排查

### 常见问题
1. **验证码收不到**: 检查手机号格式和网络连接
2. **倒计时不工作**: 确认CountDownButton状态管理正确
3. **国际化文本不显示**: 检查l10n配置和S.of(context)使用

### 调试技巧
- 使用Flutter Inspector查看Widget树
- 检查BLoC状态变化日志
- 验证表单验证逻辑

