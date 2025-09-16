@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo    VSCode Markdown All in One 模板替换工具
echo ==========================================
echo.

REM 检查模板文件是否存在
if not exist "markdown-all-in-one-template.html" (
    echo ❌ 错误：找不到模板文件 markdown-all-in-one-template.html
    echo.
    echo 请确保在包含模板文件的目录中运行此脚本
    pause
    exit /b 1
)

echo 🔍 正在查找 VSCode Markdown All in One 插件...
echo.

REM 查找插件目录
set "extensions_dir=%USERPROFILE%\.vscode\extensions"
set "plugin_dir="

if exist "%extensions_dir%" (
    for /d %%i in ("%extensions_dir%\yzhang.markdown-all-in-one-*") do (
        set "plugin_dir=%%i"
        echo ✅ 找到插件目录: %%i
    )
)

if "%plugin_dir%"=="" (
    echo ❌ 错误：未找到 Markdown All in One 插件
    echo.
    echo 请确保已安装 Markdown All in One 插件 (yzhang.markdown-all-in-one)
    echo.
    echo 你可以在 VSCode 中按 Ctrl+Shift+X 打开扩展面板，搜索并安装该插件
    pause
    exit /b 1
)

set "template_file=%plugin_dir%\media\template.html"

echo.
echo 📁 模板文件路径: %template_file%
echo.

REM 检查模板文件是否存在
if not exist "%template_file%" (
    echo ❌ 错误：插件模板文件不存在
    echo.
    echo 预期路径: %template_file%
    echo.
    echo 这可能是插件版本问题，请检查插件是否正常安装
    pause
    exit /b 1
)

echo 💾 正在备份原始模板文件...
copy "%template_file%" "%template_file%.backup" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 原始模板已备份为: %template_file%.backup
) else (
    echo ⚠️  警告：无法备份原始模板文件，可能需要管理员权限
)

echo.
echo 🔄 正在替换模板文件...
copy "markdown-all-in-one-template.html" "%template_file%" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 模板文件替换成功！
    echo.
    echo 🎉 设置完成！现在你可以：
    echo.
    echo 1. 在 VSCode 中打开任何 Markdown 文件
    echo 2. 按 Ctrl+Shift+P 打开命令面板
    echo 3. 搜索 "Markdown All in One: Print current document to HTML"
    echo 4. 导出的 HTML 文件将自动支持 Mermaid 图表渲染
    echo.
    echo 📋 功能特性：
    echo   • 自动渲染 Mermaid 图表
    echo   • 支持浅色/深色主题
    echo   • 图表有美观的边框和背景
    echo   • 支持所有 Mermaid 图表类型
    echo.
    echo 🔄 如需恢复原始模板：
    echo   copy "%template_file%.backup" "%template_file%"
) else (
    echo ❌ 错误：无法替换模板文件
    echo.
    echo 这通常是权限问题，请尝试：
    echo 1. 以管理员身份运行此脚本
    echo 2. 或者手动复制文件到插件目录
    echo.
    echo 手动操作步骤：
    echo 1. 复制 markdown-all-in-one-template.html
    echo 2. 粘贴到：%plugin_dir%\media\
    echo 3. 重命名为：template.html
)

echo.
echo ==========================================
pause