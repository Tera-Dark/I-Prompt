#!/usr/bin/env python3
"""
WD-Tagger 后端启动脚本
自动检查依赖并启动服务
"""

import subprocess
import sys
import os
import importlib.util

def check_package(package_name):
    """检查包是否已安装"""
    spec = importlib.util.find_spec(package_name)
    return spec is not None

def install_requirements():
    """安装依赖"""
    print("🔧 正在安装Python依赖...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ 依赖安装完成")
        return True
    except subprocess.CalledProcessError:
        print("❌ 依赖安装失败")
        return False

def main():
    print("🚀 WD-Tagger 后端启动器")
    print("=" * 50)
    
    # 检查主要依赖
    required_packages = ['flask', 'flask_cors', 'gradio_client']
    missing_packages = []
    
    for package in required_packages:
        package_check = package.replace('_', '-')
        if not check_package(package):
            missing_packages.append(package_check)
    
    if missing_packages:
        print(f"⚠️ 缺少依赖: {', '.join(missing_packages)}")
        print("📦 正在自动安装依赖...")
        
        if not install_requirements():
            print("❌ 无法自动安装依赖，请手动运行:")
            print("   pip install -r requirements.txt")
            return False
    else:
        print("✅ 所有依赖已就绪")
    
    # 检查server.py是否存在
    if not os.path.exists('server.py'):
        print("❌ 找不到 server.py 文件")
        return False
    
    print("🌐 启动WD-Tagger后端服务...")
    print("📍 服务地址: http://localhost:5000")
    print("🔄 启动中，请稍候...")
    print("-" * 50)
    
    try:
        # 启动Flask服务器
        subprocess.run([sys.executable, "server.py"])
    except KeyboardInterrupt:
        print("\n🛑 服务已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main() 