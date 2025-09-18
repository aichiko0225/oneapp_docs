# UI Basic 基础UI组件模块

## 模块概述

`ui_basic` 是 OneApp 基础UI模块群中的核心组件库，提供了应用开发中常用的基础UI组件和交互元素。该模块封装了通用的界面组件、布局容器、表单元素等，为整个应用提供统一的设计语言和用户体验。

### 基本信息
- **模块名称**: ui_basic
- **版本**: 0.2.45
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-ui-basic
- **Flutter 版本**: >=1.17.0
- **Dart 版本**: >=2.17.0 <4.0.0
- **发布服务器**: http://175.24.250.68:4000/

## 功能特性

### 核心功能
基于实际项目的UI组件库，包含丰富的组件和第三方集成。

1. **基础组件库**
   - 按钮组件（OneIconButton、CommonButton）
   - 输入组件（BasicTextField、BasicMultiTextField、VehiclePlateField）
   - 展示组件（OneTag、OneCard、ProgressWidget）
   - 导航组件（CommonTitleBar、CommonTabbar）

2. **交互组件**
   - 上拉下拉刷新（pull_to_refresh集成）
   - 轮播图组件（OneSwiper、carousel_slider集成）
   - 对话框和弹窗（OneDialogX、CommonBottomSheet）
   - 加载指示器（LoadingWidget、CommonLoadingWidget）

3. **多媒体组件**
   - 图片组件（GlinettImage、ImageWidget、CachedNetworkImage集成）
   - 扫码组件（QrScannerWidget、flutter_scankit集成）
   - 相机组件（CameraWidget、camera集成）
   - SVG支持（flutter_svg集成）

4. **富文本和图表**
   - HTML富文本渲染（flutter_html集成）
   - 图表组件（OneChart、fl_chart集成）
   - ECharts集成（FlutterEcharts）
   - 评分组件（RatingWidget、flutter_rating_bar集成）

## 技术架构

### 目录结构
```
lib/
├── ui_basic.dart               # 模块入口文件
├── src/                        # 源代码目录
│   ├── components/             # 基础组件
│   ├── containers/             # 布局容器
│   ├── interactions/           # 交互组件
│   ├── themes/                 # 主题配置
│   ├── utils/                  # 工具类
│   └── constants/              # 常量定义
├── widgets/                    # 组件导出
└── themes/                     # 主题文件
```

### 依赖关系

基于实际项目的pubspec.yaml配置，展示真实的依赖架构。

#### 框架依赖
```yaml
# 核心框架依赖
dependencies:
  basic_network: ^0.2.3+4      # 网络通信基础
  basic_modular: ^0.2.3        # 模块化框架
  basic_modular_route: ^0.2.1  # 路由管理
  basic_intl_flutter: ^0.2.2+1 # 国际化支持
  basic_theme_core: ^0.2.5     # 主题核心
  ui_basic_annotation: ^0.2.0  # UI框架注解
```

#### UI和交互依赖
```yaml
# UI组件和交互依赖
dependencies:
  provider: ^6.0.5             # 状态管理
  flutter_html: ^3.0.0-beta.2 # HTML富文本渲染
  badges: ^3.1.1               # 角标组件
  pull_to_refresh: ^2.0.0      # 上拉下拉刷新
  carousel_slider: ^4.2.1      # 轮播图组件
  cached_network_image: ^3.3.0 # 缓存网络图片
  flutter_svg: ^2.0.6          # SVG图片支持
  flutter_smart_dialog: ^4.9.1 # 智能对话框
  visibility_detector: ^0.4.0+2# 可见性检测
  fl_chart: ^0.x.x             # 图表组件
```

#### 多媒体和工具依赖
```yaml
# 多媒体和工具依赖
dependencies:
  camera: ^0.10.5+2            # 相机功能
  image_picker: ^1.1.2         # 图片选择
  image_cropper: ^9.1.0        # 图片裁剪
  flutter_image_compress: ^2.0.3# 图片压缩
  flutter_scankit: 2.0.3+1    # 扫码工具
  url_launcher: ^6.1.11       # URL跳转
  flutter_rating_bar: ^4.0.1   # 评分组件
  sprintf: ^7.0.0              # 字符串格式化
  dartz: ^0.10.1               # 函数式编程
  rxdart: ^0.27.7              # 响应式编程
```

## 核心组件分析

### 1. 模块入口 (`ui_basic.dart`)

基于真实项目的模块导出结构，包含大量第三方库集成和自定义组件。

**功能职责**:
- 统一导出所有UI组件和第三方库
- 集成badge、cached_network_image、flutter_html等核心UI库
- 导出自定义组件如OneColors、OneTextStyle、OneIcons
- 提供car_func_block等车辆相关UI组件

```dart
// 实际的模块导出结构（ui_basic.dart）
library ui_basic;

// 第三方UI库集成
export 'package:badges/badges.dart';
export 'package:cached_network_image/cached_network_image.dart';
export 'package:flutter_html/flutter_html.dart';
export 'package:flutter_svg/flutter_svg.dart';
export 'package:visibility_detector/visibility_detector.dart';
export 'package:bottom_sheet/bottom_sheet.dart';
export 'package:fl_chart/fl_chart.dart';

// 自定义组件导出
export 'src/colors/colors.dart' show OneColors;
export 'src/fonts/fonts.dart' show OneTextStyle, TextFont, OneBasicText;
export 'src/icon/icon.dart' show OneIcons;

// UI组件导出
export 'src/components/appbar/common_title_bar.dart';
export 'src/components/button/buttons.dart';
export 'src/components/dialog/dialog_export.dart';
export 'src/components/loading/loading_widget.dart';
export 'src/components/text_field/basic_text_field.dart';
export 'src/components/cards/cards_export.dart';

// 车辆功能组件
export 'src/car_func_block/car_func_block_class.dart';
export 'src/car_func_block/car_func_block_manager.dart';

// 工具类导出
export 'src/utils/qr_scanner_util/qr_scanner_util.dart';
export 'src/utils/image_util/image_util.dart';
export 'src/utils/launcher/launch_util.dart';
```

### 2. 主题颜色系统 (`src/colors/colors.dart`)

基于主题核心框架的动态颜色系统，支持主题切换和自定义颜色。

```dart
// 实际的颜色系统实现
class OneColors {
  /// 主题色 Primary Color
  static Color get primary =>
      theme.ofStandard().themeData?.appColors?.primary ??
      const Color(0xFFEED484);

  /// 背景色 Bgc
  static Color get bgc =>
      theme.ofStandard().themeData?.appColors?.backgroundColors.bgc ??
      const Color(0xFFFFFFFF);

  /// 背景色 辅助1-5
  static Color get bgcSub1 =>
      theme.ofStandard().themeData?.appColors?.backgroundColors.bgcSub1 ??
      const Color(0xFFFFFFFF);
  // ... 更多背景色变体

  /// 动态主题获取
  static ITheme get theme => uiBasicPlatformInfoDeps.theme != null
      ? uiBasicPlatformInfoDeps.theme!
      : DefaultTheme(
          DefaultStandardResource(),
          DefaultUiKitResource(),
        );
}
```

### 4. 按钮组件 (`src/components/button/buttons.dart`)

基于真实项目的按钮组件实现，支持多种按钮类型和状态管理。

```dart
// 实际的按钮状态枚举
enum BtnLoadingStatus {
  /// 初始化
  idle,
  /// 加载中
  loading,
}

/// 按钮类型枚举
enum BtnType {
  /// TextButton
  text,
  /// ElevatedButton
  elevated,
  /// OutlineButton
  outline,
}

/// 实际的图标按钮组件
class OneIconButton extends StatelessWidget {
  const OneIconButton({
    required this.child,
    this.iconSize,
    this.cubit,
    this.onPress,
    this.style,
    Key? key,
  }) : super(key: key);

  /// 按钮内容
  final Widget child;
  /// 字体大小
  final double? iconSize;
  /// 状态管理
  final OneIconButtonCubit? cubit;
  /// 点击回调
  final VoidCallback? onPress;
  /// 样式配置
  final ButtonStyle? style;

  @override
  Widget build(BuildContext context) {
    // 实际的按钮实现逻辑
    // 支持状态管理和样式定制
  }
}

/// 通用按钮组件
class CommonButton extends StatelessWidget {
  // 支持加载状态、不同按钮类型、自定义样式等
  // 集成BLoC状态管理和主题系统
}
```

### 5. 文本输入组件 (`src/components/text_field/`)

包含多种文本输入组件的真实实现。

```dart
// 基础文本输入字段
export 'src/components/text_field/basic_text_field.dart';
export 'src/components/text_field/basic_multi_text_field.dart';
export 'src/components/text_field/clear_text_field.dart';
export 'src/components/text_field/edit_text/edit_text.dart';

// 特殊用途文本字段
export 'src/components/text_field/vehicle_plate_field/vehicle_plate_field_widget.dart';

// 实际支持的功能：
// - 基础文本输入
// - 多行文本输入
// - 带清除按钮的文本输入
// - 车牌号输入专用组件
// - 集成表单验证和状态管理
```

### 7. 第三方UI库集成

ui_basic模块集成了大量优秀的第三方UI库，提供开箱即用的功能。

```dart
// 图标和标记组件
export 'package:badges/badges.dart';              // 角标组件
export 'package:font_awesome_flutter/font_awesome_flutter.dart'; // FontAwesome图标

// 图片和多媒体
export 'package:cached_network_image/cached_network_image.dart'; // 缓存网络图片
export 'package:flutter_svg/flutter_svg.dart';    // SVG支持
export 'package:dd_js_util/dd_js_util.dart';      // 九宫格图片选择

// 富文本和格式化
export 'package:flutter_html/flutter_html.dart';  // HTML渲染
export 'package:sprintf/sprintf.dart';            // 字符串格式化
export 'package:auto_size_text/auto_size_text.dart'; // 自适应文本

// 交互组件
export 'package:bottom_sheet/bottom_sheet.dart';  // 底部弹出框
export 'package:visibility_detector/visibility_detector.dart'; // 可见性检测
export 'package:extended_tabs/extended_tabs.dart'; // 扩展Tab组件

// 图表组件
export 'package:fl_chart/fl_chart.dart';          // Flutter图表库

// 轮播组件  
export 'package:flutter_swiper_null_safety_flutter3/flutter_swiper_null_safety_flutter3.dart';
```

### 8. 工具类组件 (`src/utils/`)

丰富的工具类支持，涵盖图片处理、扫码、启动器等功能。

```dart
// 图片相关工具
export 'src/utils/image_util/image_util.dart';
export 'src/utils/image_solution/image_solution_tools.dart';
export 'src/utils/image_cropper_util/nativate_image_cropper.dart';

// 扫码相关
export 'src/utils/qr_processor/qr_processor.dart';
export 'src/utils/qr_scanner_util/qr_scanner_util.dart';

// 系统交互
export 'src/utils/launcher/launch_util.dart';     // URL启动器
export 'src/utils/imm/custom_imm.dart';           // 输入法管理

// 订单管理
export 'src/utils/order_category_manager/order_category_factory.dart';
export 'src/utils/order_category_manager/order_category_manager.dart';

// 其他工具
export 'src/utils/keep_alive.dart';               // KeepAlive包装器
export 'src/utils/widget_utils.dart';             // Widget工具类
export 'src/utils/methods.dart' show formatDate;  // 格式化方法
```

### 9. 特色组件

针对OneApp应用特点开发的专用组件。

```dart
// 车牌号相关
export 'src/components/one_license_plate_number/one_license_plate_number.dart';
export 'src/components/text_field/vehicle_plate_field/vehicle_plate_field_widget.dart';

// 车辆HVAC相关
export 'src/components/widgets/car_hvac_other_widget.dart';

// 香氛组件
export 'src/components/fragrance/fragrance_widget.dart';

// 步进器组件
export 'src/components/stepper/stepper_widget.dart';

// 验证码组件
export 'src/components/verification_code/verification_box.dart';
export 'src/components/verification_code/code_widget.dart';

// 时间选择器
export 'src/components/time_picker/common_time_picker.dart';
export 'src/components/time_picker/ym_time_picker.dart';

// 可扩展GridView
export 'src/components/gridview/expandable_gridview.dart';

// 瀑布流ScrollView
export 'src/components/widgets/staggered_scrollview_widget.dart';
export 'src/components/widgets/reorderable_staggered_scroll_view_widget.dart';
```

## 性能优化

### 组件优化策略
- **Widget缓存**: 缓存不变的Widget实例
- **局部更新**: 使用Consumer精确控制更新范围
- **延迟构建**: 使用Builder延迟构建复杂组件
- **内存管理**: 及时释放资源和控制器

### 渲染优化
- **RepaintBoundary**: 隔离重绘区域
- **ListView.builder**: 使用懒加载列表
- **Image优化**: 合理使用缓存和压缩
- **动画优化**: 使用硬件加速动画

## 测试策略

### Widget测试
- **组件渲染测试**: 验证组件正确渲染
- **交互测试**: 测试用户交互响应
- **主题测试**: 验证主题正确应用
- **响应式测试**: 测试不同屏幕尺寸适配

### 单元测试
- **工具类测试**: 测试工具方法功能
- **状态管理测试**: 测试状态变化逻辑
- **数据模型测试**: 测试数据序列化

## 最佳实践

### 组件设计原则
1. **单一职责**: 每个组件功能单一明确
2. **可复用性**: 设计通用的可复用组件
3. **可配置性**: 提供丰富的配置选项
4. **一致性**: 保持设计风格一致

### 使用建议
1. **主题使用**: 优先使用主题颜色和样式
2. **响应式设计**: 考虑不同屏幕尺寸适配
3. **无障碍访问**: 添加语义标签和辅助功能
4. **性能考虑**: 避免不必要的重建和重绘

## 总结

`ui_basic` 模块作为 OneApp 的基础UI组件库，提供了丰富的界面组件和交互元素。通过统一的设计语言、灵活的主题系统和完善的组件生态，为整个应用提供了一致的用户体验。模块具有良好的可扩展性和可维护性，能够满足各种界面开发需求。
