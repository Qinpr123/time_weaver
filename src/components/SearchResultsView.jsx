import React from 'react';
import { Search, X, Calendar, MapPin, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const SearchResultsView = ({ results, filters, onClose, onClearFilters }) => {
  const navigate = useNavigate();
  
  // Helper: 从媒体对象或字符串中提取 URL
  const getMediaUrl = (media) => {
    if (!media) return null;
    if (typeof media === 'object' && media !== null) {
      return media.thumbnail || media.url;
    }
    return media;
  };
  
  // 获取封面图片
  const getCoverImage = (diary) => {
    if (!diary || !diary.blocks || diary.blocks.length === 0) {
      return null;
    }
    
    if (diary.cover) {
      return getMediaUrl(diary.cover);
    }
    
    for (const block of diary.blocks) {
      if (block.cover) {
        return getMediaUrl(block.cover);
      }
      if (block.media && block.media.length > 0) {
        return getMediaUrl(block.media[0]);
      }
    }
    
    return null;
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
  
  // 获取摘要（前100字）
  const getSummary = (diary) => {
    const firstBlock = diary.blocks?.[0];
    if (!firstBlock) return '';
    const content = firstBlock.content || '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };
  
  // 格式化日期
  const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'yyyy年MM月dd日 EEEE', { locale: zhCN });
  };
  
  const handleDiaryClick = (diary) => {
    navigate(`/dayview/${diary.date}`);
    onClose();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜索结果头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">
                搜索结果
              </h2>
              <p className="text-[#6B6B6B] text-sm">
                找到 {results.length} 篇日记
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              onClearFilters();
              onClose();
            }}
            className="flex items-center space-x-2 px-4 py-2 text-[#6B6B6B] hover:text-[#D4A574] transition-colors"
          >
            <X className="w-5 h-5" />
            <span>关闭搜索</span>
          </button>
        </div>
        
        {/* 已应用筛选标签 */}
        {(filters.keyword || filters.categories.length > 0 || filters.statusIcon || filters.location) && (
          <div className="flex items-center space-x-2 flex-wrap gap-2 mb-4">
            <span className="text-sm text-[#6B6B6B]">筛选条件：</span>
            {filters.keyword && (
              <span className="px-3 py-1 bg-[#F8F6F0] text-[#2C2C2C] rounded-full text-sm border border-[#E7E5E4]">
                "{filters.keyword}"
              </span>
            )}
            {filters.categories.map(cat => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: CATEGORY_COLORS[cat] || '#A8A29E' }}
              >
                {cat}
              </span>
            ))}
            {filters.statusIcon && (
              <span className="px-3 py-1 bg-[#F8F6F0] text-[#2C2C2C] rounded-full text-sm border border-[#E7E5E4]">
                {filters.statusIcon}
              </span>
            )}
            {filters.location && (
              <span className="px-3 py-1 bg-[#F8F6F0] text-[#2C2C2C] rounded-full text-sm border border-[#E7E5E4] flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{filters.location}</span>
              </span>
            )}
          </div>
        )}
      </motion.div>
      
      {/* 结果列表 */}
      {results.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-[#F8F6F0] rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-[#6B6B6B]" />
          </div>
          <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">没有找到匹配的日记</h3>
          <p className="text-[#6B6B6B] mb-6">试试调整筛选条件或搜索关键词</p>
          <button
            onClick={() => {
              onClearFilters();
              onClose();
            }}
            className="px-6 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#8B7355] transition-colors"
          >
            清除筛选
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((diary, index) => {
            const coverImage = getCoverImage(diary);
            const summary = getSummary(diary);
            
            return (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDiaryClick(diary)}
                className="bg-white rounded-lg shadow-md border border-[#E7E5E4] overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 group"
              >
                {/* 封面图 */}
                {coverImage && (
                  <div className="relative w-full h-48 overflow-hidden bg-[#F8F6F0]">
                    <img
                      src={coverImage}
                      alt={diary.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/20 to-transparent"></div>
                  </div>
                )}
                
                {/* 内容区 */}
                <div className="p-5">
                  {/* 标题和日期 */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-[#2C2C2C] mb-2 font-['Noto_Serif_SC'] line-clamp-2 group-hover:text-[#D4A574] transition-colors">
                      {diary.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-[#6B6B6B]">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(diary.date)}</span>
                    </div>
                  </div>
                  
                  {/* 摘要 */}
                  {summary && (
                    <p className="text-[#6B6B6B] text-sm line-clamp-3 mb-4">
                      {summary}
                    </p>
                  )}
                  
                  {/* 标签和地点 */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* 分类标签 */}
                    {diary.blocks?.[0]?.categories?.slice(0, 3).map(category => (
                      <span
                        key={category}
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[category] || '#A8A29E'}20`,
                          color: CATEGORY_COLORS[category] || '#A8A29E',
                          border: `1px solid ${CATEGORY_COLORS[category] || '#A8A29E'}40`
                        }}
                      >
                        {category}
                      </span>
                    ))}
                    
                    {/* 地点 */}
                    {diary.blocks?.[0]?.location && (
                      <span className="flex items-center space-x-1 px-2 py-1 rounded text-xs text-[#6B6B6B] bg-[#F8F6F0]">
                        <MapPin className="w-3 h-3" />
                        <span>{diary.blocks[0].location}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* 状态图标 */}
                  {diary.blocks?.[0]?.status?.icon && (
                    <div className="mt-3 pt-3 border-t border-[#E7E5E4]">
                      <span className="text-2xl">{diary.blocks[0].status.icon}</span>
                      {diary.blocks[0].status.description && (
                        <span className="ml-2 text-xs text-[#6B6B6B]">
                          {diary.blocks[0].status.description}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResultsView;

