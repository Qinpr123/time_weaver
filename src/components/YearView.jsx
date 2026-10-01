import React, { useState, useMemo } from 'react';
import { format, addYears, subYears } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, X, BookOpen, Calendar, Image as ImageIcon } from 'lucide-react';
import { useDiary } from '../contexts/DiaryContext';
import { motion } from 'framer-motion';

const YearView = () => {
  const { diaries, setSelectedDate, setCurrentView } = useDiary();
  const [currentYear, setCurrentYear] = useState(new Date());
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [tempYear, setTempYear] = useState('');

  const handlePrevYear = () => {
    setCurrentYear(subYears(currentYear, 1));
  };

  const handleNextYear = () => {
    setCurrentYear(addYears(currentYear, 1));
  };

  const handleYearClick = () => {
    setIsEditingYear(true);
    setTempYear(currentYear.getFullYear().toString());
  };

  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setTempYear(value);
    }
  };

  const handleYearConfirm = () => {
    if (tempYear && tempYear.length === 4) {
      const yearNum = parseInt(tempYear);
      if (yearNum >= 1900 && yearNum <= 2100) {
        setCurrentYear(new Date(yearNum, 0, 1));
      }
    }
    setIsEditingYear(false);
  };

  const handleYearCancel = () => {
    setIsEditingYear(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleYearConfirm();
    } else if (e.key === 'Escape') {
      handleYearCancel();
    }
  };

  const year = currentYear.getFullYear();

  // Helper: 从媒体对象或字符串中提取 URL
  const getMediaUrl = (media) => {
    if (!media) return null;
    if (typeof media === 'object' && media !== null) {
      return media.thumbnail || media.url;
    }
    return media;
  };

  // 获取预设月份封面
  const getPresetMonthCover = (monthIndex) => {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const baseUrl = import.meta.env.BASE_URL || '';
    // 确保路径拼接正确，避免双斜杠
    const path = baseUrl.endsWith('/') ? `month/${mm}.png` : `/month/${mm}.png`;
    return `${baseUrl}${path}`;
  };

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(year, i, 1);
      const monthKey = format(monthDate, 'yyyy-MM');
      
      // 获取该月的所有日记
      const monthDiaries = Object.values(diaries).filter(diary => 
        diary.date.startsWith(monthKey)
      );
      
      const diaryCount = monthDiaries.length;
      const hasDiaries = diaryCount > 0;
      
      // 统计该月媒体总数（照片+视频）
      const mediaCount = monthDiaries.reduce((total, diary) => {
        return total + (diary.blocks || []).reduce((blockTotal, block) => {
          return blockTotal + (block.media?.length || 0);
        }, 0);
      }, 0);

      // 直接统计icon的次数
      const iconCount = {};
      monthDiaries.forEach(diary => {
        diary.blocks.forEach(block => {
          if (block.status?.icon) {
            const icon = block.status.icon;
            iconCount[icon] = (iconCount[icon] || 0) + 1;
          }
        });
      });

      // 获取最常见的图标
      let topStatus = null;
      const iconEntries = Object.entries(iconCount);
      if (iconEntries.length > 0) {
        // 按次数排序
        iconEntries.sort((a, b) => b[1] - a[1]);
        const maxCount = iconEntries[0][1];
        // 找出所有次数最多的图标
        const topIcons = iconEntries.filter(([icon, count]) => count === maxCount);
        // 如果有多个，随机选择一个
        const selectedIcon = topIcons[Math.floor(Math.random() * topIcons.length)][0];
        
        // 找到对应的描述（使用第一个出现的描述）
        let description = '';
        for (const diary of monthDiaries) {
          for (const block of diary.blocks || []) {
            if (block.status?.icon === selectedIcon) {
              description = block.status.description || '';
              break;
            }
          }
          if (description) break;
        }
        
        topStatus = {
          icon: selectedIcon,
          description: description,
          count: maxCount
        };
      }

      // 统计分类分布
      const categoryCount = {};
      monthDiaries.forEach(diary => {
        diary.blocks.forEach(block => {
          if (block.categories && Array.isArray(block.categories)) {
            block.categories.forEach(cat => {
              categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            });
          }
        });
      });

      // 获取最常用的2个分类
      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name]) => name);
      
      // 封面逻辑：有日记时随机选择日记封面，无日记时使用预设
      let coverImage = getPresetMonthCover(i);
      if (hasDiaries) {
        // 从有封面的日记中随机选择
        const diariesWithCover = monthDiaries.filter(d => d.cover);
        if (diariesWithCover.length > 0) {
          const randomDiary = diariesWithCover[Math.floor(Math.random() * diariesWithCover.length)];
          coverImage = getMediaUrl(randomDiary.cover) || getPresetMonthCover(i);
        } else {
          // 如果没有日记级别封面，从blocks中寻找
          for (const diary of monthDiaries) {
            for (const block of diary.blocks || []) {
              if (block.cover) {
                coverImage = getMediaUrl(block.cover);
                break;
              }
              if (block.media && block.media.length > 0) {
                coverImage = getMediaUrl(block.media[0]);
                break;
              }
            }
            if (coverImage !== getPresetMonthCover(i)) break;
          }
        }
      }

      return {
        date: monthDate,
        name: format(monthDate, 'MMMM', { locale: zhCN }),
        monthNumber: i + 1,
        hasDiaries,
        diaryCount,
        mediaCount,
        topStatus,
        topCategories,
        cover: coverImage
      };
    });
  }, [year, diaries]);

  const handleMonthClick = (monthDate) => {
    setSelectedDate(monthDate);
    setCurrentView('month');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* 年份导航 - 添加快速编辑功能 */}
      <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8 space-x-2 sm:space-x-4">
        <button
          onClick={handlePrevYear}
          className="flex items-center justify-center p-1.5 sm:p-2 hover:bg-[#F8F6F0] rounded-lg transition-colors active-press"
        >
          <ChevronLeft className="w-5 h-5 text-[#6B6B6B]" />
        </button>

        <div className="flex items-center space-x-2">
          {isEditingYear ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempYear}
                onChange={handleYearChange}
                onKeyPress={handleKeyPress}
                className="w-16 sm:w-20 text-2xl sm:text-3xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] text-center border-b-2 border-[#D4A574] focus:outline-none"
                autoFocus
              />
              <span className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">年</span>
              <button
                onClick={handleYearConfirm}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors active-press"
                title="确认"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleYearCancel}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors active-press"
                title="取消"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={handleYearClick}>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] group-hover:text-[#D4A574] transition-colors">
                {year}
              </h2>
              <span className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">年</span>
            </div>
          )}
        </div>

        <button
          onClick={handleNextYear}
          className="flex items-center justify-center p-1.5 sm:p-2 hover:bg-[#F8F6F0] rounded-lg transition-colors active-press"
        >
          <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {months.map((month, index) => (
          <motion.div
            key={month.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.05,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            onClick={() => handleMonthClick(month.date)}
            className="group cursor-pointer"
          >
            <div className="relative bg-white rounded-xl sm:rounded-2xl warm-shadow hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#E7E5E4] hover-lift active-press">
              {/* 封面图片区域 */}
              <div className="aspect-[3/4] relative overflow-hidden bg-[#F8F6F0]">
                <img
                  src={month.cover}
                  alt={month.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* 渐变遮罩 - 加强底部信息可读性 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* 日记篇数角标 - 右上角，突出数字设计 */}
                <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10">
                  <div className={`${
                    month.hasDiaries 
                      ? 'bg-white shadow-lg border-2 border-[#D4A574]' 
                      : 'bg-white/90 backdrop-blur-sm border border-[#E7E5E4] shadow-md'
                  } px-1.5 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-1.5`}>
                    <BookOpen className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${month.hasDiaries ? 'text-[#D4A574]' : 'text-[#A8A29E]'} flex-shrink-0`} />
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-sm sm:text-xl font-bold font-['Noto_Serif_SC'] leading-none ${month.hasDiaries ? 'text-[#2C2C2C]' : 'text-[#6B6B6B]'}`}>
                        {month.diaryCount}
                      </span>
                      <span className={`text-[10px] sm:text-xs font-medium leading-none ${month.hasDiaries ? 'text-[#D4A574]' : 'text-[#A8A29E]'}`}>
                        篇
                      </span>
                    </div>
                  </div>
                </div>

                {/* 状态图标 - 卡片右下角展示 */}
                {month.topStatus?.icon && (
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white/50">
                      <span className="text-base sm:text-2xl drop-shadow-sm" title={month.topStatus.description}>
                        {month.topStatus.icon}
                      </span>
                    </div>
                  </div>
                )}

                {/* 底部信息条 - 手机端常显摘要，PC hover 展开 */}
                <div className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3.5 bg-gradient-to-t from-black/85 via-black/60 to-transparent ${
                  month.hasDiaries ? 'transition-transform duration-300 md:group-hover:-translate-y-2' : ''
                }`}>
                  {/* 月份名称 */}
                  <h3 className={`text-sm sm:text-xl font-bold text-white font-['Noto_Serif_SC'] drop-shadow-lg ${
                    month.hasDiaries ? 'mb-0.5 sm:mb-0 md:group-hover:mb-2 transition-all duration-300' : ''
                  }`}>
                    {month.name}
                  </h3>
                  
                  {/* 详细信息：手机端常显，PC hover 显示 */}
                  {month.hasDiaries && (
                    <div className="space-y-1 sm:space-y-1.5 opacity-100 max-h-20 md:opacity-0 md:max-h-0 md:group-hover:opacity-100 md:group-hover:max-h-32 transition-all duration-300 overflow-hidden">
                      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        {month.mediaCount > 0 && (
                          <div className="flex items-center gap-1 text-white/90 text-[10px] sm:text-xs">
                            <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>{month.mediaCount} 个媒体</span>
                          </div>
                        )}
                      </div>
                      
                      {month.topCategories && month.topCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {month.topCategories.map(category => (
                            <span 
                              key={category}
                              className="px-1.5 sm:px-2 py-0.5 bg-white/25 backdrop-blur-sm rounded-md text-[10px] sm:text-[11px] text-white/95 border border-white/30 font-medium"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 装饰性边框光晕 */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none" style={{
                background: 'linear-gradient(135deg, rgba(212,165,116,0.1) 0%, transparent 50%)'
              }}></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default YearView;
