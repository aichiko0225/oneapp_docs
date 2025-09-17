# Basic Utils 基础工具模块群

## 模块群概述

Basic Utils 模块群是 OneApp 的基础工具集合，提供了应用开发中必需的底层工具和通用组件。该模块群包含了网络通信、日志系统、配置管理、平台适配、推送服务等核心基础设施。

## 子模块列表

### 核心基础模块
1. **[basic_network](./basic_network.md)** - 网络通信模块
2. **[basic_logger](./basic_logger.md)** - 日志系统模块
3. **[basic_config](./basic_config.md)** - 配置管理模块
4. **[basic_platform](./basic_platform.md)** - 平台适配模块
5. **[basic_push](./basic_push.md)** - 推送服务模块
6. **[basic_utils](./basic_utils.md)** - 基础工具模块

### 架构框架模块
7. **[base_mvvm](./base_mvvm.md)** - MVVM架构模块

### 下载和监控模块
8. **[flutter_downloader](./flutter_downloader.md)** - 文件下载器模块
9. **[kit_app_monitor](./kit_app_monitor.md)** - 应用监控工具包

### 第三方集成模块
10. **[flutter_plugin_mtpush_private](./flutter_plugin_mtpush_private.md)** - 美团云推送插件

## 使用指南

### 基础依赖配置
```yaml
dependencies:
  basic_utils:
    path: ../oneapp_basic_utils/basic_utils
  basic_config:
    path: ../oneapp_basic_utils/basic_config
  basic_logger:
    path: ../oneapp_basic_utils/basic_logger
  basic_network:
    path: ../oneapp_basic_utils/basic_network
  basic_platform:
    path: ../oneapp_basic_utils/basic_platform
```

### 初始化配置
```dart
// 应用初始化时配置基础模块
await BasicUtils.initialize();
await BasicConfig.initialize();
await BasicLogger.initialize();
await BasicNetwork.initialize();
await BasicPlatform.initialize();
```

## 开发规范

### 模块设计原则
1. **单一职责**: 每个模块只负责特定的功能领域
2. **接口抽象**: 提供清晰的接口定义，隐藏实现细节
3. **配置驱动**: 通过配置控制模块行为，提高灵活性
4. **错误处理**: 统一的错误处理和日志记录机制

### 代码规范
- 遵循 Dart 官方编码规范
- 使用静态分析工具检查代码质量
- 编写完整的单元测试和文档
- 版本化管理和变更日志

## 总结

`oneapp_basic_utils` 模块群为 OneApp 提供了坚实的技术基础，通过模块化设计和统一抽象，实现了基础功能的复用和标准化。这些模块不仅支撑了当前的业务需求，也为未来的功能扩展提供了良好的基础架构。
