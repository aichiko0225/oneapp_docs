# OneApp Companion - 伴侣应用模块

## 模块概述

`oneapp_companion` 是 OneApp 的伴侣应用模块，提供多设备协同功能。该模块支持手机、平板、智能手表、车载设备等多种设备间的数据同步、远程控制和设备管理，为用户提供无缝的跨设备体验。

## 核心功能

### 1. 多设备协同
- **设备发现**：自动发现附近的伴侣设备
- **设备配对**：安全的设备配对和认证
- **状态同步**：设备状态实时同步
- **会话共享**：跨设备会话状态共享

### 2. 数据同步
- **实时同步**：关键数据实时同步
- **增量同步**：高效的增量数据同步
- **冲突解决**：数据冲突智能解决
- **离线同步**：离线状态下的数据缓存和同步

### 3. 远程控制
- **车辆控制**：远程控制车辆功能
- **应用控制**：远程控制应用操作
- **媒体控制**：跨设备媒体播放控制
- **权限管理**：远程操作权限控制

### 4. 设备管理
- **设备注册**：新设备注册和绑定
- **设备监控**：设备状态监控和管理
- **设备配置**：设备配置同步和管理
- **设备安全**：设备安全策略和控制

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            主应用设备                │
│          (Primary Device)           │
├─────────────────────────────────────┤
│        OneApp Companion             │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 设备管理 │ 数据同步 │ 远程控制 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 通信协议 │ 安全模块 │ 状态管理 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           通信协议层                │
│  ┌──────────┬──────────┬──────────┐ │
│  │ Bluetooth│  WiFi    │ Cellular │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           伴侣设备群                │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 手机/平板│ 智能手表 │ 车载设备 │ │
│  └──────────┴──────────┴──────────┘ │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 设备管理器 (DeviceManager)
```dart
class CompanionDeviceManager {
  // 发现设备
  Future<List<CompanionDevice>> discoverDevices();
  
  // 配对设备
  Future<bool> pairDevice(String deviceId);
  
  // 获取已配对设备
  Future<List<CompanionDevice>> getPairedDevices();
  
  // 断开设备连接
  Future<bool> disconnectDevice(String deviceId);
}
```

#### 2. 数据同步器 (DataSynchronizer)
```dart
class CompanionDataSynchronizer {
  // 同步数据到设备
  Future<SyncResult> syncToDevice(String deviceId, SyncData data);
  
  // 从设备同步数据
  Future<SyncResult> syncFromDevice(String deviceId);
  
  // 批量同步
  Future<List<SyncResult>> batchSync(List<SyncRequest> requests);
  
  // 解决同步冲突
  Future<ConflictResolution> resolveConflicts(List<SyncConflict> conflicts);
}
```

#### 3. 远程控制器 (RemoteController)
```dart
class CompanionRemoteController {
  // 发送远程指令
  Future<CommandResult> sendCommand(String deviceId, RemoteCommand command);
  
  // 批量发送指令
  Future<List<CommandResult>> sendBatchCommands(String deviceId, List<RemoteCommand> commands);
  
  // 监听远程指令
  Stream<RemoteCommand> listenForCommands();
  
  // 响应远程指令
  Future<CommandResult> respondToCommand(RemoteCommand command);
}
```

#### 4. 连接管理器 (ConnectionManager)
```dart
class CompanionConnectionManager {
  // 建立连接
  Future<Connection> establishConnection(CompanionDevice device);
  
  // 维持连接
  Future<bool> maintainConnection(String deviceId);
  
  // 监控连接状态
  Stream<ConnectionStatus> monitorConnection(String deviceId);
  
  // 重连设备
  Future<bool> reconnectDevice(String deviceId);
}
```

## 数据模型

### 设备模型
```dart
class CompanionDevice {
  final String id;
  final String name;
  final DeviceType type;
  final String model;
  final String version;
  final DeviceStatus status;
  final DateTime lastSeen;
  final Map<String, dynamic> capabilities;
  final SecurityInfo security;
  final ConnectionInfo connection;
}

enum DeviceType {
  smartphone,    // 智能手机
  tablet,        // 平板电脑
  smartwatch,    // 智能手表
  carDisplay,    // 车载显示器
  desktop,       // 桌面应用
  other          // 其他设备
}

enum DeviceStatus {
  online,        // 在线
  offline,       // 离线
  connecting,    // 连接中
  syncing,       // 同步中
  error          // 错误状态
}
```

### 同步数据模型
```dart
class SyncData {
  final String id;
  final SyncDataType type;
  final Map<String, dynamic> data;
  final DateTime timestamp;
  final String version;
  final List<String> targetDevices;
  final SyncPriority priority;
}

enum SyncDataType {
  userPreferences,   // 用户偏好
  vehicleStatus,     // 车辆状态
  mediaPlaylist,     // 媒体播放列表
  navigationRoute,   // 导航路线
  chargingSession,   // 充电会话
  configuration      // 配置信息
}

enum SyncPriority {
  low,      // 低优先级
  normal,   // 普通优先级
  high,     // 高优先级
  critical  // 关键优先级
}
```

### 远程指令模型
```dart
class RemoteCommand {
  final String id;
  final CommandType type;
  final Map<String, dynamic> parameters;
  final String sourceDeviceId;
  final String targetDeviceId;
  final DateTime timestamp;
  final bool requiresConfirmation;
  final Duration timeout;
}

enum CommandType {
  vehicleControl,    // 车辆控制
  mediaControl,      // 媒体控制
  navigationControl, // 导航控制
  appControl,        // 应用控制
  systemControl,     // 系统控制
  dataRequest        // 数据请求
}
```

## API 接口

### 设备管理接口
```dart
abstract class CompanionDeviceService {
  // 发现附近设备
  Future<ApiResponse<List<CompanionDevice>>> discoverNearbyDevices();
  
  // 配对设备
  Future<ApiResponse<bool>> pairDevice(PairDeviceRequest request);
  
  // 获取设备列表
  Future<ApiResponse<List<CompanionDevice>>> getDeviceList();
  
  // 更新设备信息
  Future<ApiResponse<bool>> updateDeviceInfo(UpdateDeviceRequest request);
}
```

### 数据同步接口
```dart
abstract class CompanionSyncService {
  // 同步数据
  Future<ApiResponse<SyncResult>> syncData(SyncDataRequest request);
  
  // 获取同步状态
  Future<ApiResponse<SyncStatus>> getSyncStatus(String deviceId);
  
  // 解决同步冲突
  Future<ApiResponse<bool>> resolveConflict(ConflictResolutionRequest request);
}
```

### 远程控制接口
```dart
abstract class CompanionRemoteService {
  // 发送远程命令
  Future<ApiResponse<CommandResult>> sendRemoteCommand(RemoteCommandRequest request);
  
  // 获取命令状态
  Future<ApiResponse<CommandStatus>> getCommandStatus(String commandId);
  
  // 取消远程命令
  Future<ApiResponse<bool>> cancelCommand(String commandId);
}
```

## 配置管理

### 伴侣应用配置
```dart
class CompanionConfig {
  final bool autoDiscovery;
  final Duration discoveryInterval;
  final int maxPairedDevices;
  final bool enableRemoteControl;
  final List<SyncDataType> enabledSyncTypes;
  final SecurityLevel securityLevel;
  
  static const CompanionConfig defaultConfig = CompanionConfig(
    autoDiscovery: true,
    discoveryInterval: Duration(minutes: 5),
    maxPairedDevices: 10,
    enableRemoteControl: true,
    enabledSyncTypes: [
      SyncDataType.userPreferences,
      SyncDataType.vehicleStatus,
      SyncDataType.mediaPlaylist,
    ],
    securityLevel: SecurityLevel.high,
  );
}
```

### 同步配置
```dart
class SyncConfig {
  final bool enableRealTimeSync;
  final Duration syncInterval;
  final int maxSyncRetries;
  final bool enableIncrementalSync;
  final Map<SyncDataType, SyncSettings> typeSettings;
  
  static const SyncConfig defaultSyncConfig = SyncConfig(
    enableRealTimeSync: true,
    syncInterval: Duration(minutes: 1),
    maxSyncRetries: 3,
    enableIncrementalSync: true,
    typeSettings: {
      SyncDataType.vehicleStatus: SyncSettings(priority: SyncPriority.high),
      SyncDataType.userPreferences: SyncSettings(priority: SyncPriority.normal),
    },
  );
}
```

## 使用示例

### 设备发现和配对
```dart
// 初始化伴侣应用管理器
final companionManager = CompanionDeviceManager.instance;
await companionManager.initialize(CompanionConfig.defaultConfig);

// 发现附近设备
final nearbyDevices = await companionManager.discoverDevices();

for (final device in nearbyDevices) {
  print('发现设备: ${device.name} (${device.type})');
  
  // 配对兼容设备
  if (device.capabilities.containsKey('oneapp_support')) {
    final paired = await companionManager.pairDevice(device.id);
    if (paired) {
      print('设备配对成功: ${device.name}');
    }
  }
}

// 监听设备状态变化
companionManager.onDeviceStatusChanged.listen((device) {
  print('设备状态变更: ${device.name} -> ${device.status}');
});
```

### 数据同步
```dart
// 同步用户偏好到所有设备
final userPreferences = await getUserPreferences();
final syncData = SyncData(
  id: 'user_prefs_${DateTime.now().millisecondsSinceEpoch}',
  type: SyncDataType.userPreferences,
  data: userPreferences.toJson(),
  timestamp: DateTime.now(),
  priority: SyncPriority.normal,
);

final pairedDevices = await companionManager.getPairedDevices();
for (final device in pairedDevices) {
  if (device.status == DeviceStatus.online) {
    final result = await CompanionDataSynchronizer.instance.syncToDevice(device.id, syncData);
    print('同步到 ${device.name}: ${result.isSuccess}');
  }
}

// 监听同步状态
CompanionDataSynchronizer.instance.onSyncProgress.listen((progress) {
  print('同步进度: ${progress.percentage}%');
});
```

### 远程控制
```dart
// 远程启动车辆
final startEngineCommand = RemoteCommand(
  id: 'start_engine_${DateTime.now().millisecondsSinceEpoch}',
  type: CommandType.vehicleControl,
  parameters: {
    'action': 'start_engine',
    'duration': 300, // 5分钟
  },
  sourceDeviceId: 'smartphone_001',
  targetDeviceId: 'car_display_001',
  requiresConfirmation: true,
  timeout: Duration(seconds: 30),
);

final result = await CompanionRemoteController.instance.sendCommand(
  'car_display_001',
  startEngineCommand,
);

if (result.isSuccess) {
  print('远程启动指令发送成功');
} else {
  print('远程启动失败: ${result.error}');
}

// 监听远程指令
CompanionRemoteController.instance.listenForCommands().listen((command) {
  print('收到远程指令: ${command.type}');
  // 处理远程指令
  handleRemoteCommand(command);
});
```

### 连接管理
```dart
// 监控设备连接状态
final connectionManager = CompanionConnectionManager.instance;

for (final device in pairedDevices) {
  connectionManager.monitorConnection(device.id).listen((status) {
    switch (status.state) {
      case ConnectionState.connected:
        print('${device.name} 已连接');
        break;
      case ConnectionState.disconnected:
        print('${device.name} 已断开，尝试重连...');
        connectionManager.reconnectDevice(device.id);
        break;
      case ConnectionState.error:
        print('${device.name} 连接错误: ${status.error}');
        break;
    }
  });
}
```

## 测试策略

### 单元测试
```dart
group('CompanionDevice Tests', () {
  test('should discover nearby devices', () async {
    // Given
    final deviceManager = CompanionDeviceManager();
    
    // When
    final devices = await deviceManager.discoverDevices();
    
    // Then
    expect(devices, isNotEmpty);
    expect(devices.first.type, isA<DeviceType>());
  });
  
  test('should sync data successfully', () async {
    // Given
    final synchronizer = CompanionDataSynchronizer();
    final syncData = SyncData(
      id: 'test_sync',
      type: SyncDataType.userPreferences,
      data: {'theme': 'dark'},
      timestamp: DateTime.now(),
      priority: SyncPriority.normal,
    );
    
    // When
    final result = await synchronizer.syncToDevice('test_device', syncData);
    
    // Then
    expect(result.isSuccess, true);
  });
});
```

### 集成测试
```dart
group('Companion Integration Tests', () {
  testWidgets('device pairing flow', (tester) async {
    // 1. 启动设备发现
    await CompanionDeviceManager.instance.startDiscovery();
    
    // 2. 模拟发现设备
    final mockDevice = createMockDevice();
    await simulateDeviceDiscovered(mockDevice);
    
    // 3. 执行配对
    final paired = await CompanionDeviceManager.instance.pairDevice(mockDevice.id);
    
    // 4. 验证配对结果
    expect(paired, true);
    
    final pairedDevices = await CompanionDeviceManager.instance.getPairedDevices();
    expect(pairedDevices, contains(mockDevice));
  });
});
```

## 性能优化

### 连接优化
- **连接池**：设备连接池管理
- **心跳机制**：定期心跳保持连接
- **重连策略**：智能重连机制
- **负载均衡**：多设备负载均衡

### 同步优化
- **增量同步**：只同步变化的数据
- **压缩传输**：数据压缩减少传输量
- **批量操作**：批量同步提高效率
- **优先级队列**：按优先级处理同步任务

## 安全考虑

### 设备安全
- **设备认证**：设备身份认证和授权
- **加密通信**：端到端加密通信
- **权限控制**：细粒度权限控制
- **安全审计**：操作安全审计日志

### 数据安全
- **数据加密**：敏感数据加密存储和传输
- **访问控制**：基于角色的数据访问控制
- **数据完整性**：数据完整性验证
- **隐私保护**：用户隐私数据保护

## 版本历史

### v0.0.7 (当前版本)
- 新增智能手表支持
- 优化设备发现性能
- 支持批量数据同步
- 修复连接稳定性问题

### v0.0.6
- 支持车载设备连接
- 新增远程控制功能
- 优化同步机制
- 改进设备管理界面

## 依赖关系

### 内部依赖
- `basic_platform`: 平台抽象层
- `basic_network`: 网络通信服务
- `basic_storage`: 本地存储服务
- `basic_security`: 安全服务

### 外部依赖
- `nearby_connections`: 设备发现和连接
- `encrypt`: 数据加密
- `rxdart`: 响应式编程
- `shared_preferences`: 配置存储

## 总结

`oneapp_companion` 模块为 OneApp 提供了完整的多设备协同解决方案。通过设备发现、数据同步、远程控制和连接管理等功能，该模块实现了跨设备的无缝体验，让用户能够在不同设备间自由切换，享受一致的应用体验和便捷的远程控制功能。
