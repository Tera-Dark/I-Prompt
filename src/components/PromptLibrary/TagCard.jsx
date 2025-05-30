import React from 'react';
import { Plus, Heart, Edit, Trash2 } from 'lucide-react';

/**
 * 标签卡片组件 - 在标签库中显示的可点击标签卡片
 */
const TagCard = ({ 
  tag, 
  onAdd, 
  onToggleFavorite, 
  isFavorited, 
  onEdit, 
  onDelete, 
  isEditable, 
  showManagement 
}) => {
  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onAdd(tag)}
    >
      {/* 主要内容 */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* 英文标签 */}
          <div className="font-medium text-gray-900 text-sm mb-1 truncate">
            {tag.en}
          </div>
          
          {/* 中文翻译 */}
          {tag.cn && (
            <div className="text-xs text-gray-600 mb-2 truncate">
              {tag.cn}
            </div>
          )}
          
          {/* 标签元信息 */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {/* 频率指示器 */}
            {tag.frequency && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>热度 {tag.frequency}</span>
              </div>
            )}
            
            {/* 分类标签 */}
            {tag.category && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {tag.category}
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex flex-col items-center gap-1 ml-2">
          {/* 收藏按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(tag);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorited 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            title={isFavorited ? "取消收藏" : "添加收藏"}
          >
            <Heart 
              size={14} 
              className={isFavorited ? 'fill-current' : ''} 
            />
          </button>

          {/* 管理模式下的编辑和删除按钮 */}
          {showManagement && isEditable && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tag);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="编辑标签"
              >
                <Edit size={14} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tag);
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除标签"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 悬停时显示的添加按钮 */}
      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-200">
          <Plus size={16} />
        </div>
      </div>

      {/* 标签特殊属性指示器 */}
      {tag.isNew && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
      
      {tag.isHot && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default TagCard; 