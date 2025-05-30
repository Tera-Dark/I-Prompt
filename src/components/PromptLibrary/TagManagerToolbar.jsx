import React from 'react';
import { 
  RefreshCw, Settings, Package, Plus, Edit
} from 'lucide-react';

/**
 * 标签管理工具栏组件 - 提供标签库管理功能
 */
const TagManagerToolbar = ({
  libraryMode,
  showTagManager,
  showImportExport,
  onToggleTagManager,
  onShowImportExport,
  onShowCustomLibraryManager,
  onShowLibraryManager,
  onAddTag,
  onRefreshDatabase,
  canEdit = false
}) => {
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">管理工具</h3>
        <div className="flex items-center gap-1">
          {/* 库模式指示器 */}
          <span className={`text-xs px-2 py-1 rounded-full ${
            libraryMode === 'default' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-purple-100 text-purple-600'
          }`}>
            {libraryMode === 'default' ? '默认库' : '自定义库'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {/* 库管理系统 - 新增的主要功能 */}
        <button
          onClick={onShowLibraryManager}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium shadow-sm"
        >
          <Package size={14} />
          库管理系统
        </button>

        {/* 标签管理模式切换 */}
        <button
          onClick={onToggleTagManager}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            showTagManager
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
          }`}
        >
          <Edit size={14} />
          {showTagManager ? '退出编辑模式' : '进入编辑模式'}
        </button>

        {/* 自定义库管理（仅自定义库模式） */}
        {libraryMode === 'custom' && (
          <button
            onClick={onShowCustomLibraryManager}
            className="w-full flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm border border-purple-200"
          >
            <Settings size={14} />
            自定义库设置
          </button>
        )}

        {/* 快速操作 */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">快速操作</div>
          <div className="grid grid-cols-2 gap-2">
            {canEdit && (
              <button
                onClick={onAddTag}
                className="flex items-center gap-1 px-2 py-1.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
              >
                <Plus size={12} />
                添加标签
              </button>
            )}
            <button
              onClick={onRefreshDatabase}
              className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
            >
              <RefreshCw size={12} />
              刷新库
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">当前库状态</div>
          <div className="text-xs text-gray-600">
            {libraryMode === 'default' ? '使用默认标签库' : '使用自定义标签库'}
          </div>
        </div>
      </div>

      {/* 操作说明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-700">
          <div className="font-medium mb-1">💡 操作提示</div>
          {showTagManager ? (
            <ul className="space-y-1">
              <li>• 点击标签卡片右上角的编辑/删除按钮</li>
              <li>• 双击标签卡片快速编辑</li>
              <li>• 使用批量操作管理多个标签</li>
            </ul>
          ) : (
            <ul className="space-y-1">
              <li>• 点击标签卡片添加到提示词</li>
              <li>• 点击爱心图标收藏标签</li>
              <li>• 使用搜索框快速查找标签</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagManagerToolbar; 