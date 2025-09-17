# UI Business 业务UI组件模块

## 模块概述

`ui_business` 是 OneApp 基础UI模块群中的业务组件库，专门提供与业务逻辑相关的UI组件和交互元素。该模块基于基础UI组件进行封装，提供了车联网、消息中心、地理位置等业务场景的专用组件。

### 基本信息
- **模块名称**: ui_business
- **版本**: 0.2.28+3
- **描述**: 业务UI组件库
- **Flutter 版本**: >=2.10.5
- **Dart 版本**: >=2.16.2 <4.0.0

## 功能特性

### 核心功能
1. **业务组件库**
   - 车辆状态展示组件
   - 消息中心组件
   - 地理位置组件
   - 用户同意组件

2. **业务交互组件**
   - 业务表单组件
   - 数据展示组件
   - 状态指示组件
   - 操作反馈组件

3. **专业界面元素**
   - 车辆控制面板
   - 地图相关组件
   - 消息列表组件
   - 权限申请组件

4. **业务流程组件**
   - 引导流程组件
   - 步骤指示器
   - 进度展示组件
   - 结果页面组件

## 技术架构

### 目录结构
```
lib/
├── ui_business.dart            # 模块入口文件
├── src/                        # 源代码目录
│   ├── vehicle/                # 车辆相关组件
│   ├── message/                # 消息中心组件
│   ├── location/               # 地理位置组件
│   ├── consent/                # 用户同意组件
│   ├── forms/                  # 业务表单组件
│   ├── displays/               # 数据展示组件
│   └── workflows/              # 业务流程组件
├── widgets/                    # 组件导出
└── themes/                     # 业务主题
```

### 依赖关系

#### 基础框架依赖
- `basic_modular: ^0.2.3` - 模块化框架
- `basic_modular_route: ^0.2.1` - 路由管理
- `basic_intl: ^0.2.0` - 国际化基础
- `basic_intl_flutter: ^0.2.2+1` - 国际化Flutter支持

#### 业务服务依赖
- `clr_message: ^0.2.5+3` - 消息中心服务
- `clr_geo: ^0.2.16+1` - 地理位置服务
- `basic_consent: ^0.2.17` - 用户同意框架
- `basic_error: ^0.2.3+1` - 错误处理框架
- `basic_track: ^0.1.3` - 数据埋点

#### 工具依赖
- `dartz: ^0.10.1` - 函数式编程
- `freezed_annotation: ^2.0.3` - 数据类注解
- `url_launcher: ^6.1.11` - URL启动

## 核心组件分析

### 1. 车辆相关组件 (`src/vehicle/`)

#### 车辆状态卡片
```dart
class VehicleStatusCard extends StatelessWidget {
  final VehicleStatus status;
  final VoidCallback? onTap;
  final bool showDetails;

  const VehicleStatusCard({
    Key? key,
    required this.status,
    this.onTap,
    this.showDetails = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context),
              const SizedBox(height: 16),
              _buildStatusIndicators(context),
              if (showDetails) ...[
                const SizedBox(height: 16),
                _buildDetailInfo(context),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: _getStatusColor().withOpacity(0.1),
          child: Icon(
            _getStatusIcon(),
            color: _getStatusColor(),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                status.vehicleName,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                _getStatusText(),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: _getStatusColor(),
                ),
              ),
            ],
          ),
        ),
        Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: Colors.grey[400],
        ),
      ],
    );
  }

  Widget _buildStatusIndicators(BuildContext context) {
    return Row(
      children: [
        _buildIndicator(
          context,
          Icons.battery_charging_full,
          '${status.batteryLevel}%',
          status.batteryLevel > 20 ? Colors.green : Colors.orange,
        ),
        const SizedBox(width: 24),
        _buildIndicator(
          context,
          Icons.speed,
          '${status.mileage} km',
          Colors.blue,
        ),
        const SizedBox(width: 24),
        _buildIndicator(
          context,
          Icons.lock,
          status.isLocked ? '已锁定' : '未锁定',
          status.isLocked ? Colors.red : Colors.green,
        ),
      ],
    );
  }

  Widget _buildIndicator(
    BuildContext context,
    IconData icon,
    String value,
    Color color,
  ) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
```

#### 车辆控制面板
```dart
class VehicleControlPanel extends StatelessWidget {
  final VehicleStatus status;
  final Function(VehicleAction) onAction;

  const VehicleControlPanel({
    Key? key,
    required this.status,
    required this.onAction,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(20),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHandle(),
          const SizedBox(height: 20),
          _buildQuickActions(context),
          const SizedBox(height: 16),
          _buildDetailActions(context),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildActionButton(
          context,
          icon: status.isLocked ? Icons.lock_open : Icons.lock,
          label: status.isLocked ? '解锁' : '锁定',
          color: status.isLocked ? Colors.green : Colors.red,
          onTap: () => onAction(
            status.isLocked ? VehicleAction.unlock : VehicleAction.lock,
          ),
        ),
        _buildActionButton(
          context,
          icon: Icons.ac_unit,
          label: '空调',
          color: Colors.blue,
          onTap: () => onAction(VehicleAction.airConditioner),
        ),
        _buildActionButton(
          context,
          icon: Icons.electric_bolt,
          label: '充电',
          color: Colors.orange,
          onTap: () => onAction(VehicleAction.charge),
        ),
        _buildActionButton(
          context,
          icon: Icons.location_on,
          label: '定位',
          color: Colors.purple,
          onTap: () => onAction(VehicleAction.locate),
        ),
      ],
    );
  }
}
```

### 2. 消息中心组件 (`src/message/`)

#### 消息列表组件
```dart
class MessageListView extends StatefulWidget {
  final Future<List<Message>> Function() onRefresh;
  final Future<List<Message>> Function()? onLoadMore;
  final Function(Message)? onMessageTap;
  final Function(Message)? onMessageDelete;

  const MessageListView({
    Key? key,
    required this.onRefresh,
    this.onLoadMore,
    this.onMessageTap,
    this.onMessageDelete,
  }) : super(key: key);

  @override
  State<MessageListView> createState() => _MessageListViewState();
}

class _MessageListViewState extends State<MessageListView> {
  List<Message> _messages = [];
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _handleRefresh,
      child: ListView.separated(
        itemCount: _messages.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final message = _messages[index];
          return MessageTile(
            message: message,
            onTap: () => widget.onMessageTap?.call(message),
            onDelete: () => widget.onMessageDelete?.call(message),
          );
        },
      ),
    );
  }
}

class MessageTile extends StatelessWidget {
  final Message message;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;

  const MessageTile({
    Key? key,
    required this.message,
    this.onTap,
    this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(message.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: Colors.red,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) => onDelete?.call(),
      child: ListTile(
        leading: _buildMessageIcon(),
        title: Text(
          message.title,
          style: TextStyle(
            fontWeight: message.isRead ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.content,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(message.timestamp),
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        trailing: !message.isRead
            ? Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
              )
            : null,
        onTap: onTap,
      ),
    );
  }
}
```

### 3. 地理位置组件 (`src/location/`)

#### 位置选择器
```dart
class LocationPicker extends StatefulWidget {
  final LatLng? initialLocation;
  final Function(LocationResult) onLocationSelected;
  final String? title;

  const LocationPicker({
    Key? key,
    this.initialLocation,
    required this.onLocationSelected,
    this.title,
  }) : super(key: key);

  @override
  State<LocationPicker> createState() => _LocationPickerState();
}

class _LocationPickerState extends State<LocationPicker> {
  late TextEditingController _searchController;
  List<POI> _searchResults = [];
  bool _isSearching = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title ?? '选择位置'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: _buildSearchBar(),
        ),
      ),
      body: Column(
        children: [
          if (_isSearching) _buildSearchResults(),
          Expanded(child: _buildMap()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _getCurrentLocation,
        child: const Icon(Icons.my_location),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: '搜索地点',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _clearSearch();
                  },
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(25),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 20),
        ),
        onChanged: _onSearchChanged,
      ),
    );
  }
}
```

### 4. 用户同意组件 (`src/consent/`)

#### 同意确认对话框
```dart
class ConsentDialog extends StatefulWidget {
  final ConsentConfig config;
  final Function(bool) onResult;

  const ConsentDialog({
    Key? key,
    required this.config,
    required this.onResult,
  }) : super(key: key);

  @override
  State<ConsentDialog> createState() => _ConsentDialogState();
}

class _ConsentDialogState extends State<ConsentDialog> {
  bool _hasReadTerms = false;
  bool _acceptedTerms = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.config.title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.config.description),
          const SizedBox(height: 16),
          _buildTermsSection(),
          const SizedBox(height: 16),
          _buildConsentCheckbox(),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => widget.onResult(false),
          child: const Text('拒绝'),
        ),
        ElevatedButton(
          onPressed: _acceptedTerms ? () => widget.onResult(true) : null,
          child: const Text('同意'),
        ),
      ],
    );
  }

  Widget _buildTermsSection() {
    return Container(
      height: 120,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: SingleChildScrollView(
        child: Text(
          widget.config.termsContent,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ),
    );
  }

  Widget _buildConsentCheckbox() {
    return CheckboxListTile(
      value: _acceptedTerms,
      onChanged: _hasReadTerms ? (value) {
        setState(() {
          _acceptedTerms = value ?? false;
        });
      } : null,
      title: Text(
        '我已阅读并同意上述条款',
        style: Theme.of(context).textTheme.bodyMedium,
      ),
      controlAffinity: ListTileControlAffinity.leading,
      contentPadding: EdgeInsets.zero,
    );
  }
}
```

## 使用示例

### 车辆状态展示
```dart
class VehicleStatusExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vehicleStatus = VehicleStatus(
      vehicleName: 'ID.4 CROZZ',
      batteryLevel: 85,
      mileage: 15234,
      isLocked: true,
      location: '北京市朝阳区',
    );

    return Scaffold(
      appBar: AppBar(title: Text('我的车辆')),
      body: Column(
        children: [
          VehicleStatusCard(
            status: vehicleStatus,
            onTap: () {
              // 跳转到车辆详情页
            },
          ),
          Expanded(
            child: VehicleControlPanel(
              status: vehicleStatus,
              onAction: (action) {
                // 处理车辆操作
                _handleVehicleAction(action);
              },
            ),
          ),
        ],
      ),
    );
  }

  void _handleVehicleAction(VehicleAction action) {
    switch (action) {
      case VehicleAction.lock:
        // 锁车操作
        break;
      case VehicleAction.unlock:
        // 解锁操作
        break;
      case VehicleAction.airConditioner:
        // 空调操作
        break;
      case VehicleAction.charge:
        // 充电操作
        break;
    }
  }
}
```

### 消息中心展示
```dart
class MessageCenterExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('消息中心')),
      body: MessageListView(
        onRefresh: () async {
          // 刷新消息列表
          return await MessageService.getMessages();
        },
        onLoadMore: () async {
          // 加载更多消息
          return await MessageService.getMoreMessages();
        },
        onMessageTap: (message) {
          // 处理消息点击
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => MessageDetailPage(message: message),
            ),
          );
        },
        onMessageDelete: (message) {
          // 删除消息
          MessageService.deleteMessage(message.id);
        },
      ),
    );
  }
}
```

## 主题定制

### 业务主题配置
```dart
class BusinessTheme {
  static ThemeData get vehicleTheme {
    return ThemeData(
      primarySwatch: Colors.blue,
      cardTheme: CardTheme(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      // 车辆相关主题配置
    );
  }

  static ThemeData get messageTheme {
    return ThemeData(
      primarySwatch: Colors.green,
      // 消息中心主题配置
    );
  }
}
```

## 性能优化

### 业务组件优化
- **数据缓存**: 缓存业务数据减少网络请求
- **图片优化**: 使用缓存和压缩优化图片加载
- **列表优化**: 使用懒加载和虚拟滚动
- **状态管理**: 合理使用状态管理减少重建

### 用户体验优化
- **加载状态**: 提供友好的加载提示
- **错误处理**: 优雅的错误页面和重试机制
- **离线支持**: 基本的离线功能支持
- **响应式设计**: 适配不同屏幕尺寸

## 测试策略

### 业务组件测试
- **业务逻辑测试**: 测试业务相关逻辑
- **UI组件测试**: 测试组件渲染和交互
- **集成测试**: 测试与服务的集成
- **用户体验测试**: 测试用户操作流程

## 最佳实践

### 组件使用建议
1. **业务封装**: 将业务逻辑封装在组件内部
2. **数据驱动**: 使用数据模型驱动UI更新
3. **错误边界**: 添加适当的错误处理边界
4. **无障碍访问**: 考虑无障碍功能支持

### 开发规范
1. **命名规范**: 使用清晰的业务相关命名
2. **文档完善**: 提供详细的组件使用文档
3. **版本兼容**: 保持向后兼容性
4. **代码复用**: 提取通用的业务逻辑

## 总结

`ui_business` 模块作为 OneApp 的业务UI组件库，专门针对车联网、消息中心、地理位置等业务场景提供了专业的UI组件。通过业务逻辑的封装和标准化的交互模式，大大提升了业务功能的开发效率和用户体验一致性。模块具有良好的扩展性和可维护性，能够快速适应业务需求的变化。
