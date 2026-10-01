import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  setMonth,
  setYear
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Check, X, Calendar, Heart, Image as ImageIcon, Tag } from 'lucide-react';
import { useDiary } from '../contexts/DiaryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MonthView = () => {
  const { diaries, selectedDate, setSelectedDate, deleteDiary } = useDiary();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const [rightColumnHeight, setRightColumnHeight] = useState('auto');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const getDiaryForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return diaries[dateKey];
  };

  const handleDateClick = (date) => {
    const diary = getDiaryForDate(date);
    if (diary) {
      // 有日记时跳转到日视图详情
      navigate(`/dayview/${format(date, 'yyyy-MM-dd')}`);
    } else {
      // 无日记时跳转到编辑界面
      navigate(`/editor/${format(date, 'yyyy-MM-dd')}`);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleEditDiary = (e, diary) => {
    e.stopPropagation();
    navigate(`/editor/${diary.date}`);
  };

  const handleDeleteDiary = (e, diary) => {
    e.stopPropagation();
    deleteDiary(new Date(diary.date));
  };

  const monthDiaries = Object.values(diaries).filter(diary => 
    diary.date.startsWith(format(currentMonth, 'yyyy-MM'))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // 分类颜色映射（与DayView保持一致）
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

  // 判断是否为视频文件
  const isVideo = (media) => {
    if (typeof media === 'object' && media !== null) {
      return media.type === 'video';
    }
    if (typeof media === 'string') {
      return media.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) || media.includes('video');
    }
    return false;
  };

  // 计算月度统计数据
  const monthStats = useMemo(() => {
    const totalDays = monthDiaries.length;
    // 统计所有媒体（包括照片和视频）
    const totalPhotos = monthDiaries.reduce((sum, diary) => {
      return sum + diary.blocks.reduce((blockSum, block) => {
        return blockSum + (block.media?.length || 0);
      }, 0);
    }, 0);

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

    // 获取最常用的3个分类
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count, color: CATEGORY_COLORS[name] || '#A8A29E' }));

    return {
      totalDays,
      totalPhotos,
      topCategories
    };
  }, [monthDiaries]);

  // 判断文字颜色，只要有封面图片就使用白色文字
  const getTextColorByCover = (coverImage) => {
    if (!coverImage) {
      return 'text-[#2C2C2C]'; // 默认深色
    }

    // 只要有封面图片，就使用白色文字确保可读性
    return 'text-white drop-shadow-lg';
  };

  // Helper 函数：从媒体对象或字符串中提取 URL
  const getMediaUrl = (media) => {
    if (!media) return null;
    if (typeof media === 'object' && media !== null) {
      return media.thumbnail || media.url;
    }
    return media;
  };

  const getCoverImage = (diary) => {
    if (!diary || !diary.blocks || diary.blocks.length === 0) {
      return null;
    }

    // 优先使用日记级别的封面
    if (diary.cover) {
      return getMediaUrl(diary.cover);
    }

    // 其次尝试从所有内容块中查找封面图片
    for (const block of diary.blocks) {
      if (block.cover) {
        return getMediaUrl(block.cover);
      }
      // 如果没有设置封面，但块中有媒体，使用第一个媒体作为封面
      if (block.media && block.media.length > 0) {
        return getMediaUrl(block.media[0]);
      }
    }

    return null;
  };

  const [tempYear, setTempYear] = useState('');
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [tempMonth, setTempMonth] = useState('');
  const [isEditingMonth, setIsEditingMonth] = useState(false);

  const handleYearClick = () => {
    setIsEditingYear(true);
    setTempYear(currentMonth.getFullYear().toString());
  };

  const handleMonthClick = () => {
    setIsEditingMonth(true);
    setTempMonth((currentMonth.getMonth() + 1).toString().padStart(2, '0'));
  };

  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setTempYear(value);
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setTempMonth(value);
    }
  };

  const handleYearConfirm = () => {
    if (tempYear && tempYear.length === 4) {
      const yearNum = parseInt(tempYear);
      if (yearNum >= 1900 && yearNum <= 2100) {
        setCurrentMonth(setYear(currentMonth, yearNum));
      }
    }
    setIsEditingYear(false);
  };

  const handleMonthConfirm = () => {
    if (tempMonth && tempMonth.length <= 2) {
      const monthNum = parseInt(tempMonth) - 1;
      if (monthNum >= 0 && monthNum <= 11) {
        setCurrentMonth(setMonth(currentMonth, monthNum));
      }
    }
    setIsEditingMonth(false);
  };

  const handleYearCancel = () => {
    setIsEditingYear(false);
  };

  const handleMonthCancel = () => {
    setIsEditingMonth(false);
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      if (type === 'year') {
        handleYearConfirm();
      } else if (type === 'month') {
        handleMonthConfirm();
      }
    } else if (e.key === 'Escape') {
      if (type === 'year') {
        handleYearCancel();
      } else if (type === 'month') {
        handleMonthCancel();
      }
    }
  };

  // 动态计算右侧滚动区域高度，使其底部与左侧统计面板底部对齐
  useEffect(() => {
    const updateHeight = () => {
      if (leftColumnRef.current && rightColumnRef.current) {
        const leftHeight = leftColumnRef.current.offsetHeight;
        const rightTitle = rightColumnRef.current.querySelector('h3');
        const titleHeight = rightTitle ? rightTitle.offsetHeight : 0;
        const gap = 24; // space-y-6 = 1.5rem = 24px
        
        // 计算可用于滚动内容的高度
        const availableHeight = leftHeight - titleHeight - gap;
        setRightColumnHeight(`${availableHeight}px`);
      }
    };

    // 初始计算
    updateHeight();

    // 监听窗口大小变化
    window.addEventListener('resize', updateHeight);
    
    // 使用 ResizeObserver 监听左侧内容变化
    const resizeObserver = new ResizeObserver(updateHeight);
    if (leftColumnRef.current) {
      resizeObserver.observe(leftColumnRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, [monthDiaries]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 月份导航 */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        <button
          onClick={handlePrevMonth}
          className="flex items-center justify-center p-2 hover:bg-[#F8F6F0] rounded-lg transition-colors active-press"
        >
          <ChevronLeft className="w-5 h-5 text-[#6B6B6B]" />
        </button>

        <div className="flex items-center space-x-2">
          {/* 年份编辑 */}
          {isEditingYear ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempYear}
                onChange={handleYearChange}
                onKeyPress={(e) => handleKeyPress(e, 'year')}
                className="w-16 text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] text-center border-b-2 border-[#D4A574] focus:outline-none"
                autoFocus
              />
              <span className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">年</span>
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
              <h2 className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] group-hover:text-[#D4A574] transition-colors">
                {format(currentMonth, 'yyyy')}
              </h2>
              <span className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">年</span>
            </div>
          )}

          {/* 月份编辑 */}
          {isEditingMonth ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempMonth}
                onChange={handleMonthChange}
                onKeyPress={(e) => handleKeyPress(e, 'month')}
                className="w-8 text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] text-center border-b-2 border-[#D4A574] focus:outline-none"
                autoFocus
              />
              <span className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">月</span>
              <button
                onClick={handleMonthConfirm}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors active-press"
                title="确认"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleMonthCancel}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors active-press"
                title="取消"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={handleMonthClick}>
              <h2 className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] group-hover:text-[#D4A574] transition-colors">
                {format(currentMonth, 'MM')}
              </h2>
              <span className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">月</span>
            </div>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="flex items-center justify-center p-2 hover:bg-[#F8F6F0] rounded-lg transition-colors active-press"
        >
          <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        {/* 左侧：日历 + 统计面板 */}
        <div className="lg:col-span-8 space-y-6" ref={leftColumnRef}>
          {/* 日历 */}
          <div className="bg-white rounded-xl warm-shadow border border-[#E7E5E4] overflow-hidden">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 bg-[#F8F6F0]">
              {weekDays.map(day => (
                <div key={day} className="p-4 text-center text-sm font-medium text-[#6B6B6B]">
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const diary = getDiaryForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square p-2 border-r border-b border-[#E7E5E4] cursor-pointer hover:bg-[#F8F6F0] transition-colors relative overflow-hidden group ${
                      !isCurrentMonth ? 'bg-[#F8F6F0]/50' : ''
                    }`}
                  >
                    {diary && getCoverImage(diary) && (
                      <div className="absolute inset-0 w-full h-full">
                        <img
                          src={getCoverImage(diary)}
                          alt="日记封面"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          style={{
                            objectPosition: 'center',
                            objectFit: 'cover'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    )}
                    <div className="relative z-10 h-full flex flex-col">
                      <div className={`text-sm font-medium mb-1 ${
                        isToday 
                          ? 'text-[#D4A574] border-b-2 border-[#D4A574] pb-0.5 w-fit drop-shadow-lg' 
                          : diary && getCoverImage(diary)
                          ? 'text-white drop-shadow-lg'
                          : isCurrentMonth 
                          ? 'text-[#2C2C2C]' 
                          : 'text-[#6B6B6B]'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      {diary && (
                        <div className="flex-1 flex items-end">
                          <div className="w-full px-1 py-1 bg-black/20 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white font-medium truncate">
                              {diary.title}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 月度统计面板 */}
          {monthDiaries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-br from-[#F8F6F0] to-white rounded-xl warm-shadow border border-[#E7E5E4] p-5">
                <h3 className="text-base font-semibold text-[#2C2C2C] font-['Noto_Serif_SC'] mb-4 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-[#D4A574]" />
                  本月回顾
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* 记录天数 */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#D4A574] font-['Noto_Serif_SC'] mb-1">
                      {monthStats.totalDays}
                    </div>
                    <div className="text-xs text-[#6B6B6B]">记录天数</div>
                  </div>
                  
                  {/* 媒体数量（包括照片和视频） */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#7FA6A8] font-['Noto_Serif_SC'] mb-1">
                      {monthStats.totalPhotos}
                    </div>
                    <div className="text-xs text-[#6B6B6B]">珍藏照片</div>
                  </div>

                  {/* 最常分类 */}
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-1.5 mb-1 flex-wrap min-h-[28px]">
                      {monthStats.topCategories.length > 0 ? (
                        monthStats.topCategories.map((cat, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-[#A8A29E]">—</span>
                      )}
                    </div>
                    <div className="text-xs text-[#6B6B6B]">热门标签</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 右侧：当月日记时光回忆卡片 */}
        <div className="lg:col-span-4" ref={rightColumnRef}>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#2C2C2C] font-['Noto_Serif_SC'] flex items-center">
              <Heart className="w-5 h-5 mr-2 text-[#D48C8C]" />
              时光记忆
              <span className="ml-auto text-sm font-normal text-[#6B6B6B]">
                {monthDiaries.length} 篇
              </span>
            </h3>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:overflow-y-auto pr-2 custom-scrollbar"
              style={{ 
                maxHeight: window.innerWidth >= 1024 ? rightColumnHeight : 'none' 
              }}
            >
            <AnimatePresence>
              {monthDiaries.map((diary, index) => {
                const coverImg = getCoverImage(diary);
                const firstCategory = diary.blocks[0]?.categories?.[0];
                const categoryColor = CATEGORY_COLORS[firstCategory] || '#A8A29E';
                const mediaCount = diary.blocks.reduce((sum, block) => sum + (block.media?.length || 0), 0);

                return (
                  <motion.div
                    key={diary.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-xl warm-shadow border-2 border-[#E7E5E4] overflow-hidden cursor-pointer hover-lift active-press relative"
                    onClick={() => navigate(`/dayview/${diary.date}`)}
                    style={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)'
                    }}
                  >
                    {/* 封面图片区域 */}
                    <div className="relative h-48 overflow-hidden bg-[#F8F6F0]">
                      <img
                        src={coverImg}
                        alt={diary.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{
                          objectPosition: 'center',
                          objectFit: 'cover'
                        }}
                      />
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      
                      {/* 日期标签 - 手绘风格 */}
                      <div 
                        className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-white font-medium shadow-lg"
                        style={{
                          backgroundColor: categoryColor,
                          transform: 'rotate(-2deg)'
                        }}
                      >
                        <div className="text-xs opacity-90">
                          {format(new Date(diary.date), 'MM月')}
                        </div>
                        <div className="text-xl font-bold leading-tight">
                          {format(new Date(diary.date), 'dd')}
                        </div>
                      </div>

                      {/* 照片数量标签 */}
                      {mediaCount > 0 && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-white" />
                          <span className="text-xs text-white font-medium">{mediaCount}</span>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditDiary(e, diary)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-[#6B6B6B] hover:text-[#D4A574] hover:bg-white transition-all shadow-lg active-press"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteDiary(e, diary)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-[#6B6B6B] hover:text-red-500 hover:bg-white transition-all shadow-lg active-press"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 内容区域 */}
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-[#2C2C2C] font-['Noto_Serif_SC'] mb-2 line-clamp-1 group-hover:text-[#D4A574] transition-colors">
                        {diary.title}
                      </h4>
                      
                      {/* 内容预览 */}
                      <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-3 leading-relaxed">
                        {diary.blocks[0]?.content || '开始记录这一天...'}
                      </p>

                      {/* 分类标签 */}
                      {diary.blocks[0]?.categories && diary.blocks[0].categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {diary.blocks[0].categories.slice(0, 3).map((cat, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 rounded-md text-xs font-medium text-white flex items-center space-x-1"
                              style={{ 
                                backgroundColor: CATEGORY_COLORS[cat] || '#A8A29E',
                                opacity: 0.9
                              }}
                            >
                              <Tag className="w-3 h-3" />
                              <span>{cat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 手绘边框效果 */}
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,165,116,0.1) 0%, transparent 50%)'
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 空状态 */}
      {monthDiaries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-4 mt-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#F8F6F0] flex items-center justify-center">
            <Calendar className="w-12 h-12 text-[#D4A574]" />
          </div>
          <p className="text-[#6B6B6B] text-sm mb-4">
            这个月还没有记录
          </p>
          <button
            onClick={() => navigate(`/editor/${format(new Date(), 'yyyy-MM-dd')}`)}
            className="px-4 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#C97A63] transition-colors active-press inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>开始写日记</span>
          </button>
        </motion.div>
      )}

      {/* 自定义滚动条样式 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F8F6F0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4A574;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C97A63;
        }
      `}</style>
    </div>
  );
};

export default MonthView;
