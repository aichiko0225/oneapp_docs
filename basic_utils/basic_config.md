# Basic Config - 基础配置管理模块文档

## 模块概述

`basic_config` 是 OneApp 基础工具模块群中的配置管理模块，提供了应用配置的统一管理、API服务管控、版本控制等功能。该模块采用领域驱动设计(DDD)架构，支持动态配置更新、服务白名单管理和API访问控制。

### 基本信息
- **模块名称**: basic_config
- **模块路径**: oneapp_basic_utils/basic_config
- **类型**: Flutter Package Module
- **架构模式**: DDD (Domain Driven Design)
- **主要功能**: 配置管理、API服务管控、版本管理

### 核心特性
- **API服务管控**: 基于正则表达式的API路径匹配和访问控制
- **服务白名单**: 支持白名单机制，允许特定服务绕过管控
- **动态配置更新**: 支持运行时更新服务规则列表
- **版本管理**: 内置版本比较和管理功能
- **缓存优化**: 使用LRU缓存提升查询性能
- **项目隔离**: 支持多项目代码隔离的配置管理

## 目录结构

```
basic_config/
├── lib/
│   ├── basic_config.dart           # 模块入口文件
│   └── src/
│       ├── constants/              # 常量定义
│       │   └── module_constant.dart
│       ├── dependency/             # 依赖注入
│       │   └── i_config_deps.dart
│       ├── domains/                # 领域层
│       │   ├── basic_config_facade.dart      # 配置门面服务
│       │   ├── entities/           # 实体对象
│       │   │   ├── config_service_failures.dart
│       │   │   ├── config_versions.dart
│       │   │   └── project_services.dart
│       │   ├── interfaces/         # 接口定义
│       │   │   └── app_api_services_interface.dart
│       │   └── value_objects/      # 值对象
│       │       └── project_code.dart
│       └── infrastructure/         # 基础设施层
│           └── repositories/
│               └── app_api_seervices_repository.dart
└── pubspec.yaml                    # 依赖配置
```

## 核心架构组件

### 1. 版本管理 (Version)

提供语义化版本号的解析和比较功能：

```dart
mixin Version {
  /// 转成字符串格式
  String get toStr => '$major.$minor.$revision';

  /// 版本比较 - 大于
  bool greaterThan(Version other) {
    if (major > other.major) return true;
    if (minor > other.minor && major == other.major) return true;
    if (revision > other.revision && 
        major == other.major && 
        minor == other.minor) return true;
    return false;
  }

  /// 主版本号
  int get major;
  /// 次版本号  
  int get minor;
  /// 修订版本号
  int get revision;

  @override
  String toString() => toStr;

  /// 解析版本字符串 (格式: x.x.x)
  static Version parseFrom(String versionStr) {
    final split = versionStr.split('.');
    if (split.length != 3) {
      throw UnsupportedError('parse version From $versionStr failed');
    }
    
    final int major = int.parse(split[0]);
    final int minor = int.parse(split[1]);
    final int revision = int.parse(split[2]);
    
    return _VersionImpl(major, minor, revision);
  }
}
```

### 2. 项目服务实体 (ProjectServicesDo)

定义单个项目的服务配置信息：

```dart
class ProjectServicesDo {
  /// 构造函数
  /// [projectCode] 项目编号
  /// [ruleList] api path 正则规则
  /// [disableServiceList] 下架的服务列表
  ProjectServicesDo({
    required this.projectCode,
    required this.ruleList,
    required this.disableServiceList,
  }) : _ruleListRegex = ruleList.map(RegExp.new).toList(growable: false);

  /// 项目编号
  final ProjectCodeVo projectCode;
  
  /// 该项目对应的规则列表
  final List<String> ruleList;
  
  /// 对应正则表达式
  final List<RegExp> _ruleListRegex;
  
  /// 下架的服务
  final List<String> disableServiceList;

  /// 检查路径是否匹配规则
  bool isMatchBy(String s) {
    bool match = false;
    for (final rule in _ruleListRegex) {
      match = rule.hasMatch(s);
      if (match) break;
    }
    return match;
  }
}
```

### 3. 应用项目管理 (AppProjectsDo)

管理所有项目的服务配置：

```dart
class AppProjectsDo {
  /// 构造函数
  AppProjectsDo(this.version, this.projects) {
    for (final project in projects) {
      _projectsMap[project.projectCode.id] = project;
    }
  }

  /// 版本号
  final int version;
  
  /// app所有项目的信息
  List<ProjectServicesDo> projects;
  
  /// 项目映射表
  final Map<String, ProjectServicesDo> _projectsMap = {};

  /// 根据项目代码查找项目
  ProjectServicesDo? findBy(String projectCode) => _projectsMap[projectCode];

  /// 检查服务是否已下架
  bool isServiceDisabled({
    required String projectCode,
    required String service,
  }) {
    try {
      final project = _projectsMap[projectCode];
      project!.disableServiceList.firstWhere((e) => e == service);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// 获取所有项目编号
  List<String> getProjectCodes() => _projectsMap.keys.toList(growable: false);
}
```

### 4. 基础配置门面 (BasicConfigFacade)

核心配置管理服务，采用单例模式：

```dart
abstract class IBasicConfigFacade {
  /// 初始化配置
  Future<Either<ConfigServiceFailures, Unit>> initialize({
    required String versionOfConnectivity,
    String jsonServiceList = '',
    List<String> whiteServiceList = const [],
    IBasicConfigDeps? deps,
  });

  /// 检查API是否命中管控规则
  Either<ConfigServiceFailures, bool> queryApiIfHit({
    String projectCode = '',
    String url = '',
  });

  /// 检查API是否在白名单
  bool queryApiIfInWhiteList({required String url});

  /// 主动更新服务规则列表
  Future<bool> updateServiceList({List<String> projectCodes = const []});

  /// 检查服务是否下架
  bool isServiceDisabled({
    required String projectCode,
    required String service,
  });

  /// 根据项目代码查询项目信息
  Either<ConfigServiceFailures, ProjectServicesDo> queryProjectBy({
    String projectCode = '',
  });

  /// 获取当前连接版本
  Version get currConnVersion;
}

/// 全局配置对象
IBasicConfigFacade basicConfigFacade = BasicConfigFacadeImpl();
```

### 5. 具体实现 (BasicConfigFacadeImpl)

```dart
class BasicConfigFacadeImpl implements IBasicConfigFacade {
  BasicConfigFacadeImpl({IAppApiServiceRepo? appApiServiceRepo})
      : _apiServiceRepo = appApiServiceRepo ?? ApiServiceListRepository();

  static const String _tag = 'BasicConfigFacadeImpl';
  
  final IAppApiServiceRepo _apiServiceRepo;
  IBasicConfigDeps _deps = const DefaultConfigDeps();
  final _cache = LruCache<String, bool>(storage: InMemoryStorage(20));
  late Version _connVersion;

  @override
  Future<Either<ConfigServiceFailures, Unit>> initialize({
    required String versionOfConnectivity,
    String jsonServiceList = '',
    List<String> whiteServiceList = const [],
    IBasicConfigDeps? deps,
  }) async {
    if (deps != null) _deps = deps;
    _connVersion = Version.parseFrom(versionOfConnectivity);

    // 初始化api管控配置列表
    final r = await _apiServiceRepo.initialize(
      deps: _deps,
      jsonServiceList: jsonServiceList,
      whiteServiceList: whiteServiceList,
    );

    return r ? right(unit) : left(ConfigServiceFailures(
      errorCodeConfigServiceInvalidLocalServiceList,
      'initialize failed',
    ));
  }

  @override
  Either<ConfigServiceFailures, bool> queryApiIfHit({
    String projectCode = '',
    String url = '',
  }) {
    final appProject = _apiServiceRepo.appProject;
    if (appProject == null) {
      return left(ConfigServiceFailures(
        errorCodeConfigServiceEmptyServiceList,
        'empty service list',
      ));
    }

    final findBy = appProject.findBy(projectCode);
    if (findBy == null) return right(false);

    // 使用缓存优化查询性能
    final hitCache = _cache.get(url);
    if (hitCache == null) {
      final matchBy = findBy.isMatchBy(url);
      _cache.set(url, matchBy);
      return right(matchBy);
    }

    return right(hitCache);
  }

  // 其他方法实现...
}
```

## 使用指南

### 1. 初始化配置

```dart
import 'package:basic_config/basic_config.dart';

// 初始化基础配置
await basicConfigFacade.initialize(
  versionOfConnectivity: '1.0.0',
  jsonServiceList: jsonConfigData,
  whiteServiceList: ['api/health', 'api/version'],
);
```

### 2. API访问控制

```dart
// 检查API是否命中管控规则
final result = basicConfigFacade.queryApiIfHit(
  projectCode: 'oneapp_main',
  url: '/api/user/profile',
);

result.fold(
  (failure) => print('查询失败: ${failure.message}'),
  (isHit) => {
    if (isHit) {
      print('API被管控，需要特殊处理')
    } else {
      print('API正常访问')
    }
  },
);
```

### 3. 白名单检查

```dart
// 检查API是否在白名单
bool inWhiteList = basicConfigFacade.queryApiIfInWhiteList(
  url: '/api/health'
);

if (inWhiteList) {
  // 白名单API，直接放行
  print('白名单API，允许访问');
}
```

### 4. 服务状态检查

```dart
// 检查服务是否下架
bool isDisabled = basicConfigFacade.isServiceDisabled(
  projectCode: 'oneapp_main',
  service: 'user_profile',
);

if (isDisabled) {
  // 服务已下架，显示维护页面
  showMaintenancePage();
}
```

### 5. 动态更新配置

```dart
// 更新服务规则列表
bool updateSuccess = await basicConfigFacade.updateServiceList(
  projectCodes: ['oneapp_main', 'oneapp_car'],
);

if (updateSuccess) {
  print('配置更新成功');
}
```

### 6. 版本管理

```dart
// 版本解析和比较
Version currentVersion = Version.parseFrom('1.2.3');
Version newVersion = Version.parseFrom('1.2.4');

if (newVersion.greaterThan(currentVersion)) {
  print('发现新版本: ${newVersion.toStr}');
  // 执行更新逻辑
}
```

## 配置文件格式

### 服务配置JSON格式

```json
{
  "version": 1,
  "projects": [
    {
      "projectCode": "oneapp_main",
      "ruleList": [
        "^/api/user/.*",
        "^/api/payment/.*"
      ],
      "disableServiceList": [
        "old_payment_service",
        "deprecated_user_api"
      ]
    },
    {
      "projectCode": "oneapp_car",
      "ruleList": [
        "^/api/vehicle/.*",
        "^/api/charging/.*"
      ],
      "disableServiceList": []
    }
  ]
}
```

## 依赖配置

### pubspec.yaml 关键依赖

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # 函数式编程支持
  dartz: ^0.10.1
  
  # 基础日志模块
  basic_logger:
    path: ../basic_logger
    
  # 基础存储模块  
  basic_storage:
    path: ../basic_storage

dev_dependencies:
  flutter_test:
    sdk: flutter
```

## 架构设计原则

### 1. DDD分层架构
- **Domain层**: 包含业务实体、值对象和领域服务
- **Infrastructure层**: 处理数据持久化和外部服务调用
- **Application层**: 通过Facade模式提供应用服务

### 2. 函数式编程
- 使用`dartz`包提供的`Either`类型处理错误
- 避免异常抛出，通过类型系统表达可能的失败情况

### 3. 依赖注入
- 通过接口定义依赖，支持测试替换
- 使用抽象类定义服务边界

## 性能优化

### 1. 缓存策略
- 使用LRU缓存存储API匹配结果
- 缓存大小限制为20个条目，避免内存过度使用

### 2. 正则表达式优化
- 预编译正则表达式，避免重复编译开销
- 使用不可变列表存储编译后的正则

### 3. 查询优化
- 使用Map结构优化项目查找性能
- 短路求值减少不必要的匹配操作

## 最佳实践

### 1. 错误处理
```dart
// 推荐：使用Either处理可能的错误
final result = basicConfigFacade.queryApiIfHit(
  projectCode: projectCode,
  url: url,
);

result.fold(
  (failure) => handleFailure(failure),
  (success) => handleSuccess(success),
);

// 不推荐：使用try-catch
try {
  final result = riskyOperation();
  handleSuccess(result);
} catch (e) {
  handleError(e);
}
```

### 2. 配置管理
- 在应用启动时初始化配置
- 定期检查和更新远程配置
- 为关键服务提供降级策略

### 3. 测试策略
- 使用依赖注入进行单元测试
- 模拟网络请求测试异常情况
- 验证缓存行为的正确性

## 问题排查

### 常见问题
1. **初始化失败**: 检查配置JSON格式和依赖注入设置
2. **正则匹配异常**: 验证规则列表中的正则表达式语法
3. **缓存不生效**: 确认URL格式一致性

### 调试技巧
- 启用详细日志查看配置加载过程
- 使用`basicConfigTag`过滤相关日志
- 检查版本解析是否符合x.x.x格式
