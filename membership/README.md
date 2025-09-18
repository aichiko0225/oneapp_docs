# OneApp Membership - 会员系统模块文档

## 模块概述

`oneapp_membership` 是 OneApp 的会员系统核心模块，专注于积分系统和签到功能。该模块提供用户积分管理、签到中心、积分任务等功能，与社区、账户等模块深度集成。

### 基本信息
- **模块名称**: oneapp_membership
- **版本**: 0.0.1
- **类型**: Flutter Package
- **主要功能**: 积分系统、签到功能、积分任务管理

### 核心导出组件

```dart
library oneapp_membership;

// 积分页面
export 'src/app_modules/app_points/pages/user_points_page.dart';
// 签到中心页面
export 'src/app_modules/app_signin/pages/signIn_center_page.dart';
// 会员事件
export 'src/app_event/membership_event.dart';
```

## 目录结构

```
oneapp_membership/
├── lib/
│   ├── oneapp_membership.dart        # 主导出文件
│   ├── generated/                    # 生成的国际化文件
│   ├── l10n/                        # 国际化资源文件
│   └── src/                         # 源代码目录
│       ├── app_modules/             # 应用模块
│       │   ├── app_points/          # 积分模块
│       │   │   ├── pages/           # 积分页面
│       │   │   ├── blocs/           # 积分状态管理
│       │   │   ├── widges/          # 积分组件
│       │   │   ├── scene/           # 积分场景
│       │   │   └── beans/           # 积分数据模型
│       │   └── app_signin/          # 签到模块
│       │       └── pages/           # 签到页面
│       ├── app_net_service/         # 网络服务
│       └── app_event/               # 应用事件
├── assets/                          # 静态资源
├── test/                           # 测试文件
└── pubspec.yaml                    # 依赖配置
```

## 核心功能模块

### 1. 用户积分页面 (UserPointsPage)

基于真实项目代码的用户积分管理页面：

```dart
/// 用户积分页面
class UserPointsPage extends BaseStatefulWidget with RouteObjProvider {
  UserPointsPage({Key? key, required this.userId});

  final String userId;

  @override
  BaseStatefulWidgetState<UserPointsPage> getState() => _UserPointsPageState();
}

class _UserPointsPageState extends BaseStatefulWidgetState<UserPointsPage>
    with WidgetsBindingObserver {
  
  /// 是否需要添加推送积分
  bool needAddPushPoints = false;
  
  /// 是否使用通用导航栏
  bool useCommonNavigation = false;

  @override
  List<Widget> get rightActions => [
    PointsRuleWidge(
      lable: MemberShipIntlDelegate.current.pointsRule,
      onTap: () async {
        // 获取积分规则
        final rsp3 = await UserPointsTask.getRule(ruleKey: "integrationRule");
        if ((rsp3.data ?? '').isNotEmpty) {
          String jumpUrl = 'oneapp://component?routeKey=Key_Community_Postdetail&postId=${rsp3.data}&userName=';
          
          try {
            Uri uri = Uri.tryParse(jumpUrl)!;
            final routeKey = uri.queryParameters['routeKey'];
            final meta = RouteCenterAPI.routeMetaBy(routeKey!);
            NavigatorProxy().launchMeta(
              meta,
              meta.routePath,
              arguments: uri.queryParameters,
            );
          } catch (e) {
            // 处理跳转异常
          }
        } else {
          ToastHelper.showToast(msg: '获取文章失败');
        }
      }
    )
  ];

  @override
  String get titleText => MemberShipIntlDelegate.current.myPoints;

  @override
  double get elevation => 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    addNotifyPoints();
  }

  /// 添加通知积分
  Future<void> addNotifyPoints() async {
    bool haveNotifyPermission = await Permission.notification.isGranted;
    if (haveNotifyPermission) {
      PointsAddCenter().addPoints(PointsOpenPush());
    }
  }
}
```

### 2. 积分组件架构

实际项目包含的积分相关组件：

- **point_score_head_section.dart**: 积分头部区域组件
- **points_rule_widget.dart**: 积分规则组件  
- **points_task_cell.dart**: 积分任务单元格组件
- **PointsAddCenter**: 积分添加中心
- **points_open_push.dart**: 积分推送开启

### 3. 会员权益管理

#### 权益服务系统
```dart
// 会员权益服务
class MemberBenefitsService {
  final BenefitsRepository _repository;
  final MembershipService _membershipService;
  
  MemberBenefitsService(this._repository, this._membershipService);
  
  // 获取用户可用权益
  Future<Result<List<MemberBenefit>>> getUserBenefits(String userId) async {
    try {
      final membership = await _membershipService.getUserMembership(userId);
      return membership.fold(
        (failure) => Left(BenefitsFailure.membershipNotFound()),
        (membershipInfo) async {
          final benefits = await _repository.getBenefitsForTier(
            membershipInfo.tier,
          );
          return Right(benefits);
        },
      );
    } catch (e) {
      return Left(BenefitsFailure.loadFailed(e.toString()));
    }
  }
  
  // 使用权益
  Future<Result<BenefitUsage>> useBenefit({
    required String userId,
    required String benefitId,
    Map<String, dynamic>? context,
  }) async {
    try {
      // 检查权益可用性
      final benefit = await _repository.getBenefitById(benefitId);
      if (benefit == null) {
        return Left(BenefitsFailure.benefitNotFound());
      }
      
      // 检查使用条件
      final canUseResult = await _canUseBenefit(userId, benefit);
      if (canUseResult.isLeft()) {
        return Left(canUseResult.fold((l) => l, (r) => throw Exception()));
      }
      
      // 记录使用
      final usage = BenefitUsage(
        id: generateId(),
        userId: userId,
        benefitId: benefitId,
        usedAt: DateTime.now(),
        context: context,
      );
      
      await _repository.recordBenefitUsage(usage);
      
      // 执行权益逻辑
      await _executeBenefitLogic(benefit, usage);
      
      return Right(usage);
    } catch (e) {
      return Left(BenefitsFailure.usageFailed(e.toString()));
    }
  }
  
  // 获取权益使用历史
  Future<Result<List<BenefitUsage>>> getBenefitUsageHistory({
    required String userId,
    String? benefitId,
    DateRange? dateRange,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final usageHistory = await _repository.getBenefitUsageHistory(
        userId: userId,
        benefitId: benefitId,
        dateRange: dateRange,
        page: page,
        pageSize: pageSize,
      );
      return Right(usageHistory);
    } catch (e) {
      return Left(BenefitsFailure.historyLoadFailed(e.toString()));
    }
  }
}

// 会员权益模型
class MemberBenefit {
  final String id;
  final String name;
  final String description;
  final BenefitType type;
  final BenefitCategory category;
  final Map<String, dynamic> configuration;
  final UsageLimit usageLimit;
  final List<MembershipTier> eligibleTiers;
  final DateTime? validFrom;
  final DateTime? validUntil;
  final bool isActive;
  
  const MemberBenefit({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.category,
    required this.configuration,
    required this.usageLimit,
    required this.eligibleTiers,
    this.validFrom,
    this.validUntil,
    this.isActive = true,
  });
  
  // 免费充电权益
  factory MemberBenefit.freeCharging({int times = 1}) {
    return MemberBenefit(
      id: 'free_charging',
      name: '免费充电',
      description: '每月享受 $times 次免费充电服务',
      type: BenefitType.service,
      category: BenefitCategory.charging,
      configuration: {'free_times': times},
      usageLimit: UsageLimit.monthly(times),
      eligibleTiers: [
        MembershipTier.gold,
        MembershipTier.platinum,
        MembershipTier.diamond,
        MembershipTier.vip,
      ],
    );
  }
  
  // 优先客服权益
  factory MemberBenefit.prioritySupport() {
    return MemberBenefit(
      id: 'priority_support',
      name: '优先客服',
      description: '享受7x24小时优先客服支持',
      type: BenefitType.service,
      category: BenefitCategory.support,
      configuration: {'priority_level': 'high'},
      usageLimit: UsageLimit.unlimited(),
      eligibleTiers: [
        MembershipTier.gold,
        MembershipTier.platinum,
        MembershipTier.diamond,
        MembershipTier.vip,
      ],
    );
  }
}
```

### 4. 会员商城

#### 积分商城服务
```dart
// 积分商城服务
class MembershipStoreService {
  final StoreRepository _repository;
  final PointsService _pointsService;
  final OrderService _orderService;
  
  MembershipStoreService(
    this._repository,
    this._pointsService,
    this._orderService,
  );
  
  // 获取商品列表
  Future<Result<List<StoreItem>>> getStoreItems({
    StoreCategory? category,
    MembershipTier? minTier,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final items = await _repository.getStoreItems(
        category: category,
        minTier: minTier,
        page: page,
        pageSize: pageSize,
      );
      return Right(items);
    } catch (e) {
      return Left(StoreFailure.loadFailed(e.toString()));
    }
  }
  
  // 兑换商品
  Future<Result<StoreOrder>> redeemItem({
    required String userId,
    required String itemId,
    int quantity = 1,
    String? deliveryAddress,
  }) async {
    try {
      // 获取商品信息
      final item = await _repository.getStoreItemById(itemId);
      if (item == null) {
        return Left(StoreFailure.itemNotFound());
      }
      
      // 检查积分余额
      final totalCost = item.pointsPrice * quantity;
      final pointsResult = await _pointsService.getUserPoints(userId);
      
      return pointsResult.fold(
        (failure) => Left(StoreFailure.pointsCheckFailed()),
        (balance) async {
          if (balance.availablePoints < totalCost) {
            return Left(StoreFailure.insufficientPoints());
          }
          
          // 检查库存
          if (item.stock != null && item.stock! < quantity) {
            return Left(StoreFailure.insufficientStock());
          }
          
          // 创建订单
          final order = StoreOrder(
            id: generateId(),
            userId: userId,
            itemId: itemId,
            itemName: item.name,
            quantity: quantity,
            pointsPrice: item.pointsPrice,
            totalPoints: totalCost,
            deliveryAddress: deliveryAddress,
            status: StoreOrderStatus.pending,
            createdAt: DateTime.now(),
          );
          
          // 扣除积分
          await _pointsService.spendPoints(
            userId: userId,
            points: totalCost,
            reason: PointsSpendReason.storeRedemption,
            metadata: {'order_id': order.id, 'item_id': itemId},
          );
          
          // 保存订单
          await _repository.createStoreOrder(order);
          
          // 更新库存
          if (item.stock != null) {
            await _repository.updateItemStock(itemId, -quantity);
          }
          
          return Right(order);
        },
      );
    } catch (e) {
      return Left(StoreFailure.redeemFailed(e.toString()));
    }
  }
  
  // 获取兑换记录
  Future<Result<List<StoreOrder>>> getRedemptionHistory({
    required String userId,
    StoreOrderStatus? status,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final orders = await _repository.getStoreOrders(
        userId: userId,
        status: status,
        page: page,
        pageSize: pageSize,
      );
      return Right(orders);
    } catch (e) {
      return Left(StoreFailure.historyLoadFailed(e.toString()));
    }
  }
}

// 商城商品模型
class StoreItem {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final int pointsPrice;
  final StoreCategory category;
  final MembershipTier? requiredTier;
  final int? stock;
  final bool isVirtual;
  final Map<String, dynamic>? metadata;
  final DateTime? validUntil;
  final bool isActive;
  
  const StoreItem({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.pointsPrice,
    required this.category,
    this.requiredTier,
    this.stock,
    this.isVirtual = false,
    this.metadata,
    this.validUntil,
    this.isActive = true,
  });
  
  bool get isInStock => stock == null || stock! > 0;
  bool get isExpired => validUntil != null && validUntil!.isBefore(DateTime.now());
  bool get isAvailable => isActive && isInStock && !isExpired;
}
```

## 页面组件设计

### 会员主页
```dart
// 会员主页
class MembershipHomePage extends StatefulWidget {
  @override
  _MembershipHomePageState createState() => _MembershipHomePageState();
}

class _MembershipHomePageState extends State<MembershipHomePage> {
  late MembershipBloc _membershipBloc;
  late PointsBloc _pointsBloc;
  
  @override
  void initState() {
    super.initState();
    _membershipBloc = context.read<MembershipBloc>();
    _pointsBloc = context.read<PointsBloc>();
    
    _membershipBloc.add(LoadMembershipInfo());
    _pointsBloc.add(LoadPointsBalance());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(child: _buildMembershipCard()),
          SliverToBoxAdapter(child: _buildPointsSection()),
          SliverToBoxAdapter(child: _buildBenefitsSection()),
          SliverToBoxAdapter(child: _buildQuickActions()),
          SliverToBoxAdapter(child: _buildPromotions()),
        ],
      ),
    );
  }
  
  Widget _buildMembershipCard() {
    return BlocBuilder<MembershipBloc, MembershipState>(
      builder: (context, state) {
        if (state is MembershipLoaded) {
          return MembershipCard(
            membershipInfo: state.membershipInfo,
            onUpgrade: () => _navigateToUpgrade(),
          );
        }
        return MembershipCardSkeleton();
      },
    );
  }
  
  Widget _buildPointsSection() {
    return BlocBuilder<PointsBloc, PointsState>(
      builder: (context, state) {
        if (state is PointsLoaded) {
          return PointsOverviewCard(
            balance: state.balance,
            onViewHistory: () => _navigateToPointsHistory(),
            onEarnMore: () => _navigateToEarnPoints(),
          );
        }
        return PointsCardSkeleton();
      },
    );
  }
}
```

### 会员卡片组件
```dart
// 会员卡片组件
class MembershipCard extends StatelessWidget {
  final MembershipInfo membershipInfo;
  final VoidCallback? onUpgrade;
  
  const MembershipCard({
    Key? key,
    required this.membershipInfo,
    this.onUpgrade,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(16),
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: _getGradientForTier(membershipInfo.tier),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          SizedBox(height: 16),
          _buildProgress(),
          SizedBox(height: 16),
          _buildActions(),
        ],
      ),
    );
  }
  
  Widget _buildHeader() {
    return Row(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: Colors.white.withOpacity(0.2),
          child: Icon(
            _getIconForTier(membershipInfo.tier),
            color: Colors.white,
            size: 28,
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                membershipInfo.tierName,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                '会员编号: ${membershipInfo.memberNumber}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.8),
                ),
              ),
            ],
          ),
        ),
        if (membershipInfo.tier != MembershipTier.vip)
          TextButton(
            onPressed: onUpgrade,
            child: Text(
              '升级',
              style: TextStyle(color: Colors.white),
            ),
            style: TextButton.styleFrom(
              backgroundColor: Colors.white.withOpacity(0.2),
            ),
          ),
      ],
    );
  }
  
  Widget _buildProgress() {
    if (membershipInfo.tier == MembershipTier.vip) {
      return Container(); // VIP 不显示进度
    }
    
    final nextTier = _getNextTier(membershipInfo.tier);
    final currentPoints = membershipInfo.totalPoints;
    final requiredPoints = _getRequiredPointsForTier(nextTier);
    final progress = currentPoints / requiredPoints;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '距离${_getTierName(nextTier)}还需 ${requiredPoints - currentPoints} 积分',
          style: TextStyle(
            color: Colors.white.withOpacity(0.9),
            fontSize: 14,
          ),
        ),
        SizedBox(height: 8),
        LinearProgressIndicator(
          value: progress.clamp(0.0, 1.0),
          backgroundColor: Colors.white.withOpacity(0.3),
          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
        ),
      ],
    );
  }
}
```

## 状态管理

### 会员状态管理
```dart
// 会员状态 BLoC
class MembershipBloc extends Bloc<MembershipEvent, MembershipState> {
  final MembershipService _membershipService;
  final PointsService _pointsService;
  
  MembershipBloc(this._membershipService, this._pointsService) 
      : super(MembershipInitial()) {
    on<LoadMembershipInfo>(_onLoadMembershipInfo);
    on<UpgradeMembership>(_onUpgradeMembership);
    on<RefreshMembershipInfo>(_onRefreshMembershipInfo);
  }
  
  Future<void> _onLoadMembershipInfo(
    LoadMembershipInfo event,
    Emitter<MembershipState> emit,
  ) async {
    emit(MembershipLoading());
    
    final result = await _membershipService.getUserMembership(event.userId);
    result.fold(
      (failure) => emit(MembershipError(failure.message)),
      (membershipInfo) => emit(MembershipLoaded(membershipInfo)),
    );
  }
  
  Future<void> _onUpgradeMembership(
    UpgradeMembership event,
    Emitter<MembershipState> emit,
  ) async {
    emit(MembershipUpgrading());
    
    final result = await _membershipService.upgradeMembership(
      userId: event.userId,
      targetTier: event.targetTier,
      paymentMethod: event.paymentMethod,
    );
    
    result.fold(
      (failure) => emit(MembershipError(failure.message)),
      (_) {
        add(LoadMembershipInfo(event.userId));
        emit(MembershipUpgradeSuccess());
      },
    );
  }
}
```

## 与其他模块集成

### 社区集成
```dart
// 会员社区权益服务
class MembershipCommunityIntegration {
  final MembershipService _membershipService;
  final CommunityService _communityService;
  
  MembershipCommunityIntegration(
    this._membershipService,
    this._communityService,
  );
  
  // 检查发布权限
  Future<bool> canPublishPremiumContent(String userId) async {
    final membership = await _membershipService.getUserMembership(userId);
    return membership.fold(
      (_) => false,
      (info) => info.tier.index >= MembershipTier.gold.index,
    );
  }
  
  // 获取会员专属话题
  Future<List<Topic>> getMemberExclusiveTopics(String userId) async {
    final membership = await _membershipService.getUserMembership(userId);
    return membership.fold(
      (_) => [],
      (info) => _communityService.getTopicsForMemberTier(info.tier),
    );
  }
}
```

## 依赖管理

### 集成模块依赖
- **basic_utils**: 基础工具类
- **basic_uis**: 基础 UI 组件
- **oneapp_community**: 社区功能集成
- **oneapp_after_sales**: 售后服务集成
- **app_account**: 账户系统集成

### 第三方依赖
- **fluwx**: 微信支付集成（会员升级付费）

## 错误处理

### 会员系统异常
```dart
// 会员系统异常
abstract class MembershipFailure {
  const MembershipFailure();
  
  factory MembershipFailure.loadFailed(String message) = LoadFailure;
  factory MembershipFailure.upgradeFailed(String message) = UpgradeFailure;
  factory MembershipFailure.paymentFailed() = PaymentFailure;
  factory MembershipFailure.upgradeNotAllowed() = UpgradeNotAllowedFailure;
  factory MembershipFailure.insufficientPoints() = InsufficientPointsFailure;
}

// 积分系统异常
abstract class PointsFailure {
  const PointsFailure();
  
  factory PointsFailure.insufficientPoints() = InsufficientPointsFailure;
  factory PointsFailure.earnFailed(String message) = EarnFailure;
  factory PointsFailure.spendFailed(String message) = SpendFailure;
}
```

## 总结

`oneapp_membership` 模块为 OneApp 构建了完整的会员生态体系，通过等级管理、积分系统、权益服务和商城功能，提升了用户粘性和付费转化。模块与社区、账户、售后服务等模块深度集成，为用户提供了全方位的会员体验和价值认知。
