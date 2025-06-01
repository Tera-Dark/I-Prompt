"""
WD-Tagger 图像反推 Python 后端服务器
基于 Gradio Client 的稳定实现
支持Vercel无服务器部署
"""

from flask import Flask, request, jsonify
import os
import json
import tempfile

app = Flask(__name__)

# CORS支持
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
    response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'WD Tagger Proxy',
        'message': 'Server is running',
        'version': '2.1.0',
        'deployment': 'vercel'
    })

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'WD Tagger API Server',
        'endpoints': ['/api/health', '/api/wd-tagger']
    })

@app.route('/api/wd-tagger', methods=['POST'])
def analyze_image():
    """
    临时的图像分析端点 - 返回测试数据
    在确认基础功能正常后，我们会添加真正的Gradio客户端
    """
    try:
        # 检查文件上传
        if 'image' not in request.files:
            return jsonify({'error': '没有上传图片文件'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400
        
        # 验证文件类型
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if file.content_type not in allowed_types:
            return jsonify({'error': f'不支持的文件类型: {file.content_type}'}), 400
        
        # 返回测试数据（稍后替换为真实的Gradio调用）
        return jsonify({
            'success': True,
            'data': {
                'general': [
                    {'tag': 'test_tag', 'confidence': 0.95, 'category': 'general'},
                    {'tag': 'anime_style', 'confidence': 0.87, 'category': 'general'}
                ],
                'character': [],
                'copyright': [],
                'artist': [],
                'meta': [],
                'rating': {'safe': 0.9}
            },
            'message': '测试响应 - Gradio功能即将添加',
            'filename': file.filename,
            'content_type': file.content_type
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 错误处理
@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': '文件太大，请选择小于10MB的图片'}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': '服务器内部错误'}), 500

# 配置
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port) 