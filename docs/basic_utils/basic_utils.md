# Basic Utils 基础工具模块

## 模块概述

`basic_utils` 是 OneApp 基础工具模块群中的核心工具集合，提供了应用开发中常用的基础工具类、辅助方法和通用组件。该模块包含了事件总线、图片处理、分享功能、加密解密、文件上传等丰富的工具功能。

### 基本信息
- **模块名称**: basic_utils
- **版本**: 0.0.3
- **描述**: 基础工具包
- **Flutter 版本**: >=2.10.5
- **Dart 版本**: >=3.0.0 <4.0.08

## 功能特性

### 核心功能
1. **事件总线系统**
   - 全局事件发布订阅
   - 类型安全的事件传递
   - 事件生命周期管理
   - 异步事件处理

2. **图片处理工具**
   - 图片选择和拍照
   - 图片压缩和格式转换
   - 图片裁剪和编辑
   - 图片缓存管理

3. **分享功能集成**
   - 社交平台分享
   - 文件分享
   - 链接分享
   - 自定义分享内容

4. **加密解密服务**
   - 对称加密算法
   - 非对称加密算法
   - 哈希算法
   - 数字签名

5. **云存储服务**
   - 腾讯云COS集成
   - 文件上传下载
   - 断点续传
   - 存储管理

## 技术架构

### 目录结构
```
lib/
├── basic_utils.dart            # 模块入口文件
├── src/                        # 源代码目录
│   ├── event_bus/              # 事件总线
│   ├── image/                  # 图片处理
│   ├── share/                  # 分享功能
│   ├── crypto/                 # 加密解密
│   ├── storage/                # 云存储
│   ├── network/                # 网络工具
│   ├── utils/                  # 通用工具
│   └── models/                 # 数据模型
├── widgets/                    # 通用组件
└── test/                       # 测试文件
```

### 依赖关系

#### 核心框架依赖
- `basic_modular: ^0.2.3` - 模块化框架
- `basic_storage: 0.2.2` - 基础存储
- `basic_webview: ^0.2.4` - WebView组件

#### 工具依赖
- `event_bus: ^2.0.0` - 事件总线
- `shared_preferences: ^2.0.17` - 本地存储
- `http: ^1.0.0` - HTTP客户端
- `dartz: ^0.10.1` - 函数式编程

#### 功能依赖
- `image_picker: ^1.1.2` - 图片选择
- `flutter_image_compress: 2.1.0` - 图片压缩
- `share_plus: 7.2.1` - 分享功能
- `fluwx: ^4.2.5` - 微信SDK
- `weibo_kit: ^4.0.0` - 微博SDK

#### 安全依赖
- `crypto: any` - 加密算法
- `encrypt: any` - 加密工具
- `pointycastle: any` - 加密库

#### 云服务依赖
- `tencentcloud_cos_sdk_plugin: 1.2.0` - 腾讯云COS

## 核心模块分析

### 1. 模块入口 (`basic_utils.dart`)

**功能职责**:
- 工具模块统一导出
- 全局配置初始化
- 服务注册管理

### 2. 事件总线 (`src/event_bus/`)

**功能职责**:
- 全局事件发布订阅机制
- 类型安全的事件传递
- 事件过滤和转换
- 内存泄漏防护

**主要组件**:
- `GlobalEventBus` - 全局事件总线
- `EventSubscription` - 事件订阅管理
- `TypedEvent` - 类型化事件
- `EventFilter` - 事件过滤器

**使用示例**:
```dart
// 定义事件类型
class UserLoginEvent {
  final String userId;
  final String userName;
  
  UserLoginEvent(this.userId, this.userName);
}

// 发布事件
GlobalEventBus.instance.fire(UserLoginEvent('123', 'John'));

// 订阅事件
final subscription = GlobalEventBus.instance.on<UserLoginEvent>().listen((event) {
  print('User ${event.userName} logged in');
});

// 取消订阅
subscription.cancel();
```

### 3. 图片处理 (`src/image/`)

**功能职责**:
- 图片选择和拍照功能
- 图片压缩和格式转换
- 图片编辑和处理
- 图片缓存和管理

**主要组件**:
- `ImagePicker` - 图片选择器
- `ImageCompressor` - 图片压缩器
- `ImageEditor` - 图片编辑器
- `ImageCache` - 图片缓存管理

**使用示例**:
```dart
class ImageUtils {
  static Future<File?> pickImage({
    ImageSource source = ImageSource.gallery,
    double? maxWidth,
    double? maxHeight,
    int? imageQuality,
  }) async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: source,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      imageQuality: imageQuality,
    );
    
    return image != null ? File(image.path) : null;
  }
  
  static Future<File> compressImage(
    File file, {
    int quality = 85,
    int? minWidth,
    int? minHeight,
  }) async {
    final result = await FlutterImageCompress.compressAndGetFile(
      file.absolute.path,
      '${file.parent.path}/compressed_${file.name}',
      quality: quality,
      minWidth: minWidth,
      minHeight: minHeight,
    );
    
    return File(result!.path);
  }
}
```

### 4. 分享功能 (`src/share/`)

**功能职责**:
- 系统原生分享
- 社交平台分享
- 自定义分享内容
- 分享结果回调

**主要组件**:
- `ShareManager` - 分享管理器
- `WeChatShare` - 微信分享
- `WeiboShare` - 微博分享
- `SystemShare` - 系统分享

**使用示例**:
```dart
class ShareUtils {
  static Future<void> shareText(String text) async {
    await Share.share(text);
  }
  
  static Future<void> shareFile(String filePath) async {
    await Share.shareXFiles([XFile(filePath)]);
  }
  
  static Future<void> shareToWeChat({
    required String title,
    required String description,
    String? imageUrl,
    String? webpageUrl,
  }) async {
    final model = WeChatShareWebPageModel(
      webPage: webpageUrl ?? '',
      title: title,
      description: description,
      thumbnail: WeChatImage.network(imageUrl ?? ''),
    );
    
    await fluwx.shareToWeChat(model);
  }
}
```

### 5. 加密解密 (`src/crypto/`)

**功能职责**:
- 对称加密解密
- 非对称加密解密
- 数字签名验证
- 哈希算法实现

**主要组件**:
- `AESCrypto` - AES加密
- `RSACrypto` - RSA加密
- `HashUtils` - 哈希工具
- `SignatureUtils` - 数字签名

**使用示例**:
```dart
class CryptoUtils {
  static String md5Hash(String input) {
    final bytes = utf8.encode(input);
    final digest = md5.convert(bytes);
    return digest.toString();
  }
  
  static String sha256Hash(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
  
  static String aesEncrypt(String plainText, String key) {
    final encrypter = Encrypter(AES(Key.fromBase64(key)));
    final encrypted = encrypter.encrypt(plainText);
    return encrypted.base64;
  }
  
  static String aesDecrypt(String encryptedText, String key) {
    final encrypter = Encrypter(AES(Key.fromBase64(key)));
    final decrypted = encrypter.decrypt64(encryptedText);
    return decrypted;
  }
}
```

### 6. 云存储 (`src/storage/`)

**功能职责**:
- 腾讯云COS集成
- 文件上传下载
- 断点续传
- 存储空间管理

**主要组件**:
- `COSManager` - COS管理器
- `FileUploader` - 文件上传器
- `FileDownloader` - 文件下载器
- `StorageMonitor` - 存储监控

**使用示例**:
```dart
class CloudStorageUtils {
  static Future<String?> uploadFile(
    String filePath, {
    String? objectKey,
    Function(int, int)? onProgress,
  }) async {
    try {
      final result = await TencentCloudCosSdkPlugin.upload(
        filePath,
        objectKey ?? _generateObjectKey(filePath),
        onProgress: onProgress,
      );
      
      return result['url'] as String?;
    } catch (e) {
      print('Upload failed: $e');
      return null;
    }
  }
  
  static Future<bool> downloadFile(
    String url,
    String savePath, {
    Function(int, int)? onProgress,
  }) async {
    try {
      await TencentCloudCosSdkPlugin.download(
        url,
        savePath,
        onProgress: onProgress,
      );
      return true;
    } catch (e) {
      print('Download failed: $e');
      return false;
    }
  }
  
  static String _generateObjectKey(String filePath) {
    final fileName = path.basename(filePath);
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return 'uploads/$timestamp/$fileName';
  }
}
```

### 7. 网络工具 (`src/network/`)

**功能职责**:
- HTTP请求封装
- 网络状态检测
- 请求重试机制
- 响应数据处理

**主要组件**:
- `HttpClient` - HTTP客户端
- `NetworkMonitor` - 网络监控
- `RequestInterceptor` - 请求拦截器
- `ResponseHandler` - 响应处理器

### 8. 通用工具 (`src/utils/`)

**功能职责**:
- 字符串处理工具
- 日期时间工具
- 数学计算工具
- 格式化工具

**主要工具**:
- `StringUtils` - 字符串工具
- `DateUtils` - 日期工具
- `MathUtils` - 数学工具
- `FormatUtils` - 格式化工具

**工具方法示例**:
```dart
class StringUtils {
  static bool isNullOrEmpty(String? str) {
    return str == null || str.isEmpty;
  }
  
  static bool isValidEmail(String email) {
    return RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(email);
  }
  
  static bool isValidPhone(String phone) {
    return RegExp(r'^1[3-9]\d{9}$').hasMatch(phone);
  }
  
  static String maskPhone(String phone) {
    if (phone.length != 11) return phone;
    return '${phone.substring(0, 3)}****${phone.substring(7)}';
  }
}

class DateUtils {
  static String formatDateTime(DateTime dateTime, [String? pattern]) {
    pattern ??= 'yyyy-MM-dd HH:mm:ss';
    return DateFormat(pattern).format(dateTime);
  }
  
  static DateTime? parseDateTime(String dateStr, [String? pattern]) {
    try {
      pattern ??= 'yyyy-MM-dd HH:mm:ss';
      return DateFormat(pattern).parse(dateStr);
    } catch (e) {
      return null;
    }
  }
  
  static bool isToday(DateTime dateTime) {
    final now = DateTime.now();
    return dateTime.year == now.year &&
           dateTime.month == now.month &&
           dateTime.day == now.day;
  }
}
```

## 通用组件

### Loading组件
```dart
class LoadingUtils {
  static OverlayEntry? _overlayEntry;
  
  static void show(BuildContext context, {String? message}) {
    hide(); // 先隐藏之前的
    
    _overlayEntry = OverlayEntry(
      builder: (context) => Material(
        color: Colors.black54,
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(),
                if (message != null) ...[
                  const SizedBox(height: 16),
                  Text(message),
                ],
              ],
            ),
          ),
        ),
      ),
    );
    
    Overlay.of(context).insert(_overlayEntry!);
  }
  
  static void hide() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }
}
```

### Toast组件
```dart
class ToastUtils {
  static void showSuccess(String message) {
    Fluttertoast.showToast(
      msg: message,
      backgroundColor: Colors.green,
      textColor: Colors.white,
      toastLength: Toast.LENGTH_SHORT,
    );
  }
  
  static void showError(String message) {
    Fluttertoast.showToast(
      msg: message,
      backgroundColor: Colors.red,
      textColor: Colors.white,
      toastLength: Toast.LENGTH_SHORT,
    );
  }
  
  static void showInfo(String message) {
    Fluttertoast.showToast(
      msg: message,
      backgroundColor: Colors.blue,
      textColor: Colors.white,
      toastLength: Toast.LENGTH_SHORT,
    );
  }
}
```

## 性能优化

### 内存管理
- **事件订阅管理**: 及时取消不需要的事件订阅
- **图片内存优化**: 合理控制图片加载和缓存
- **对象池**: 复用常用对象减少GC压力
- **弱引用**: 使用弱引用避免内存泄漏

### 网络优化
- **请求缓存**: 缓存网络请求结果
- **并发控制**: 控制并发请求数量
- **超时重试**: 智能超时和重试机制
- **数据压缩**: 压缩传输数据

### 存储优化
- **文件压缩**: 压缩存储文件
- **清理策略**: 定期清理过期文件
- **分块上传**: 大文件分块上传
- **断点续传**: 支持上传下载断点续传

## 安全特性

### 数据安全
- **敏感数据加密**: 敏感信息加密存储
- **传输加密**: HTTPS传输保护
- **数据校验**: 数据完整性校验
- **防篡改**: 数字签名防篡改

### 隐私保护
- **权限控制**: 严格的功能权限控制
- **数据脱敏**: 敏感数据脱敏处理
- **本地存储**: 安全的本地数据存储
- **清理机制**: 数据清理和销毁机制

## 测试策略

### 单元测试
- **工具类测试**: 各种工具方法测试
- **加密解密测试**: 加密算法正确性
- **事件总线测试**: 事件发布订阅机制
- **网络工具测试**: 网络请求功能

### 集成测试
- **文件上传测试**: 云存储集成测试
- **分享功能测试**: 社交分享集成测试
- **图片处理测试**: 图片处理流程测试
- **端到端测试**: 完整功能流程测试

### 性能测试
- **内存泄漏测试**: 长时间运行检测
- **并发性能测试**: 高并发场景测试
- **文件处理测试**: 大文件处理性能
- **网络性能测试**: 网络请求性能

## 最佳实践

### 开发建议
1. **工具复用**: 优先使用现有工具方法
2. **异常处理**: 完善的异常处理机制
3. **资源管理**: 及时释放不需要的资源
4. **性能考虑**: 避免不必要的操作开销

### 使用指南
1. **按需导入**: 只导入需要的工具类
2. **配置优化**: 合理配置各种参数
3. **错误处理**: 妥善处理可能的错误
4. **日志记录**: 记录关键操作日志

## 总结

`basic_utils` 模块作为 OneApp 的基础工具集合，提供了丰富的开发工具和辅助功能。通过事件总线、图片处理、分享功能、加密解密等核心能力，大大简化了应用开发的复杂性。模块具有良好的性能优化和安全保护机制，能够满足各种开发场景的需求。
