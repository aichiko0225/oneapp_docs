# ShareToFriends - 分享功能模块

## 模块概述

`ShareToFriends` 是 OneApp 的分享功能模块，提供了完整的社交分享解决方案。该模块支持多种社交平台分享、自定义分享内容、分享统计分析和权限控制等功能，为用户提供便捷的内容分享体验。

## 核心功能

### 1. 社交平台分享
- **多平台支持**：支持微信、QQ、微博、抖音等主流平台
- **原生集成**：深度集成各平台原生分享能力
- **格式适配**：自动适配各平台的内容格式要求
- **状态跟踪**：跟踪分享状态和结果反馈

### 2. 自定义分享内容
- **内容模板**：提供丰富的分享内容模板
- **动态生成**：根据分享内容动态生成分享素材
- **多媒体支持**：支持文字、图片、视频、链接分享
- **品牌定制**：支持品牌元素的自定义添加

### 3. 分享统计分析
- **分享数据统计**：统计分享次数、平台分布等数据
- **用户行为分析**：分析用户分享行为和偏好
- **转化率跟踪**：跟踪分享带来的转化效果
- **热点内容识别**：识别热门分享内容

### 4. 分享权限控制
- **内容权限**：控制可分享的内容范围
- **用户权限**：基于用户角色的分享权限
- **平台限制**：特定平台的分享限制
- **敏感内容过滤**：过滤敏感或不当内容

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            应用界面层                │
│         (Share UI Components)       │
├─────────────────────────────────────┤
│         ShareToFriends              │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 分享管理 │ 内容生成 │ 平台适配 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 统计分析 │ 权限控制 │ 缓存管理 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           平台SDK层                 │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 微信SDK  │ QQ SDK   │ 微博SDK  │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           系统分享接口              │
│       (System Share APIs)           │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 分享管理器 (ShareManager)
```dart
class ShareManager {
  // 执行分享
  Future<ShareResult> share(ShareRequest request);
  
  // 获取可用的分享平台
  Future<List<SharePlatform>> getAvailablePlatforms();
  
  // 检查平台可用性
  Future<bool> isPlatformAvailable(SharePlatformType platform);
  
  // 注册分享平台
  void registerPlatform(SharePlatform platform);
}
```

#### 2. 内容生成器 (ContentGenerator)
```dart
class ShareContentGenerator {
  // 生成分享内容
  Future<ShareContent> generateContent(ContentTemplate template, Map<String, dynamic> data);
  
  // 创建分享图片
  Future<File> createShareImage(ShareImageConfig config);
  
  // 生成分享链接
  Future<String> generateShareLink(ShareLinkConfig config);
  
  // 格式化分享文本
  String formatShareText(String template, Map<String, String> variables);
}
```

#### 3. 平台适配器 (PlatformAdapter)
```dart
class SharePlatformAdapter {
  // 适配分享内容
  ShareContent adaptContent(ShareContent content, SharePlatformType platform);
  
  // 验证内容格式
  ValidationResult validateContent(ShareContent content, SharePlatformType platform);
  
  // 获取平台限制
  PlatformLimitations getPlatformLimitations(SharePlatformType platform);
  
  // 转换内容格式
  ShareContent convertContentFormat(ShareContent content, ContentFormat targetFormat);
}
```

#### 4. 统计分析器 (ShareAnalytics)
```dart
class ShareAnalytics {
  // 记录分享事件
  Future<void> recordShareEvent(ShareEvent event);
  
  // 获取分享统计
  Future<ShareStatistics> getShareStatistics(StatisticsQuery query);
  
  // 分析用户分享行为
  Future<UserShareBehavior> analyzeUserBehavior(String userId);
  
  // 获取热门分享内容
  Future<List<PopularContent>> getPopularContent(TimeRange timeRange);
}
```

## 数据模型

### 分享请求模型
```dart
class ShareRequest {
  final String id;
  final ShareContent content;
  final SharePlatformType platform;
  final ShareOptions options;
  final String? userId;
  final Map<String, dynamic> metadata;
  final DateTime timestamp;
}

class ShareContent {
  final String? title;
  final String? description;
  final String? text;
  final List<String> images;
  final String? video;
  final String? url;
  final String? thumbnailUrl;
  final ContentType type;
  final Map<String, dynamic> extras;
}

enum ContentType {
  text,         // 纯文本
  image,        // 图片
  video,        // 视频
  link,         // 链接
  miniProgram,  // 小程序
  music,        // 音乐
  file          // 文件
}
```

### 分享平台模型
```dart
enum SharePlatformType {
  wechat,           // 微信好友
  wechatMoments,    // 微信朋友圈
  qq,               // QQ好友
  qzone,            // QQ空间
  weibo,            // 新浪微博
  douyin,           // 抖音
  system,           // 系统分享
  copy,             // 复制链接
  email,            // 邮件
  sms               // 短信
}

class SharePlatform {
  final SharePlatformType type;
  final String name;
  final String packageName;
  final String iconUrl;
  final bool isInstalled;
  final bool isEnabled;
  final PlatformLimitations limitations;
  final Map<String, dynamic> config;
}
```

### 分享结果模型
```dart
class ShareResult {
  final bool isSuccess;
  final SharePlatformType platform;
  final String? shareId;
  final String? errorMessage;
  final int? errorCode;
  final DateTime timestamp;
  final Map<String, dynamic> extraData;
}

class ShareStatistics {
  final int totalShares;
  final Map<SharePlatformType, int> platformDistribution;
  final Map<ContentType, int> contentTypeDistribution;
  final List<ShareTrend> trends;
  final double averageSharesPerUser;
  final List<TopSharedContent> topContent;
}
```

## API 接口

### 分享接口
```dart
abstract class ShareService {
  // 执行分享
  Future<ApiResponse<ShareResult>> executeShare(ShareRequest request);
  
  // 获取分享平台列表
  Future<ApiResponse<List<SharePlatform>>> getSharePlatforms();
  
  // 预览分享内容
  Future<ApiResponse<SharePreview>> previewShare(PreviewRequest request);
  
  // 获取分享历史
  Future<ApiResponse<List<ShareRecord>>> getShareHistory(HistoryQuery query);
}
```

### 内容生成接口
```dart
abstract class ShareContentService {
  // 生成分享内容
  Future<ApiResponse<ShareContent>> generateShareContent(ContentGenerationRequest request);
  
  // 创建分享海报
  Future<ApiResponse<String>> createSharePoster(PosterCreationRequest request);
  
  // 获取内容模板
  Future<ApiResponse<List<ContentTemplate>>> getContentTemplates(String category);
}
```

### 统计分析接口
```dart
abstract class ShareAnalyticsService {
  // 获取分享统计数据
  Future<ApiResponse<ShareStatistics>> getShareStatistics(StatisticsRequest request);
  
  // 获取用户分享行为
  Future<ApiResponse<UserShareBehavior>> getUserShareBehavior(String userId);
  
  // 获取热门分享内容
  Future<ApiResponse<List<PopularContent>>> getPopularContent(PopularContentRequest request);
}
```

## 配置管理

### 分享配置
```dart
class ShareConfig {
  final List<SharePlatformType> enabledPlatforms;
  final bool enableAnalytics;
  final bool enableContentGeneration;
  final int maxImageSize;
  final Duration shareTimeout;
  final Map<SharePlatformType, PlatformConfig> platformConfigs;
  
  static const ShareConfig defaultConfig = ShareConfig(
    enabledPlatforms: [
      SharePlatformType.wechat,
      SharePlatformType.wechatMoments,
      SharePlatformType.qq,
      SharePlatformType.qzone,
      SharePlatformType.weibo,
      SharePlatformType.system,
    ],
    enableAnalytics: true,
    enableContentGeneration: true,
    maxImageSize: 1024 * 1024 * 2, // 2MB
    shareTimeout: Duration(seconds: 30),
    platformConfigs: {},
  );
}
```

### 内容配置
```dart
class ContentConfig {
  final String appName;
  final String appDescription;
  final String defaultShareUrl;
  final String logoUrl;
  final Map<String, String> shareTemplates;
  final List<String> sensitiveWords;
  
  static const ContentConfig defaultContentConfig = ContentConfig(
    appName: 'OneApp',
    appDescription: '智能车联网应用',
    defaultShareUrl: 'https://oneapp.com',
    logoUrl: 'https://oneapp.com/logo.png',
    shareTemplates: {
      'vehicle': '我在OneApp发现了一款不错的车辆：{vehicleName}',
      'charging': '在OneApp找到了便宜的充电站，分享给你：{stationName}',
    },
    sensitiveWords: ['敏感词1', '敏感词2'],
  );
}
```

## 使用示例

### 基本分享功能
```dart
// 分享文本内容
final shareRequest = ShareRequest(
  id: 'share_text_${DateTime.now().millisecondsSinceEpoch}',
  content: ShareContent(
    text: '我在使用OneApp，感觉很不错！',
    url: 'https://oneapp.com',
    type: ContentType.text,
  ),
  platform: SharePlatformType.wechat,
  options: ShareOptions(
    enableAnalytics: true,
    autoGenerateImage: false,
  ),
);

final result = await ShareManager.instance.share(shareRequest);

if (result.isSuccess) {
  print('分享成功');
} else {
  print('分享失败: ${result.errorMessage}');
}
```

### 分享图片内容
```dart
// 分享车辆信息
final vehicleInfo = {
  'name': 'Model Y',
  'brand': 'Tesla',
  'price': '30万',
  'image': 'https://example.com/vehicle.jpg',
};

// 生成分享内容
final shareContent = await ShareContentGenerator.instance.generateContent(
  ContentTemplate.vehicle,
  vehicleInfo,
);

// 创建分享海报
final posterPath = await ShareContentGenerator.instance.createShareImage(
  ShareImageConfig(
    template: 'vehicle_poster',
    data: vehicleInfo,
    size: Size(750, 1334),
  ),
);

// 执行分享
final shareResult = await ShareManager.instance.share(
  ShareRequest(
    id: 'share_vehicle',
    content: ShareContent(
      title: vehicleInfo['name'],
      description: '${vehicleInfo['brand']} ${vehicleInfo['name']} - ${vehicleInfo['price']}',
      images: [posterPath],
      url: 'https://oneapp.com/vehicle/${vehicleInfo['id']}',
      type: ContentType.image,
    ),
    platform: SharePlatformType.wechatMoments,
  ),
);
```

### 多平台分享
```dart
// 获取可用的分享平台
final availablePlatforms = await ShareManager.instance.getAvailablePlatforms();

// 显示分享面板
showSharePanel(
  context: context,
  platforms: availablePlatforms,
  content: shareContent,
  onPlatformSelected: (platform) async {
    final result = await ShareManager.instance.share(
      ShareRequest(
        content: shareContent,
        platform: platform.type,
      ),
    );
    
    if (result.isSuccess) {
      showSuccessToast('分享成功');
    } else {
      showErrorToast('分享失败: ${result.errorMessage}');
    }
  },
);
```

### 分享统计分析
```dart
// 获取分享统计数据
final statistics = await ShareAnalytics.instance.getShareStatistics(
  StatisticsQuery(
    timeRange: TimeRange.lastMonth,
    groupBy: GroupBy.platform,
  ),
);

print('总分享次数: ${statistics.totalShares}');
print('平台分布:');
statistics.platformDistribution.forEach((platform, count) {
  print('  ${platform.name}: $count次');
});

// 获取热门分享内容
final popularContent = await ShareAnalytics.instance.getPopularContent(
  TimeRange.lastWeek,
);

print('热门分享内容:');
for (final content in popularContent) {
  print('  ${content.title}: ${content.shareCount}次分享');
}
```

### 自定义分享内容
```dart
// 注册自定义内容模板
ShareContentGenerator.instance.registerTemplate(
  'custom_vehicle',
  ContentTemplate(
    id: 'custom_vehicle',
    name: '自定义车辆分享',
    textTemplate: '我在OneApp发现了{brand} {model}，{feature}，推荐给你！',
    imageTemplate: 'custom_vehicle_poster.png',
    variables: ['brand', 'model', 'feature', 'price'],
  ),
);

// 使用自定义模板生成内容
final customContent = await ShareContentGenerator.instance.generateContent(
  'custom_vehicle',
  {
    'brand': 'BMW',
    'model': 'iX3',
    'feature': '续航500公里',
    'price': '40万',
  },
);
```

## 测试策略

### 单元测试
```dart
group('ShareManager Tests', () {
  test('should share content successfully', () async {
    // Given
    final shareManager = ShareManager();
    final shareRequest = ShareRequest(
      content: ShareContent(text: 'Test share'),
      platform: SharePlatformType.system,
    );
    
    // When
    final result = await shareManager.share(shareRequest);
    
    // Then
    expect(result.isSuccess, true);
    expect(result.platform, SharePlatformType.system);
  });
  
  test('should generate share content from template', () async {
    // Given
    final generator = ShareContentGenerator();
    final template = ContentTemplate.vehicle;
    final data = {'name': 'Model 3', 'brand': 'Tesla'};
    
    // When
    final content = await generator.generateContent(template, data);
    
    // Then
    expect(content.title, contains('Model 3'));
    expect(content.description, contains('Tesla'));
  });
});
```

### 集成测试
```dart
group('Share Integration Tests', () {
  testWidgets('share flow', (tester) async {
    // 1. 点击分享按钮
    await tester.tap(find.byKey(Key('share_button')));
    await tester.pumpAndSettle();
    
    // 2. 验证分享面板显示
    expect(find.byType(SharePanel), findsOneWidget);
    
    // 3. 选择分享平台
    await tester.tap(find.byKey(Key('platform_wechat')));
    await tester.pumpAndSettle();
    
    // 4. 验证分享执行
    verify(mockShareManager.share(any)).called(1);
  });
});
```

## 性能优化

### 内容生成优化
- **模板缓存**：缓存常用的内容模板
- **图片压缩**：自动压缩分享图片
- **异步处理**：异步生成分享内容
- **批量处理**：批量处理多个分享请求

### 平台集成优化
- **懒加载SDK**：按需加载平台SDK
- **连接池**：复用网络连接
- **缓存检查**：缓存平台可用性检查结果
- **超时控制**：合理的超时时间设置

## 版本历史

### v0.2.5+3 (当前版本)
- 新增抖音分享支持
- 优化分享内容生成性能
- 支持自定义分享模板
- 修复微信分享回调问题

### v0.2.4
- 支持视频内容分享
- 新增分享统计分析
- 优化分享面板UI
- 改进错误处理机制

## 依赖关系

### 内部依赖
- `basic_utils`: 工具类库
- `basic_storage`: 本地存储
- `basic_network`: 网络请求
- `basic_logger`: 日志记录

### 外部依赖
- `fluwx`: 微信分享SDK
- `share_plus`: 系统分享
- `image`: 图片处理
- `path_provider`: 文件路径

## 总结

`ShareToFriends` 模块为 OneApp 提供了完整的社交分享解决方案。通过多平台支持、自定义内容生成、统计分析和权限控制等功能，该模块让用户能够便捷地分享应用内容到各大社交平台，同时为运营团队提供了有价值的分享数据分析，有助于提升用户参与度和应用传播效果。
