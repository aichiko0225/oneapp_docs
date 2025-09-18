# OneApp Account 账户模块文档

## 模块概述

`oneapp_account` 是 OneApp 的用户账户管理模块，负责用户认证、登录、注册、权限管理等核心功能。该模块包含两个主要子模块：

- **clr_account**: 账户服务 SDK，提供账户相关的核心服务接口
- **jverify**: 极验验证 Flutter 插件，提供安全验证功能

## 真实项目结构

基于实际的 `oneapp_account` 项目结构：

```
oneapp_account/
├── lib/
│   ├── account.dart              # 主要导出文件
│   ├── account_api.dart          # API接口定义
│   ├── account_third_bind.dart   # 第三方绑定
│   ├── module_constants.dart     # 模块常量
│   ├── generated/                # 代码生成文件
│   ├── l10n/                     # 国际化文件
│   └── src/                      # 源代码目录
│       ├── account_dependency.dart  # 依赖配置
│       ├── blocs/                # BLoC状态管理
│       │   ├── personal_center/  # 个人中心BLoC
│       │   ├── garage/          # 车库管理BLoC
│       │   ├── vehicle_info/    # 车辆信息BLoC
│       │   ├── phone_sign_in/   # 手机登录BLoC
│       │   ├── bind_vehicle_new/ # 绑车流程BLoC
│       │   ├── qr_hu_confirm/   # 二维码确认BLoC
│       │   └── ...              # 其他业务BLoC
│       ├── pages/                # 页面组件
│       ├── model/                # 数据模型
│       ├── utils/                # 工具类
│       ├── constants/            # 常量定义
│       ├── route_dp.dart         # 路由配置
│       └── route_export.dart     # 路由导出
├── clr_account/                  # 账户连接层服务
├── jverify/                      # 极验验证插件
├── assets/                       # 资源文件
└── pubspec.yaml                  # 依赖配置
```

## 子模块文档

- [CLR Account 账户服务 SDK](./clr_account.md)
- [JVerify 极验验证插件](./jverify.md)

## 主要功能

### 真实实现的功能模块
基于实际项目代码，账户模块包含以下已实现的功能：

#### 1. 用户认证和登录
- **手机号登录** (`phone_sign_in/`) - 支持手机号密码登录
- **验证码验证** (`verification_code_input/`) - 短信验证码确认
- **第三方登录** (`third_sign_in/`) - 第三方账户集成
- **二维码登录确认** (`qr_hu_confirm/`) - 车机登录确认功能

#### 2. 个人信息管理
- **个人中心** (`personal_center/`) - 用户信息展示和管理
- **个人资料** (`personal_intro/`) - 个人信息编辑
- **头像管理** - 用户头像上传和设置
- **手机号更新** (`update_phone/`) - 更换绑定手机号

#### 3. 车辆管理
- **车库管理** (`garage/`) - 车辆列表和管理
- **车辆信息** (`vehicle_info/`) - 车辆详细信息查看
- **绑车流程** (`bind_vehicle_new/`) - 新车绑定流程
- **车辆授权** (`vehicle_auth/`) - 车辆访问权限管理
- **车牌设置** (`plate_no_edit/`) - 车牌号码编辑

#### 4. 扫码功能
- **二维码扫描** (`qr_scan/`) - 通用二维码扫描
- **扫码登录** (`scan_login_hu/`) - 扫码登录车机功能
- **绑车二维码** - 车辆绑定二维码处理

#### 5. 账户安全
- **账户注销** (`cancel_account/`) - 用户账户注销流程
- **短信认证** (`sms_auth/`) - 安全操作短信验证
- **用户协议** (`agreement/`) - 用户协议和隐私政策

## 真实技术架构

### 模块依赖
基于实际 `pubspec.yaml` 的真实依赖：

```yaml
dependencies:
  # 核心框架
  basic_modular: ^0.2.3           # 模块化框架
  basic_modular_route: ^0.2.1     # 路由管理
  basic_network: ^0.2.3+4         # 网络请求
  basic_storage: ^0.2.2           # 本地存储
  
  # 业务依赖
  clr_account: ^0.2.24            # 账户服务SDK (本地路径)
  car_vehicle: ^0.6.4+1           # 车辆服务
  app_consent: ^0.2.19            # 用户同意管理
  
  # 工具依赖
  dartz: ^0.10.1                  # 函数式编程
  freezed_annotation: ^2.2.0      # 不可变类生成
  flutter_contacts: ^1.1.5        # 联系人服务
```

## 依赖关系

该模块被 `oneapp_main` 项目依赖，为整个应用提供用户账户相关的基础服务。

## 开发指南

### 环境要求
- Flutter >=3.0.0
- Dart >=3.0.0

### 集成使用
详细的集成使用方法请参考各子模块的具体文档。
