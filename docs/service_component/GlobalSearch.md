# GlobalSearch - 全局搜索模块

## 模块概述

`GlobalSearch` 是 OneApp 的全局搜索模块，提供了跨模块的统一搜索功能。该模块支持多种内容类型的搜索，包括智能搜索建议、搜索历史管理、搜索结果优化等功能，为用户提供高效、精准的搜索体验。

## 核心功能

### 1. 跨模块内容搜索
- **统一搜索入口**：提供全局统一的搜索接口
- **多模块索引**：聚合各模块的可搜索内容
- **内容分类**：按类型分类搜索结果
- **权限控制**：基于用户权限过滤搜索结果

### 2. 智能搜索建议
- **实时建议**：输入时实时提供搜索建议
- **热门搜索**：展示热门搜索关键词
- **个性化推荐**：基于用户行为的个性化建议
- **拼写纠错**：智能纠正搜索词拼写错误

### 3. 搜索历史管理
- **历史记录**：保存用户搜索历史
- **快速访问**：快速访问历史搜索结果
- **清理管理**：支持清理搜索历史
- **隐私保护**：敏感搜索历史加密存储

### 4. 搜索结果优化
- **相关性排序**：按相关性智能排序
- **结果聚合**：相似结果智能聚合
- **高亮显示**：关键词高亮显示
- **分页加载**：大量结果分页展示

## 技术架构

### 架构设计
```
┌─────────────────────────────────────┐
│            搜索界面层                │
│       (Search UI Components)        │
├─────────────────────────────────────┤
│         GlobalSearch 模块           │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 搜索引擎 │ 索引管理 │ 结果处理 │ │
│  ├──────────┼──────────┼──────────┤ │
│  │ 建议系统 │ 历史管理 │ 缓存层   │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           模块搜索接口              │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 车辆模块 │ 订单模块 │ 设置模块 │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│           数据存储层                │
│    (Local DB + Remote Index)        │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. 搜索引擎 (SearchEngine)
```dart
class GlobalSearchEngine {
  // 执行搜索
  Future<SearchResult> search(SearchQuery query);
  
  // 获取搜索建议
  Future<List<SearchSuggestion>> getSuggestions(String input);
  
  // 注册搜索提供者
  void registerSearchProvider(SearchProvider provider);
  
  // 构建搜索索引
  Future<void> buildSearchIndex();
}
```

#### 2. 索引管理器 (IndexManager)
```dart
class SearchIndexManager {
  // 更新索引
  Future<bool> updateIndex(String moduleId, List<SearchableItem> items);
  
  // 删除索引
  Future<bool> removeIndex(String moduleId, List<String> itemIds);
  
  // 重建索引
  Future<bool> rebuildIndex(String moduleId);
  
  // 搜索索引
  Future<List<IndexedItem>> searchIndex(String query, SearchOptions options);
}
```

#### 3. 搜索历史管理器 (SearchHistoryManager)
```dart
class SearchHistoryManager {
  // 添加搜索记录
  Future<void> addSearchRecord(SearchRecord record);
  
  // 获取搜索历史
  Future<List<SearchRecord>> getSearchHistory({int limit = 50});
  
  // 删除搜索记录
  Future<bool> deleteSearchRecord(String recordId);
  
  // 清空搜索历史
  Future<bool> clearSearchHistory();
}
```

#### 4. 搜索建议系统 (SuggestionSystem)
```dart
class SearchSuggestionSystem {
  // 生成搜索建议
  Future<List<SearchSuggestion>> generateSuggestions(String input);
  
  // 获取热门搜索
  Future<List<String>> getPopularSearches();
  
  // 获取个性化建议
  Future<List<SearchSuggestion>> getPersonalizedSuggestions(String userId);
  
  // 更新建议数据
  Future<void> updateSuggestionData();
}
```

## 数据模型

### 搜索查询模型
```dart
class SearchQuery {
  final String keyword;
  final List<String> categories;
  final SearchScope scope;
  final SortOption sortBy;
  final int page;
  final int pageSize;
  final Map<String, dynamic> filters;
  final bool includeHistory;
}

enum SearchScope {
  all,        // 全部内容
  vehicle,    // 车辆相关
  order,      // 订单相关
  service,    // 服务相关
  settings,   // 设置相关
  help        // 帮助文档
}

enum SortOption {
  relevance,  // 相关性
  time,       // 时间
  popularity, // 热度
  alphabetical // 字母顺序
}
```

### 搜索结果模型
```dart
class SearchResult {
  final String query;
  final int totalCount;
  final List<SearchResultItem> items;
  final List<SearchSuggestion> suggestions;
  final Duration searchTime;
  final Map<String, int> categoryCount;
  final bool hasMore;
}

class SearchResultItem {
  final String id;
  final String title;
  final String? subtitle;
  final String? description;
  final String category;
  final String moduleId;
  final String? imageUrl;
  final double relevanceScore;
  final DateTime? timestamp;
  final Map<String, dynamic> metadata;
  final List<HighlightRange> highlights;
}
```

### 搜索建议模型
```dart
class SearchSuggestion {
  final String text;
  final SuggestionType type;
  final String? category;
  final int frequency;
  final double relevance;
  final Map<String, dynamic>? metadata;
}

enum SuggestionType {
  keyword,     // 关键词建议
  history,     // 历史搜索
  popular,     // 热门搜索
  completion,  // 自动补全
  correction   // 拼写纠错
}
```

## API 接口

### 搜索接口
```dart
abstract class GlobalSearchService {
  // 执行全局搜索
  Future<ApiResponse<SearchResult>> search(SearchRequest request);
  
  // 获取搜索建议
  Future<ApiResponse<List<SearchSuggestion>>> getSuggestions(SuggestionRequest request);
  
  // 获取热门搜索
  Future<ApiResponse<List<String>>> getPopularSearches();
  
  // 获取搜索历史
  Future<ApiResponse<List<SearchRecord>>> getSearchHistory(HistoryRequest request);
}
```

### 索引管理接口
```dart
abstract class SearchIndexService {
  // 更新搜索索引
  Future<ApiResponse<bool>> updateSearchIndex(UpdateIndexRequest request);
  
  // 删除搜索索引
  Future<ApiResponse<bool>> deleteSearchIndex(DeleteIndexRequest request);
  
  // 获取索引状态
  Future<ApiResponse<IndexStatus>> getIndexStatus(String moduleId);
}
```

### 搜索提供者接口
```dart
abstract class SearchProvider {
  // 搜索提供者ID
  String get providerId;
  
  // 支持的搜索类别
  List<String> get supportedCategories;
  
  // 执行搜索
  Future<List<SearchResultItem>> search(SearchQuery query);
  
  // 获取可搜索项目
  Future<List<SearchableItem>> getSearchableItems();
  
  // 获取搜索建议
  Future<List<SearchSuggestion>> getSuggestions(String input);
}
```

## 配置管理

### 搜索配置
```dart
class GlobalSearchConfig {
  final int maxResults;
  final int suggestionLimit;
  final bool enableHistory;
  final bool enableSuggestions;
  final Duration cacheExpiry;
  final List<String> enabledModules;
  final Map<String, double> categoryWeights;
  
  static const GlobalSearchConfig defaultConfig = GlobalSearchConfig(
    maxResults: 100,
    suggestionLimit: 10,
    enableHistory: true,
    enableSuggestions: true,
    cacheExpiry: Duration(minutes: 30),
    enabledModules: ['vehicle', 'order', 'service', 'settings'],
    categoryWeights: {
      'vehicle': 1.0,
      'order': 0.8,
      'service': 0.9,
      'settings': 0.6,
    },
  );
}
```

### 索引配置
```dart
class SearchIndexConfig {
  final bool enableRealTimeIndex;
  final Duration indexUpdateInterval;
  final int maxIndexSize;
  final List<String> indexedFields;
  final Map<String, int> fieldWeights;
  
  static const SearchIndexConfig defaultIndexConfig = SearchIndexConfig(
    enableRealTimeIndex: true,
    indexUpdateInterval: Duration(minutes: 5),
    maxIndexSize: 10000,
    indexedFields: ['title', 'description', 'tags', 'content'],
    fieldWeights: {
      'title': 3,
      'description': 2,
      'tags': 2,
      'content': 1,
    },
  );
}
```

## 使用示例

### 基本搜索功能
```dart
// 初始化全局搜索
final globalSearch = GlobalSearchEngine.instance;
await globalSearch.initialize(GlobalSearchConfig.defaultConfig);

// 执行搜索
final searchQuery = SearchQuery(
  keyword: '充电',
  categories: ['vehicle', 'service'],
  scope: SearchScope.all,
  sortBy: SortOption.relevance,
  page: 1,
  pageSize: 20,
);

final searchResult = await globalSearch.search(searchQuery);

// 处理搜索结果
for (final item in searchResult.items) {
  print('${item.title}: ${item.description}');
  print('类别: ${item.category}, 相关性: ${item.relevanceScore}');
}
```

### 搜索建议功能
```dart
// 获取输入建议
final suggestions = await globalSearch.getSuggestions('充电');

// 显示建议列表
for (final suggestion in suggestions) {
  switch (suggestion.type) {
    case SuggestionType.completion:
      print('补全: ${suggestion.text}');
      break;
    case SuggestionType.history:
      print('历史: ${suggestion.text}');
      break;
    case SuggestionType.popular:
      print('热门: ${suggestion.text}');
      break;
  }
}

// 获取热门搜索
final popularSearches = await globalSearch.getPopularSearches();
print('热门搜索: ${popularSearches.join(', ')}');
```

### 搜索历史管理
```dart
// 添加搜索记录
final searchRecord = SearchRecord(
  query: '充电站',
  timestamp: DateTime.now(),
  resultCount: 25,
  category: 'vehicle',
);

await SearchHistoryManager.instance.addSearchRecord(searchRecord);

// 获取搜索历史
final history = await SearchHistoryManager.instance.getSearchHistory(limit: 10);

for (final record in history) {
  print('${record.query} - ${record.timestamp}');
}

// 清空搜索历史
await SearchHistoryManager.instance.clearSearchHistory();
```

### 注册搜索提供者
```dart
// 实现搜索提供者
class VehicleSearchProvider extends SearchProvider {
  @override
  String get providerId => 'vehicle_search';
  
  @override
  List<String> get supportedCategories => ['vehicle', 'charging', 'maintenance'];
  
  @override
  Future<List<SearchResultItem>> search(SearchQuery query) async {
    // 实现车辆相关内容搜索
    final vehicles = await vehicleService.searchVehicles(query.keyword);
    
    return vehicles.map((vehicle) => SearchResultItem(
      id: vehicle.id,
      title: vehicle.name,
      description: vehicle.description,
      category: 'vehicle',
      moduleId: 'app_car',
      relevanceScore: calculateRelevance(query.keyword, vehicle),
    )).toList();
  }
  
  @override
  Future<List<SearchSuggestion>> getSuggestions(String input) async {
    // 返回车辆相关搜索建议
    return vehicleService.getSearchSuggestions(input);
  }
}

// 注册搜索提供者
globalSearch.registerSearchProvider(VehicleSearchProvider());
```

## 测试策略

### 单元测试
```dart
group('GlobalSearch Tests', () {
  test('should return search results', () async {
    // Given
    final searchEngine = GlobalSearchEngine();
    final query = SearchQuery(keyword: 'test', scope: SearchScope.all);
    
    // When
    final result = await searchEngine.search(query);
    
    // Then
    expect(result.items, isNotEmpty);
    expect(result.query, 'test');
  });
  
  test('should provide search suggestions', () async {
    // Given
    final suggestionSystem = SearchSuggestionSystem();
    
    // When
    final suggestions = await suggestionSystem.generateSuggestions('cha');
    
    // Then
    expect(suggestions, isNotEmpty);
    expect(suggestions.first.text, contains('cha'));
  });
});
```

### 集成测试
```dart
group('Search Integration Tests', () {
  testWidgets('complete search flow', (tester) async {
    // 1. 输入搜索关键词
    await tester.enterText(find.byKey(Key('search_input')), '充电');
    
    // 2. 验证搜索建议显示
    expect(find.text('充电站'), findsOneWidget);
    expect(find.text('充电桩'), findsOneWidget);
    
    // 3. 执行搜索
    await tester.tap(find.byKey(Key('search_button')));
    await tester.pumpAndSettle();
    
    // 4. 验证搜索结果
    expect(find.byType(SearchResultItem), findsWidgets);
  });
});
```

## 性能优化

### 搜索性能优化
- **索引优化**：使用倒排索引提高搜索速度
- **缓存策略**：热门搜索结果缓存
- **分页加载**：大结果集分页加载
- **异步处理**：搜索操作异步处理

### 内存优化
- **结果限制**：限制搜索结果数量
- **懒加载**：搜索结果懒加载
- **对象池**：复用搜索对象
- **内存回收**：及时回收不用的搜索数据

## 算法和策略

### 相关性算法
```dart
class RelevanceCalculator {
  // 计算文本相关性
  double calculateTextRelevance(String query, String text);
  
  // 计算标题权重
  double calculateTitleWeight(String query, String title);
  
  // 计算类别权重
  double calculateCategoryWeight(String category);
  
  // 计算综合得分
  double calculateFinalScore(Map<String, double> scores);
}
```

### 搜索优化策略
- **查询扩展**：同义词和相关词扩展
- **模糊匹配**：支持模糊匹配搜索
- **权重调整**：动态调整搜索权重
- **个性化排序**：基于用户行为的个性化排序

## 版本历史

### v0.3.2+5 (当前版本)
- 新增语义搜索功能
- 优化搜索性能和准确性
- 支持多语言搜索
- 修复搜索结果排序问题

### v0.3.1
- 支持实时搜索建议
- 新增搜索历史管理
- 优化搜索索引结构
- 改进搜索结果展示

## 依赖关系

### 内部依赖
- `basic_storage`: 本地数据存储
- `basic_network`: 网络请求服务
- `basic_utils`: 工具类库
- `basic_logger`: 日志记录

### 外部依赖
- `sqflite`: 本地数据库
- `fuzzywuzzy`: 模糊匹配算法
- `rxdart`: 响应式编程
- `collection`: 集合工具

## 总结

`GlobalSearch` 模块为 OneApp 提供了强大的全局搜索能力，通过统一的搜索接口、智能的搜索建议、完善的历史管理和优化的搜索结果，为用户提供了高效、精准的搜索体验。该模块的设计充分考虑了可扩展性、性能优化和用户体验，能够很好地支撑应用的搜索需求。
