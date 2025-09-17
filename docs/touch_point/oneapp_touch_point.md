# OneApp Touch Point - 触点服务主模块

## 模块概述

`oneapp_touch_point` 是 OneApp 的触点服务主模块，负责用户触点数据的收集、管理和分析。该模块通过跟踪用户在应用中的各种交互行为，构建完整的用户行为路径，为用户体验优化、个性化推荐和业务决策提供数据支撑。

## 核心功能

### 1. 用户触点数据收集
- **行为事件跟踪**：记录用户的点击、滑动、停留等行为
- **页面访问跟踪**：跟踪用户的页面访问路径和时长
- **功能使用统计**：统计各功能模块的使用频率
- **异常行为监控**：监控和记录异常的用户行为

### 2. 触点事件跟踪和分析
- **事件分类管理**：对触点事件进行分类和标签管理
- **实时事件处理**：实时处理和响应触点事件
- **事件关联分析**：分析事件之间的关联关系
- **趋势分析**：分析用户行为的趋势变化

### 3. 用户行为路径记录
- **用户旅程映射**：构建完整的用户旅程地图
- **转化漏斗分析**：分析用户在关键流程中的转化情况
- **路径优化建议**：基于数据分析提供路径优化建议
- **异常路径识别**：识别和分析异常的用户行为路径

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            应用界面层                │
│         (Application UI)            │
├─────────────────────────────────────┤
│        OneApp Touch Point           │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 数据收集 │ 事件处理 │ 行为分析 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 路径跟踪 │ 数据存储 │ 报告生成 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           数据处理层                │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 数据清洗 │ 数据聚合 │ 数据分析 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           数据存储层                │
│    (Local DB + Remote Analytics)    │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 触点数据收集器 (TouchPointCollector)
```dart
class TouchPointCollector {
  // 记录触点事件
  Future<void> trackEvent(TouchPointEvent event);
  
  // 记录页面访问
  Future<void> trackPageView(PageViewEvent event);
  
  // 记录用户行为
  Future<void> trackUserAction(UserActionEvent event);
  
  // 批量上传数据
  Future<bool> uploadBatchData();
}
```

#### 2. 事件分析器 (EventAnalyzer)
```dart
class TouchPointEventAnalyzer {
  // 分析用户行为模式
  Future<UserBehaviorPattern> analyzeUserBehavior(String userId, TimeRange timeRange);
  
  // 生成用户旅程
  Future<UserJourney> generateUserJourney(String userId, String sessionId);
  
  // 计算转化率
  Future<ConversionRate> calculateConversionRate(ConversionFunnel funnel);
  
  // 识别异常行为
  Future<List<AnomalousEvent>> detectAnomalousEvents(AnalysisConfig config);
}
```

#### 3. 路径跟踪器 (PathTracker)
```dart
class UserPathTracker {
  // 开始路径跟踪
  Future<String> startPathTracking(String userId);
  
  // 记录路径节点
  Future<void> recordPathNode(String sessionId, PathNode node);
  
  // 结束路径跟踪
  Future<UserPath> endPathTracking(String sessionId);
  
  // 获取用户路径历史
  Future<List<UserPath>> getUserPathHistory(String userId, int limit);
}
```

#### 4. 数据管理器 (TouchPointDataManager)
```dart
class TouchPointDataManager {
  // 存储触点数据
  Future<bool> storeTouchPointData(TouchPointData data);
  
  // 查询触点数据
  Future<List<TouchPointData>> queryTouchPointData(DataQuery query);
  
  // 清理过期数据
  Future<int> cleanupExpiredData(Duration retentionPeriod);
  
  // 导出数据
  Future<String> exportData(ExportConfig config);
}
```

## 数据模型

### 触点事件模型
```dart
class TouchPointEvent {
  final String id;
  final String userId;
  final String sessionId;
  final EventType type;
  final String category;
  final String action;
  final String? target;
  final Map<String, dynamic> properties;
  final DateTime timestamp;
  final String pageUrl;
  final String? referrer;
  final DeviceInfo deviceInfo;
  final LocationInfo? locationInfo;
}

enum EventType {
  click,        // 点击事件
  view,         // 查看事件
  scroll,       // 滚动事件
  input,        // 输入事件
  search,       // 搜索事件
  purchase,     // 购买事件
  share,        // 分享事件
  download,     // 下载事件
  upload,       // 上传事件
  custom        // 自定义事件
}
```

### 用户路径模型
```dart
class UserPath {
  final String id;
  final String userId;
  final String sessionId;
  final DateTime startTime;
  final DateTime endTime;
  final List<PathNode> nodes;
  final Duration totalDuration;
  final String? goalAchieved;
  final Map<String, dynamic> metadata;
}

class PathNode {
  final String id;
  final String pageUrl;
  final String pageName;
  final DateTime entryTime;
  final DateTime? exitTime;
  final Duration? duration;
  final List<TouchPointEvent> events;
  final String? exitMethod;
  final Map<String, dynamic> pageData;
}
```

### 用户行为分析模型
```dart
class UserBehaviorPattern {
  final String userId;
  final TimeRange analysisPeriod;
  final List<String> frequentPages;
  final List<String> preferredFeatures;
  final Map<String, int> actionCounts;
  final List<BehaviorInsight> insights;
  final double engagementScore;
  final UserSegment segment;
}

class ConversionFunnel {
  final String name;
  final List<FunnelStep> steps;
  final Map<String, ConversionMetric> metrics;
  final DateTime analysisTime;
}

class ConversionMetric {
  final int totalUsers;
  final int convertedUsers;
  final double conversionRate;
  final Duration averageTime;
  final List<String> dropOffReasons;
}
```

## API 接口

### 数据收集接口
```dart
abstract class TouchPointTrackingService {
  // 跟踪事件
  Future<ApiResponse<bool>> trackEvent(TrackEventRequest request);
  
  // 批量跟踪事件
  Future<ApiResponse<BatchResult>> trackBatchEvents(BatchTrackRequest request);
  
  // 跟踪页面访问
  Future<ApiResponse<bool>> trackPageView(PageViewRequest request);
  
  // 跟踪用户会话
  Future<ApiResponse<String>> trackUserSession(SessionRequest request);
}
```

### 数据分析接口
```dart
abstract class TouchPointAnalyticsService {
  // 获取用户行为分析
  Future<ApiResponse<UserBehaviorPattern>> getUserBehaviorAnalysis(BehaviorAnalysisRequest request);
  
  // 获取转化漏斗分析
  Future<ApiResponse<ConversionFunnelResult>> getConversionAnalysis(ConversionAnalysisRequest request);
  
  // 获取用户旅程分析
  Future<ApiResponse<UserJourneyResult>> getUserJourneyAnalysis(JourneyAnalysisRequest request);
  
  // 获取实时分析数据
  Future<ApiResponse<RealtimeAnalytics>> getRealtimeAnalytics();
}
```

### 数据管理接口
```dart
abstract class TouchPointDataService {
  // 查询触点数据
  Future<ApiResponse<List<TouchPointData>>> queryTouchPointData(DataQueryRequest request);
  
  // 导出触点数据
  Future<ApiResponse<String>> exportTouchPointData(ExportRequest request);
  
  // 删除用户数据
  Future<ApiResponse<bool>> deleteUserData(DeleteUserDataRequest request);
  
  // 获取数据统计
  Future<ApiResponse<DataStatistics>> getDataStatistics(StatisticsRequest request);
}
```

## 配置管理

### 触点跟踪配置
```dart
class TouchPointConfig {
  final bool enableTracking;
  final bool enableRealTimeAnalysis;
  final int batchUploadSize;
  final Duration uploadInterval;
  final List<EventType> trackedEventTypes;
  final Duration dataRetentionPeriod;
  final bool enableLocationTracking;
  final PrivacyLevel privacyLevel;
  
  static const TouchPointConfig defaultConfig = TouchPointConfig(
    enableTracking: true,
    enableRealTimeAnalysis: true,
    batchUploadSize: 100,
    uploadInterval: Duration(minutes: 5),
    trackedEventTypes: [
      EventType.click,
      EventType.view,
      EventType.search,
      EventType.purchase,
    ],
    dataRetentionPeriod: Duration(days: 90),
    enableLocationTracking: false,
    privacyLevel: PrivacyLevel.standard,
  );
}
```

### 分析配置
```dart
class AnalyticsConfig {
  final bool enableBehaviorAnalysis;
  final bool enablePathAnalysis;
  final bool enableConversionTracking;
  final Duration analysisInterval;
  final int maxPathLength;
  final List<String> conversionGoals;
  final Map<String, double> eventWeights;
  
  static const AnalyticsConfig defaultAnalyticsConfig = AnalyticsConfig(
    enableBehaviorAnalysis: true,
    enablePathAnalysis: true,
    enableConversionTracking: true,
    analysisInterval: Duration(hours: 1),
    maxPathLength: 50,
    conversionGoals: ['purchase', 'registration', 'subscription'],
    eventWeights: {
      'click': 1.0,
      'view': 0.5,
      'search': 1.5,
      'purchase': 5.0,
    },
  );
}
```

## 使用示例

### 基本事件跟踪
```dart
// 初始化触点服务
final touchPointService = TouchPointCollector.instance;
await touchPointService.initialize(TouchPointConfig.defaultConfig);

// 跟踪页面访问
await touchPointService.trackPageView(
  PageViewEvent(
    userId: 'user123',
    sessionId: 'session456',
    pageUrl: '/home',
    pageName: '首页',
    timestamp: DateTime.now(),
    properties: {
      'source': 'direct',
      'previous_page': '/login',
    },
  ),
);

// 跟踪用户行为
await touchPointService.trackEvent(
  TouchPointEvent(
    userId: 'user123',
    sessionId: 'session456',
    type: EventType.click,
    category: 'navigation',
    action: 'menu_click',
    target: 'vehicle_menu',
    properties: {
      'menu_position': 'top',
      'menu_index': 2,
    },
    timestamp: DateTime.now(),
    pageUrl: '/home',
  ),
);
```

### 用户路径跟踪
```dart
// 开始用户路径跟踪
final pathTracker = UserPathTracker.instance;
final sessionId = await pathTracker.startPathTracking('user123');

// 记录路径节点
await pathTracker.recordPathNode(
  sessionId,
  PathNode(
    id: 'node1',
    pageUrl: '/vehicle/list',
    pageName: '车辆列表',
    entryTime: DateTime.now(),
    pageData: {
      'filter': 'electric',
      'sort': 'price',
    },
  ),
);

// 记录页面内的事件
await pathTracker.recordPathNode(
  sessionId,
  PathNode(
    id: 'node2',
    pageUrl: '/vehicle/detail/123',
    pageName: '车辆详情',
    entryTime: DateTime.now(),
    events: [
      TouchPointEvent(
        type: EventType.view,
        action: 'image_view',
        target: 'vehicle_gallery',
      ),
    ],
  ),
);

// 结束路径跟踪
final userPath = await pathTracker.endPathTracking(sessionId);
print('用户路径总时长: ${userPath.totalDuration}');
```

### 用户行为分析
```dart
// 分析用户行为模式
final analyzer = TouchPointEventAnalyzer.instance;
final behaviorPattern = await analyzer.analyzeUserBehavior(
  'user123',
  TimeRange.lastMonth,
);

print('用户参与度评分: ${behaviorPattern.engagementScore}');
print('常访问页面: ${behaviorPattern.frequentPages}');
print('偏好功能: ${behaviorPattern.preferredFeatures}');

// 生成用户旅程
final userJourney = await analyzer.generateUserJourney('user123', 'session456');
print('旅程步骤数: ${userJourney.steps.length}');

// 计算转化率
final conversionFunnel = ConversionFunnel(
  name: '购车转化漏斗',
  steps: [
    FunnelStep(name: '浏览车辆', event: 'vehicle_view'),
    FunnelStep(name: '查看详情', event: 'vehicle_detail'),
    FunnelStep(name: '预约试驾', event: 'test_drive_booking'),
    FunnelStep(name: '下单购买', event: 'purchase'),
  ],
);

final conversionRate = await analyzer.calculateConversionRate(conversionFunnel);
print('总体转化率: ${conversionRate.overallConversionRate}%');
```

### 数据导出和管理
```dart
// 查询触点数据
final dataManager = TouchPointDataManager.instance;
final touchPointData = await dataManager.queryTouchPointData(
  DataQuery(
    userId: 'user123',
    timeRange: TimeRange.lastWeek,
    eventTypes: [EventType.click, EventType.view],
  ),
);

print('查询到 ${touchPointData.length} 条数据');

// 导出数据
final exportPath = await dataManager.exportData(
  ExportConfig(
    format: ExportFormat.csv,
    timeRange: TimeRange.lastMonth,
    includePersonalData: false,
  ),
);

print('数据已导出到: $exportPath');

// 清理过期数据
final cleanedCount = await dataManager.cleanupExpiredData(
  Duration(days: 90),
);

print('清理了 $cleanedCount 条过期数据');
```

## 测试策略

### 单元测试
```dart
group('TouchPointCollector Tests', () {
  test('should track event successfully', () async {
    // Given
    final collector = TouchPointCollector();
    final event = TouchPointEvent(
      userId: 'test_user',
      type: EventType.click,
      action: 'button_click',
    );
    
    // When
    await collector.trackEvent(event);
    
    // Then
    final storedEvents = await collector.getStoredEvents();
    expect(storedEvents, contains(event));
  });
  
  test('should analyze user behavior correctly', () async {
    // Given
    final analyzer = TouchPointEventAnalyzer();
    final userId = 'test_user';
    
    // When
    final pattern = await analyzer.analyzeUserBehavior(userId, TimeRange.lastWeek);
    
    // Then
    expect(pattern.userId, userId);
    expect(pattern.engagementScore, greaterThan(0));
  });
});
```

### 集成测试
```dart
group('TouchPoint Integration Tests', () {
  testWidgets('complete tracking flow', (tester) async {
    // 1. 初始化触点服务
    await TouchPointCollector.instance.initialize(TouchPointConfig.defaultConfig);
    
    // 2. 模拟用户操作
    await tester.tap(find.byKey(Key('vehicle_button')));
    await tester.pumpAndSettle();
    
    // 3. 验证事件被跟踪
    final trackedEvents = await TouchPointCollector.instance.getStoredEvents();
    expect(trackedEvents, isNotEmpty);
    
    // 4. 验证用户路径记录
    final userPaths = await UserPathTracker.instance.getUserPathHistory('test_user', 10);
    expect(userPaths, isNotEmpty);
  });
});
```

## 性能优化

### 数据收集优化
- **批量上传**：批量上传触点数据减少网络请求
- **数据压缩**：压缩数据减少存储空间和传输量
- **异步处理**：异步处理数据收集和上传
- **本地缓存**：本地缓存数据防止数据丢失

### 分析性能优化
- **增量分析**：只分析新增的数据
- **并行处理**：并行处理多个分析任务
- **结果缓存**：缓存分析结果避免重复计算
- **数据预聚合**：预聚合常用的分析指标

## 隐私和合规

### 数据隐私保护
- **数据匿名化**：敏感数据匿名化处理
- **用户同意管理**：用户数据收集同意管理
- **数据加密**：敏感数据加密存储和传输
- **访问控制**：严格的数据访问权限控制

### 合规要求
- **GDPR合规**：支持GDPR数据保护要求
- **数据删除权**：支持用户数据删除请求
- **数据导出权**：支持用户数据导出请求
- **透明度报告**：提供数据使用透明度报告

## 版本历史

### v0.3.2+8 (当前版本)
- 新增实时行为分析功能
- 优化数据收集性能
- 支持用户路径可视化
- 修复数据同步问题

### v0.3.1
- 支持转化漏斗分析
- 新增异常行为检测
- 优化数据存储结构
- 改进隐私保护机制

## 依赖关系

### 内部依赖
- `basic_storage`: 本地数据存储
- `basic_network`: 网络请求服务
- `basic_logger`: 日志记录服务
- `basic_utils`: 工具类库

### 外部依赖
- `sqflite`: 本地数据库
- `dio`: HTTP客户端
- `uuid`: 唯一标识符生成
- `path_provider`: 文件路径管理

## 总结

`oneapp_touch_point` 模块为 OneApp 提供了完整的用户触点管理和分析能力。通过全面的数据收集、智能的行为分析和详细的路径跟踪，该模块帮助产品团队深入了解用户行为，优化用户体验，提升产品价值。同时，模块严格遵循隐私保护原则，确保用户数据的安全和合规使用。
