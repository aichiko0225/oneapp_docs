# OneApp Community - 社区模块文档

## 模块概述

`oneapp_community` 是 OneApp 的社区模块，专注于社区发现和用户互动功能。该模块提供社区内容浏览、文章发现、动态时刻、用户主页等核心功能。

### 基本信息
- **模块名称**: oneapp_community
- **版本**: 0.0.3
- **类型**: Flutter Package

### 核心导出组件

基于真实项目代码的主要导出：

```dart
library oneapp_community;

// 社区发现模块
export 'src/app_modules/app_discover/pages/community_tab_page.dart';
export 'src/app_modules/app_discover/pages/discover_tab_page.dart';
export 'src/app_modules/app_discover/pages/community_tab_explore_page.dart';
export 'src/app_modules/app_discover/pages/discover_article_page.dart';
export 'src/app_modules/app_discover/pages/discovery_moment_page.dart';

// 用户模块
export 'src/app_modules/app_mine/pages/user_home_page.dart';

// 路由和模块配置
export 'src/community_route_dp.dart';
export 'src/community_route_export.dart';
export 'src/oneapp_community_module.dart';

// 数据模型
export '/src/app_modules/app_mine/models/ads_space_model.dart';

// 组件
export 'src/app_component/medium_component/sweep_video_bg.dart';
```

## 目录结构

基于实际项目结构：

```
oneapp_community/
├── lib/
│   ├── oneapp_community.dart     # 主导出文件
│   ├── generated/                # 生成的国际化文件
│   ├── l10n/                    # 国际化资源文件
│   └── src/                     # 源代码目录
│       ├── app_modules/         # 应用模块
│       │   ├── app_discover/    # 发现模块
│       │   │   └── pages/       # 发现页面
│       │   └── app_mine/        # 我的模块
│       │       ├── pages/       # 用户页面
│       │       └── models/      # 数据模型
│       ├── app_component/       # 应用组件
│       │   └── medium_component/ # 媒体组件
│       ├── community_route_dp.dart      # 社区路由依赖
│       ├── community_route_export.dart  # 社区路由导出
│       └── oneapp_community_module.dart # 社区模块定义
├── assets/                      # 静态资源
└── pubspec.yaml                # 依赖配置
```

## 核心功能模块

### 1. 社区发现功能

实际项目包含的发现页面：

- **community_tab_page.dart**: 社区标签页面
- **discover_tab_page.dart**: 发现标签页面  
- **community_tab_explore_page.dart**: 社区探索页面
- **discover_article_page.dart**: 发现文章页面
- **discovery_moment_page.dart**: 发现动态页面

### 2. 用户相关功能

- **user_home_page.dart**: 用户主页页面
- **ads_space_model.dart**: 广告位数据模型

### 3. 媒体组件功能

- **sweep_video_bg.dart**: 视频背景扫描组件

## 技术架构

### 模块化设计

基于OneApp的模块化架构：

```dart
// 社区模块类（推测结构）
class OneAppCommunityModule extends Module {
  @override
  List<Bind> get binds => [
    // 服务绑定
  ];

  @override
  List<ModularRoute> get routes => [
    // 路由配置
  ];
}
```

### 路由管理

```dart
// 社区路由导出
class CommunityRouteExport {
  // 路由键定义
  static const String keyCommunityTab = 'Key_Community_Tab';
  static const String keyDiscoverTab = 'Key_Discover_Tab';
  static const String keyUserHome = 'Key_User_Home';
  
  // 其他路由相关配置
}
```

## 使用指南

### 1. 模块集成

```dart
// 在主应用中导入社区模块
import 'package:oneapp_community/oneapp_community.dart';

// 注册模块
class AppModule extends Module {
  @override
  List<Module> get imports => [
    OneAppCommunityModule(),
    // 其他模块...
  ];
}
```

### 2. 页面导航

```dart
// 导航到社区页面
Navigator.pushNamed(context, '/community_tab');

// 导航到发现页面
Navigator.pushNamed(context, '/discover_tab');

// 导航到用户主页
Navigator.pushNamed(context, '/user_home');
```

### 3. 组件使用

```dart
// 使用视频背景组件
SweepVideoBg(
  videoUrl: 'your_video_url',
  child: YourContentWidget(),
)
```

## 依赖配置

### pubspec.yaml 关键依赖

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 基础模块依赖
  basic_modular:
    path: ../oneapp_basic_utils/basic_modular
    
  # UI基础组件
  ui_basic:
    path: ../oneapp_basic_uis/ui_basic

  # 国际化支持
  flutter_localizations:
    sdk: flutter
  intl: ^0.17.0

dev_dependencies:
  # 国际化代码生成
  intl_utils: ^2.8.0
```

## 最佳实践

### 1. 性能优化
- 使用懒加载优化页面加载速度
- 合理缓存图片和视频资源
- 实现虚拟列表减少内存占用

### 2. 用户体验
- 提供加载状态指示
- 实现下拉刷新和上拉加载
- 支持离线浏览缓存内容

### 3. 代码组织
- 按功能模块组织代码结构
- 使用BLoC模式管理状态
- 实现完整的错误处理机制

## 问题排查

### 常见问题
1. **页面加载慢**: 检查网络请求和图片加载优化
2. **内存占用高**: 使用内存分析工具检查是否有内存泄漏
3. **导航异常**: 检查路由配置和模块注册

### 调试技巧
- 使用Flutter Inspector检查组件树
- 启用性能监控查看帧率
- 使用网络抓包工具检查API调用
