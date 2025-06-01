"""
WD-Tagger 图像反推 Python 后端服务器
基于 Gradio Client 的稳定实现
支持Vercel无服务器部署
"""

from flask import Flask, request, jsonify
import os
import json
import tempfile
from gradio_client import Client, handle_file

app = Flask(__name__)

# 全局Gradio客户端（延迟初始化）
_gradio_client = None

def get_gradio_client():
    """获取或创建Gradio客户端"""
    global _gradio_client
    if _gradio_client is None:
        try:
            print("正在连接到WD Tagger...")
            _gradio_client = Client("SmilingWolf/wd-tagger", timeout=60)
            print("WD Tagger客户端连接成功")
        except Exception as e:
            print(f"连接WD Tagger失败: {str(e)}")
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
        """使用Gradio客户端调用WD Tagger API"""
        try:
            print(f"开始处理图像文件: {image_file.filename}")
            print(f"文件大小: {len(image_file.read())} bytes")
            image_file.seek(0)  # 重置文件指针
            
            # 创建临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix=self.get_file_extension(image_file.filename)) as tmp_file:
                tmp_file.write(image_file.read())
                tmp_file_path = tmp_file.name
                print(f"临时文件路径: {tmp_file_path}")
            
            try:
                # 获取Gradio客户端
                client = get_gradio_client()
                if client is None:
                    raise Exception("Gradio客户端初始化失败")
                
                print("正在调用WD Tagger API...")
                print(f"使用模型: {model_repo or self.default_model}")
                
                # 调用Gradio API
                result = client.predict(
                    image=handle_file(tmp_file_path),
                    model_repo=model_repo or self.default_model,
                    general_thresh=general_thresh,
                    general_mcut_enabled=general_mcut_enabled,
                    character_thresh=character_thresh,
                    character_mcut_enabled=character_mcut_enabled,
                    api_name="/predict"
                )
                
                print("WD Tagger API调用成功")
                
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
        return '.jpg'

    def parse_gradio_result(self, result):
        """解析Gradio API返回结果"""
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
            
            print(f"评级数据: {rating_data}")
            print(f"角色数据: {character_data}")
            print(f"标签数据类型: {type(tags_data)}")
            
            # 解析标签和角色数据
            parsed_tags = self.parse_tags_data(tags_data)
            parsed_characters = self.parse_character_data(character_data)
            
            # 构建最终结果
            final_result = {
                'general': parsed_tags,
                'character': parsed_characters,
                'copyright': [],
                'artist': [],
                'meta': [],
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
        except Exception as e:
            print(f"解析角色数据时出错: {str(e)}")
        return characters

    def categorize_tags(self, result):
        """将标签进一步分类"""
        try:
            general_tags = result['general']
            copyright_tags = []
            artist_tags = []
            meta_tags = []
            filtered_general = []
            
            # 分类关键词
            copyright_keywords = ['series', 'game', 'anime', 'manga', 'original']
            artist_keywords = ['artist', 'drawn by', 'by ', 'creator']
            meta_keywords = ['highres', 'absurdres', 'lowres', 'official art', 'scan']
            
            for tag_item in general_tags:
                tag = tag_item['tag'].lower()
                
                if any(keyword in tag for keyword in copyright_keywords):
                    copyright_tags.append(tag_item)
                elif any(keyword in tag for keyword in artist_keywords):
                    artist_tags.append(tag_item)
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
        'version': '3.0.0',
        'deployment': 'vercel',
        'gradio_client': 'ready' if _gradio_client else 'initializing'
    })

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'WD Tagger API Server',
        'endpoints': ['/api/health', '/api/wd-tagger'],
        'version': '3.0.0'
    })

@app.route('/api/wd-tagger', methods=['POST'])
def analyze_image():
    """图像分析API端点 - 正式版本"""
    try:
        print("收到图像分析请求")
        
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
        
        # 获取参数
        model_repo = request.form.get('model_repo', 'SmilingWolf/wd-swinv2-tagger-v3')
        general_thresh = float(request.form.get('general_thresh', 0.35))
        general_mcut_enabled = request.form.get('general_mcut_enabled', 'false').lower() == 'true'
        character_thresh = float(request.form.get('character_thresh', 0.85))
        character_mcut_enabled = request.form.get('character_mcut_enabled', 'false').lower() == 'true'
        
        print(f"开始分析图像: {file.filename}")
        print(f"使用模型: {model_repo}")
        
        # 调用真正的WD Tagger分析
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