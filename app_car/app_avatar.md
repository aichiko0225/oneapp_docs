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
│   ├── generated/                # 代码生成文件
│   ├── l10n/                     # 国际化文件
│   └── src/                      # 源代码目录
│       ├── avatar/               # 虚拟形象核心功能
│       ├── common_import.dart    # 通用导入
│       └── route_export.dart     # 路由导出
├── assets/                       # 静态资源
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 语音克隆服务集成

#### 语音克隆功能
```dart
// 语音克隆服务封装
class VoiceCloneService {
  final CLRVoiceClone _voiceCloneService;
  final PaymentService _paymentService;
  final ConsentService _consentService;
  
  VoiceCloneService(
    this._voiceCloneService,
    this._paymentService,
    this._consentService,
  );
  
  // 开始语音克隆流程
  Future<Result<VoiceCloneSession>> startVoiceClone({
    required String userId,
    required VoiceClonePackage package,
  }) async {
    try {
      // 1. 检查用户同意
      final consentResult = await _checkUserConsent(userId);
      if (consentResult.isLeft()) {
        return Left(AvatarFailure.consentRequired());
      }
      
      // 2. 验证支付
      final paymentResult = await _processPayment(package);
      if (paymentResult.isLeft()) {
        return Left(AvatarFailure.paymentFailed());
      }
      
      // 3. 创建语音克隆会话
      final session = await _voiceCloneService.createSession(
        userId: userId,
        packageId: package.id,
        paymentId: paymentResult.getOrElse(() => ''),
      );
      
      return Right(session);
    } catch (e) {
      return Left(AvatarFailure.sessionCreationFailed(e.toString()));
    }
  }
  
  // 上传语音样本
  Future<Result<VoiceSampleUploadResult>> uploadVoiceSample({
    required String sessionId,
    required String audioFilePath,
    required String sampleText,
  }) async {
    try {
      // 压缩音频文件
      final compressedAudio = await _compressAudioFile(audioFilePath);
      
      // 上传到语音克隆服务
      final uploadResult = await _voiceCloneService.uploadSample(
        sessionId: sessionId,
        audioData: compressedAudio,
        transcription: sampleText,
      );
      
      return Right(uploadResult);
    } catch (e) {
      return Left(AvatarFailure.uploadFailed(e.toString()));
    }
  }
  
  // 开始训练语音模型
  Future<Result<VoiceTrainingJob>> startVoiceTraining(
    String sessionId,
  ) async {
    try {
      final trainingJob = await _voiceCloneService.startTraining(sessionId);
      return Right(trainingJob);
    } catch (e) {
      return Left(AvatarFailure.trainingFailed(e.toString()));
    }
  }
  
  // 获取训练进度
  Future<Result<VoiceTrainingProgress>> getTrainingProgress(
    String jobId,
  ) async {
    try {
      final progress = await _voiceCloneService.getTrainingProgress(jobId);
      return Right(progress);
    } catch (e) {
      return Left(AvatarFailure.progressQueryFailed(e.toString()));
    }
  }
}
```

### 2. 虚拟形象管理

#### 形象配置和定制
```dart
// 虚拟形象配置管理
class AvatarConfigurationManager {
  final SharedPreferences _prefs;
  final AvatarRenderingService _renderingService;
  
  AvatarConfigurationManager(this._prefs, this._renderingService);
  
  // 获取用户的虚拟形象配置
  Future<Result<AvatarConfiguration>> getUserAvatarConfig(
    String userId,
  ) async {
    try {
      final configJson = _prefs.getString('avatar_config_$userId');
      if (configJson != null) {
        final config = AvatarConfiguration.fromJson(
          jsonDecode(configJson),
        );
        return Right(config);
      } else {
        // 返回默认配置
        return Right(AvatarConfiguration.defaultConfig());
      }
    } catch (e) {
      return Left(AvatarFailure.configLoadFailed(e.toString()));
    }
  }
  
  // 保存虚拟形象配置
  Future<Result<void>> saveAvatarConfig({
    required String userId,
    required AvatarConfiguration config,
  }) async {
    try {
      final configJson = jsonEncode(config.toJson());
      await _prefs.setString('avatar_config_$userId', configJson);
      
      // 通知渲染服务更新配置
      await _renderingService.updateConfiguration(config);
      
      return Right(unit);
    } catch (e) {
      return Left(AvatarFailure.configSaveFailed(e.toString()));
    }
  }
  
  // 更新形象外观
  Future<Result<void>> updateAvatarAppearance({
    required String userId,
    required AvatarAppearance appearance,
  }) async {
    try {
      final config = await getUserAvatarConfig(userId);
      return config.fold(
        (failure) => Left(failure),
        (currentConfig) async {
          final updatedConfig = currentConfig.copyWith(
            appearance: appearance,
          );
          return await saveAvatarConfig(
            userId: userId,
            config: updatedConfig,
          );
        },
      );
    } catch (e) {
      return Left(AvatarFailure.appearanceUpdateFailed(e.toString()));
    }
  }
}

// 虚拟形象配置模型
class AvatarConfiguration {
  final String id;
  final String userId;
  final AvatarAppearance appearance;
  final VoiceSettings voiceSettings;
  final BehaviorSettings behaviorSettings;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const AvatarConfiguration({
    required this.id,
    required this.userId,
    required this.appearance,
    required this.voiceSettings,
    required this.behaviorSettings,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory AvatarConfiguration.defaultConfig() {
    return AvatarConfiguration(
      id: 'default',
      userId: '',
      appearance: AvatarAppearance.defaultAppearance(),
      voiceSettings: VoiceSettings.defaultSettings(),
      behaviorSettings: BehaviorSettings.defaultSettings(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }
  
  AvatarConfiguration copyWith({
    AvatarAppearance? appearance,
    VoiceSettings? voiceSettings,
    BehaviorSettings? behaviorSettings,
  }) {
    return AvatarConfiguration(
      id: id,
      userId: userId,
      appearance: appearance ?? this.appearance,
      voiceSettings: voiceSettings ?? this.voiceSettings,
      behaviorSettings: behaviorSettings ?? this.behaviorSettings,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
```

### 3. 支付集成

#### 虚拟形象服务支付
```dart
// 虚拟形象支付服务
class AvatarPaymentService {
  final PaymentService _paymentService;
  final OrderService _orderService;
  
  AvatarPaymentService(this._paymentService, this._orderService);
  
  // 获取虚拟形象服务套餐
  Future<Result<List<AvatarServicePackage>>> getServicePackages() async {
    try {
      final packages = await _paymentService.getAvatarPackages();
      return Right(packages);
    } catch (e) {
      return Left(AvatarFailure.packagesLoadFailed(e.toString()));
    }
  }
  
  // 购买虚拟形象服��
  Future<Result<PaymentResult>> purchaseAvatarService({
    required String userId,
    required AvatarServicePackage package,
    required PaymentMethod paymentMethod,
  }) async {
    try {
      // 1. 创建订单
      final order = await _orderService.createAvatarOrder(
        userId: userId,
        packageId: package.id,
        amount: package.price,
      );
      
      if (order.isLeft()) {
        return Left(AvatarFailure.orderCreationFailed());
      }
      
      // 2. 处理支付
      final paymentResult = await _paymentService.processPayment(
        orderId: order.getOrElse(() => throw Exception()).id,
        amount: package.price,
        paymentMethod: paymentMethod,
        description: '虚拟形象服务 - ${package.name}',
      );
      
      if (paymentResult.isSuccess) {
        // 3. 激活服务
        await _activateAvatarService(
          userId: userId,
          packageId: package.id,
          orderId: order.getOrElse(() => throw Exception()).id,
        );
      }
      
      return Right(paymentResult);
    } catch (e) {
      return Left(AvatarFailure.purchaseFailed(e.toString()));
    }
  }
  
  // 激活虚拟形象服务
  Future<void> _activateAvatarService({
    required String userId,
    required String packageId,
    required String orderId,
  }) async {
    // 更新用户虚拟形象权限
    await _updateUserAvatarPermissions(userId, packageId);
    
    // 记录服务激活
    await _recordServiceActivation(userId, packageId, orderId);
  }
}

// 虚拟形象服务套餐模型
class AvatarServicePackage {
  final String id;
  final String name;
  final String description;
  final double price;
  final Currency currency;
  final Duration validityPeriod;
  final List<AvatarFeature> includedFeatures;
  final PackageType type;
  
  const AvatarServicePackage({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.currency,
    required this.validityPeriod,
    required this.includedFeatures,
    required this.type,
  });
  
  bool get includesVoiceClone => includedFeatures
      .contains(AvatarFeature.voiceClone);
  
  bool get includesCustomAppearance => includedFeatures
      .contains(AvatarFeature.customAppearance);
  
  bool get includesAdvancedBehavior => includedFeatures
      .contains(AvatarFeature.advancedBehavior);
}
```

### 4. 用户同意管理

#### 隐私和权限同意
```dart
// 虚拟形象同意管理
class AvatarConsentManager {
  final ConsentService _consentService;
  final BasicConsentService _basicConsentService;
  
  AvatarConsentManager(this._consentService, this._basicConsentService);
  
  // 检查虚拟形象服务同意状态
  Future<Result<ConsentStatus>> checkAvatarConsent(String userId) async {
    try {
      final consentItems = [
        ConsentItem.voiceDataCollection,
        ConsentItem.voiceCloning,
        ConsentItem.avatarDataProcessing,
        ConsentItem.personalizedService,
      ];
      
      final consentResults = await Future.wait(
        consentItems.map((item) => _consentService.checkConsent(
          userId: userId,
          consentType: item.type,
        )),
      );
      
      final allConsented = consentResults.every((result) => 
          result.fold((_) => false, (status) => status.isConsented));
      
      return Right(ConsentStatus(
        isFullyConsented: allConsented,
        consentItems: consentItems,
        consentResults: consentResults,
      ));
    } catch (e) {
      return Left(AvatarFailure.consentCheckFailed(e.toString()));
    }
  }
  
  // 请求虚拟形象服务同意
  Future<Result<ConsentResult>> requestAvatarConsent({
    required String userId,
    required List<ConsentItem> requiredConsents,
  }) async {
    try {
      final consentResult = await _consentService.requestConsent(
        userId: userId,
        consentItems: requiredConsents,
        purpose: ConsentPurpose.avatarService,
      );
      
      return Right(consentResult);
    } catch (e) {
      return Left(AvatarFailure.consentRequestFailed(e.toString()));
    }
  }
  
  // 撤销虚拟形象同意
  Future<Result<void>> revokeAvatarConsent({
    required String userId,
    required ConsentType consentType,
  }) async {
    try {
      await _consentService.revokeConsent(
        userId: userId,
        consentType: consentType,
      );
      
      // 根据撤销的同意类型，禁用相关功能
      await _disableRelatedFeatures(userId, consentType);
      
      return Right(unit);
    } catch (e) {
      return Left(AvatarFailure.consentRevokeFailed(e.toString()));
    }
  }
}

// 同意项定义
enum ConsentItem {
  voiceDataCollection,
  voiceCloning,
  avatarDataProcessing,
  personalizedService;
  
  String get displayName {
    switch (this) {
      case ConsentItem.voiceDataCollection:
        return '语音数据收集';
      case ConsentItem.voiceCloning:
        return '语音克隆服务';
      case ConsentItem.avatarDataProcessing:
        return '虚拟形象数据处理';
      case ConsentItem.personalizedService:
        return '个性化服务';
    }
  }
  
  String get description {
    switch (this) {
      case ConsentItem.voiceDataCollection:
        return '收集您的语音样本用于创建个性化虚拟��象';
      case ConsentItem.voiceCloning:
        return '使用AI技术克隆您的声音特征';
      case ConsentItem.avatarDataProcessing:
        return '处理虚拟形象相关的个人数据';
      case ConsentItem.personalizedService:
        return '基于您的偏好提供个性化虚拟助手服务';
    }
  }
}
```

## 状态管理 (BLoC)

### 虚拟形象状态管理
```dart
// 虚拟形象状态管理
class AvatarBloc extends Bloc<AvatarEvent, AvatarState> {
  final AvatarConfigurationManager _configManager;
  final VoiceCloneService _voiceCloneService;
  final AvatarPaymentService _paymentService;
  
  AvatarBloc(
    this._configManager,
    this._voiceCloneService,
    this._paymentService,
  ) : super(AvatarInitial()) {
    on<LoadAvatarConfig>(_onLoadAvatarConfig);
    on<UpdateAvatarAppearance>(_onUpdateAvatarAppearance);
    on<StartVoiceClone>(_onStartVoiceClone);
    on<PurchaseAvatarService>(_onPurchaseAvatarService);
  }
  
  Future<void> _onLoadAvatarConfig(
    LoadAvatarConfig event,
    Emitter<AvatarState> emit,
  ) async {
    emit(AvatarLoading());
    
    final result = await _configManager.getUserAvatarConfig(event.userId);
    result.fold(
      (failure) => emit(AvatarError(failure.message)),
      (config) => emit(AvatarConfigLoaded(config)),
    );
  }
  
  Future<void> _onStartVoiceClone(
    StartVoiceClone event,
    Emitter<AvatarState> emit,
  ) async {
    emit(VoiceCloneStarting());
    
    final result = await _voiceCloneService.startVoiceClone(
      userId: event.userId,
      package: event.package,
    );
    
    result.fold(
      (failure) => emit(AvatarError(failure.message)),
      (session) => emit(VoiceCloneSessionCreated(session)),
    );
  }
}

// 语音克隆训练状态管理
class VoiceTrainingBloc extends Bloc<VoiceTrainingEvent, VoiceTrainingState> {
  final VoiceCloneService _voiceCloneService;
  Timer? _progressTimer;
  
  VoiceTrainingBloc(this._voiceCloneService) : super(VoiceTrainingInitial()) {
    on<StartVoiceTraining>(_onStartVoiceTraining);
    on<CheckTrainingProgress>(_onCheckTrainingProgress);
    on<CancelVoiceTraining>(_onCancelVoiceTraining);
  }
  
  Future<void> _onStartVoiceTraining(
    StartVoiceTraining event,
    Emitter<VoiceTrainingState> emit,
  ) async {
    emit(VoiceTrainingInProgress(
      progress: TrainingProgress.initial(),
    ));
    
    final result = await _voiceCloneService.startVoiceTraining(event.sessionId);
    
    result.fold(
      (failure) => emit(VoiceTrainingError(failure.message)),
      (job) {
        emit(VoiceTrainingInProgress(
          progress: TrainingProgress.started(job.id),
        ));
        _startProgressMonitoring(job.id);
      },
    );
  }
  
  void _startProgressMonitoring(String jobId) {
    _progressTimer = Timer.periodic(
      Duration(seconds: 10),
      (_) => add(CheckTrainingProgress(jobId)),
    );
  }
}
```

## 数据模型

### 虚拟形象外观模型
```dart
// 虚拟形象外观配置
class AvatarAppearance {
  final FaceConfiguration face;
  final HairConfiguration hair;
  final EyeConfiguration eyes;
  final ClothingConfiguration clothing;
  final AccessoryConfiguration accessories;
  
  const AvatarAppearance({
    required this.face,
    required this.hair,
    required this.eyes,
    required this.clothing,
    required this.accessories,
  });
  
  factory AvatarAppearance.defaultAppearance() {
    return AvatarAppearance(
      face: FaceConfiguration.defaultFace(),
      hair: HairConfiguration.defaultHair(),
      eyes: EyeConfiguration.defaultEyes(),
      clothing: ClothingConfiguration.defaultClothing(),
      accessories: AccessoryConfiguration.defaultAccessories(),
    );
  }
}

// 语音设置模型
class VoiceSettings {
  final String? customVoiceId; // 自定义语音ID
  final VoiceType voiceType;
  final double pitch; // 音调 (0.5 - 2.0)
  final double speed; // 语速 (0.5 - 2.0)
  final double volume; // 音量 (0.0 - 1.0)
  final String language;
  final String accent;
  
  const VoiceSettings({
    this.customVoiceId,
    required this.voiceType,
    required this.pitch,
    required this.speed,
    required this.volume,
    required this.language,
    required this.accent,
  });
  
  factory VoiceSettings.defaultSettings() {
    return VoiceSettings(
      voiceType: VoiceType.standard,
      pitch: 1.0,
      speed: 1.0,
      volume: 0.8,
      language: 'zh-CN',
      accent: 'standard',
    );
  }
  
  bool get hasCustomVoice => customVoiceId != null;
}

// 行为设置模型
class BehaviorSettings {
  final PersonalityType personality;
  final ResponseStyle responseStyle;
  final List<BehaviorTrait> traits;
  final EmotionSettings emotionSettings;
  final InteractionPreferences interactionPreferences;
  
  const BehaviorSettings({
    required this.personality,
    required this.responseStyle,
    required this.traits,
    required this.emotionSettings,
    required this.interactionPreferences,
  });
  
  factory BehaviorSettings.defaultSettings() {
    return BehaviorSettings(
      personality: PersonalityType.friendly,
      responseStyle: ResponseStyle.conversational,
      traits: [BehaviorTrait.helpful, BehaviorTrait.patient],
      emotionSettings: EmotionSettings.balanced(),
      interactionPreferences: InteractionPreferences.defaultPreferences(),
    );
  }
}
```

### 语音克隆相关模型
```dart
// 语音克隆会话
class VoiceCloneSession {
  final String id;
  final String userId;
  final String packageId;
  final VoiceCloneStatus status;
  final List<VoiceSample> samples;
  final DateTime createdAt;
  final DateTime? completedAt;
  final String? voiceModelId;
  
  const VoiceCloneSession({
    required this.id,
    required this.userId,
    required this.packageId,
    required this.status,
    required this.samples,
    required this.createdAt,
    this.completedAt,
    this.voiceModelId,
  });
  
  int get requiredSamplesCount => 10; // 需要的语音样本数量
  int get uploadedSamplesCount => samples.length;
  bool get hasEnoughSamples => uploadedSamplesCount >= requiredSamplesCount;
  double get completionPercentage => uploadedSamplesCount / requiredSamplesCount;
}

// 语音样本
class VoiceSample {
  final String id;
  final String sessionId;
  final String audioUrl;
  final String transcription;
  final Duration duration;
  final SampleQuality quality;
  final DateTime uploadedAt;
  
  const VoiceSample({
    required this.id,
    required this.sessionId,
    required this.audioUrl,
    required this.transcription,
    required this.duration,
    required this.quality,
    required this.uploadedAt,
  });
  
  bool get isGoodQuality => quality == SampleQuality.high || 
                          quality == SampleQuality.excellent;
}

// 训练进度
class TrainingProgress {
  final String jobId;
  final TrainingStage currentStage;
  final double progressPercentage;
  final Duration estimatedTimeRemaining;
  final String? statusMessage;
  final DateTime lastUpdated;
  
  const TrainingProgress({
    required this.jobId,
    required this.currentStage,
    required this.progressPercentage,
    required this.estimatedTimeRemaining,
    this.statusMessage,
    required this.lastUpdated,
  });
  
  factory TrainingProgress.initial() {
    return TrainingProgress(
      jobId: '',
      currentStage: TrainingStage.initializing,
      progressPercentage: 0.0,
      estimatedTimeRemaining: Duration(hours: 2),
      lastUpdated: DateTime.now(),
    );
  }
  
  bool get isCompleted => progressPercentage >= 1.0;
  bool get isFailed => currentStage == TrainingStage.failed;
}
```

## UI 组件

### 虚拟形象配置界面
```dart
// 虚拟形象配置页面
class AvatarConfigurationPage extends StatefulWidget {
  final String userId;
  
  const AvatarConfigurationPage({required this.userId});
  
  @override
  _AvatarConfigurationPageState createState() => _AvatarConfigurationPageState();
}

class _AvatarConfigurationPageState extends State<AvatarConfigurationPage>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late AvatarBloc _avatarBloc;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _avatarBloc = context.read<AvatarBloc>();
    _avatarBloc.add(LoadAvatarConfig(widget.userId));
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('虚拟形象设置'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: '外观'),
            Tab(text: '声音'),
            Tab(text: '性格'),
          ],
        ),
      ),
      body: BlocBuilder<AvatarBloc, AvatarState>(
        builder: (context, state) {
          if (state is AvatarConfigLoaded) {
            return TabBarView(
              controller: _tabController,
              children: [
                _buildAppearanceTab(state.config),
                _buildVoiceTab(state.config),
                _buildBehaviorTab(state.config),
              ],
            );
          } else if (state is AvatarError) {
            return _buildErrorState(state.message);
          } else {
            return _buildLoadingState();
          }
        },
      ),
    );
  }
  
  Widget _buildAppearanceTab(AvatarConfiguration config) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAvatarPreview(config.appearance),
          SizedBox(height: 24),
          _buildFaceCustomization(config.appearance.face),
          SizedBox(height: 16),
          _buildHairCustomization(config.appearance.hair),
          SizedBox(height: 16),
          _buildClothingCustomization(config.appearance.clothing),
        ],
      ),
    );
  }
  
  Widget _buildVoiceTab(AvatarConfiguration config) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildVoiceTypeSelection(config.voiceSettings),
          SizedBox(height: 16),
          if (config.voiceSettings.hasCustomVoice) 
            _buildCustomVoiceControls(config.voiceSettings),
          _buildVoicePreviewPlayer(config.voiceSettings),
          SizedBox(height: 16),
          _buildVoiceParameterSliders(config.voiceSettings),
          SizedBox(height: 24),
          _buildVoiceCloneSection(),
        ],
      ),
    );
  }
}
```

### 语音克隆界面
```dart
// 语音克隆训练页面
class VoiceCloneTrainingPage extends StatefulWidget {
  final VoiceCloneSession session;
  
  const VoiceCloneTrainingPage({required this.session});
  
  @override
  _VoiceCloneTrainingPageState createState() => _VoiceCloneTrainingPageState();
}

class _VoiceCloneTrainingPageState extends State<VoiceCloneTrainingPage> {
  late VoiceTrainingBloc _trainingBloc;
  
  @override
  void initState() {
    super.initState();
    _trainingBloc = context.read<VoiceTrainingBloc>();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('语音克隆训练')),
      body: BlocBuilder<VoiceTrainingBloc, VoiceTrainingState>(
        builder: (context, state) {
          if (state is VoiceTrainingInProgress) {
            return _buildTrainingProgress(state.progress);
          } else if (state is VoiceTrainingCompleted) {
            return _buildTrainingCompleted(state.result);
          } else if (state is VoiceTrainingError) {
            return _buildTrainingError(state.message);
          } else {
            return _buildTrainingInitial();
          }
        },
      ),
    );
  }
  
  Widget _buildTrainingProgress(TrainingProgress progress) {
    return Padding(
      padding: EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '正在训练您的专属语音',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 32),
          CircularProgressIndicator(
            value: progress.progressPercentage,
            strokeWidth: 8,
            backgroundColor: Colors.grey[300],
          ),
          SizedBox(height: 16),
          Text(
            '${(progress.progressPercentage * 100).toInt()}% 完成',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          SizedBox(height: 8),
          Text(
            '预计剩余时间: ${progress.estimatedTimeRemaining.inMinutes} 分钟',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          SizedBox(height: 16),
          if (progress.statusMessage != null)
            Text(
              progress.statusMessage!,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
        ],
      ),
    );
  }
}
```

## 工具类

### 音频处理工具
```dart
// 音频文件处理工具
class AudioProcessingUtils {
  // 压缩音频文件
  static Future<Uint8List> compressAudioFile(String filePath) async {
    try {
      final file = File(filePath);
      final originalBytes = await file.readAsBytes();
      
      // 使用 flutter_image_compress 进行音频压缩
      // 注意：这里需要适配音频压缩，实际实现可能需要专门的音频处理库
      final compressedBytes = await FlutterImageCompress.compressWithList(
        originalBytes,
        quality: 70, // 压缩质量
      );
      
      return compressedBytes;
    } catch (e) {
      throw AudioProcessingException('音频压缩失败: $e');
    }
  }
  
  // 验证音频文件格式
  static bool isValidAudioFormat(String filePath) {
    final extension = path.extension(filePath).toLowerCase();
    const supportedFormats = ['.mp3', '.wav', '.m4a', '.aac'];
    return supportedFormats.contains(extension);
  }
  
  // 获取音频文件时长
  static Future<Duration> getAudioDuration(String filePath) async {
    // 这里需要使用音频处理库来获取时长
    // 示例实现
    try {
      // 使用适当的音频库获取时长
      return Duration(seconds: 30); // 示例返回值
    } catch (e) {
      throw AudioProcessingException('无法获取音频时长: $e');
    }
  }
  
  // 检查音频质量
  static Future<SampleQuality> analyzeAudioQuality(String filePath) async {
    try {
      // 分析音频质量指标
      final duration = await getAudioDuration(filePath);
      final fileSize = await File(filePath).length();
      
      // 基于时长和文件大小的简单质量评估
      if (duration.inSeconds < 5) {
        return SampleQuality.poor;
      } else if (duration.inSeconds > 30) {
        return SampleQuality.poor;
      } else if (fileSize < 50 * 1024) { // 小于50KB
        return SampleQuality.low;
      } else {
        return SampleQuality.high;
      }
    } catch (e) {
      return SampleQuality.unknown;
    }
  }
}
```

## 依赖管理

### 核心依赖
- **clr_voiceclone**: 语音克隆服务 SDK
- **ui_payment**: 支付界面组件
- **clr_order**: 订单服务 SDK
- **clr_payment**: 支付服务 SDK

### 同意管理
- **app_consent**: 应用同意管理
- **basic_consent**: 基础同意服务

### 框架依赖
- **basic_modular**: 模块化框架
- **basic_intl**: 国际化支持
- **bloc**: 状态管理

### 工具依赖
- **shared_preferences**: 本地存储
- **fluttertoast**: Toast 提示
- **flutter_image_compress**: 图像/音频压缩

## 错误处理

### 虚拟形象特定异常
```dart
// 虚拟形象功能异常
abstract class AvatarFailure {
  const AvatarFailure();
  
  factory AvatarFailure.consentRequired() = ConsentRequiredFailure;
  factory AvatarFailure.paymentFailed() = PaymentFailedFailure;
  factory AvatarFailure.sessionCreationFailed(String message) = SessionCreationFailure;
  factory AvatarFailure.uploadFailed(String message) = UploadFailure;
  factory AvatarFailure.trainingFailed(String message) = TrainingFailure;
  factory AvatarFailure.configLoadFailed(String message) = ConfigLoadFailure;
}

class ConsentRequiredFailure extends AvatarFailure {
  const ConsentRequiredFailure();
  
  String get message => '使用虚拟形象服务需要您的同意';
}

class PaymentFailedFailure extends AvatarFailure {
  const PaymentFailedFailure();
  
  String get message => '支付失败，请检查支付方式';
}

class AudioProcessingException implements Exception {
  final String message;
  const AudioProcessingException(this.message);
}
```

## 总结

`app_avatar` 模块为 OneApp 提供了完整的虚拟形象服务，包括语音克隆、外观定制、行为设置等功能。模块严格遵循隐私保护原则，通过完善的同意管理确保用户数据安全。集成的支付服务支持虚拟形象服务的商业化运营，为用户提供个性化的车载助手体验。
