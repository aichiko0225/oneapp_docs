# Base MVVM - 基础MVVM架构模块文档

## 模块概述

`base_mvvm` 是 OneApp 基础工具模块群中的MVVM架构基础模块，提供了完整的Model-View-ViewModel架构模式实现。该模块封装了状态管理、数据绑定、Provider模式等核心功能，为应用提供了统一的架构规范和基础组件。

### 基本信息
- **模块名称**: base_mvvm
- **模块路径**: oneapp_basic_utils/base_mvvm  
- **类型**: Flutter Package Module
- **主要功能**: MVVM架构基础、状态管理、数据绑定

### 核心特性
- **状态管理**: 基于Provider的响应式状态管理
- **视图状态**: 统一的页面状态管理(idle/busy/empty/error)
- **列表刷新**: 封装下拉刷新和上拉加载更多
- **数据绑定**: 双向数据绑定支持
- **错误处理**: 统一的错误类型和处理机制
- **日志工具**: 集成日志记录功能

## 目录结构

```
base_mvvm/
├── lib/
│   ├── base_mvvm.dart              # 模块入口文件
│   ├── provider/                   # Provider相关
│   │   ├── provider_widget.dart    # Provider封装组件
│   │   ├── view_state_model.dart   # 视图状态模型
│   │   ├── view_state_list_model.dart        # 列表状态模型
│   │   ├── view_state_refresh_list_model.dart # 刷新列表模型
│   │   └── view_state.dart         # 状态枚举定义
│   ├── utils/                      # 工具类
│   │   ├── logs/                   # 日志工具
│   │   │   └── log_utils.dart
│   │   └── rxbus.dart              # 事件总线
│   └── widgets/                    # 基础组件
│       ├── glides/                 # 图片组件
│       │   └── glide_image_view.dart
│       └── refresh/                # 刷新组件
│           └── base_easy_refresh.dart
└── pubspec.yaml                    # 依赖配置
```

## 核心架构组件

### 1. 视图状态枚举 (ViewState)

定义了应用中通用的页面状态：

```dart
/// 页面状态类型
enum ViewState {
  idle,    // 空闲状态
  busy,    // 加载中
  empty,   // 无数据
  error,   // 加载失败
}

/// 错误类型
enum ViewStateErrorType {
  none,
  defaultError,
  networkTimeOutError,    // 网络超时
  disconnectException,    // 断网
  noNetworkSignal,       // 无网络信号
}
```

### 2. 基础视图状态模型 (ViewStateModel)

所有ViewModel的基础类，提供统一的状态管理：

```dart
class ViewStateModel with ChangeNotifier {
  /// 防止页面销毁后异步任务才完成导致报错
  bool _disposed = false;

  /// 当前页面状态，默认为idle
  ViewState _viewState = ViewState.idle;
  
  /// 错误类型
  ViewStateErrorType _viewStateError = ViewStateErrorType.none;

  /// 构造函数，可指定初始状态
  ViewStateModel({ViewState? viewState})
      : _viewState = viewState ?? ViewState.idle;

  // 状态获取器
  ViewState get viewState => _viewState;
  ViewStateErrorType get viewStateError => _viewStateError;

  // 状态判断方法
  bool get isBusy => viewState == ViewState.busy;
  bool get isIdle => viewState == ViewState.idle;
  bool get isEmpty => viewState == ViewState.empty;
  bool get isError => viewState == ViewState.error;

  // 状态设置方法
  void setIdle() => viewState = ViewState.idle;
  void setBusy() => viewState = ViewState.busy;
  void setEmpty() => viewState = ViewState.empty;

  @override
  void notifyListeners() {
    if (!_disposed) {
      super.notifyListeners();
    }
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
```

### 3. Provider封装组件 (ProviderWidget)

简化Provider使用的封装组件：

```dart
class ProviderWidget<T extends ChangeNotifier> extends StatefulWidget {
  final ValueWidgetBuilder<T> builder;
  final T model;
  final Widget? child;
  final Function(T model)? onModelReady;
  final bool autoDispose;

  const ProviderWidget({
    super.key,
    required this.builder,
    required this.model,
    this.child,
    this.onModelReady,
    this.autoDispose = true
  });

  @override
  _ProviderWidgetState<T> createState() => _ProviderWidgetState<T>();
}

class _ProviderWidgetState<T extends ChangeNotifier>
    extends State<ProviderWidget<T>> {
  late T model;

  @override
  void initState() {
    model = widget.model;
    widget.onModelReady?.call(model);
    super.initState();
  }

  @override
  void dispose() {
    if (widget.autoDispose) {
      model.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<T>.value(
      value: model,
      child: Consumer<T>(builder: widget.builder, child: widget.child)
    );
  }
}
```

### 4. 多Provider支持 (ProviderWidget2)

支持同时管理两个Model的组件：

```dart
class ProviderWidget2<A extends ChangeNotifier, B extends ChangeNotifier>
    extends StatefulWidget {
  final Widget Function(BuildContext context, A model1, B model2, Widget? child) builder;
  final A model1;
  final B model2;
  final Widget? child;
  final Function(A model1, B model2)? onModelReady;
  final bool autoDispose;

  // ... 实现与ProviderWidget类似，支持双Model管理
}
```

### 5. 刷新列表状态模型 (ViewStateRefreshListModel)

专门用于处理列表数据的刷新和加载更多功能：

```dart
abstract class ViewStateRefreshListModel<T> extends ViewStateListModel<T> {
  /// 分页配置
  static const int pageNumFirst = 1;
  static const int pageSize = 10;

  /// 列表刷新控制器
  final EasyRefreshController _refreshController;
  EasyRefreshController get refreshController => _refreshController;

  /// 当前页码
  int _currentPageNum = pageNumFirst;

  ViewStateRefreshListModel({super.viewState, bool isMore = true})
      : _refreshController = EasyRefreshController(
            controlFinishLoad: isMore, 
            controlFinishRefresh: true);

  /// 下拉刷新
  @override
  Future<List<T>> refresh({bool init = false}) async {
    try {
      _currentPageNum = pageNumFirst;
      var data = await loadData(pageNum: pageNumFirst);
      refreshController.finishRefresh();
      
      if (data.isEmpty) {
        refreshController.finishLoad(IndicatorResult.none);
        list.clear();
        setEmpty();
      } else {
        onCompleted(data);
        list.clear();
        list.addAll(data);
        
        // 小于分页数量时禁止上拉加载更多
        if (data.length < pageSize) {
          Future.delayed(const Duration(milliseconds: 100)).then((value) {
            refreshController.finishLoad(IndicatorResult.noMore);
          });
        }
        setIdle();
      }
      return data;
    } catch (e) {
      if (init) list.clear();
      refreshController.finishLoad(IndicatorResult.fail);
      setEmpty();
      return [];
    }
  }

  /// 上拉加载更多
  Future<List<T>> loadMore() async {
    try {
      var data = await loadData(pageNum: ++_currentPageNum);
      refreshController.finishRefresh();
      
      if (data.isEmpty) {
        _currentPageNum--;
        refreshController.finishLoad(IndicatorResult.noMore);
      } else {
        onCompleted(data);
        list.addAll(data);
        
        if (data.length < pageSize) {
          refreshController.finishLoad(IndicatorResult.noMore);
        } else {
          refreshController.finishLoad();
        }
        notifyListeners();
      }
      return data;
    } catch (e) {
      _currentPageNum--;
      refreshController.finishLoad(IndicatorResult.fail);
      return [];
    }
  }

  /// 抽象方法：加载数据
  @override
  Future<List<T>> loadData({int? pageNum});

  @override
  void dispose() {
    _refreshController.dispose();
    super.dispose();
  }
}
```

## 使用指南

### 1. 基础ViewModel示例

创建一个继承ViewStateModel的ViewModel：

```dart
class UserProfileViewModel extends ViewStateModel {
  UserInfo? _userInfo;
  UserInfo? get userInfo => _userInfo;

  Future<void> loadUserProfile(String userId) async {
    setBusy(); // 设置加载状态
    
    try {
      _userInfo = await userRepository.getUserProfile(userId);
      setIdle(); // 设置空闲状态
    } catch (e) {
      setError(); // 设置错误状态
    }
  }
}
```

### 2. 在UI中使用ProviderWidget

```dart
class UserProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ProviderWidget<UserProfileViewModel>(
      model: UserProfileViewModel(),
      onModelReady: (model) => model.loadUserProfile("123"),
      builder: (context, model, child) {
        if (model.isBusy) {
          return Center(child: CircularProgressIndicator());
        }
        
        if (model.isEmpty) {
          return Center(child: Text('暂无数据'));
        }
        
        if (model.isError) {
          return Center(child: Text('加载失败'));
        }
        
        return Column(
          children: [
            Text(model.userInfo?.name ?? ''),
            Text(model.userInfo?.email ?? ''),
          ],
        );
      },
    );
  }
}
```

### 3. 列表刷新示例

```dart
class NewsListViewModel extends ViewStateRefreshListModel<NewsItem> {
  final NewsRepository _repository = NewsRepository();

  @override
  Future<List<NewsItem>> loadData({int? pageNum}) async {
    return await _repository.getNewsList(
      page: pageNum ?? 1,
      pageSize: ViewStateRefreshListModel.pageSize,
    );
  }
}

// UI使用
class NewsListPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ProviderWidget<NewsListViewModel>(
      model: NewsListViewModel(),
      onModelReady: (model) => model.refresh(init: true),
      builder: (context, model, child) {
        return EasyRefresh(
          controller: model.refreshController,
          onRefresh: () => model.refresh(),
          onLoad: () => model.loadMore(),
          child: ListView.builder(
            itemCount: model.list.length,
            itemBuilder: (context, index) {
              final item = model.list[index];
              return ListTile(
                title: Text(item.title),
                subtitle: Text(item.summary),
              );
            },
          ),
        );
      },
    );
  }
}
```

### 4. 双Model管理示例

```dart
class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ProviderWidget2<UserViewModel, NotificationViewModel>(
      model1: UserViewModel(),
      model2: NotificationViewModel(),
      onModelReady: (userModel, notificationModel) {
        userModel.loadUserInfo();
        notificationModel.loadNotifications();
      },
      builder: (context, userModel, notificationModel, child) {
        return Scaffold(
          body: Column(
            children: [
              // 用户信息区域
              if (userModel.isBusy)
                CircularProgressIndicator()
              else
                UserInfoWidget(user: userModel.currentUser),
              
              // 通知区域
              if (notificationModel.isBusy)
                CircularProgressIndicator()
              else
                NotificationListWidget(notifications: notificationModel.notifications),
            ],
          ),
        );
      },
    );
  }
}
```

## 依赖配置

### pubspec.yaml 关键依赖

```yaml
dependencies:
  flutter:
    sdk: flutter
    
  # 状态管理
  provider: ^6.0.0
  
  # 列表刷新
  easy_refresh: ^3.0.0
  
  # 日志记录
  # (自定义日志工具类)

dev_dependencies:
  flutter_test:
    sdk: flutter
```

## 最佳实践

### 1. ViewModel设计原则
- 继承ViewStateModel获得基础状态管理能力
- 将业务逻辑封装在ViewModel中，保持View的简洁
- 合理使用状态枚举，提供良好的用户体验反馈
- 及时释放资源，避免内存泄漏

### 2. 错误处理策略
- 使用ViewStateErrorType枚举区分不同错误类型
- 在UI层根据错误类型提供相应的用户提示
- 网络错误提供重试机制

### 3. 列表优化建议
- 使用ViewStateRefreshListModel处理列表数据
- 合理设置分页大小，平衡性能和用户体验
- 实现适当的缓存策略减少不必要的网络请求

### 4. 内存管理
- ProviderWidget默认开启autoDispose，自动管理Model生命周期
- 在Model的dispose方法中清理定时器、流订阅等资源
- 避免在已销毁的Model上调用notifyListeners

## 扩展开发

### 1. 自定义状态类型
可以扩展ViewState枚举添加业务特定的状态：

```dart
enum CustomViewState {
  idle,
  busy,
  empty,
  error,
  networkError,    // 自定义网络错误状态
  authRequired,    // 自定义需要认证状态
}
```

### 2. 自定义刷新组件
基于base_mvvm的基础组件，可以创建适合特定业务场景的刷新组件。

### 3. 状态持久化
结合SharedPreferences等持久化方案，实现ViewState的持久化存储。

## 问题排查

### 常见问题
1. **Model未正确释放**: 检查ProviderWidget的autoDispose设置
2. **状态更新无效**: 确认notifyListeners调用时机
3. **列表刷新异常**: 检查EasyRefreshController的状态管理

### 调试技巧
- 使用LogUtils记录关键状态变更
- 通过ViewState枚举值判断当前页面状态
- 利用Flutter Inspector查看Provider状态
