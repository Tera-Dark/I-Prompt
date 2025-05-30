# 🚀 Vercel部署指南

## 快速部署Python后端到Vercel

### 1. 准备工作
确保你的项目中有以下文件：
- ✅ `server.py` - Python Flask后端
- ✅ `requirements.txt` - Python依赖
- ✅ `vercel.json` - Vercel配置

### 2. 一键部署步骤

#### 方法1：使用Vercel CLI (推荐)
```bash
# 安装Vercel CLI
npm i -g vercel

# 在项目根目录运行
vercel

# 按照提示完成部署
```

#### 方法2：通过GitHub连接
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的GitHub仓库
4. 点击 "Deploy"

### 3. 部署完成后
部署成功后，你会得到一个URL，比如：
```
https://i-prompt-xxxxx.vercel.app
```

### 4. 更新前端配置
编辑 `src/services/imageTaggingService.js`：
```javascript
localApiUrl: process.env.NODE_ENV === 'production' 
  ? 'https://你的vercel域名.vercel.app/api'  // 替换为你的URL
  : 'http://localhost:5000/api',
```

### 5. 测试API
访问：`https://你的vercel域名.vercel.app/api/health`
应该返回：
```json
{
  "status": "healthy",
  "service": "WD Tagger Proxy",
  "version": "2.0.0",
  "gradio_client": "enabled",
  "deployment": "vercel"
}
```

## 🔧 故障排除

### 常见问题

#### 1. 部署失败
- 检查 `requirements.txt` 是否包含所有依赖
- 确保Python版本兼容（推荐3.8+）

#### 2. 函数超时
- Vercel免费版有10秒执行限制
- 首次调用可能需要冷启动时间

#### 3. 依赖安装失败
确保 `requirements.txt` 格式正确：
```
flask==2.3.3
flask-cors==4.0.0
gradio-client==0.8.1
requests==2.31.0
```

## 🌟 部署成功！
现在你的图像反推功能可以在GitHub Pages上正常运行了！ 