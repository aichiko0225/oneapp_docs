# OneApp Popup - 弹窗管理模块

## 模块概述

`oneapp_popup` 是 OneApp 的统一弹窗管理模块，提供了全局弹窗管理、优先级控制、样式定制和生命周期管理等功能。该模块确保应用中所有弹窗的一致性体验，避免弹窗冲突，并提供灵活的弹窗展示策略。

## 核心功能

### 1. 统一弹窗管理
- **全局队列**：统一管理所有弹窗显示队列
- **弹窗注册**：注册和管理不同类型的弹窗
- **显示控制**：控制弹窗的显示和隐藏
- **状态管理**：跟踪弹窗的显示状态

### 2. 弹窗优先级控制
- **优先级排序**：按优先级排序弹窗显示顺序
- **抢占机制**：高优先级弹窗抢占显示
- **队列管理**：智能管理弹窗等待队列
- **冲突解决**：解决弹窗显示冲突

### 3. 弹窗样式定制
- **主题适配**：自动适配应用主题
- **样式继承**：支持样式继承和覆盖
- **动画效果**：丰富的弹窗动画效果
- **响应式设计**：适配不同屏幕尺寸

### 4. 弹窗生命周期
- **生命周期钩子**：完整的生命周期回调
- **自动销毁**：弹窗自动销毁机制
- **内存管理**：防止内存泄漏
- **状态恢复**：应用重启后状态恢复

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            应用界面层                │
│         (Application UI)            │
├─────────────────────────────────────┤
│         OneApp Popup                │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 弹窗管理 │ 队列控制 │ 样式系统 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 生命周期 │ 事件系统 │ 动画引擎 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           UI 渲染层                 │
│  ┌──────────┬──────────┬──────────┐ │
│  │ Overlay  │ Dialog   │ BottomSheet │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│          Flutter Framework          │
│         (Widget System)             │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 弹窗管理器 (PopupManager)
```dart
class PopupManager {
  // 显示弹窗
  Future<T?> show<T>(Popup popup);
  
  // 隐藏弹窗
  Future<bool> hide(String popupId);
  
  // 隐藏所有弹窗
  Future<void> hideAll();
  
  // 获取当前弹窗
  Popup? getCurrentPopup();
  
  // 获取弹窗队列
  List<Popup> getPopupQueue();
}
```

#### 2. 弹窗队列控制器 (PopupQueueController)
```dart
class PopupQueueController {
  // 添加弹窗到队列
  void enqueue(Popup popup);
  
  // 从队列移除弹窗
  bool dequeue(String popupId);
  
  // 按优先级排序队列
  void sortByPriority();
  
  // 处理下一个弹窗
  Future<void> processNext();
}
```

#### 3. 弹窗样式管理器 (PopupStyleManager)
```dart
class PopupStyleManager {
  // 应用弹窗主题
  PopupTheme applyTheme(PopupStyle style, AppTheme theme);
  
  // 创建弹窗样式
  PopupStyle createStyle(PopupType type);
  
  // 自定义样式
  PopupStyle customizeStyle(PopupStyle base, StyleOverrides overrides);
  
  // 获取默认样式
  PopupStyle getDefaultStyle(PopupType type);
}
```

#### 4. 弹窗生命周期管理器 (PopupLifecycleManager)
```dart
class PopupLifecycleManager {
  // 注册生命周期监听器
  void registerLifecycleListener(String popupId, PopupLifecycleListener listener);
  
  // 触发生命周期事件
  void triggerLifecycleEvent(String popupId, PopupLifecycleEvent event);
  
  // 清理弹窗资源
  void cleanupPopup(String popupId);
  
  // 恢复弹窗状态
  Future<void> restorePopupState();
}
```

## 数据模型

### 弹窗模型
```dart
class Popup {
  final String id;
  final PopupType type;
  final Widget content;
  final PopupPriority priority;
  final PopupStyle? style;
  final PopupOptions options;
  final Map<String, dynamic> data;
  final DateTime createdAt;
  final Duration? autoHideDelay;
  final List<PopupAction> actions;
}

enum PopupType {
  dialog,        // 对话框
  bottomSheet,   // 底部弹窗
  toast,         // 吐司消息
  overlay,       // 覆盖层
  modal,         // 模态框
  banner,        // 横幅
  snackbar      // 快捷消息
}

enum PopupPriority {
  low,          // 低优先级
  normal,       // 普通优先级
  high,         // 高优先级
  critical,     // 关键优先级
  emergency     // 紧急优先级
}
```

### 弹窗样式模型
```dart
class PopupStyle {
  final Color? backgroundColor;
  final BorderRadius? borderRadius;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final BoxShadow? shadow;
  final TextStyle? textStyle;
  final PopupAnimation? animation;
  final Alignment? alignment;
  final Size? size;
  final bool? barrierDismissible;
}

class PopupAnimation {
  final AnimationType type;
  final Duration duration;
  final Curve curve;
  final Offset? slideDirection;
  final double? scaleStart;
}

enum AnimationType {
  fade,         // 淡入淡出
  slide,        // 滑动
  scale,        // 缩放
  rotate,       // 旋转
  bounce,       // 弹跳
  none          // 无动画
}
```

### 弹窗选项模型
```dart
class PopupOptions {
  final bool barrierDismissible;
  final Color? barrierColor;
  final String? barrierLabel;
  final bool useRootNavigator;
  final RouteSettings? routeSettings;
  final Offset? anchorPoint;
  final PopupGravity gravity;
  final Duration? showDuration;
  final Duration? hideDuration;
}

enum PopupGravity {
  center,       // 居中
  top,          // 顶部
  bottom,       // 底部
  left,         // 左侧
  right,        // 右侧
  topLeft,      // 左上
  topRight,     // 右上
  bottomLeft,   // 左下
  bottomRight   // 右下
}
```

## API 接口

### 弹窗管理接口
```dart
abstract class PopupService {
  // 显示弹窗
  Future<ApiResponse<T?>> showPopup<T>(ShowPopupRequest request);
  
  // 隐藏弹窗
  Future<ApiResponse<bool>> hidePopup(HidePopupRequest request);
  
  // 获取弹窗状态
  Future<ApiResponse<PopupStatus>> getPopupStatus(String popupId);
  
  // 清理弹窗
  Future<ApiResponse<bool>> clearPopups(ClearPopupsRequest request);
}
```

### 弹窗样式接口
```dart
abstract class PopupStyleService {
  // 获取弹窗主题
  Future<ApiResponse<PopupTheme>> getPopupTheme(String themeId);
  
  // 更新弹窗样式
  Future<ApiResponse<bool>> updatePopupStyle(UpdateStyleRequest request);
  
  // 获取样式模板
  Future<ApiResponse<List<PopupStyleTemplate>>> getStyleTemplates();
}
```

## 配置管理

### 弹窗配置
```dart
class PopupConfig {
  final int maxConcurrentPopups;
  final Duration defaultAnimationDuration;
  final bool enableGlobalQueue;
  final bool autoHideOnAppBackground;
  final Map<PopupType, PopupTypeConfig> typeConfigs;
  final PopupTheme defaultTheme;
  
  static const PopupConfig defaultConfig = PopupConfig(
    maxConcurrentPopups: 3,
    defaultAnimationDuration: Duration(milliseconds: 300),
    enableGlobalQueue: true,
    autoHideOnAppBackground: true,
    typeConfigs: {
      PopupType.dialog: PopupTypeConfig(
        maxInstances: 1,
        defaultPriority: PopupPriority.high,
      ),
      PopupType.toast: PopupTypeConfig(
        maxInstances: 5,
        defaultPriority: PopupPriority.low,
      ),
    },
    defaultTheme: PopupTheme.defaultTheme,
  );
}
```

### 主题配置
```dart
class PopupTheme {
  final PopupStyle dialogStyle;
  final PopupStyle toastStyle;
  final PopupStyle bottomSheetStyle;
  final PopupStyle overlayStyle;
  final Map<String, PopupStyle> customStyles;
  
  static const PopupTheme defaultTheme = PopupTheme(
    dialogStyle: PopupStyle(
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.circular(8.0),
      padding: EdgeInsets.all(16.0),
      animation: PopupAnimation(
        type: AnimationType.scale,
        duration: Duration(milliseconds: 300),
      ),
    ),
    toastStyle: PopupStyle(
      backgroundColor: Colors.black87,
      borderRadius: BorderRadius.circular(24.0),
      padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      animation: PopupAnimation(
        type: AnimationType.slide,
        duration: Duration(milliseconds: 200),
      ),
    ),
  );
}
```

## 使用示例

### 基本弹窗显示
```dart
// 显示对话框
final result = await PopupManager.instance.show<bool>(
  Popup(
    id: 'confirm_dialog',
    type: PopupType.dialog,
    priority: PopupPriority.high,
    content: AlertDialog(
      title: Text('确认操作'),
      content: Text('是否确认执行此操作？'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: Text('取消'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(true),
          child: Text('确认'),
        ),
      ],
    ),
  ),
);

if (result == true) {
  print('用户确认操作');
}
```

### 吐司消息
```dart
// 显示成功消息
PopupManager.instance.show(
  Popup(
    id: 'success_toast',
    type: PopupType.toast,
    priority: PopupPriority.normal,
    content: Container(
      padding: EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.green,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.check, color: Colors.white),
          SizedBox(width: 8.0),
          Text('操作成功', style: TextStyle(color: Colors.white)),
        ],
      ),
    ),
    options: PopupOptions(
      gravity: PopupGravity.top,
      barrierDismissible: false,
    ),
    autoHideDelay: Duration(seconds: 3),
  ),
);
```

### 底部弹窗
```dart
// 显示底部选择弹窗
final selectedOption = await PopupManager.instance.show<String>(
  Popup(
    id: 'bottom_sheet_options',
    type: PopupType.bottomSheet,
    priority: PopupPriority.normal,
    content: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ListTile(
          leading: Icon(Icons.camera),
          title: Text('拍照'),
          onTap: () => Navigator.of(context).pop('camera'),
        ),
        ListTile(
          leading: Icon(Icons.photo_library),
          title: Text('从相册选择'),
          onTap: () => Navigator.of(context).pop('gallery'),
        ),
        ListTile(
          leading: Icon(Icons.cancel),
          title: Text('取消'),
          onTap: () => Navigator.of(context).pop(null),
        ),
      ],
    ),
    style: PopupStyle(
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.vertical(top: Radius.circular(16.0)),
    ),
  ),
);

print('用户选择: $selectedOption');
```

### 自定义弹窗样式
```dart
// 创建自定义样式弹窗
final customStyle = PopupStyle(
  backgroundColor: Colors.blue.shade50,
  borderRadius: BorderRadius.circular(12.0),
  padding: EdgeInsets.all(20.0),
  shadow: BoxShadow(
    color: Colors.black26,
    blurRadius: 10.0,
    offset: Offset(0, 4),
  ),
  animation: PopupAnimation(
    type: AnimationType.bounce,
    duration: Duration(milliseconds: 500),
    curve: Curves.elasticOut,
  ),
);

PopupManager.instance.show(
  Popup(
    id: 'custom_popup',
    type: PopupType.modal,
    priority: PopupPriority.high,
    style: customStyle,
    content: Container(
      width: 300,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.info, size: 48, color: Colors.blue),
          SizedBox(height: 16),
          Text('自定义弹窗', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Text('这是一个自定义样式的弹窗示例'),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => PopupManager.instance.hide('custom_popup'),
            child: Text('关闭'),
          ),
        ],
      ),
    ),
  ),
);
```

### 弹窗队列管理
```dart
// 批量添加弹窗到队列
final popups = [
  Popup(
    id: 'popup_1',
    type: PopupType.toast,
    priority: PopupPriority.low,
    content: Text('消息1'),
  ),
  Popup(
    id: 'popup_2',
    type: PopupType.dialog,
    priority: PopupPriority.high,
    content: Text('重要消息'),
  ),
  Popup(
    id: 'popup_3',
    type: PopupType.toast,
    priority: PopupPriority.normal,
    content: Text('消息3'),
  ),
];

// 按优先级添加到队列
for (final popup in popups) {
  PopupManager.instance.enqueue(popup);
}

// 监听弹窗队列变化
PopupManager.instance.onQueueChanged.listen((queue) {
  print('当前队列长度: ${queue.length}');
});
```

## 测试策略

### 单元测试
```dart
group('PopupManager Tests', () {
  test('should show popup successfully', () async {
    // Given
    final popupManager = PopupManager();
    final popup = Popup(
      id: 'test_popup',
      type: PopupType.dialog,
      content: Text('Test'),
    );
    
    // When
    final result = await popupManager.show(popup);
    
    // Then
    expect(popupManager.getCurrentPopup()?.id, 'test_popup');
  });
  
  test('should manage popup queue by priority', () {
    // Given
    final queueController = PopupQueueController();
    final lowPriorityPopup = Popup(id: 'low', priority: PopupPriority.low);
    final highPriorityPopup = Popup(id: 'high', priority: PopupPriority.high);
    
    // When
    queueController.enqueue(lowPriorityPopup);
    queueController.enqueue(highPriorityPopup);
    queueController.sortByPriority();
    
    // Then
    final queue = queueController.getQueue();
    expect(queue.first.id, 'high');
    expect(queue.last.id, 'low');
  });
});
```

### 集成测试
```dart
group('Popup Integration Tests', () {
  testWidgets('popup display flow', (tester) async {
    // 1. 显示弹窗
    await PopupManager.instance.show(testPopup);
    await tester.pumpAndSettle();
    
    // 2. 验证弹窗显示
    expect(find.byKey(Key('test_popup')), findsOneWidget);
    
    // 3. 点击关闭按钮
    await tester.tap(find.byKey(Key('close_button')));
    await tester.pumpAndSettle();
    
    // 4. 验证弹窗关闭
    expect(find.byKey(Key('test_popup')), findsNothing);
  });
});
```

## 性能优化

### 渲染优化
- **懒加载**：弹窗内容懒加载
- **复用机制**：弹窗组件复用
- **动画优化**：高效的动画实现
- **内存管理**：及时释放弹窗资源

### 队列优化
- **智能调度**：智能弹窗调度算法
- **优先级合并**：相同优先级弹窗合并
- **批量处理**：批量处理弹窗队列
- **负载控制**：控制同时显示的弹窗数量

## 版本历史

### v0.3.1+2 (当前版本)
- 新增弹窗主题系统
- 优化动画性能
- 支持自定义弹窗样式
- 修复内存泄漏问题

### v0.3.0
- 重构弹窗管理架构
- 新增优先级队列系统
- 支持多种弹窗类型
- 改进生命周期管理

## 依赖关系

### 内部依赖
- `basic_theme`: 主题管理系统
- `basic_utils`: 工具类库
- `basic_logger`: 日志记录

### 外部依赖
- `flutter/material`: Material 设计组件
- `flutter/cupertino`: iOS 风格组件
- `rxdart`: 响应式编程支持

## 总结

`oneapp_popup` 模块为 OneApp 提供了完整的弹窗管理解决方案。通过统一的弹窗管理、智能的优先级控制、灵活的样式定制和完善的生命周期管理，该模块确保了应用中所有弹窗的一致性体验，提高了用户界面的专业性和用户体验的流畅性。
