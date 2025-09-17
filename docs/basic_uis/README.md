# Basic UIs 基础UI组件模块群

## 模块群概述

Basic UIs 模块群是 OneApp 的用户界面基础设施，提供了完整的UI组件生态系统。该模块群包含了基础UI组件、业务UI组件和通用UI组件，为整个应用提供统一的设计语言和用户体验。

## 子模块列表

### 核心UI组件
1. **[ui_basic](./ui_basic.md)** - 基础UI组件库
   - 按钮、输入框、卡片等基础组件
   - 布局容器和交互组件
   - 主题系统和响应式设计

2. **[ui_business](./ui_business.md)** - 业务UI组件库
   - 车辆状态展示组件
   - 消息中心组件
   - 地理位置组件
   - 用户同意组件

3. **[basic_uis](./basic_uis.md)** - 通用UI组件集合
   - 组件库整合和统一导出
   - 跨模块UI组件管理
   - 全局UI配置和工具

4. **[general_ui_component](./general_ui_component.md)** - 通用UI组件
   - 可复用的通用组件
   - 跨业务场景组件
   - 第三方组件封装

## 模块架构

### 分层设计
```
应用层 UI 组件
    ↓
业务层 UI 组件 (ui_business)
    ↓
基础层 UI 组件 (ui_basic)
    ↓
Flutter Framework
```

### 组件分类

#### 1. 基础组件层 (ui_basic)
- **原子组件**: Button, TextField, Icon, Text
- **分子组件**: Card, ListTile, AppBar, Dialog
- **布局组件**: Container, Row, Column, Stack
- **交互组件**: GestureDetector, InkWell, RefreshIndicator

#### 2. 业务组件层 (ui_business)
- **车辆组件**: VehicleStatusCard, VehicleControlPanel
- **消息组件**: MessageListView, MessageTile
- **位置组件**: LocationPicker, MapView
- **表单组件**: BusinessForm, ConsentDialog

#### 3. 通用组件层 (basic_uis & general_ui_component)
- **复合组件**: SearchBar, NavigationDrawer
- **特效组件**: AnimatedWidget, TransitionWidget
- **工具组件**: LoadingOverlay, ErrorBoundary

## 设计原则

### 1. 一致性原则
- **视觉一致性**: 统一的颜色、字体、间距规范
- **交互一致性**: 统一的交互模式和反馈机制
- **行为一致性**: 相同功能组件的行为保持一致

### 2. 可访问性原则
- **语义标签**: 为屏幕阅读器提供清晰的语义
- **键盘导航**: 支持键盘和辅助设备导航
- **对比度**: 满足无障碍对比度要求
- **字体缩放**: 支持系统字体缩放设置

### 3. 响应式原则
- **屏幕适配**: 适应不同屏幕尺寸和密度
- **方向适配**: 支持横竖屏切换
- **设备适配**: 针对手机、平板的优化
- **性能适配**: 根据设备性能调整渲染策略

### 4. 可扩展性原则
- **插件化**: 支持组件插件化扩展
- **主题化**: 支持多主题和自定义主题
- **国际化**: 支持多语言和本地化
- **配置化**: 通过配置控制组件行为

## 主题系统

### 主题架构
```dart
class OneAppTheme {
  // 颜色系统
  static ColorScheme get colorScheme => ColorScheme.fromSeed(
    seedColor: const Color(0xFF1976D2),
  );
  
  // 字体系统
  static TextTheme get textTheme => const TextTheme(
    displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
    titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
    bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.normal),
  );
  
  // 组件主题
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    textTheme: textTheme,
    appBarTheme: const AppBarTheme(/* ... */),
    elevatedButtonTheme: ElevatedButtonThemeData(/* ... */),
  );
}
```

### 设计令牌 (Design Tokens)
```dart
class DesignTokens {
  // 间距系统
  static const double spacingXs = 4.0;
  static const double spacingSm = 8.0;
  static const double spacingMd = 16.0;
  static const double spacingLg = 24.0;
  static const double spacingXl = 32.0;
  
  // 圆角系统
  static const double radiusXs = 4.0;
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  
  // 阴影系统
  static const List<BoxShadow> shadowSm = [
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];
}
```

## 组件开发规范

### 1. 组件结构
```dart
class ExampleComponent extends StatelessWidget {
  // 1. 必需参数
  final String title;
  
  // 2. 可选参数
  final String? subtitle;
  final VoidCallback? onTap;
  
  // 3. 样式参数
  final TextStyle? titleStyle;
  final EdgeInsets? padding;
  
  // 4. 构造函数
  const ExampleComponent({
    Key? key,
    required this.title,
    this.subtitle,
    this.onTap,
    this.titleStyle,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(/* 实现 */);
  }
}
```

### 2. 命名规范
- **组件名称**: 使用PascalCase，如 `VehicleStatusCard`
- **参数名称**: 使用camelCase，如 `onPressed`
- **常量名称**: 使用camelCase，如 `defaultPadding`
- **枚举名称**: 使用PascalCase，如 `ButtonType`

### 3. 文档规范
```dart
/// 车辆状态卡片组件
/// 
/// 用于展示车辆的基本状态信息，包括电量、里程、锁定状态等。
/// 支持点击交互和自定义样式。
/// 
/// 示例用法：
/// ```dart
/// VehicleStatusCard(
///   status: vehicleStatus,
///   onTap: () => Navigator.push(...),
/// )
/// ```
class VehicleStatusCard extends StatelessWidget {
  /// 车辆状态数据
  final VehicleStatus status;
  
  /// 点击回调函数
  final VoidCallback? onTap;
}
```

## 性能优化策略

### 1. 渲染优化
- **Widget缓存**: 缓存不变的Widget实例
- **RepaintBoundary**: 隔离重绘区域
- **Const构造**: 使用const构造函数
- **Build优化**: 避免在build方法中创建对象

### 2. 内存优化
- **资源释放**: 及时释放Controller和Stream
- **图片缓存**: 合理使用图片缓存策略
- **对象池**: 复用频繁创建的对象
- **弱引用**: 避免内存泄漏

### 3. 加载优化
- **懒加载**: 按需加载组件和资源
- **预加载**: 预测性加载关键资源
- **分包加载**: 大型组件分包异步加载
- **缓存策略**: 智能缓存机制

## 测试策略

### 1. 单元测试
```dart
testWidgets('VehicleStatusCard displays correct information', (tester) async {
  const status = VehicleStatus(
    vehicleName: 'Test Vehicle',
    batteryLevel: 80,
    isLocked: true,
  );

  await tester.pumpWidget(
    MaterialApp(
      home: VehicleStatusCard(status: status),
    ),
  );

  expect(find.text('Test Vehicle'), findsOneWidget);
  expect(find.text('80%'), findsOneWidget);
  expect(find.byIcon(Icons.lock), findsOneWidget);
});
```

### 2. Widget测试
- **渲染测试**: 验证组件正确渲染
- **交互测试**: 测试用户交互响应
- **状态测试**: 测试状态变化
- **样式测试**: 验证样式正确应用

### 3. 集成测试
- **页面流程测试**: 测试完整用户流程
- **性能测试**: 测试组件性能表现
- **兼容性测试**: 测试不同设备兼容性
- **可访问性测试**: 测试无障碍功能

## 构建和发布

### 1. 版本管理
- **语义化版本**: 遵循 semver 规范
- **变更日志**: 详细的变更记录
- **向后兼容**: 保证API向后兼容
- **废弃通知**: 提前通知API废弃

### 2. 发布流程
```bash
# 1. 运行测试
flutter test

# 2. 更新版本号
# 编辑 pubspec.yaml

# 3. 更新变更日志
# 编辑 CHANGELOG.md

# 4. 发布包
flutter pub publish
```

## 使用指南

### 1. 快速开始
```dart
import 'package:ui_basic/ui_basic.dart';
import 'package:ui_business/ui_business.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: OneAppTheme.lightTheme,
      home: MyHomePage(),
    );
  }
}
```

### 2. 组件使用
```dart
// 基础组件使用
BasicButton(
  text: '确定',
  type: ButtonType.primary,
  onPressed: () {},
)

// 业务组件使用
VehicleStatusCard(
  status: vehicleStatus,
  onTap: () {},
)
```

### 3. 主题定制
```dart
MaterialApp(
  theme: OneAppTheme.lightTheme.copyWith(
    primarySwatch: Colors.green,
    // 其他自定义配置
  ),
)
```

## 最佳实践

### 1. 组件设计
- **单一职责**: 每个组件功能单一明确
- **可组合性**: 支持组件组合使用
- **可配置性**: 提供丰富的配置选项
- **可预测性**: 相同输入产生相同输出

### 2. API设计
- **直观性**: API命名直观易理解
- **一致性**: 相似功能API保持一致
- **扩展性**: 预留扩展空间
- **文档化**: 提供完整文档和示例

### 3. 性能考虑
- **懒加载**: 按需加载减少初始化开销
- **缓存策略**: 合理使用缓存提升性能
- **异步处理**: 避免阻塞UI线程
- **资源管理**: 及时释放不需要的资源

## 总结

Basic UIs 模块群为 OneApp 提供了完整的UI基础设施，通过分层设计、统一规范和完善的工具链，实现了高效的UI开发和一致的用户体验。模块群具有良好的可扩展性和可维护性，能够支撑大型应用的UI需求，并为未来的功能扩展提供了坚实的基础。
