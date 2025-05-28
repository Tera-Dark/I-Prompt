#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基于translators库的翻译服务
支持多种翻译引擎：Google、Baidu、Alibaba、Youdao等
"""

import translators as ts
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 支持的翻译引擎配置
TRANSLATORS = {
    'google': {
        'name': 'Google翻译',
        'func': ts.google,
        'description': '支持134种语言，质量高，国内可能不稳定',
        'status': 'stable'
    },
    'baidu': {
        'name': '百度翻译',
        'func': ts.baidu,
        'description': '支持201种语言，支持专业领域，中文效果好',
        'status': 'stable'
    },
    'alibaba': {
        'name': '阿里翻译',
        'func': ts.alibaba,
        'description': '支持221种语言，支持专业领域',
        'status': 'stable'
    },
    'youdao': {
        'name': '有道翻译',
        'func': ts.youdao,
        'description': '支持114种语言，中文翻译质量高',
        'status': 'stable'
    },
    'bing': {
        'name': '必应翻译',
        'func': ts.bing,
        'description': '支持128种语言，微软出品',
        'status': 'stable'
    },
    'sogou': {
        'name': '搜狗翻译',
        'func': ts.sogou,
        'description': '支持65种语言，搜狗出品',
        'status': 'stable'
    },
    'tencent': {
        'name': '腾讯翻译',
        'func': ts.tencent,
        'description': '支持89种语言，腾讯出品',
        'status': 'stable'
    },
    'deepl': {
        'name': 'DeepL翻译',
        'func': ts.deepl,
        'description': '支持33种语言，质量极高',
        'status': 'premium'
    }
}

@app.route('/api/translators', methods=['GET'])
def get_translators():
    """获取支持的翻译引擎列表"""
    return jsonify({
        'success': True,
        'data': {
            key: {
                'name': info['name'],
                'description': info['description'],
                'status': info['status']
            }
            for key, info in TRANSLATORS.items()
        }
    })

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """翻译文本"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        target_lang = data.get('target_lang', 'zh')
        source_lang = data.get('source_lang', 'auto')
        translator = data.get('translator', 'google')
        
        if not text:
            return jsonify({
                'success': False,
                'error': '文本内容不能为空'
            })
        
        if translator not in TRANSLATORS:
            return jsonify({
                'success': False,
                'error': f'不支持的翻译引擎: {translator}'
            })
        
        # 执行翻译
        translate_func = TRANSLATORS[translator]['func']
        
        # 处理语言代码
        if source_lang == 'auto':
            result = translate_func(text, to_language=target_lang)
        else:
            result = translate_func(text, from_language=source_lang, to_language=target_lang)
        
        return jsonify({
            'success': True,
            'data': {
                'original_text': text,
                'translated_text': result,
                'source_lang': source_lang,
                'target_lang': target_lang,
                'translator': translator,
                'translator_name': TRANSLATORS[translator]['name']
            }
        })
        
    except Exception as e:
        logger.error(f"翻译失败: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'翻译失败: {str(e)}'
        })

@app.route('/api/test_translator', methods=['POST'])
def test_translator():
    """测试翻译引擎是否可用"""
    try:
        data = request.get_json()
        translator = data.get('translator', 'google')
        
        if translator not in TRANSLATORS:
            return jsonify({
                'success': False,
                'error': f'不支持的翻译引擎: {translator}'
            })
        
        # 使用简单的测试文本
        test_text = "hello"
        translate_func = TRANSLATORS[translator]['func']
        
        start_time = time.time()
        result = translate_func(test_text, to_language='zh')
        end_time = time.time()
        
        response_time = round((end_time - start_time) * 1000, 2)  # 毫秒
        
        return jsonify({
            'success': True,
            'data': {
                'translator': translator,
                'translator_name': TRANSLATORS[translator]['name'],
                'test_text': test_text,
                'translated_text': result,
                'response_time': response_time,
                'status': 'available'
            }
        })
        
    except Exception as e:
        logger.error(f"测试翻译引擎失败: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'测试失败: {str(e)}',
            'data': {
                'translator': translator,
                'translator_name': TRANSLATORS.get(translator, {}).get('name', '未知'),
                'status': 'unavailable'
            }
        })

@app.route('/api/batch_translate', methods=['POST'])
def batch_translate():
    """批量翻译"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        target_lang = data.get('target_lang', 'zh')
        source_lang = data.get('source_lang', 'auto')
        translator = data.get('translator', 'google')
        
        if not texts:
            return jsonify({
                'success': False,
                'error': '文本列表不能为空'
            })
        
        if translator not in TRANSLATORS:
            return jsonify({
                'success': False,
                'error': f'不支持的翻译引擎: {translator}'
            })
        
        translate_func = TRANSLATORS[translator]['func']
        results = []
        
        for text in texts:
            try:
                if source_lang == 'auto':
                    result = translate_func(text.strip(), to_language=target_lang)
                else:
                    result = translate_func(text.strip(), from_language=source_lang, to_language=target_lang)
                
                results.append({
                    'original': text.strip(),
                    'translated': result,
                    'success': True
                })
                
                # 添加延迟避免频率限制
                time.sleep(0.1)
                
            except Exception as e:
                logger.error(f"翻译单个文本失败: {text} - {str(e)}")
                results.append({
                    'original': text.strip(),
                    'translated': text.strip(),  # 翻译失败时保持原文
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'data': {
                'results': results,
                'total': len(texts),
                'success_count': sum(1 for r in results if r['success']),
                'translator': translator,
                'translator_name': TRANSLATORS[translator]['name']
            }
        })
        
    except Exception as e:
        logger.error(f"批量翻译失败: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'批量翻译失败: {str(e)}'
        })

if __name__ == '__main__':
    print("启动翻译服务...")
    print("支持的翻译引擎:")
    for key, info in TRANSLATORS.items():
        print(f"  - {key}: {info['name']} ({info['description']})")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 