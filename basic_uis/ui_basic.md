# UI Basic 基础UI组件模块

## 模块概述

`ui_basic` 是 OneApp 基础UI模块群中的核心组件库，提供了应用开发中常用的基础UI组件和交互元素。该模块封装了通用的界面组件、布局容器、表单元素等，为整个应用提供统一的设计语言和用户体验。

### 基本信息
- **模块名称**: ui_basic
- **版本**: 0.2.45
- **描述**: 基础UI组件库
- **Flutter 版本**: >=1.17.0
- **Dart 版本**: >=2.17.0 <4.0.0

## 功能特性

### 核心功能
1. **基础组件库**
   - 按钮组件（Button、IconButton、FloatingActionButton）
   - 输入组件（TextField、TextFormField、Checkbox、Radio）
   - 展示组件（Card、ListTile、Chip、Badge）
   - 导航组件（AppBar、TabBar、BottomNavigationBar）

2. **布局容器**
   - 响应式布局容器
   - 网格布局组件
   - 弹性布局组件
   - 自定义布局容器

3. **交互组件**
   - 上拉下拉刷新
   - 轮播图组件
   - 对话框和弹窗
   - 加载指示器

4. **富文本支持**
   - HTML富文本渲染
   - 文本样式定制
   - 链接和图片支持
   - 自定义标签解析

## 技术架构

### 目录结构
```
lib/
├── ui_basic.dart               # 模块入口文件
├── src/                        # 源代码目录
│   ├── components/             # 基础组件
│   ├── containers/             # 布局容器
│   ├── interactions/           # 交互组件
│   ├── themes/                 # 主题配置
│   ├── utils/                  # 工具类
│   └── constants/              # 常量定义
├── widgets/                    # 组件导出
└── themes/                     # 主题文件
```

### 依赖关系

#### 框架依赖
- `basic_network: ^0.2.3+4` - 网络通信基础
- `provider: ^6.0.5` - 状态管理
- `rxdart: ^0.27.7` - 响应式编程

#### UI相关依赖
- `flutter_html: ^3.0.0-beta.2` - HTML富文本渲染
- `badges: ^3.1.1` - 角标组件
- `pull_to_refresh: ^2.0.0` - 上拉下拉刷新
- `fluttertoast: ^8.2.5` - 提示组件

#### 工具依赖
- `dartz: ^0.10.1` - 函数式编程
- `kt_dart: ^1.1.0` - Kotlin风格扩展
- `collection: ^1.16.0` - 集合工具

## 核心组件分析

### 1. 模块入口 (`ui_basic.dart`)

**功能职责**:
- 统一导出所有UI组件
- 组件主题配置
- 全局样式设置

### 2. 基础组件 (`src/components/`)

#### 按钮组件
```dart
class BasicButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonType type;
  final ButtonSize size;
  final bool isLoading;
  final Widget? icon;

  const BasicButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.type = ButtonType.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: _getButtonStyle(context),
      child: isLoading 
          ? _buildLoadingIndicator()
          : _buildButtonContent(),
    );
  }

  ButtonStyle _getButtonStyle(BuildContext context) {
    switch (type) {
      case ButtonType.primary:
        return ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
        );
      case ButtonType.secondary:
        return ElevatedButton.styleFrom(
          backgroundColor: Colors.grey[200],
          foregroundColor: Colors.black87,
        );
      case ButtonType.outline:
        return OutlinedButton.styleFrom(
          side: BorderSide(color: Theme.of(context).primaryColor),
        );
    }
  }
}

enum ButtonType { primary, secondary, outline }
enum ButtonSize { small, medium, large }
```

#### 输入组件
```dart
class BasicTextField extends StatelessWidget {
  final String? labelText;
  final String? hintText;
  final String? helperText;
  final String? errorText;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final FormFieldValidator<String>? validator;
  final TextInputType keyboardType;
  final bool obscureText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;

  const BasicTextField({
    Key? key,
    this.labelText,
    this.hintText,
    this.helperText,
    this.errorText,
    this.controller,
    this.onChanged,
    this.validator,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.prefixIcon,
    this.suffixIcon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      onChanged: onChanged,
      validator: validator,
      keyboardType: keyboardType,
      obscureText: obscureText,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        helperText: helperText,
        errorText: errorText,
        prefixIcon: prefixIcon,
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }
}
```

### 3. 布局容器 (`src/containers/`)

#### 响应式容器
```dart
class ResponsiveContainer extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final double? maxWidth;
  final BoxDecoration? decoration;

  const ResponsiveContainer({
    Key? key,
    required this.child,
    this.padding,
    this.margin,
    this.maxWidth,
    this.decoration,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final effectiveMaxWidth = maxWidth ?? _getMaxWidth(screenWidth);

    return Container(
      width: double.infinity,
      margin: margin,
      decoration: decoration,
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: effectiveMaxWidth),
          child: Padding(
            padding: padding ?? _getDefaultPadding(screenWidth),
            child: child,
          ),
        ),
      ),
    );
  }

  double _getMaxWidth(double screenWidth) {
    if (screenWidth > 1200) return 1200;
    if (screenWidth > 768) return screenWidth * 0.9;
    return double.infinity;
  }

  EdgeInsets _getDefaultPadding(double screenWidth) {
    if (screenWidth > 768) return const EdgeInsets.all(24);
    return const EdgeInsets.all(16);
  }
}
```

### 4. 交互组件 (`src/interactions/`)

#### 上拉下拉刷新组件
```dart
class BasicRefreshView extends StatefulWidget {
  final Future<void> Function() onRefresh;
  final Future<void> Function()? onLoading;
  final Widget child;
  final bool enablePullUp;
  final bool enablePullDown;

  const BasicRefreshView({
    Key? key,
    required this.onRefresh,
    this.onLoading,
    required this.child,
    this.enablePullUp = true,
    this.enablePullDown = true,
  }) : super(key: key);

  @override
  State<BasicRefreshView> createState() => _BasicRefreshViewState();
}

class _BasicRefreshViewState extends State<BasicRefreshView> {
  final RefreshController _refreshController = RefreshController();

  @override
  Widget build(BuildContext context) {
    return SmartRefresher(
      controller: _refreshController,
      enablePullDown: widget.enablePullDown,
      enablePullUp: widget.enablePullUp,
      onRefresh: _onRefresh,
      onLoading: _onLoading,
      header: const WaterDropMaterialHeader(),
      footer: const ClassicFooter(),
      child: widget.child,
    );
  }

  void _onRefresh() async {
    try {
      await widget.onRefresh();
      _refreshController.refreshCompleted();
    } catch (e) {
      _refreshController.refreshFailed();
    }
  }

  void _onLoading() async {
    if (widget.onLoading == null) {
      _refreshController.loadNoData();
      return;
    }

    try {
      await widget.onLoading!();
      _refreshController.loadComplete();
    } catch (e) {
      _refreshController.loadFailed();
    }
  }

  @override
  void dispose() {
    _refreshController.dispose();
    super.dispose();
  }
}
```

#### 加载指示器组件
```dart
class BasicLoadingIndicator extends StatelessWidget {
  final String? message;
  final LoadingType type;
  final Color? color;
  final double size;

  const BasicLoadingIndicator({
    Key? key,
    this.message,
    this.type = LoadingType.circular,
    this.color,
    this.size = 40.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildIndicator(context),
        if (message != null) ...[
          const SizedBox(height: 16),
          Text(
            message!,
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Widget _buildIndicator(BuildContext context) {
    final effectiveColor = color ?? Theme.of(context).primaryColor;

    switch (type) {
      case LoadingType.circular:
        return SizedBox(
          width: size,
          height: size,
          child: CircularProgressIndicator(color: effectiveColor),
        );
      case LoadingType.linear:
        return SizedBox(
          width: size * 2,
          child: LinearProgressIndicator(color: effectiveColor),
        );
      case LoadingType.dots:
        return _buildDotsIndicator(effectiveColor);
    }
  }

  Widget _buildDotsIndicator(Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 2),
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        );
      }),
    );
  }
}

enum LoadingType { circular, linear, dots }
```

### 5. 主题配置 (`src/themes/`)

#### 基础主题配置
```dart
class BasicTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF1976D2),
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 1,
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 12,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF1976D2),
        brightness: Brightness.dark,
      ),
      // ... 暗色主题配置
    );
  }
}
```

## 组件使用示例

### 基础使用示例
```dart
class BasicComponentsExample extends StatefulWidget {
  @override
  _BasicComponentsExampleState createState() => _BasicComponentsExampleState();
}

class _BasicComponentsExampleState extends State<BasicComponentsExample> {
  final TextEditingController _textController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Basic Components')),
      body: ResponsiveContainer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 输入框示例
            BasicTextField(
              labelText: '用户名',
              hintText: '请输入用户名',
              controller: _textController,
              prefixIcon: Icon(Icons.person),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '请输入用户名';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 16),
            
            // 按钮示例
            BasicButton(
              text: '登录',
              type: ButtonType.primary,
              isLoading: _isLoading,
              onPressed: () => _handleLogin(),
            ),
            
            const SizedBox(height: 16),
            
            // 卡片示例
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '通知',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text('这是一条重要通知内容'),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // 加载指示器示例
            if (_isLoading)
              const BasicLoadingIndicator(
                message: '正在登录...',
                type: LoadingType.circular,
              ),
          ],
        ),
      ),
    );
  }

  void _handleLogin() async {
    setState(() {
      _isLoading = true;
    });

    // 模拟登录请求
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isLoading = false;
    });

    // 显示结果
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('登录成功')),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }
}
```

### 高级组件示例
```dart
class AdvancedComponentsExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Advanced Components')),
      body: BasicRefreshView(
        onRefresh: () async {
          // 刷新数据
          await Future.delayed(const Duration(seconds: 1));
        },
        onLoading: () async {
          // 加载更多数据
          await Future.delayed(const Duration(seconds: 1));
        },
        child: ListView.builder(
          itemCount: 20,
          itemBuilder: (context, index) {
            return ListTile(
              leading: CircleAvatar(
                child: Text('${index + 1}'),
              ),
              title: Text('项目 ${index + 1}'),
              subtitle: Text('这是项目 ${index + 1} 的描述'),
              trailing: Badge(
                label: Text('${index % 5 + 1}'),
                child: const Icon(Icons.notifications),
              ),
              onTap: () {
                // 处理点击事件
              },
            );
          },
        ),
      ),
    );
  }
}
```

## 自定义主题

### 主题定制示例
```dart
class CustomThemeExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Custom Theme Example',
      theme: _buildCustomTheme(),
      home: MyHomePage(),
    );
  }

  ThemeData _buildCustomTheme() {
    const primaryColor = Color(0xFF6C5CE7);
    const secondaryColor = Color(0xFFA29BFE);

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        secondary: secondaryColor,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
      cardTheme: CardTheme(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
```

## 性能优化

### 组件优化策略
- **Widget缓存**: 缓存不变的Widget实例
- **局部更新**: 使用Consumer精确控制更新范围
- **延迟构建**: 使用Builder延迟构建复杂组件
- **内存管理**: 及时释放资源和控制器

### 渲染优化
- **RepaintBoundary**: 隔离重绘区域
- **ListView.builder**: 使用懒加载列表
- **Image优化**: 合理使用缓存和压缩
- **动画优化**: 使用硬件加速动画

## 测试策略

### Widget测试
- **组件渲染测试**: 验证组件正确渲染
- **交互测试**: 测试用户交互响应
- **主题测试**: 验证主题正确应用
- **响应式测试**: 测试不同屏幕尺寸适配

### 单元测试
- **工具类测试**: 测试工具方法功能
- **状态管理测试**: 测试状态变化逻辑
- **数据模型测试**: 测试数据序列化

## 最佳实践

### 组件设计原则
1. **单一职责**: 每个组件功能单一明确
2. **可复用性**: 设计通用的可复用组件
3. **可配置性**: 提供丰富的配置选项
4. **一致性**: 保持设计风格一致

### 使用建议
1. **主题使用**: 优先使用主题颜色和样式
2. **响应式设计**: 考虑不同屏幕尺寸适配
3. **无障碍访问**: 添加语义标签和辅助功能
4. **性能考虑**: 避免不必要的重建和重绘

## 总结

`ui_basic` 模块作为 OneApp 的基础UI组件库，提供了丰富的界面组件和交互元素。通过统一的设计语言、灵活的主题系统和完善的组件生态，为整个应用提供了一致的用户体验。模块具有良好的可扩展性和可维护性，能够满足各种界面开发需求。
