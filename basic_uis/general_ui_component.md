# General UI Component 通用UI组件模块

## 模块概述

`general_ui_component` 是 OneApp 基础UI模块群中的通用UI组件模块，专门提供可复用的通用界面组件。该模块实现了通用的项目组件和分享对话框等核心功能。

### 基本信息
- **模块名称**: general_ui_component
- **版本**: 0.0.1
- **描述**: 通用UI组件库
- **Flutter 版本**: >=1.17.0

## 核心组件

### 1. 项目组件 (ItemAComponent)

基于真实项目代码的通用项目展示组件：

```dart
/// 通用项目组件A，用于显示带图标和标题的项目
class ItemAComponent extends StatelessWidget {
  /// Logo图片URL
  String logoImg = '';
  
  /// 标题文本
  String title = '';
  
  /// 点击回调函数
  OnItemAClick onItemAClick;
  
  /// 项目索引
  int index;
  
  /// 自定义尺寸（可选）
  double? size;

  ItemAComponent({
    required this.title,
    required this.logoImg,
    required this.onItemAClick,
    required this.index,
    this.size,
  });

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
              // 圆形背景
              Container(
                width: width(designWidgetWidth: 48),
                height: width(designWidgetWidth: 48),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: OneColors.bgcSub2,
                ),
              ),
              // 图标图片
              SizedBox(
                height: size ?? width(designWidgetWidth: 40),
                width: size ?? width(designWidgetWidth: 40),
                child: CacheImageComponent(
                  imageUrl: logoImg,
                ),
              ),
            ],
          ),
          // 标题文本
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

/// 项目点击回调函数类型定义
typedef OnItemAClick = Function(int index);
```

### 2. 分享对话框 (ShareDialog)

基于真实项目代码的分享功能对话框：

```dart
/// 分享对话框组件
class Sharedialog extends StatelessWidget {
  /// 项目点击回调
  OnItemAClick onItemAClick;
  
  /// 分享项目名称列表
  List<String> itemNameList;
  
  /// 底部操作组件（可选）
  Widget? bottomActionWidget;

  Sharedialog({
    required this.onItemAClick,
    required this.itemNameList,
    this.bottomActionWidget,
  });

  @override
  Widget build(BuildContext context) {
    if (itemNameList.isNotEmpty) {
      List<Widget> itemWidgetList = [];
      
      for (int i = 0; i < itemNameList.length; i++) {
        // 添加间距
        if (bottomActionWidget != null) {
          itemWidgetList.add(SizedBox(
            width: width(designWidgetWidth: 36),
          ));
        }

        // 根据类型创建不同的分享项目
        switch (itemNameList[i]) {
          case 'weibo':
            itemWidgetList.add(_createShareItem(
              title: BasicUisIntlDelegate.current.Weibo,
              logoImg: 'packages/basic_uis/assets/icon/weibo.png',
              index: i,
            ));
            break;
          case 'weixin':
            itemWidgetList.add(_createShareItem(
              title: BasicUisIntlDelegate.current.WeChat,
              logoImg: 'packages/basic_uis/assets/icon/wechat.png',
              index: i,
            ));
            break;
          case 'friends':
            itemWidgetList.add(_createShareItem(
              title: BasicUisIntlDelegate.current.FriendCircle,
              logoImg: 'packages/basic_uis/assets/icon/moments.png',
              index: i,
            ));
            break;
          case 'copy':
            itemWidgetList.add(_createShareItem(
              title: BasicUisIntlDelegate.current.copyLink,
              logoImg: 'packages/basic_uis/assets/icon/copy_link.png',
              index: i,
              size: width(designWidgetWidth: 20),
            ));
            break;
        }
      }
      
      return Container(
        child: Wrap(
          children: itemWidgetList,
        ),
      );
    }
    return Container();
  }

  /// 创建分享项目组件
  Widget _createShareItem({
    required String title,
    required String logoImg,
    required int index,
    double? size,
  }) {
    return ItemAComponent(
      title: title,
      logoImg: logoImg,
      index: index,
      size: size,
      onItemAClick: (int index) => onItemAClick(index),
    );
  }
}
```

## 技术架构

### 目录结构

基于实际项目结构：

```
lib/
├── ItemAComponent.dart         # 通用项目组件
└── share/                      # 分享功能相关
    ├── dialog/                 # 分享对话框
    │   └── ShareDialog.dart    # 分享对话框实现
    └── util/                   # 分享工具类
```

### 依赖关系

基于实际项目依赖：

```dart
// 国际化支持
import 'package:basic_uis/generated/l10n.dart';
import 'package:basic_utils/generated/l10n.dart';

// UI基础组件
import 'package:ui_basic/ui_basic.dart';

// 基础工具
import 'package:basic_utils/basic_utils.dart';

// 缓存图片组件
import 'package:basic_uis/src/common_components/cache_image_component.dart';
```

## 使用指南

### 1. ItemAComponent 使用示例

```dart
import 'package:general_ui_component/ItemAComponent.dart';

class ServiceGridPage extends StatelessWidget {
  final List<ServiceItem> services = [
    ServiceItem('充电服务', 'assets/icons/charging.png'),
    ServiceItem('维修保养', 'assets/icons/maintenance.png'),
    ServiceItem('道路救援', 'assets/icons/rescue.png'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('服务中心')),
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
    print('选择了服务: ${service.name}');
    // 处理服务选择逻辑
  }
}

class ServiceItem {
  final String name;
  final String iconUrl;
  
  ServiceItem(this.name, this.iconUrl);
}
```

### 2. ShareDialog 分享功能使用

```dart
import 'package:general_ui_component/share/dialog/ShareDialog.dart';

class ShareExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => _showShareDialog(context),
      child: Text('分享内容'),
    );
  }

  void _showShareDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Sharedialog(
        itemNameList: ['weixin', 'friends', 'weibo', 'copy'],
        onItemAClick: _handleShareAction,
        bottomActionWidget: Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('选择分享方式'),
        ),
      ),
    );
  }

  void _handleShareAction(int index) {
    switch (index) {
      case 0:
        print('分享到微信');
        break;
      case 1:
        print('分享到朋友圈');
        break;
      case 2:
        print('分享到微博');
        break;
      case 3:
        print('复制链接');
        break;
    }
  }
}

## 依赖配置

### pubspec.yaml 关键依赖

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 国际化支持
  basic_uis:
    path: ../basic_uis
    
  # 基础工具
  basic_utils:
    path: ../../oneapp_basic_utils/basic_utils
    
  # UI基础组件
  ui_basic:
    path: ../ui_basic

dev_dependencies:
  build_runner: any
  freezed: ^2.3.5
  flutter_lints: ^5.0.0
```

## 最佳实践

### 1. 组件复用
```dart
// 推荐：创建配置化的服务列表
Widget buildServiceGrid({
  required List<ServiceItem> services,
  required OnItemAClick onItemClick,
}) {
  return GridView.builder(
    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
      crossAxisCount: 3,
      childAspectRatio: 1.0,
    ),
    itemCount: services.length,
    itemBuilder: (context, index) {
      final service = services[index];
      return ItemAComponent(
        title: service.name,
        logoImg: service.iconUrl,
        index: index,
        onItemAClick: onItemClick,
      );
    },
  );
}
```

### 2. 分享功能集成
```dart
// 推荐：封装分享功能
class ShareHelper {
  static void showShareDialog(
    BuildContext context,
    String content, {
    List<String> platforms = const ['weixin', 'friends', 'weibo', 'copy'],
  }) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Sharedialog(
        itemNameList: platforms,
        onItemAClick: (index) => _handleShare(context, content, platforms[index]),
      ),
    );
  }

  static void _handleShare(BuildContext context, String content, String platform) {
    // 实际分享逻辑实现
    Navigator.pop(context);
  }
}
```

### 3. 主题适配
```dart
// 推荐：支持主题切换
ItemAComponent(
  title: service.name,
  logoImg: service.iconUrl,
  index: index,
  onItemAClick: onItemClick,
  // 自动适配当前主题
)
```

## 项目集成

### 模块依赖关系

```dart
// 实际项目中的依赖导入
import 'package:basic_uis/generated/l10n.dart';  // 国际化
import 'package:basic_utils/basic_utils.dart';    // 工具类
import 'package:ui_basic/ui_basic.dart';          // UI基础
import 'package:flutter/material.dart';           // Flutter核心
```

### 使用建议

1. **性能优化**：使用`const`构造函数优化重建性能
2. **内存管理**：及时释放不用的控制器和监听器  
3. **主题一致性**：使用OneColors主题颜色系统
4. **国际化支持**：使用BasicUisIntlDelegate进行文本国际化

## 总结

`general_ui_component` 模块提供了OneApp项目中的核心通用UI组件，包括：

- **ItemAComponent**: 通用项目展示组件，支持圆形图标和文本标题
- **ShareDialog**: 分享功能对话框，支持微信、朋友圈、微博、复制等分享方式
- **完整的依赖管理**: 与OneApp其他模块的良好集成
- **国际化支持**: 完整的中英文多语言支持

这些组件为OneApp提供了统一的UI设计语言和交互模式，确保了应用界面的一致性和可维护性。
