# General UI Component 通用UI组件模块

## 模块概述

`general_ui_component` 是 OneApp 基础UI模块群中的通用UI组件模块，专门提供可复用的通用界面组件。该模块关注于创建高度可复用、跨业务场景的UI组件，为不同模块提供统一的界面元素和交互模式。

### 基本信息
- **模块名称**: general_ui_component
- **版本**: 0.0.1
- **描述**: 通用UI组件库
- **Flutter 版本**: >=1.17.0
- **Dart 版本**: >=3.0.0 <4.0.0

## 功能特性

### 核心功能
1. **通用界面组件**
   - 可复用的基础UI元素
   - 跨平台一致性保证
   - 标准化交互模式
   - 主题适配支持

2. **组件组合能力**
   - 组件嵌套和组合
   - 灵活的布局系统
   - 响应式设计支持
   - 自适应界面元素

3. **扩展性设计**
   - 插件化组件架构
   - 可定制的样式系统
   - 事件驱动的交互
   - 配置化行为控制

4. **性能优化**
   - 轻量级组件设计
   - 懒加载机制
   - 内存使用优化
   - 渲染性能提升

## 技术架构

### 目录结构
```
lib/
├── general_ui_component.dart   # 模块入口文件
├── src/                        # 源代码目录
│   ├── atoms/                  # 原子组件
│   ├── molecules/              # 分子组件
│   ├── organisms/              # 有机体组件
│   ├── templates/              # 模板组件
│   ├── themes/                 # 主题配置
│   ├── mixins/                 # 混入组件
│   └── utils/                  # 工具类
├── widgets/                    # Widget导出
└── examples/                   # 示例代码
```

### 依赖关系

#### 开发依赖
- `build_runner: any` - 代码生成引擎
- `freezed: ^2.3.5` - 数据类生成
- `flutter_lints: ^5.0.0` - 代码规范检查

#### 内部依赖 (dependency_overrides)
- `ui_business` - 业务UI组件（本地路径）
- `basic_utils` - 基础工具（本地路径）
- `basic_uis` - 基础UI集合（本地路径）

## 组件设计原则

### 原子设计方法论

#### 1. 原子组件 (Atoms)
最基础的UI元素，不可再分解的组件：

```dart
// 基础按钮原子组件
class AtomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonStyle? style;
  final ButtonSize size;
  final ButtonVariant variant;

  const AtomButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.style,
    this.size = ButtonSize.medium,
    this.variant = ButtonVariant.primary,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: _buildButtonStyle(context),
      child: Text(text),
    );
  }

  ButtonStyle _buildButtonStyle(BuildContext context) {
    final theme = Theme.of(context);
    
    return ElevatedButton.styleFrom(
      backgroundColor: _getBackgroundColor(theme),
      foregroundColor: _getForegroundColor(theme),
      padding: _getPadding(),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}

// 基础输入框原子组件
class AtomTextField extends StatelessWidget {
  final String? labelText;
  final String? hintText;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String? Function(String?)? validator;
  final TextInputType keyboardType;
  final bool obscureText;

  const AtomTextField({
    Key? key,
    this.labelText,
    this.hintText,
    this.controller,
    this.onChanged,
    this.validator,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
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
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }
}
```

#### 2. 分子组件 (Molecules)
由多个原子组件组合而成：

```dart
// 搜索栏分子组件
class MoleculeSearchBar extends StatefulWidget {
  final String? hintText;
  final ValueChanged<String>? onSearchChanged;
  final VoidCallback? onSearchPressed;
  final TextEditingController? controller;

  const MoleculeSearchBar({
    Key? key,
    this.hintText,
    this.onSearchChanged,
    this.onSearchPressed,
    this.controller,
  }) : super(key: key);

  @override
  State<MoleculeSearchBar> createState() => _MoleculeSearchBarState();
}

class _MoleculeSearchBarState extends State<MoleculeSearchBar> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(25),
      ),
      child: Row(
        children: [
          Icon(Icons.search, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: AtomTextField(
              controller: _controller,
              hintText: widget.hintText ?? '搜索...',
              onChanged: widget.onSearchChanged,
            ),
          ),
          if (_controller.text.isNotEmpty)
            GestureDetector(
              onTap: () {
                _controller.clear();
                widget.onSearchChanged?.call('');
              },
              child: Icon(Icons.clear, color: Colors.grey[600]),
            ),
        ],
      ),
    );
  }
}

// 标签选择器分子组件
class MoleculeTagSelector extends StatelessWidget {
  final List<String> tags;
  final List<String> selectedTags;
  final ValueChanged<List<String>>? onSelectionChanged;
  final TagSelectorStyle style;

  const MoleculeTagSelector({
    Key? key,
    required this.tags,
    required this.selectedTags,
    this.onSelectionChanged,
    this.style = const TagSelectorStyle(),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: tags.map((tag) {
        final isSelected = selectedTags.contains(tag);
        return GestureDetector(
          onTap: () => _toggleTag(tag),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? style.selectedColor : style.unselectedColor,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? style.selectedBorderColor : style.unselectedBorderColor,
              ),
            ),
            child: Text(
              tag,
              style: TextStyle(
                color: isSelected ? style.selectedTextColor : style.unselectedTextColor,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  void _toggleTag(String tag) {
    final newSelection = List<String>.from(selectedTags);
    if (newSelection.contains(tag)) {
      newSelection.remove(tag);
    } else {
      newSelection.add(tag);
    }
    onSelectionChanged?.call(newSelection);
  }
}
```

#### 3. 有机体组件 (Organisms)
由多个分子和原子组件组合的复杂组件：

```dart
// 列表项有机体组件
class OrganismListItem extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;
  final List<Widget>? actions;
  final bool showDivider;

  const OrganismListItem({
    Key? key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.onTap,
    this.actions,
    this.showDivider = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          leading: leading,
          title: Text(title),
          subtitle: subtitle != null ? Text(subtitle!) : null,
          trailing: trailing,
          onTap: onTap,
        ),
        if (actions != null && actions!.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: actions!,
            ),
          ),
          const SizedBox(height: 8),
        ],
        if (showDivider) const Divider(height: 1),
      ],
    );
  }
}

// 卡片容器有机体组件
class OrganismCard extends StatelessWidget {
  final Widget child;
  final String? title;
  final List<Widget>? actions;
  final EdgeInsets? padding;
  final double? elevation;
  final Color? backgroundColor;

  const OrganismCard({
    Key? key,
    required this.child,
    this.title,
    this.actions,
    this.padding,
    this.elevation,
    this.backgroundColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: elevation ?? 2,
      color: backgroundColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null || (actions != null && actions!.isNotEmpty))
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (title != null)
                    Expanded(
                      child: Text(
                        title!,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                  if (actions != null) ...actions!,
                ],
              ),
            ),
          Padding(
            padding: padding ?? const EdgeInsets.all(16),
            child: child,
          ),
        ],
      ),
    );
  }
}
```

#### 4. 模板组件 (Templates)
页面级别的布局模板：

```dart
// 标准页面模板
class TemplateStandardPage extends StatelessWidget {
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final Widget? drawer;
  final Widget? bottomNavigationBar;
  final bool showBackButton;

  const TemplateStandardPage({
    Key? key,
    required this.title,
    required this.body,
    this.actions,
    this.floatingActionButton,
    this.drawer,
    this.bottomNavigationBar,
    this.showBackButton = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        automaticallyImplyLeading: showBackButton,
        actions: actions,
      ),
      body: body,
      floatingActionButton: floatingActionButton,
      drawer: drawer,
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}
```

## 主题系统

### 主题配置
```dart
class GeneralUITheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF1976D2),
      brightness: Brightness.light,
    ),
    // 组件主题配置
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF1976D2),
      brightness: Brightness.dark,
    ),
    // 暗色主题配置
  );
}
```

## 使用示例

### 基础组件使用
```dart
class GeneralUIExample extends StatefulWidget {
  @override
  _GeneralUIExampleState createState() => _GeneralUIExampleState();
}

class _GeneralUIExampleState extends State<GeneralUIExample> {
  final TextEditingController _searchController = TextEditingController();
  List<String> _selectedTags = [];

  @override
  Widget build(BuildContext context) {
    return TemplateStandardPage(
      title: 'General UI Components',
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 搜索栏示例
            MoleculeSearchBar(
              controller: _searchController,
              hintText: '搜索内容...',
              onSearchChanged: (query) {
                print('搜索: $query');
              },
            ),
            
            const SizedBox(height: 20),
            
            // 标签选择器示例
            Text(
              '选择标签',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            MoleculeTagSelector(
              tags: ['技术', '设计', '产品', '运营', '市场'],
              selectedTags: _selectedTags,
              onSelectionChanged: (tags) {
                setState(() {
                  _selectedTags = tags;
                });
              },
            ),
            
            const SizedBox(height: 20),
            
            // 卡片示例
            OrganismCard(
              title: '示例卡片',
              actions: [
                IconButton(
                  icon: const Icon(Icons.more_vert),
                  onPressed: () {},
                ),
              ],
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('这是一个使用通用UI组件构建的卡片示例'),
                  const SizedBox(height: 12),
                  AtomButton(
                    text: '操作按钮',
                    onPressed: () {
                      print('按钮被点击');
                    },
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 20),
            
            // 列表项示例
            OrganismListItem(
              title: '列表项标题',
              subtitle: '列表项副标题',
              leading: const CircleAvatar(child: Text('A')),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () {
                print('列表项被点击');
              },
              actions: [
                AtomButton(
                  text: '编辑',
                  size: ButtonSize.small,
                  variant: ButtonVariant.secondary,
                  onPressed: () {},
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

## 性能优化

### 组件优化策略
1. **Widget缓存**: 缓存不变的Widget实例
2. **const构造函数**: 尽可能使用const构造函数
3. **RepaintBoundary**: 隔离重绘区域
4. **懒加载**: 按需加载组件

### 内存管理
1. **控制器管理**: 及时释放TextEditingController等
2. **监听器清理**: 清理事件监听器
3. **图片缓存**: 合理使用图片缓存
4. **内存监控**: 监控内存使用情况

## 测试策略

### Widget测试
```dart
void main() {
  group('AtomButton', () {
    testWidgets('should display text correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: AtomButton(
            text: 'Test Button',
            onPressed: () {},
          ),
        ),
      );

      expect(find.text('Test Button'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('should call onPressed when tapped', (tester) async {
      bool wasPressed = false;
      
      await tester.pumpWidget(
        MaterialApp(
          home: AtomButton(
            text: 'Test Button',
            onPressed: () => wasPressed = true,
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      
      expect(wasPressed, true);
    });
  });
}
```

## 最佳实践

### 组件设计原则
1. **单一职责**: 每个组件功能单一明确
2. **可组合性**: 组件之间可以灵活组合
3. **可配置性**: 提供丰富的配置选项
4. **一致性**: 保持设计风格一致

### 开发建议
1. **遵循原子设计**: 按照原子设计方法论组织组件
2. **主题一致**: 使用统一的主题系统
3. **文档完善**: 提供详细的组件文档
4. **测试覆盖**: 保证充分的测试覆盖

## 总结

`general_ui_component` 模块作为通用UI组件库，采用原子设计方法论构建了完整的组件体系。通过分层设计和模块化架构，提供了高度可复用、一致性强的UI组件，为 OneApp 的界面开发提供了坚实的基础。模块具有良好的扩展性和可维护性，能够支撑复杂的界面需求。
