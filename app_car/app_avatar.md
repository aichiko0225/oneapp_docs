# App Avatar - 虚拟形象模块文档

## 模块概述

`app_avatar` 是 OneApp 的虚拟形象管理模块，为用户提供个性化的虚拟车载助手服务。该模块集成了语音克隆技术、3D 虚拟形象渲染、支付服务等功能，让用户可以创建和定制自己的专属虚拟助手。

### 基本信息
- **模块名称**: app_avatar
- **版本**: 0.6.1+2
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-app-avatar
- **Flutter 版本**: >=3.0.0
- **Dart 版本**: >=2.16.2 <4.0.0

## 目录结构

```
app_avatar/
├── lib/
│   ├── app_avatar.dart           # 主导出文件
│   └── src/                      # 源代码目录
│       ├── avatar/               # 虚拟形象核心功能
│       │   ├── pages/           # 页面组件
│       │   │   ├── avatar_building/    # 形象生成页面
│       │   │   ├── avatar_copy/        # 形象复制页面
│       │   │   ├── avatar_display/     # 形象展示页面
│       │   │   ├── no_avatar/          # 未生成形象页面
│       │   │   ├── prepare_resource_page/ # 资源准备页面
│       │   │   ├── pta_camera/         # 拍照相机页面
│       │   │   ├── pta_sex_check/      # 性别确认页面
│       │   │   ├── rename/             # 重命名页面
│       │   │   └── server_data_dress_up/ # 捏脸界面
│       │   ├── provide_external/       # 对外提供组件
│       │   └── util/                   # 工具类
│       ├── common_import.dart          # 通用导入
│       └── route_export.dart           # 路由导出
├── assets/                             # 静态资源
├── pubspec.yaml                        # 依赖配置
└── README.md                           # 项目说明
```

## 核心功能模块

### 1. 主导出模块

**文件**: `lib/app_avatar.dart`

```dart
library app_avatar;
import 'package:basic_modular/modular.dart';
import 'package:basic_modular_route/basic_modular_route.dart';
import 'src/route_export.dart';

// 导出路由和对外组件
export 'src/route_export.dart';
export 'src/avatar/provide_external/in_use_avatar_icon.dart';
export 'src/avatar/provide_external/avatar_header.dart';
export 'src/avatar/util/config.dart';
export 'src/avatar/util/avatar_engine_manage.dart';

/// App Avatar 模块定义
class AppAvatarModule extends Module with RouteObjProvider {
  @override
  List<Module> get imports => [];

  @override
  List<Bind> get binds => [];

  @override
  List<ModularRoute> get routes {
    // 获取路由元数据
    final r1 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyHome);
    final r4 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiAvatarDisplayPage);
    final r7 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiPtaAvatarCamera);
    final r8 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiBuilding);
    final r10 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiDressUpServerDataPage);
    final r11 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiNonAvatar);
    final r12 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiRename);
    final r13 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiStep2GenderCheck);
    final r14 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiAvatarCopy);
    final r15 = RouteCenterAPI.routeMetaBy(AvatarRouteExport.keyAvatarUiPrepareResourcePage);
    
    // 返回子路由列表
    return [
      ChildRoute(r1.path, child: (_, args) => r1.provider(args).as()),
      ChildRoute(r4.path, child: (_, args) => r4.provider(args).as()),
      ChildRoute(r7.path, child: (_, args) => r7.provider(args).as()),
      ChildRoute(r8.path, child: (_, args) => r8.provider(args).as()),
      ChildRoute(r10.path, child: (_, args) => r10.provider(args).as()),
      ChildRoute(r11.path, child: (_, args) => r11.provider(args).as()),
      ChildRoute(r12.path, child: (_, args) => r12.provider(args).as()),
      ChildRoute(r13.path, child: (_, args) => r13.provider(args).as()),
      ChildRoute(r14.path, child: (_, args) => r14.provider(args).as()),
      ChildRoute(r15.path, child: (_, args) => r15.provider(args).as()),
    ];
  }
}
```

### 2. 路由导出管理

## 核心功能与实现

### 1. 页面路由系统

app_avatar 模块基于真实的路由系统实现，主要包含以下功能页面：

#### 核心页面组件
- **AvatarReplaceChild**: 虚拟形象展示页面
- **PtaAvatarCamera**: 拍照相机页面
- **AvatarBuildingPage**: 形象生成页面
- **DressUpServerDataPage**: 捏脸编辑页面
- **AvatarCopy**: 形象复制页面
- **NonAvatar**: 非形象页面

#### 页面导航实现
```dart
// 页面跳转示例
class AvatarNavigationHelper {
  // 跳转到虚拟形象展示页面
  static void gotoAvatarDisplay() {
    Modular.to.pushNamed('/avatar/avatarDisplayPage');
  }
  
  // 跳转到拍照创建页面
  static void gotoPtaCamera() {
    Modular.to.pushNamed('/avatar/PtaAvatarCamera');
  }
  
  // 跳转到捏脸编辑页面
  static void gotoDressUp() {
    Modular.to.pushNamed('/avatar/DressUpServerDataPage');
  }
  
  // 跳转到形象生成页面
  static void gotoAvatarBuilding({
    required String sex,
    required String name,
    required String photoPath,
  }) {
    Modular.to.pushNamed('/avatar/AvatarBuildingPage', arguments: {
      'sex': sex,
      'name': name,
      'photoPath': photoPath,
    });
  }
}
```

### 2. 模块架构设计

#### 基本模块结构
```dart
// 模块入口点
class AppAvatarModule extends Module implements RouteObjProvider {
  @override
  List<Bind> get binds => [
    // 依赖注入配置将在这里定义
  ];
  
  @override
  List<ModularRoute> get routes => [
    // 路由配置通过 AvatarRouteExport 管理
  ];
  
  @override
  RouteCenterAPI? get routeObj => RouteCenterAPI(
    routeExporter: AvatarRouteExport(),
  );
}
```

#### 页面状态管理
```dart
// 简化的页面状态管理
class AvatarPageState {
  final bool isLoading;
  final String? errorMessage;
  final Map<String, dynamic> data;
  
  const AvatarPageState({
    this.isLoading = false,
    this.errorMessage,
    this.data = const {},
  });
  
  AvatarPageState copyWith({
    bool? isLoading,
    String? errorMessage,
    Map<String, dynamic>? data,
  }) {
    return AvatarPageState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      data: data ?? this.data,
    );
  }
}
```

### 3. 核心功能实现

#### 虚拟形象创建流程
虚拟形象创建遵循以下步骤：

1. **用户拍照**: 通过 `PtaAvatarCamera` 页面获取用户照片
2. **信息确认**: 收集用户基本信息（姓名、性别等）
3. **形象生成**: `AvatarBuildingPage` 显示生成进度
4. **结果展示**: `AvatarReplaceChild` 展示最终形象

#### 形象管理功能
- **形象展示**: 3D/2D 虚拟形象渲染展示
- **形象编辑**: 通过捏脸系统进行外观定制
- **形象切换**: 支持多个虚拟形象间的切换
- **形象分享**: 虚拟形象内容的分享功能

### 4. 数据模型定义

#### 基础数据结构
```dart
// 虚拟形象基本信息
class AvatarInfo {
  final String id;
  final String name;
  final String sex;
  final String photoPath;
  final DateTime createdAt;
  final Map<String, dynamic> customData;
  
  const AvatarInfo({
    required this.id,
    required this.name,
    required this.sex,
    required this.photoPath,
    required this.createdAt,
    this.customData = const {},
  });
  
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'sex': sex,
      'photoPath': photoPath,
      'createdAt': createdAt.toIso8601String(),
      'customData': customData,
    };
  }
  
  factory AvatarInfo.fromMap(Map<String, dynamic> map) {
    return AvatarInfo(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      sex: map['sex'] ?? '',
      photoPath: map['photoPath'] ?? '',
      createdAt: DateTime.parse(map['createdAt'] ?? DateTime.now().toIso8601String()),
      customData: map['customData'] ?? const {},
    );
  }
}

// 形象配置信息
class AvatarConfiguration {
  final String avatarId;
  final Map<String, dynamic> appearanceConfig;
  final Map<String, dynamic> behaviorConfig;
  final DateTime updatedAt;
  
  const AvatarConfiguration({
    required this.avatarId,
    required this.appearanceConfig,
    required this.behaviorConfig,
    required this.updatedAt,
  });
}
```

### 5. UI 组件实现

#### 通用 UI 组件
```dart
// 形象展示组件
class AvatarDisplayWidget extends StatelessWidget {
  final AvatarInfo avatarInfo;
  final VoidCallback? onTap;
  
  const AvatarDisplayWidget({
    Key? key,
    required this.avatarInfo,
    this.onTap,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 200,
        height: 300,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Column(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(10)),
                  image: avatarInfo.photoPath.isNotEmpty
                    ? DecorationImage(
                        image: FileImage(File(avatarInfo.photoPath)),
                        fit: BoxFit.cover,
                      )
                    : null,
                ),
                child: avatarInfo.photoPath.isEmpty
                  ? Center(child: Icon(Icons.person, size: 50, color: Colors.grey))
                  : null,
              ),
            ),
            Container(
              padding: EdgeInsets.all(8),
              child: Text(
                avatarInfo.name,
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 操作按钮组件
class AvatarActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onPressed;
  final bool isLoading;
  
  const AvatarActionButton({
    Key? key,
    required this.label,
    required this.icon,
    required this.onPressed,
    this.isLoading = false,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: isLoading ? null : onPressed,
      icon: isLoading 
        ? SizedBox(
            width: 16, 
            height: 16, 
            child: CircularProgressIndicator(strokeWidth: 2)
          )
        : Icon(icon),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}
```

### 6. 错误处理与异常管理

#### 异常定义
```dart
// 虚拟形象相关异常
abstract class AvatarException implements Exception {
  final String message;
  const AvatarException(this.message);
  
  @override
  String toString() => 'AvatarException: $message';
}

class AvatarCreationException extends AvatarException {
  const AvatarCreationException(String message) : super(message);
}

class AvatarLoadException extends AvatarException {
  const AvatarLoadException(String message) : super(message);
}

class AvatarSaveException extends AvatarException {
  const AvatarSaveException(String message) : super(message);
}
```

#### 错误处理机制
```dart
// 错误处理工具类
class AvatarErrorHandler {
  static void handleError(
    BuildContext context,
    Exception error, {
    VoidCallback? onRetry,
  }) {
    String message = '发生未知错误';
    
    if (error is AvatarException) {
      message = error.message;
    }
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('错误'),
        content: Text(message),
        actions: [
          if (onRetry != null)
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                onRetry();
              },
              child: Text('重试'),
            ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('确定'),
          ),
        ],
      ),
    );
  }
}
```
## 技术架构与设计模式

### 1. 模块化架构

app_avatar 模块采用标准的 OneApp 模块化架构：

- **模块定义**: `AppAvatarModule` 继承自 `Module` 并实现 `RouteObjProvider`
- **路由管理**: 通过 `AvatarRouteExport` 统一管理所有路由
- **依赖注入**: 使用 basic_modular 的依赖注入机制
- **页面组织**: 按功能分组的页面结构

### 2. 核心功能实现

#### 虚拟形象创建流程
1. **拍照页面**: 用户使用相机拍摄照片
2. **信息填写**: 确认性别和姓名信息
3. **形象生成**: 后台处理生成虚拟形象
4. **形象展示**: 展示生成结果

#### 形象管理功能
- **形象展示**: 3D/2D 虚拟形象渲染
- **形象编辑**: 捏脸和装扮功能
- **形象复制**: 形象模板复制功能
- **重命名**: 形象名称管理

### 3. 与其他模块集成

```dart
// 集成示例 - 从其他模块跳转到虚拟形象相关页面
class AvatarNavigationHelper {
  // 跳转到虚拟形象展示页面
  static void gotoAvatarDisplay() {
    Modular.to.pushNamed('/avatar/avatarDisplayPage');
  }
  
  // 跳转到拍照创建页面
  static void gotoPtaCamera() {
    Modular.to.pushNamed('/avatar/PtaAvatarCamera');
  }
  
  // 跳转到捏脸编辑页面
  static void gotoDressUp() {
    Modular.to.pushNamed('/avatar/DressUpServerDataPage');
  }
}
```

## 依赖管理与技术栈

### 核心依赖
- **basic_modular**: 模块化框架
- **basic_modular_route**: 路由管理
- **flutter**: Flutter 框架

### UI 组件
- **Material Design**: 基础 UI 组件
- **Custom Widgets**: 虚拟形象专用组件

### 数据存储
- **SharedPreferences**: 配置信息本地存储
- **文件系统**: 图片和资源文件存储

## 最佳实践与规范

### 1. 代码组织
- 页面文件统一放在 `src/avatar/pages/` 目录
- 按功能模块分别组织（拍照、生成、编辑、展示）
- 对外组件放在 `provide_external` 目录

### 2. 路由管理
- 采用 `RouteExporter` 接口统一路由导出
- 使用 `RouteMeta` 配置路由元数据
- 支持路由参数传递和嵌套路由

### 3. 用户体验优化
- 流畅的页面转场动画
- 友好的加载进度提示
- 响应式布局适配不同屏幕

### 4. 性能优化
- 合理的资源加载和释放
- 动画性能优化
- 内存使用管理
