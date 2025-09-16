# 替换 VSCode Markdown All in One 插件模板教程

## 方法1: 直接替换插件模板文件

### 1. 找到插件安装目录
在 Windows 上，VSCode 扩展通常安装在：
```
%USERPROFILE%\.vscode\extensions\yzhang.markdown-all-in-one-*\
```

### 2. 找到模板文件
进入插件目录，找到模板文件：
```
media/template.html
```

### 3. 备份并替换
```powershell
# 备份原始模板
copy template.html template.html.bak

# 替换为支持 Mermaid 的模板
copy "你的路径\markdown-all-in-one-template.html" template.html
```

## 方法2: 使用 VSCode 设置自定义模板

### 1. 打开 VSCode 设置
- 按 `Ctrl+,` 或者 File → Preferences → Settings

### 2. 搜索 markdown
在搜索框中输入：`markdown-preview-enhanced.printBackground`

### 3. 添加自定义模板路径
在 `settings.json` 中添加：
```json
{
    "markdown.extension.print.absoluteImgPath": true,
    "markdown.extension.print.imgToBase64": true,
    "markdown.extension.print.includeVscodeStylesheets": true,
    "markdown.extension.print.theme": "github",
    "markdown.extension.print.browserPath": "",
    "markdown.extension.print.quality": 90
}
```

## 方法3: 手动修改每个生成的HTML文件

如果你不想修改插件，可以用以下批处理脚本自动处理所有HTML文件：

### 创建批处理脚本
```batch
@echo off
setlocal enabledelayedexpansion

echo 正在为所有HTML文件添加Mermaid支持...

for %%f in (*.html) do (
    echo 处理文件: %%f
    
    REM 备份原文件
    copy "%%f" "%%f.bak" >nul
    
    REM 添加Mermaid CDN和脚本
    powershell -Command "(Get-Content '%%f') -replace '</head>', '    <script src=\"https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js\"></script>`n</head>' | Set-Content '%%f'"
    
    REM 添加初始化脚本
    powershell -Command "(Get-Content '%%f') -replace '</body>', '    <script>mermaid.initialize({startOnLoad:true,theme:\"default\"});document.addEventListener(\"DOMContentLoaded\",function(){const blocks=document.querySelectorAll(\"code.language-mermaid\");blocks.forEach((block,index)=>{const parent=block.parentElement;if(parent&&parent.tagName===\"PRE\"){const div=document.createElement(\"div\");div.className=\"mermaid\";div.textContent=block.textContent;parent.parentElement.replaceChild(div,parent);}});mermaid.run();});</script>`n</body>' | Set-Content '%%f'"
)

echo 完成！所有HTML文件已添加Mermaid支持
pause
```

## 推荐方案

**我推荐使用方法1** - 直接替换插件模板文件，这样：

✅ **一劳永逸**: 设置一次，以后所有导出的HTML都自动支持Mermaid
✅ **无需手动处理**: 不需要每次都手动修改HTML文件  
✅ **保持一致**: 所有文档的样式和功能保持一致
✅ **主题适配**: 自动适配VSCode的浅色/深色主题

## 使用说明

替换模板后，你的所有 Markdown 文件导出的 HTML 都会：

1. **自动识别** ```mermaid 代码块
2. **自动渲染** 成交互式图表
3. **主题适配** 跟随VSCode主题变化
4. **样式优化** 图表有边框和背景，更美观
5. **错误处理** 如果图表语法有问题，会在控制台显示警告

## 验证效果

替换模板后，重新导出你的 `OneApp架构设计文档.md`，应该能看到：
- 所有Mermaid图表正常显示
- 图表有漂亮的边框和背景
- 支持浅色/深色主题切换

如果有任何问题，随时告诉我！