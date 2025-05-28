@echo off
chcp 65001
echo =======================================
echo    启动I-Prompt翻译服务
echo =======================================

cd /d "%~dp0"

echo 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Python环境，请先安装Python 3.7+
    pause
    exit /b 1
)

echo.
echo 检查依赖包...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo 错误: 安装依赖包失败
    pause
    exit /b 1
)

echo.
echo =======================================
echo    启动翻译服务 (http://localhost:5000)
echo =======================================
echo 按 Ctrl+C 停止服务
echo.

python translation_service.py

pause 