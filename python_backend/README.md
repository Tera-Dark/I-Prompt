# I-Prompt 翻译服务

基于 [translators](https://github.com/UlionTse/translators) 库的多引擎翻译服务，为 I-Prompt 项目提供强大的翻译功能。

## 功能特性

### 支持的翻译引擎
- **Google翻译** - 支持134种语言，质量高
- **百度翻译** - 支持201种语言，支持专业领域，中文效果好
- **阿里翻译** - 支持221种语言，支持专业领域
- **有道翻译** - 支持114种语言，中文翻译质量高
- **必应翻译** - 支持128种语言，微软出品
- **搜狗翻译** - 支持65种语言，搜狗出品
- **腾讯翻译** - 支持89种语言，腾讯出品
- **DeepL翻译** - 支持33种语言，质量极高

### 主要功能
- 🔄 **多引擎支持**: 支持8种主流翻译引擎
- 🚀 **批量翻译**: 支持同时翻译多个文本
- 🔍 **引擎测试**: 实时测试翻译引擎可用性
- 📊 **状态监控**: 实时监控翻译引擎状态
- 🛡️ **错误处理**: 完善的错误处理和降级机制
- 🎯 **专业优化**: 针对AI绘画提示词优化

## 快速开始

### 1. 环境要求
- Python 3.7+
- 网络连接

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 启动服务

#### Windows用户
双击 `start_translation_service.bat` 启动

#### 命令行启动
```bash
python translation_service.py
```

### 4. 访问服务
服务启动后访问: http://localhost:5000

## API接口

### 获取翻译引擎列表
```http
GET /api/translators
```

### 翻译文本
```http
POST /api/translate
Content-Type: application/json

{
  "text": "hello world",
  "translator": "google",
  "target_lang": "zh",
  "source_lang": "auto"
}
```

### 批量翻译
```http
POST /api/batch_translate
Content-Type: application/json

{
  "texts": ["hello", "world"],
  "translator": "google",
  "target_lang": "zh",
  "source_lang": "auto"
}
```

### 测试翻译引擎
```http
POST /api/test_translator
Content-Type: application/json

{
  "translator": "google"
}
```

## 配置说明

### 翻译引擎配置
在 `translation_service.py` 中的 `TRANSLATORS` 字典配置：

```python
TRANSLATORS = {
    'google': {
        'name': 'Google翻译',
        'func': ts.google,
        'description': '支持134种语言，质量高',
        'status': 'stable'
    },
    # ... 其他引擎
}
```

### 语言代码
- `zh`: 中文简体
- `en`: 英文
- `ja`: 日文
- `ko`: 韩文
- `auto`: 自动检测

## 故障排除

### 常见问题

#### 1. 翻译引擎不可用
**原因**: 网络问题或引擎限制
**解决**: 
- 检查网络连接
- 切换其他翻译引擎
- 等待一段时间后重试

#### 2. 翻译速度慢
**原因**: 网络延迟或引擎限速
**解决**:
- 使用国内翻译引擎（百度、阿里、腾讯）
- 减少批量翻译的文本数量

#### 3. 翻译质量不佳
**原因**: 引擎特性或文本复杂
**解决**:
- 尝试不同翻译引擎
- DeepL通常质量最高
- Google和百度适合中英互译

### 日志查看
服务运行时会在控制台显示详细日志，包括：
- 翻译请求
- 错误信息
- 性能统计

## 开发说明

### 添加新翻译引擎
1. 在 `TRANSLATORS` 字典中添加配置
2. 确保 translators 库支持该引擎
3. 测试引擎可用性

### 自定义配置
- 修改端口: 在 `app.run()` 中设置
- 添加认证: 使用 Flask 中间件
- 缓存翻译: 集成 Redis 或内存缓存

## 许可证
基于 GPL-3.0 许可证开源

## 致谢
- [translators](https://github.com/UlionTse/translators) - 核心翻译库
- [Flask](https://flask.palletsprojects.com/) - Web框架 