# Basic UIs 通用UI组件集合模块

## 模块概述

`basic_uis` 是 OneApp 基础UI模块群中的通用UI组件集合模块，负责整合和统一管理所有的UI组件库。该模块提供了一站式的UI组件解决方案，包含了动画效果、权限管理、分享功能、地图集成等丰富的UI功能组件。

### 基本信息
- **模块名称**: basic_uis
- **版本**: 0.0.7
- **描述**: 通用UI组件集合包
- **Flutter 版本**: >=1.17.0
- **Dart 版本**: >=3.0.0 <4.0.0

## 功能特性

### 核心功能
1. **UI组件整合**
   - 统一的UI组件导出
   - 组件库版本管理
   - 跨模块组件协调
   - 全局UI配置管理

2. **高级UI组件**
   - 下拉刷新组件集成
   - Lottie动画支持
   - WebView组件封装
   - 地图视图集成

3. **用户交互组件**
   - 权限管理UI组件
   - 分享功能UI集成
   - 图片保存组件
   - 设置页面组件

4. **系统集成组件**
   - 位置服务UI
   - 应用设置界面
   - 用户同意组件
   - Toast消息提示

## 技术架构

### 目录结构
```
lib/
├── basic_uis.dart             # 模块入口文件
├── src/                       # 源代码目录
│   ├── components/            # 通用组件
│   ├── animations/            # 动画组件
│   ├── permissions/           # 权限组件
│   ├── sharing/               # 分享组件
│   ├── webview/               # WebView组件
│   ├── location/              # 位置组件
│   ├── settings/              # 设置组件
│   └── utils/                 # 工具类
├── widgets/                   # Widget导出
└── themes/                    # 主题配置
```

### 依赖关系

#### UI框架依赖
- `easy_refresh: ^3.0.5` - 下拉刷新组件
- `lottie: ^3.1.0` - Lottie动画
- `fluttertoast: ^8.2.2` - Toast提示
- `helpers: ^1.2.3+1` - 辅助工具

#### 功能组件依赖
- `basic_webview: ^0.2.4+4` - WebView组件
- `permission_handler: ^10.4.5` - 权限管理
- `image_gallery_saver: any` - 图片保存
- `share_plus: 7.2.1` - 分享功能
- `flutter_inappwebview: ^6.0.0` - 应用内WebView

#### 业务组件依赖
- `app_consent: ^0.2.19` - 用户同意组件
- `ui_mapview: ^0.2.18` - 地图视图组件
- `app_settings: ^4.3.1` - 应用设置
- `location: ^6.0.1` - 位置服务

#### 内部依赖
- `basic_utils` - 基础工具（本地路径）

## 核心组件分析

### 1. 模块入口 (`basic_uis.dart`)

**功能职责**:
- 统一导出所有UI组件
- 初始化全局UI配置
- 管理组件生命周期

```dart
library basic_uis;

// 基础组件导出
export 'src/components/enhanced_refresh_indicator.dart';
export 'src/components/lottie_animation_widget.dart';
export 'src/components/permission_request_dialog.dart';
export 'src/components/share_action_sheet.dart';

// WebView组件导出
export 'src/webview/enhanced_webview.dart';
export 'src/webview/webview_controller.dart';

// 位置组件导出
export 'src/location/location_picker_widget.dart';
export 'src/location/map_integration_widget.dart';

// 设置组件导出
export 'src/settings/app_settings_page.dart';
export 'src/settings/permission_settings_widget.dart';

// 工具类导出
export 'src/utils/ui_helpers.dart';
export 'src/utils/toast_utils.dart';

class BasicUIs {
  static bool _isInitialized = false;
  
  /// 初始化Basic UIs模块
  static Future<void> initialize() async {
    if (_isInitialized) return;
    
    // 初始化Toast配置
    await _initializeToast();
    
    // 初始化权限处理器
    await _initializePermissions();
    
    // 初始化分享服务
    await _initializeShare();
    
    // 初始化WebView配置
    await _initializeWebView();
    
    _isInitialized = true;
  }
}
```

### 2. 增强下拉刷新组件 (`src/components/enhanced_refresh_indicator.dart`)

```dart
class EnhancedRefreshIndicator extends StatefulWidget {
  final Widget child;
  final Future<void> Function() onRefresh;
  final Future<void> Function()? onLoadMore;
  final RefreshIndicatorConfig? config;
  final bool enablePullUp;
  final bool enablePullDown;

  const EnhancedRefreshIndicator({
    Key? key,
    required this.child,
    required this.onRefresh,
    this.onLoadMore,
    this.config,
    this.enablePullUp = true,
    this.enablePullDown = true,
  }) : super(key: key);

  @override
  State<EnhancedRefreshIndicator> createState() => _EnhancedRefreshIndicatorState();
}

class _EnhancedRefreshIndicatorState extends State<EnhancedRefreshIndicator> {
  late EasyRefreshController _controller;

  @override
  Widget build(BuildContext context) {
    return EasyRefresh(
      controller: _controller,
      onRefresh: widget.enablePullDown ? _onRefresh : null,
      onLoad: widget.enablePullUp && widget.onLoadMore != null ? _onLoad : null,
      header: _buildRefreshHeader(),
      footer: _buildLoadFooter(),
      child: widget.child,
    );
  }

  Widget _buildRefreshHeader() {
    return ClassicHeader(
      dragText: '下拉刷新',
      armedText: '释放刷新',
      readyText: '正在刷新...',
      processingText: '正在刷新...',
      processedText: '刷新完成',
      noMoreText: '没有更多数据',
      failedText: '刷新失败',
      messageText: '最后更新于 %T',
    );
  }

  Widget _buildLoadFooter() {
    return ClassicFooter(
      dragText: '上拉加载',
      armedText: '释放加载',
      readyText: '正在加载...',
      processingText: '正在加载...',
      processedText: '加载完成',
      noMoreText: '没有更多数据',
      failedText: '加载失败',
    );
  }
}
```

### 3. Lottie动画组件 (`src/animations/lottie_animation_widget.dart`)

```dart
class LottieAnimationWidget extends StatefulWidget {
  final String assetPath;
  final double? width;
  final double? height;
  final bool repeat;
  final bool autoPlay;
  final AnimationController? controller;
  final VoidCallback? onComplete;

  const LottieAnimationWidget({
    Key? key,
    required this.assetPath,
    this.width,
    this.height,
    this.repeat = true,
    this.autoPlay = true,
    this.controller,
    this.onComplete,
  }) : super(key: key);

  @override
  State<LottieAnimationWidget> createState() => _LottieAnimationWidgetState();
}

class _LottieAnimationWidgetState extends State<LottieAnimationWidget> 
    with TickerProviderStateMixin {
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    
    _animationController = widget.controller ?? 
        AnimationController(vsync: this);
        
    if (widget.autoPlay) {
      _animationController.forward();
    }
    
    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        widget.onComplete?.call();
        if (widget.repeat) {
          _animationController.repeat();
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Lottie.asset(
      widget.assetPath,
      width: widget.width,
      height: widget.height,
      controller: _animationController,
      onLoaded: (composition) {
        _animationController.duration = composition.duration;
        if (widget.autoPlay) {
          _animationController.forward();
        }
      },
    );
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _animationController.dispose();
    }
    super.dispose();
  }
}
```

### 4. 权限请求对话框 (`src/permissions/permission_request_dialog.dart`)

```dart
class PermissionRequestDialog extends StatelessWidget {
  final Permission permission;
  final String title;
  final String description;
  final String? rationale;
  final VoidCallback? onGranted;
  final VoidCallback? onDenied;

  const PermissionRequestDialog({
    Key? key,
    required this.permission,
    required this.title,
    required this.description,
    this.rationale,
    this.onGranted,
    this.onDenied,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          Icon(_getPermissionIcon(), color: Theme.of(context).primaryColor),
          const SizedBox(width: 12),
          Expanded(child: Text(title)),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(description),
          if (rationale != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, 
                       color: Colors.blue, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      rationale!,
                      style: TextStyle(
                        color: Colors.blue[700],
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onDenied?.call();
          },
          child: const Text('拒绝'),
        ),
        ElevatedButton(
          onPressed: () async {
            Navigator.of(context).pop();
            final status = await permission.request();
            if (status.isGranted) {
              onGranted?.call();
            } else {
              onDenied?.call();
              if (status.isPermanentlyDenied) {
                _showSettingsDialog(context);
              }
            }
          },
          child: const Text('允许'),
        ),
      ],
    );
  }

  IconData _getPermissionIcon() {
    switch (permission) {
      case Permission.camera:
        return Icons.camera_alt;
      case Permission.microphone:
        return Icons.mic;
      case Permission.location:
        return Icons.location_on;
      case Permission.storage:
        return Icons.storage;
      case Permission.photos:
        return Icons.photo_library;
      default:
        return Icons.security;
    }
  }

  void _showSettingsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('权限设置'),
        content: const Text('请在设置中手动开启所需权限'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              openAppSettings();
            },
            child: const Text('去设置'),
          ),
        ],
      ),
    );
  }
}
```

### 5. 分享操作表 (`src/sharing/share_action_sheet.dart`)

```dart
class ShareActionSheet extends StatelessWidget {
  final ShareContent content;
  final List<SharePlatform> platforms;
  final Function(SharePlatform)? onPlatformSelected;

  const ShareActionSheet({
    Key? key,
    required this.content,
    required this.platforms,
    this.onPlatformSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHandle(),
          const SizedBox(height: 20),
          Text(
            '分享到',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 20),
          _buildPlatformGrid(context),
          const SizedBox(height: 20),
          _buildMoreActions(context),
        ],
      ),
    );
  }

  Widget _buildPlatformGrid(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 1,
        crossAxisSpacing: 20,
        mainAxisSpacing: 20,
      ),
      itemCount: platforms.length,
      itemBuilder: (context, index) {
        final platform = platforms[index];
        return _buildPlatformItem(context, platform);
      },
    );
  }

  Widget _buildPlatformItem(BuildContext context, SharePlatform platform) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pop();
        onPlatformSelected?.call(platform);
        _shareToplatform(platform);
      },
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: platform.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              platform.icon,
              color: platform.color,
              size: 30,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            platform.name,
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _shareToplatform(SharePlatform platform) async {
    try {
      switch (platform.type) {
        case SharePlatformType.system:
          await Share.share(content.text, subject: content.title);
          break;
        case SharePlatformType.wechat:
          // 微信分享逻辑
          break;
        case SharePlatformType.weibo:
          // 微博分享逻辑
          break;
        case SharePlatformType.qq:
          // QQ分享逻辑
          break;
      }
    } catch (e) {
      ToastUtils.showError('分享失败: $e');
    }
  }
}
```

## 工具类

### Toast工具类 (`src/utils/toast_utils.dart`)

```dart
class ToastUtils {
  static void showSuccess(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.CENTER,
      backgroundColor: Colors.green,
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }

  static void showError(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.CENTER,
      backgroundColor: Colors.red,
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }

  static void showInfo(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.CENTER,
      backgroundColor: Colors.blue,
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }

  static void showWarning(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.CENTER,
      backgroundColor: Colors.orange,
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }
}
```

## 使用示例

### 基础使用
```dart
class BasicUIsExample extends StatefulWidget {
  @override
  _BasicUIsExampleState createState() => _BasicUIsExampleState();
}

class _BasicUIsExampleState extends State<BasicUIsExample> {
  @override
  void initState() {
    super.initState();
    _initializeBasicUIs();
  }

  Future<void> _initializeBasicUIs() async {
    await BasicUIs.initialize();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Basic UIs Example')),
      body: EnhancedRefreshIndicator(
        onRefresh: _handleRefresh,
        onLoadMore: _handleLoadMore,
        child: ListView(
          children: [
            // Lottie动画示例
            LottieAnimationWidget(
              assetPath: 'assets/animations/loading.json',
              width: 100,
              height: 100,
            ),
            
            // 权限请求示例
            ListTile(
              title: Text('请求相机权限'),
              onTap: () => _requestCameraPermission(),
            ),
            
            // 分享功能示例
            ListTile(
              title: Text('分享内容'),
              onTap: () => _showShareSheet(),
            ),
            
            // Toast示例
            ListTile(
              title: Text('显示Toast'),
              onTap: () => ToastUtils.showSuccess('操作成功'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleRefresh() async {
    await Future.delayed(Duration(seconds: 2));
    ToastUtils.showSuccess('刷新完成');
  }

  Future<void> _handleLoadMore() async {
    await Future.delayed(Duration(seconds: 1));
  }

  void _requestCameraPermission() {
    showDialog(
      context: context,
      builder: (context) => PermissionRequestDialog(
        permission: Permission.camera,
        title: '相机权限',
        description: '需要相机权限来拍照和录制视频',
        rationale: '此权限用于扫描二维码和拍照功能',
        onGranted: () => ToastUtils.showSuccess('权限已授予'),
        onDenied: () => ToastUtils.showError('权限被拒绝'),
      ),
    );
  }

  void _showShareSheet() {
    showModalBottomSheet(
      context: context,
      builder: (context) => ShareActionSheet(
        content: ShareContent(
          title: 'OneApp',
          text: '快来体验OneApp的强大功能！',
          url: 'https://oneapp.com',
        ),
        platforms: [
          SharePlatform.system(),
          SharePlatform.wechat(),
          SharePlatform.weibo(),
          SharePlatform.qq(),
        ],
        onPlatformSelected: (platform) {
          ToastUtils.showInfo('分享到${platform.name}');
        },
      ),
    );
  }
}
```

## 性能优化

### 组件优化
- **懒加载**: 按需加载重型组件
- **Widget缓存**: 缓存不变的Widget实例
- **动画优化**: 合理使用动画避免过度渲染
- **内存管理**: 及时释放资源和控制器

### 集成优化
- **依赖管理**: 避免重复依赖和版本冲突
- **包大小**: 优化资源文件减少包大小
- **初始化**: 异步初始化避免阻塞启动
- **缓存策略**: 合理使用缓存提升性能

## 测试策略

### Widget测试
- **组件渲染测试**: 验证组件正确渲染
- **交互测试**: 测试用户交互响应
- **动画测试**: 测试动画效果
- **权限测试**: 测试权限请求流程

### 集成测试
- **模块集成测试**: 测试模块间协作
- **第三方服务测试**: 测试外部服务集成
- **性能测试**: 测试组件性能表现
- **兼容性测试**: 测试平台兼容性

## 最佳实践

### 组件使用
1. **统一入口**: 通过BasicUIs统一初始化
2. **配置管理**: 集中管理组件配置
3. **错误处理**: 完善的错误处理机制
4. **用户体验**: 注重用户交互体验

### 开发规范
1. **代码规范**: 遵循统一的代码规范
2. **文档完善**: 提供详细的使用文档
3. **版本管理**: 合理的版本发布策略
4. **测试覆盖**: 保证充分的测试覆盖

## 总结

`basic_uis` 模块作为 OneApp 的通用UI组件集合，整合了丰富的UI功能组件和第三方服务，为应用开发提供了一站式的UI解决方案。通过统一的管理和标准化的接口，大大提升了开发效率和用户体验的一致性。模块具有良好的扩展性和可维护性，能够适应不断变化的UI需求。
