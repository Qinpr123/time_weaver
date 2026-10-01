import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Tag, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiary } from '../contexts/DiaryContext';

const SearchPanel = ({ onClose, onSearch }) => {
  const { getFilterOptions } = useDiary();
  const [filters, setFilters] = useState({
    keyword: '',
    categories: [],
    statusIcon: '',
    location: '',
    dateRange: null
  });
  
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    statusIcons: [],
    locations: []
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const panelRef = useRef(null);
  
  // 加载筛选选项
  useEffect(() => {
    const options = getFilterOptions();
    setFilterOptions(options);
  }, [getFilterOptions]);
  
  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  // 切换分类选择
  const toggleCategory = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };
  
  // 切换状态图标
  const toggleStatus = (icon) => {
    setFilters(prev => ({
      ...prev,
      statusIcon: prev.statusIcon === icon ? '' : icon
    }));
  };
  
  // 清除所有筛选
  const clearFilters = () => {
    setFilters({
      keyword: '',
      categories: [],
      statusIcon: '',
      location: '',
      dateRange: null
    });
  };
  
  // 执行搜索
  const handleSearch = () => {
    onSearch(filters);
  };
  
  // 分类颜色映射
  const CATEGORY_COLORS = {
    '日常': '#A8A29E',
    '美食': '#C97A63',
    '旅行': '#D4A574',
    '玩乐': '#B085D6',
    '自己': '#8EA1B8',
    '朋友': '#7FB28B',
    '家人': '#9F8268',
    '宠物': '#CCAA66',
    '情侣': '#D48C8C',
    '风景': '#7FA6A8',
    '学习': '#7C8C6E',
    '工作': '#8B7355',
    '运动': '#6BA58C',
    '作品': '#B78C6C'
  };
  
  const hasActiveFilters = filters.keyword || 
    filters.categories.length > 0 || 
    filters.statusIcon || 
    filters.location ||
    filters.dateRange;
  
  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed inset-x-3 top-[3.75rem] sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 w-auto sm:w-[min(600px,calc(100vw-2rem))] bg-white rounded-lg shadow-xl border border-[#E7E5E4] overflow-hidden z-50 flex flex-col max-h-[min(90vh,calc(100dvh-5rem))]"
    >
      {/* 搜索主输入区 */}
      <div className="p-4 border-b border-[#E7E5E4] flex-shrink-0">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索日记标题或内容..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8F6F0] border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F8F6F0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6B6B6B]" />
          </button>
        </div>
        
        {/* 快速筛选标签 */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-[#D4A574] text-white'
                : 'bg-[#F8F6F0] text-[#6B6B6B] hover:bg-[#E7E5E4]'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>筛选</span>
            {hasActiveFilters && (
              <span className="ml-1 bg-white/30 px-1.5 rounded-full text-xs">
                {filters.categories.length + (filters.statusIcon ? 1 : 0) + (filters.location ? 1 : 0)}
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs text-[#6B6B6B] hover:text-[#D4A574] hover:bg-[#F8F6F0] rounded-lg transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>
      
      {/* 高级筛选面板 */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: '600px', opacity: 1 }}
            exit={{ maxHeight: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-y-auto flex-1 scrollbar-thin"
          >
            <div className="p-4 bg-[#FAFAF9] space-y-4">
              {/* 分类筛选 */}
              {filterOptions.categories.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-[#6B6B6B]" />
                    <span className="text-sm font-medium text-[#2C2C2C]">分类</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.categories.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filters.categories.includes(category)
                            ? 'bg-white shadow-md'
                            : 'bg-white/60 hover:bg-white hover:shadow-sm'
                        }`}
                        style={filters.categories.includes(category) ? {
                          backgroundColor: CATEGORY_COLORS[category] || '#A8A29E',
                          color: 'white'
                        } : {
                          border: `2px solid ${CATEGORY_COLORS[category] || '#A8A29E'}`,
                          color: CATEGORY_COLORS[category] || '#A8A29E'
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 状态图标筛选 */}
              {filterOptions.statusIcons.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#6B6B6B]" />
                    <span className="text-sm font-medium text-[#2C2C2C]">心情状态</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.statusIcons.map(icon => (
                      <button
                        key={icon}
                        onClick={() => toggleStatus(icon)}
                        className={`w-10 h-10 rounded-lg text-lg transition-all ${
                          filters.statusIcon === icon
                            ? 'bg-[#D4A574] shadow-md scale-110'
                            : 'bg-white/60 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 地点筛选 */}
              {filterOptions.locations.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#6B6B6B]" />
                    <span className="text-sm font-medium text-[#2C2C2C]">地点</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.locations.slice(0, showAllLocations ? undefined : 12).map(loc => (
                      <button
                        key={loc}
                        onClick={() => setFilters(prev => ({ ...prev, location: prev.location === loc ? '' : loc }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filters.location === loc
                            ? 'bg-[#D4A574] text-white shadow-md'
                            : 'bg-white/60 text-[#6B6B6B] hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                  {filterOptions.locations.length > 12 && (
                    <div className="mt-2">
                      <button
                        onClick={() => setShowAllLocations(!showAllLocations)}
                        className="w-full px-3 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#D4A574] hover:bg-[#F8F6F0] rounded-lg transition-colors border border-[#E7E5E4]"
                      >
                        {showAllLocations ? '收起' : `展开全部 ${filterOptions.locations.length} 个地点`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 搜索按钮 */}
      <div className="p-4 bg-white flex-shrink-0 border-t border-[#E7E5E4]">
        <button
          onClick={handleSearch}
          disabled={!hasActiveFilters}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            hasActiveFilters
              ? 'bg-[#D4A574] text-white hover:bg-[#8B7355] shadow-md hover:shadow-lg'
              : 'bg-[#E7E5E4] text-[#6B6B6B] cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Search className="w-4 h-4" />
            <span>搜索</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default SearchPanel;

