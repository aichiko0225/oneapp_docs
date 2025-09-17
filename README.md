# OneApp 架构设计文档

> OneApp Flutter 应用的完整技术架构设计和模块说明文档站点

## 🚀 快速开始

本文档站点支持两种构建方式：
- **MkDocs** - 生成静态HTML文档站点（推荐）
- **Docsify** - 动态文档解析（兼容支持）

提供了完整的 OneApp Flutter 应用架构设计说明。

### 📖 主要内容

- **[架构设计文档](OneApp架构设计文档.md)** - 完整的系统架构设计文档
- **[主应用架构](main_app.md)** - 主应用的详细架构说明  
- **[调试工具](debug_tools.md)** - 开发调试工具使用指南

### 📱 功能模块

根据OneApp架构设计，系统分为应用层（APP）和服务层（CLR）两大部分：

#### 🔧 服务层模块 (CLR - Connection Layer)
- **[账户服务](account/README.md)** - CLR账户服务SDK，用户认证和授权
- **[售后服务](after_sales/README.md)** - CLR售后服务SDK，售后流程管理

#### 🚗 应用层模块 (APP - Application Layer) 
- **[车辆服务](app_car/README.md)** - 车辆控制、充电、监控等核心功能
- **[汽车销售](car_sales/README.md)** - 汽车销售业务功能

#### 🏗 基础设施层
- **[基础UI组件](basic_uis/README.md)** - UI组件库和设计系统
- **[基础工具库](basic_utils/README.md)** - 网络、存储、日志等基础工具
- **[服务组件](service_component/README.md)** - 通用服务组件

#### 🎯 业务功能层
- **[社区功能](community/README.md)** - 用户社区和交互功能
- **[会员服务](membership/README.md)** - 会员权益和管理系统
- **[设置功能](setting/README.md)** - 应用配置和个人设置
- **[触点模块](touch_point/README.md)** - 用户接触点管理

## 🛠️ 技术栈

- **框架**: Flutter 3.0+
- **语言**: Dart 3.0+
- **架构**: MVVM + 模块化
- **状态管理**: Provider + Bloc
- **路由**: Flutter Modular
- **网络**: Dio
- **存储**: Hive + SharedPreferences

## 📖 使用指南

### 在线浏览
- 使用左侧导航栏浏览不同模块
- 使用右上角搜索功能快速查找内容
- 点击主题切换按钮切换深色/浅色模式

### MkDocs 本地部署（推荐）
```bash
# 安装 MkDocs Material
pip install mkdocs-material

# 在项目目录启动本地服务
mkdocs serve

# 访问 http://127.0.0.1:8000

# 构建静态站点
mkdocs build
```

### Docsify 本地部署（兼容）
```bash
# 安装 docsify-cli
npm install -g docsify-cli

# 在项目目录启动本地服务
docsify serve

# 访问 http://localhost:3000
```

## 🎯 文档特性

- ✅ **双构建支持** - MkDocs静态生成 + Docsify动态解析
- ✅ **Mermaid 图表支持** - 所有架构图表自动渲染
- ✅ **响应式设计** - 完美支持移动端和桌面端
- ✅ **全文搜索** - 快速查找文档内容
- ✅ **主题切换** - 支持浅色和深色主题
- ✅ **代码高亮** - 支持多种编程语言语法高亮
- ✅ **中文优化** - 完整的中文本地化支持

---

> **提示**: 文档中的所有 Mermaid 图表都支持交互式查看，点击可获得更好的阅读体验。静态站点推荐使用MkDocs构建版本获得最佳性能。