"""
WD-Tagger 图像反推 Python 后端服务器
基于 Gradio Client 的稳定实现
支持Vercel无服务器部署
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import io
import base64
import os
import json
import tempfile
from gradio_client import Client, handle_file

app = Flask(__name__)
CORS(app, origins=["*"], supports_credentials=False, allow_headers=["*"], methods=["GET", "POST", "OPTIONS"])

# 全局客户端实例（复用连接）
_gradio_client = None

def get_gradio_client():
    """获取或创建Gradio客户端（全局复用）"""
    global _gradio_client
    if _gradio_client is None:
        try:
            print("正在连接到WD Tagger...")
            # 增加超时时间，适应Vercel环境
            _gradio_client = Client("SmilingWolf/wd-tagger", timeout=60)
            print("WD Tagger客户端连接成功")
        except Exception as e:
            print(f"连接WD Tagger失败: {str(e)}")
            # 在健康检查时不抛出异常，允许延迟初始化
            _gradio_client = None
            return None
    return _gradio_client

class WDTaggerProxy:
    def __init__(self):
        self.models = [
            "SmilingWolf/wd-swinv2-tagger-v3",
            "SmilingWolf/wd-convnext-tagger-v3", 
            "SmilingWolf/wd-vit-tagger-v3",
            "SmilingWolf/wd-vit-large-tagger-v3",
            "SmilingWolf/wd-eva02-large-tagger-v3"
        ]
        self.default_model = "SmilingWolf/wd-swinv2-tagger-v3"

    def analyze_image(self, image_file, model_repo=None, general_thresh=0.35, general_mcut_enabled=False, character_thresh=0.85, character_mcut_enabled=False):
        """
        使用官方Gradio客户端调用WD Tagger API分析图像
        """
        try:
            print(f"开始处理图像文件: {image_file.filename}")
            print(f"文件大小: {len(image_file.read())} bytes")
            image_file.seek(0)  # 重置文件指针
            
            # 创建临时文件保存上传的图像
            with tempfile.NamedTemporaryFile(delete=False, suffix=self.get_file_extension(image_file.filename)) as tmp_file:
                tmp_file.write(image_file.read())
                tmp_file_path = tmp_file.name
                print(f"临时文件路径: {tmp_file_path}")
            
            try:
                # 获取Gradio客户端
                client = get_gradio_client()
                
                print("正在调用WD Tagger API...")
                print(f"使用模型: {model_repo or self.default_model}")
                
                # 按照官方文档调用API
                result = client.predict(
                    image=handle_file(tmp_file_path),  # 使用临时文件路径
                    model_repo=model_repo or self.default_model,     # 模型选择
                    general_thresh=general_thresh,               # 一般标签阈值
                    general_mcut_enabled=general_mcut_enabled,        # MCut阈值
                    character_thresh=character_thresh,             # 角色标签阈值  
                    character_mcut_enabled=character_mcut_enabled,      # MCut阈值
                    api_name="/predict"
                )
                
                print("WD Tagger API调用成功")
                print(f"返回结果类型: {type(result)}")
                print(f"返回结果长度: {len(result) if hasattr(result, '__len__') else 'N/A'}")
                
                # 解析结果
                parsed_result = self.parse_gradio_result(result)
                return parsed_result
                
            finally:
                # 清理临时文件
                try:
                    os.unlink(tmp_file_path)
                    print("临时文件已清理")
                except Exception as e:
                    print(f"清理临时文件失败: {str(e)}")
                
        except Exception as e:
            print(f"调用WD Tagger API时出错: {str(e)}")
            raise e

    def get_file_extension(self, filename):
        """获取文件扩展名"""
        if '.' in filename:
            return '.' + filename.rsplit('.', 1)[1].lower()
        return '.jpg'  # 默认扩展名

    def parse_gradio_result(self, result):
        """
        解析Gradio API返回的结果
        根据官方文档，返回的是tuple of 4 elements:
        [0] str - Output (string)
        [1] dict - Rating 
        [2] dict - Characters
        [3] dict - Tags
        """
        try:
            print("开始解析API返回结果...")
            
            if not result or len(result) < 4:
                print(f"API返回结果格式不正确: {result}")
                raise Exception("API返回结果格式不正确")
            
            # 解析各部分结果
            output_string = result[0] if len(result) > 0 else ""
            rating_data = result[1] if len(result) > 1 else {}
            character_data = result[2] if len(result) > 2 else {}
            tags_data = result[3] if len(result) > 3 else {}
            
            print(f"输出字符串: {output_string[:200]}...")
            print(f"评级数据: {rating_data}")
            print(f"角色数据: {character_data}")
            print(f"标签数据类型: {type(tags_data)}")
            
            # 解析标签数据
            parsed_tags = self.parse_tags_data(tags_data)
            
            # 解析角色数据
            parsed_characters = self.parse_character_data(character_data)
            
            # 合并结果
            final_result = {
                'general': parsed_tags,
                'character': parsed_characters,
                'copyright': [],  # 从一般标签中提取
                'artist': [],     # 从一般标签中提取  
                'meta': [],       # 从一般标签中提取
                'rating': rating_data,
                'raw_output': output_string
            }
            
            # 进一步分类标签
            final_result = self.categorize_tags(final_result)
            
            print(f"解析完成，一般标签数量: {len(final_result['general'])}")
            print(f"角色标签数量: {len(final_result['character'])}")
            
            return final_result
            
        except Exception as e:
            print(f"解析API结果时出错: {str(e)}")
            print(f"原始结果: {result}")
            raise e

    def parse_tags_data(self, tags_data):
        """解析标签数据"""
        tags = []
        try:
            if isinstance(tags_data, dict) and 'confidences' in tags_data:
                for conf_item in tags_data['confidences']:
                    if isinstance(conf_item, dict) and 'label' in conf_item and 'confidence' in conf_item:
                        tags.append({
                            'tag': str(conf_item['label']),
                            'confidence': float(conf_item['confidence'])
                        })
            elif isinstance(tags_data, dict) and 'label' in tags_data:
                # 单个标签的情况
                tags.append({
                    'tag': str(tags_data['label']),
                    'confidence': 1.0
                })
        except Exception as e:
            print(f"解析标签数据时出错: {str(e)}")
        
        return tags

    def parse_character_data(self, character_data):
        """解析角色数据"""
        characters = []
        try:
            if isinstance(character_data, dict) and 'confidences' in character_data:
                for conf_item in character_data['confidences']:
                    if isinstance(conf_item, dict) and 'label' in conf_item and 'confidence' in conf_item:
                        characters.append({
                            'tag': str(conf_item['label']),
                            'confidence': float(conf_item['confidence'])
                        })
            elif isinstance(character_data, dict) and 'label' in character_data:
                # 单个角色的情况
                characters.append({
                    'tag': str(character_data['label']),
                    'confidence': 1.0
                })
        except Exception as e:
            print(f"解析角色数据时出错: {str(e)}")
        
        return characters

    def categorize_tags(self, result):
        """
        将一般标签进一步分类到版权、艺术家、元数据等类别
        """
        try:
            general_tags = result['general']
            copyright_tags = []
            artist_tags = []
            meta_tags = []
            filtered_general = []
            
            # 定义一些常见的分类关键词
            copyright_keywords = ['series', 'game', 'anime', 'manga', 'original']
            artist_keywords = ['artist', 'drawn by', 'by ', 'creator']
            meta_keywords = ['highres', 'absurdres', 'lowres', 'official art', 'scan', 'traditional media']
            
            for tag_item in general_tags:
                tag = tag_item['tag'].lower()
                
                # 检查是否为版权标签
                if any(keyword in tag for keyword in copyright_keywords):
                    copyright_tags.append(tag_item)
                # 检查是否为艺术家标签
                elif any(keyword in tag for keyword in artist_keywords):
                    artist_tags.append(tag_item)
                # 检查是否为元数据标签
                elif any(keyword in tag for keyword in meta_keywords):
                    meta_tags.append(tag_item)
                else:
                    filtered_general.append(tag_item)
            
            result['general'] = filtered_general
            result['copyright'].extend(copyright_tags)
            result['artist'].extend(artist_tags)
            result['meta'].extend(meta_tags)
            
        except Exception as e:
            print(f"分类标签时出错: {str(e)}")
        
        return result

# 实例化代理
wd_tagger_proxy = WDTaggerProxy()

@app.route('/api/wd-tagger', methods=['POST'])
def analyze_image():
    """
    图像分析API端点
    """
    try:
        print("收到图像分析请求")
        
        # 检查是否有文件上传
        if 'image' not in request.files:
            print("错误: 没有上传图片文件")
            return jsonify({'error': '没有上传图片文件'}), 400
        
        file = request.files['image']
        if file.filename == '':
            print("错误: 没有选择文件")
            return jsonify({'error': '没有选择文件'}), 400
        
        # 验证文件类型
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if file.content_type not in allowed_types:
            print(f"错误: 不支持的文件类型 {file.content_type}")
            return jsonify({'error': f'不支持的文件类型: {file.content_type}'}), 400
        
        # 获取参数（按照测试模块的参数名称）
        model_repo = request.form.get('model_repo', 'SmilingWolf/wd-swinv2-tagger-v3')
        general_thresh = float(request.form.get('general_thresh', 0.35))
        general_mcut_enabled = request.form.get('general_mcut_enabled', 'false').lower() == 'true'
        character_thresh = float(request.form.get('character_thresh', 0.85))
        character_mcut_enabled = request.form.get('character_mcut_enabled', 'false').lower() == 'true'
        
        print(f"开始分析图像: {file.filename}, 类型: {file.content_type}")
        print(f"使用模型: {model_repo}")
        print(f"参数: general_thresh={general_thresh}, character_thresh={character_thresh}")
        print(f"MCut: general={general_mcut_enabled}, character={character_mcut_enabled}")
        
        # 调用WD Tagger分析
        result = wd_tagger_proxy.analyze_image(
            file, 
            model_repo=model_repo,
            general_thresh=general_thresh,
            general_mcut_enabled=general_mcut_enabled,
            character_thresh=character_thresh,
            character_mcut_enabled=character_mcut_enabled
        )
        
        print("图像分析完成，返回结果")
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        error_msg = f"处理请求时出错: {str(e)}"
        print(error_msg)
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    健康检查端点 - 快速响应，不检查Gradio连接
    """
    try:
        # 简单检查，不尝试连接Gradio（避免冷启动延迟）
        global _gradio_client
        gradio_status = 'ready' if _gradio_client is not None else 'initializing'
        
        return jsonify({
            'status': 'healthy',
            'service': 'WD Tagger Proxy',
            'version': '2.0.0',
            'gradio_client': gradio_status,
            'deployment': 'vercel',
            'timestamp': os.environ.get('VERCEL_DEPLOYMENT_ID', 'local')
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.errorhandler(413)
def too_large(e):
    """
    处理文件过大错误
    """
    return jsonify({'error': '文件太大，请选择小于10MB的图片'}), 413

@app.errorhandler(500)
def internal_error(e):
    """
    处理服务器内部错误
    """
    return jsonify({'error': '服务器内部错误'}), 500

# 配置文件上传大小限制
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# 为Vercel导出app - 这是关键！
app = app

# 添加OPTIONS处理，确保CORS预检请求正常
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

# Vercel需要的handler函数  
def handler(event, context):
    """Vercel无服务器函数处理器"""
    return app(event, context)

if __name__ == '__main__':
    # 本地开发模式
    print("WD Tagger 代理服务器启动中...")
    print("使用官方Gradio客户端进行API调用")
    print("访问地址: http://localhost:5000")
    print("API文档:")
    print("  POST /api/wd-tagger - 分析图像")
    print("  GET  /api/health    - 健康检查")
    print("支持的模型:")
    proxy = WDTaggerProxy()
    for model in proxy.models:
        print(f"  - {model}")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port) 