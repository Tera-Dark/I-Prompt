import React from 'react';
import { ChevronDown, ChevronRight, Database, Heart, Folder } from 'lucide-react';

/**
 * 分类侧边栏组件 - 显示标签库的分类结构
 */
const CategorySidebar = ({
  libraryMode,
  selectedCategory,
  selectedSubcategory,
  expandedCategories,
  currentDatabase,
  favorites,
  onSelectCategory,
  onToggleCategory
}) => {
  // 获取分类统计
  const getCategoryStats = (categoryKey, category) => {
    if (categoryKey === 'favorites') {
      return favorites.length;
    }
    
    if (!category?.subcategories) return 0;
    
    return Object.values(category.subcategories).reduce((total, subcategory) => {
      return total + (subcategory?.tags?.length || 0);
    }, 0);
  };

  // 获取子分类统计
  const getSubcategoryStats = (subcategory) => {
    return subcategory?.tags?.length || 0;
  };

  // 渲染分类项
  const renderCategory = (categoryKey, category) => {
    const isExpanded = expandedCategories[categoryKey];
    const isSelected = selectedCategory === categoryKey;
    const stats = getCategoryStats(categoryKey, category);
    const hasSubcategories = category?.subcategories && Object.keys(category.subcategories).length > 0;

    // 处理分类点击 - 同时选中和智能切换展开状态
    const handleCategoryClick = () => {
      onSelectCategory(categoryKey);
      
      // 如果有子分类，智能切换展开状态
      if (hasSubcategories) {
        onToggleCategory(categoryKey);
      }
    };

    // 处理展开按钮点击 - 只切换展开状态
    const handleToggleClick = (e) => {
      e.stopPropagation();
      onToggleCategory(categoryKey);
    };

    return (
      <div key={categoryKey} className="mb-2">
        {/* 主分类 */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
            isSelected && !selectedSubcategory
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'hover:bg-gray-50 text-gray-700'
          } border ${isSelected && !selectedSubcategory ? 'border-blue-200' : 'border-transparent'}`}
          onClick={handleCategoryClick}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {hasSubcategories && (
                <button
                  onClick={handleToggleClick}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={isExpanded ? '收起子分类' : '展开子分类'}
                >
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              )}
              
              <div className="text-lg">
                {category?.icon || (categoryKey === 'favorites' ? '❤️' : '📁')}
              </div>
            </div>
            
            <div>
              <div className="font-medium text-sm">
                {category?.name || categoryKey}
              </div>
              {categoryKey === 'favorites' && (
                <div className="text-xs text-gray-500">个人收藏</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {stats}
            </span>
            {categoryKey === 'favorites' && (
              <Heart size={12} className="text-red-500" />
            )}
          </div>
        </div>

        {/* 子分类 */}
        {isExpanded && category?.subcategories && (
          <div className="ml-6 mt-2 space-y-1">
            {Object.entries(category.subcategories).map(([subKey, subcategory]) => {
              const isSubSelected = selectedCategory === categoryKey && selectedSubcategory === subKey;
              const subStats = getSubcategoryStats(subcategory);
              
              return (
                <div
                  key={subKey}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    isSubSelected
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'hover:bg-gray-50 text-gray-600'
                  } border ${isSubSelected ? 'border-blue-200' : 'border-transparent'}`}
                  onClick={() => onSelectCategory(categoryKey, subKey)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {subcategory?.name || subKey}
                    </span>
                  </div>
                  
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {subStats}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!currentDatabase) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Database size={48} className="mx-auto mb-2 opacity-50" />
        <p>暂无分类</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">标签分类</h3>
        <span className="text-xs text-gray-500">
          {libraryMode === 'default' ? '默认库' : '自定义库'}
        </span>
      </div>

      {/* 收藏分类 - 特殊处理 */}
      {renderCategory('favorites', {
        name: '我的收藏',
        icon: '❤️',
        subcategories: libraryMode === 'default' && currentDatabase?.favorites?.subcategories
          ? currentDatabase.favorites.subcategories
          : {
              personal: {
                name: '个人收藏',
                tags: favorites
              }
            }
      })}

      {/* 其他分类 */}
      {Object.entries(currentDatabase).map(([categoryKey, category]) => {
        if (categoryKey === 'favorites') return null;
        return renderCategory(categoryKey, category);
      })}

      {Object.keys(currentDatabase).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Folder size={48} className="mx-auto mb-2 opacity-50" />
          <p>暂无分类</p>
          <p className="text-sm">点击上方按钮添加分类</p>
        </div>
      )}
    </div>
  );
};

export default CategorySidebar; 