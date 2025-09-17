# 构建脚本使用说明

## 快速使用

### 方式一：双击运行 (推荐)
直接双击 `build-docs.bat` 文件，按提示选择构建选项。

### 方式二：命令行运行

#### Windows PowerShell
```powershell
# 构建文档并自动清理docs目录
.\build-docs.ps1

# 构建文档但保留docs目录
.\build-docs.ps1 -KeepDocs

# 显示帮助信息
.\build-docs.ps1 -Help
```

#### Windows CMD
```cmd
# 交互式选择构建选项
build-docs.bat
```

## 脚本功能

### 🔄 自动化流程
1. **清理准备** - 删除旧的docs目录
2. **文件拷贝** - 将源文件拷贝到docs目录
3. **文档构建** - 执行 `python -m mkdocs build --clean`
4. **清理收尾** - 删除临时的docs目录

### 📂 拷贝的文件和目录
- **Markdown文件**：
  - `README.md`
  - `OneApp架构设计文档.md` 
  - `main_app.md`
  - `debug_tools.md`

- **文档目录**：
  - `account/` - 账户模块
  - `after_sales/` - 售后服务
  - `app_car/` - 车辆服务
  - `basic_uis/` - 基础UI组件
  - `basic_utils/` - 基础工具库
  - `car_sales/` - 汽车销售
  - `community/` - 社区功能
  - `membership/` - 会员服务
  - `service_component/` - 服务组件
  - `setting/` - 设置功能
  - `touch_point/` - 触点模块

- **资源文件**：
  - `images/` - 图片资源

### ✨ 主要特性
- ✅ **自动清理** - 构建完成后自动删除docs目录，避免重复文件
- ✅ **错误处理** - 遇到错误自动清理，防止残留文件
- ✅ **构建统计** - 显示生成的文件数量和站点大小
- ✅ **可选保留** - 使用`-KeepDocs`参数可以保留docs目录用于调试

## 输出结果

构建成功后会生成：
- `site/` 目录 - 静态HTML文档站点
- `site/index.html` - 文档首页，可直接在浏览器中打开

## Git配置

`.gitignore` 文件已配置忽略：
- `/docs` - 临时文档目录
- `/site` - 生成的静态站点 (可选择是否上传)

## 环境要求

- Windows系统
- Python 3.7+
- 已安装MkDocs Material主题：
  ```bash
  pip install mkdocs-material
  ```

## 故障排除

### 常见问题

1. **PowerShell执行策略错误**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Python或MkDocs未安装**
   ```bash
   pip install mkdocs-material
   ```

3. **文件拷贝失败**
   - 检查源文件是否存在
   - 确保没有其他程序占用文件

4. **构建失败**
   - 检查mkdocs.yml配置文件
   - 查看错误日志信息