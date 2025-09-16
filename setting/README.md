# OneApp Setting - 应用设置模块文档

## 模块概述

`app_setting` 是 OneApp 的应用设置管理模块，提供用户偏好设置、系统配置、通知管理、隐私设置等功能。该模块采用模块化设计，支持动态配置更新和多语言切换，为用户提供个性化的应用体验。

### 基本信息
- **模块名称**: app_setting
- **版本**: 0.2.26
- **仓库**: https://gitlab-rd0.maezia.com/dssomobile/oneapp/dssomobile-oneapp-app-setting
- **Flutter 版本**: >=2.10.5
- **Dart 版本**: >=2.16.2 <4.0.0

## 目录结构

```
app_setting/
├── lib/
│   ├── app_setting.dart          # 主导出文件
│   ├── route_dp.dart             # 路由配置
│   ├── route_export.dart         # 路由导出
│   ├── generated/                # 代码生成文件
│   ├── l10n/                     # 国际化文件
│   └── src/                      # 源代码目录
│       ├── pages/                # 设置页面
│       ├── widgets/              # 设置组件
│       ├── models/               # 数据模型
│       ├── services/             # 服务层
│       └── constants/            # 常量定义
├── assets/                       # 静态资源
├── set_notification_uml.puml     # 通知设置 UML 图
├── set_notification_uml.svg      # 通知设置 UML 图
├── pubspec.yaml                  # 依赖配置
└── README.md                     # 项目说明
```

## 核心功能模块

### 1. 用户偏好设置

#### 个人信息设置
```dart
// 个人信息设置服务
class ProfileSettingsService {
  final SettingRepository _settingRepository;
  final StorageService _storageService;
  
  ProfileSettingsService(this._settingRepository, this._storageService);
  
  // 获取用户个人信息设置
  Future<Result<UserProfileSettings>> getUserProfileSettings() async {
    try {
      final settings = await _settingRepository.getUserProfileSettings();
      return Right(settings);
    } catch (e) {
      return Left(SettingFailure.loadFailed(e.toString()));
    }
  }
  
  // 更新用户头像
  Future<Result<void>> updateUserAvatar(String avatarUrl) async {
    try {
      await _settingRepository.updateUserAvatar(avatarUrl);
      await _storageService.setString('user_avatar', avatarUrl);
      return Right(unit);
    } catch (e) {
      return Left(SettingFailure.updateFailed(e.toString()));
    }
  }
  
  // 更新用户昵称
  Future<Result<void>> updateUserNickname(String nickname) async {
    try {
      await _settingRepository.updateUserNickname(nickname);
      await _storageService.setString('user_nickname', nickname);
      return Right(unit);
    } catch (e) {
      return Left(SettingFailure.updateFailed(e.toString()));
    }
  }
}
```

#### 应用偏好设置
```dart
// 应用偏好设置模型
class AppPreferenceSettings {
  final String language;
  final String theme;
  final bool enableDarkMode;
  final bool enableAutoStart;
  final bool enableBackgroundRefresh;
  final double fontSize;
  final bool enableHapticFeedback;
  final bool enableSoundEffects;
  
  const AppPreferenceSettings({
    required this.language,
    required this.theme,
    required this.enableDarkMode,
    required this.enableAutoStart,
    required this.enableBackgroundRefresh,
    required this.fontSize,
    required this.enableHapticFeedback,
    required this.enableSoundEffects,
  });
  
  factory AppPreferenceSettings.fromJson(Map<String, dynamic> json) {
    return AppPreferenceSettings(
      language: json['language'] ?? 'zh-CN',
      theme: json['theme'] ?? 'system',
      enableDarkMode: json['enable_dark_mode'] ?? false,
      enableAutoStart: json['enable_auto_start'] ?? true,
      enableBackgroundRefresh: json['enable_background_refresh'] ?? true,
      fontSize: (json['font_size'] ?? 16.0).toDouble(),
      enableHapticFeedback: json['enable_haptic_feedback'] ?? true,
      enableSoundEffects: json['enable_sound_effects'] ?? true,
    );
  }
}

// 应用偏好设置服务
class AppPreferenceService {
  final StorageService _storageService;
  
  AppPreferenceService(this._storageService);
  
  // 获取应用偏好设置
  Future<AppPreferenceSettings> getAppPreferences() async {
    final json = await _storageService.getObject('app_preferences') ?? {};
    return AppPreferenceSettings.fromJson(json);
  }
  
  // 保存应用偏好设置
  Future<void> saveAppPreferences(AppPreferenceSettings settings) async {
    await _storageService.setObject('app_preferences', settings.toJson());
    
    // 通知其他模块设置变更
    _notifySettingsChanged(settings);
  }
  
  // 更新语言设置
  Future<void> updateLanguage(String language) async {
    final settings = await getAppPreferences();
    final updatedSettings = settings.copyWith(language: language);
    await saveAppPreferences(updatedSettings);
  }
  
  // 更新主题设置
  Future<void> updateTheme(String theme, bool enableDarkMode) async {
    final settings = await getAppPreferences();
    final updatedSettings = settings.copyWith(
      theme: theme,
      enableDarkMode: enableDarkMode,
    );
    await saveAppPreferences(updatedSettings);
  }
}
```

### 2. 通知设置管理

#### 通知偏好配置
```dart
// 通知设置模型
class NotificationSettings {
  final bool enablePushNotification;
  final bool enableSoundNotification;
  final bool enableVibrationNotification;
  final bool enableLEDNotification;
  final NotificationTime quietHours;
  final Map<NotificationType, bool> typeSettings;
  
  const NotificationSettings({
    required this.enablePushNotification,
    required this.enableSoundNotification,
    required this.enableVibrationNotification,
    required this.enableLEDNotification,
    required this.quietHours,
    required this.typeSettings,
  });
  
  factory NotificationSettings.defaultSettings() {
    return NotificationSettings(
      enablePushNotification: true,
      enableSoundNotification: true,
      enableVibrationNotification: true,
      enableLEDNotification: false,
      quietHours: NotificationTime.defaultQuietHours(),
      typeSettings: {
        NotificationType.system: true,
        NotificationType.charging: true,
        NotificationType.maintenance: true,
        NotificationType.security: true,
        NotificationType.social: false,
        NotificationType.marketing: false,
      },
    );
  }
}

// 通知设置服务
class NotificationSettingsService {
  final SettingRepository _settingRepository;
  final PushNotificationService _pushService;
  
  NotificationSettingsService(this._settingRepository, this._pushService);
  
  // 获取通知设置
  Future<Result<NotificationSettings>> getNotificationSettings() async {
    try {
      final settings = await _settingRepository.getNotificationSettings();
      return Right(settings);
    } catch (e) {
      return Left(SettingFailure.loadFailed(e.toString()));
    }
  }
  
  // 更新通知设置
  Future<Result<void>> updateNotificationSettings(
    NotificationSettings settings,
  ) async {
    try {
      await _settingRepository.updateNotificationSettings(settings);
      
      // 同步到推送服务
      await _syncNotificationSettingsToPushService(settings);
      
      return Right(unit);
    } catch (e) {
      return Left(SettingFailure.updateFailed(e.toString()));
    }
  }
  
  // 切换通知类型开关
  Future<Result<void>> toggleNotificationType(
    NotificationType type,
    bool enabled,
  ) async {
    try {
      final currentSettings = await getNotificationSettings();
      return currentSettings.fold(
        (failure) => Left(failure),
        (settings) async {
          final updatedTypeSettings = Map<NotificationType, bool>.from(
            settings.typeSettings,
          );
          updatedTypeSettings[type] = enabled;
          
          final updatedSettings = settings.copyWith(
            typeSettings: updatedTypeSettings,
          );
          
          return await updateNotificationSettings(updatedSettings);
        },
      );
    } catch (e) {
      return Left(SettingFailure.updateFailed(e.toString()));
    }
  }
}
```

### 3. 隐私安全设置

#### 隐私设置管理
```dart
// 隐私设置模型
class PrivacySettings {
  final bool enableLocationSharing;
  final bool enableDataAnalytics;
  final bool enablePersonalizedAds;
  final bool enableContactSync;
  final bool enableBiometricAuth;
  final bool enableAutoLock;
  final Duration autoLockDuration;
  final List<String> blockedContacts;
  
  const PrivacySettings({
    required this.enableLocationSharing,
    required this.enableDataAnalytics,
    required this.enablePersonalizedAds,
    required this.enableContactSync,
    required this.enableBiometricAuth,
    required this.enableAutoLock,
    required this.autoLockDuration,
    required this.blockedContacts,
  });
  
  factory PrivacySettings.defaultSettings() {
    return PrivacySettings(
      enableLocationSharing: true,
      enableDataAnalytics: false,
      enablePersonalizedAds: false,
      enableContactSync: false,
      enableBiometricAuth: false,
      enableAutoLock: true,
      autoLockDuration: Duration(minutes: 5),
      blockedContacts: [],
    );
  }
}

// 隐私设置服务
class PrivacySettingsService {
  final SettingRepository _settingRepository;
  final ConsentService _consentService;
  final BiometricService _biometricService;
  
  PrivacySettingsService(
    this._settingRepository,
    this._consentService,
    this._biometricService,
  );
  
  // 获取隐私设置
  Future<Result<PrivacySettings>> getPrivacySettings() async {
    try {
      final settings = await _settingRepository.getPrivacySettings();
      return Right(settings);
    } catch (e) {
      return Left(SettingFailure.loadFailed(e.toString()));
    }
  }
  
  // 更新隐私设置
  Future<Result<void>> updatePrivacySettings(
    PrivacySettings settings,
  ) async {
    try {
      // 检查权限变更
      await _handlePrivacyPermissionChanges(settings);
      
      await _settingRepository.updatePrivacySettings(settings);
      return Right(unit);
    } catch (e) {
      return Left(SettingFailure.updateFailed(e.toString()));
    }
  }
  
  // 启用生物识别认证
  Future<Result<void>> enableBiometricAuth() async {
    try {
      // 检查生物识别可用性
      final isAvailable = await _biometricService.isAvailable();
      if (!isAvailable) {
        return Left(SettingFailure.biometricNotAvailable());
      }
      
      // 验证生物识别
      final isAuthenticated = await _biometricService.authenticate(
        localizedReason: '请验证生物识别以启用此功能',
      );
      
      if (!isAuthenticated) {
        return Left(SettingFailure.biometricAuthFailed());
      }
      
      // 更新设置
      final currentSettings = await getPrivacySettings();
      return currentSettings.fold(
        (failure) => Left(failure),
        (settings) async {
          final updatedSettings = settings.copyWith(
            enableBiometricAuth: true,
          );
          return await updatePrivacySettings(updatedSettings);
        },
      );
    } catch (e) {
      return Left(SettingFailure.updateFailed(e.toString()));
    }
  }
}
```

### 4. 系统设置

#### 系统信息与设置
```dart
// 系统设置服务
class SystemSettingsService {
  final PackageInfo _packageInfo;
  final StorageService _storageService;
  final NetworkService _networkService;
  
  SystemSettingsService(
    this._packageInfo,
    this._storageService,
    this._networkService,
  );
  
  // 获取应用信息
  AppInfo getAppInfo() {
    return AppInfo(
      appName: _packageInfo.appName,
      packageName: _packageInfo.packageName,
      version: _packageInfo.version,
      buildNumber: _packageInfo.buildNumber,
    );
  }
  
  // 获取存储信息
  Future<StorageInfo> getStorageInfo() async {
    final cacheSize = await _getCacheSize();
    final userData = await _getUserDataSize();
    final tempFiles = await _getTempFilesSize();
    
    return StorageInfo(
      cacheSize: cacheSize,
      userDataSize: userData,
      tempFilesSize: tempFiles,
      totalUsage: cacheSize + userData + tempFiles,
    );
  }
  
  // 清理缓存
  Future<Result<void>> clearCache() async {
    try {
      // 清理网络缓存
      await _networkService.clearCache();
      
      // 清理图片缓存
      await _clearImageCache();
      
      // 清理临时文件
      await _clearTempFiles();
      
      return Right(unit);
    } catch (e) {
      return Left(SettingFailure.clearCacheFailed(e.toString()));
    }
  }
  
  // 检查更新
  Future<Result<UpdateInfo?>> checkForUpdates() async {
    try {
      final updateInfo = await _networkService.checkAppUpdate(
        currentVersion: _packageInfo.version,
      );
      return Right(updateInfo);
    } catch (e) {
      return Left(SettingFailure.updateCheckFailed(e.toString()));
    }
  }
  
  // 导出用户数据
  Future<Result<String>> exportUserData() async {
    try {
      final userData = await _collectUserData();
      final exportPath = await _saveDataToFile(userData);
      return Right(exportPath);
    } catch (e) {
      return Left(SettingFailure.exportFailed(e.toString()));
    }
  }
}
```

## 页面组件设计

### 主设置页面
```dart
// 主设置页面
class SettingsMainPage extends StatefulWidget {
  @override
  _SettingsMainPageState createState() => _SettingsMainPageState();
}

class _SettingsMainPageState extends State<SettingsMainPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('设置'),
      ),
      body: ListView(
        children: [
          _buildUserSection(),
          _buildAppSection(),
          _buildPrivacySection(),
          _buildNotificationSection(),
          _buildSystemSection(),
          _buildAboutSection(),
        ],
      ),
    );
  }
  
  Widget _buildUserSection() {
    return SettingsSection(
      title: '账户',
      children: [
        SettingsTile.navigation(
          leading: Icon(Icons.person),
          title: Text('个人信息'),
          subtitle: Text('头像、昵称等'),
          onPressed: (context) => _navigateToProfile(),
        ),
        SettingsTile.navigation(
          leading: Icon(Icons.security),
          title: Text('安全设置'),
          subtitle: Text('密码、生物识别'),
          onPressed: (context) => _navigateToSecurity(),
        ),
      ],
    );
  }
  
  Widget _buildAppSection() {
    return SettingsSection(
      title: '应用',
      children: [
        SettingsTile.navigation(
          leading: Icon(Icons.language),
          title: Text('语言'),
          subtitle: Text('中文（简体）'),
          onPressed: (context) => _navigateToLanguage(),
        ),
        SettingsTile.navigation(
          leading: Icon(Icons.palette),
          title: Text('主题'),
          subtitle: Text('跟随系统'),
          onPressed: (context) => _navigateToTheme(),
        ),
        SettingsTile.switchTile(
          leading: Icon(Icons.dark_mode),
          title: Text('深色模式'),
          initialValue: false,
          onToggle: (value) => _toggleDarkMode(value),
        ),
      ],
    );
  }
}
```

### 通知设置页面
```dart
// 通知设置页面
class NotificationSettingsPage extends StatefulWidget {
  @override
  _NotificationSettingsPageState createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  late NotificationSettingsBloc _bloc;
  
  @override
  void initState() {
    super.initState();
    _bloc = context.read<NotificationSettingsBloc>();
    _bloc.add(LoadNotificationSettings());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('通知设置')),
      body: BlocBuilder<NotificationSettingsBloc, NotificationSettingsState>(
        builder: (context, state) {
          if (state is NotificationSettingsLoaded) {
            return _buildSettingsList(state.settings);
          } else if (state is NotificationSettingsError) {
            return _buildErrorState(state.message);
          } else {
            return _buildLoadingState();
          }
        },
      ),
    );
  }
  
  Widget _buildSettingsList(NotificationSettings settings) {
    return ListView(
      children: [
        SettingsSection(
          title: '通知开关',
          children: [
            SettingsTile.switchTile(
              leading: Icon(Icons.notifications),
              title: Text('推送通知'),
              subtitle: Text('接收应用推送消息'),
              initialValue: settings.enablePushNotification,
              onToggle: (value) => _togglePushNotification(value),
            ),
            SettingsTile.switchTile(
              leading: Icon(Icons.volume_up),
              title: Text('声音'),
              initialValue: settings.enableSoundNotification,
              onToggle: (value) => _toggleSoundNotification(value),
            ),
            SettingsTile.switchTile(
              leading: Icon(Icons.vibration),
              title: Text('振动'),
              initialValue: settings.enableVibrationNotification,
              onToggle: (value) => _toggleVibrationNotification(value),
            ),
          ],
        ),
        SettingsSection(
          title: '通知类型',
          children: [
            ...settings.typeSettings.entries.map(
              (entry) => SettingsTile.switchTile(
                leading: _getNotificationTypeIcon(entry.key),
                title: Text(_getNotificationTypeName(entry.key)),
                initialValue: entry.value,
                onToggle: (value) => _toggleNotificationType(entry.key, value),
              ),
            ),
          ],
        ),
        SettingsSection(
          title: '免打扰',
          children: [
            SettingsTile.navigation(
              leading: Icon(Icons.schedule),
              title: Text('免打扰时间'),
              subtitle: Text('${settings.quietHours.startTime} - ${settings.quietHours.endTime}'),
              onPressed: (context) => _navigateToQuietHours(),
            ),
          ],
        ),
      ],
    );
  }
}
```

## 状态管理

### 设置状态管理
```dart
// 设置状态 BLoC
class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  final AppPreferenceService _preferenceService;
  final NotificationSettingsService _notificationService;
  final PrivacySettingsService _privacyService;
  
  SettingsBloc(
    this._preferenceService,
    this._notificationService,
    this._privacyService,
  ) : super(SettingsInitial()) {
    on<LoadAllSettings>(_onLoadAllSettings);
    on<UpdateAppPreference>(_onUpdateAppPreference);
    on<UpdateNotificationSettings>(_onUpdateNotificationSettings);
    on<UpdatePrivacySettings>(_onUpdatePrivacySettings);
  }
  
  Future<void> _onLoadAllSettings(
    LoadAllSettings event,
    Emitter<SettingsState> emit,
  ) async {
    emit(SettingsLoading());
    
    try {
      final appPreferences = await _preferenceService.getAppPreferences();
      final notificationSettings = await _notificationService.getNotificationSettings();
      final privacySettings = await _privacyService.getPrivacySettings();
      
      final allSettings = AllSettings(
        appPreferences: appPreferences,
        notificationSettings: notificationSettings.getOrElse(() => NotificationSettings.defaultSettings()),
        privacySettings: privacySettings.getOrElse(() => PrivacySettings.defaultSettings()),
      );
      
      emit(SettingsLoaded(allSettings));
    } catch (e) {
      emit(SettingsError('加载设置失败: $e'));
    }
  }
}
```

## 路由配置

### 设置模块路由
```dart
// 设置模块路由配置
class SettingRoutes {
  static const String main = '/settings';
  static const String profile = '/settings/profile';
  static const String notification = '/settings/notification';
  static const String privacy = '/settings/privacy';
  static const String security = '/settings/security';
  static const String language = '/settings/language';
  static const String theme = '/settings/theme';
  static const String about = '/settings/about';
  
  static List<ModularRoute> get routes => [
    ChildRoute(
      main,
      child: (context, args) => SettingsMainPage(),
    ),
    ChildRoute(
      profile,
      child: (context, args) => ProfileSettingsPage(),
    ),
    ChildRoute(
      notification,
      child: (context, args) => NotificationSettingsPage(),
    ),
    ChildRoute(
      privacy,
      child: (context, args) => PrivacySettingsPage(),
    ),
    ChildRoute(
      security,
      child: (context, args) => SecuritySettingsPage(),
    ),
    ChildRoute(
      language,
      child: (context, args) => LanguageSettingsPage(),
    ),
    ChildRoute(
      theme,
      child: (context, args) => ThemeSettingsPage(),
    ),
    ChildRoute(
      about,
      child: (context, args) => AboutPage(),
    ),
  ];
}
```

## 依赖管理

### 核心依赖
- **basic_network**: 网络请求服务
- **basic_storage**: 本地存储
- **basic_modular**: 模块化框架
- **basic_intl**: 国际化支持

### 服务依赖
- **clr_setting**: 设置服务 SDK
- **clr_media**: 媒体服务
- **app_consent**: 用户同意管理

### 系统依赖
- **package_info**: 应用信息获取
- **cupertino_icons**: iOS 风格图标

## 数据持久化

### 设置存储策略
```dart
// 设置存储管理器
class SettingsStorageManager {
  final StorageService _storageService;
  
  SettingsStorageManager(this._storageService);
  
  // 保存设置到本地
  Future<void> saveSettings<T>(String key, T settings) async {
    await _storageService.setObject(key, settings.toJson());
  }
  
  // 从本地加载设置
  Future<T?> loadSettings<T>(
    String key,
    T Function(Map<String, dynamic>) fromJson,
  ) async {
    final json = await _storageService.getObject(key);
    if (json != null) {
      return fromJson(json);
    }
    return null;
  }
  
  // 同步设置到云端
  Future<void> syncSettingsToCloud() async {
    // 实现云端同步逻辑
  }
}
```

## 错误处理

### 设置特定异常
```dart
// 设置功能异常
abstract class SettingFailure {
  const SettingFailure();
  
  factory SettingFailure.loadFailed(String message) = LoadFailure;
  factory SettingFailure.updateFailed(String message) = UpdateFailure;
  factory SettingFailure.clearCacheFailed(String message) = ClearCacheFailure;
  factory SettingFailure.biometricNotAvailable() = BiometricNotAvailableFailure;
  factory SettingFailure.biometricAuthFailed() = BiometricAuthFailure;
}

class LoadFailure extends SettingFailure {
  final String message;
  const LoadFailure(this.message);
}
```

## 总结

`app_setting` 模块为 OneApp 提供了完整的应用设置管理功能，涵盖用户偏好、通知管理、隐私安全等各个方面。模块采用清晰的分层架构和模块化设计，支持多语言、主题切换和云端同步，为用户提供个性化和安全的设置体验。通过完善的状态管理和错误处理机制，确保了设置功能的稳定性和用户体验。
