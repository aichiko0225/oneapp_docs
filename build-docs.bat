@echo off
chcp 65001 >nul
title OneApp 文档构建

echo.
echo ==============================================
echo    OneApp 文档自动构建脚本
echo ==============================================
echo.

REM 检查PowerShell是否可用
powershell -Command "Write-Host 'PowerShell 可用'" >nul 2>&1
if errorlevel 1 (
    echo 错误: PowerShell 不可用，请确保系统支持PowerShell
    pause
    exit /b 1
)

REM 获取用户选择
echo 请选择构建选项:
echo 1. 构建文档并清理docs目录 (推荐)
echo 2. 构建文档但保留docs目录
echo 3. 显示帮助信息
echo 4. 退出
echo.
set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" (
    echo.
    echo 开始构建文档...
    powershell -ExecutionPolicy Bypass -File "%~dp0build-docs.ps1"
) else if "%choice%"=="2" (
    echo.
    echo 开始构建文档 (保留docs目录)...
    powershell -ExecutionPolicy Bypass -File "%~dp0build-docs.ps1" -KeepDocs
) else if "%choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File "%~dp0build-docs.ps1" -Help
    pause
) else if "%choice%"=="4" (
    echo 退出脚本
    exit /b 0
) else (
    echo 无效选项，请重新运行脚本
    pause
    exit /b 1
)

echo.
echo 构建完成！
pause