import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, MapPin, Download, X, ChevronRight as RightIcon, ChevronLeft as LeftIcon } from 'lucide-react';
import { useDiary } from '../contexts/DiaryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// 手绘风格插图映射（根据分类标签匹配）
const CATEGORY_ILLUSTRATIONS = {
  '日常': `${import.meta.env.BASE_URL}activities/undraw_working-out_6ksl.png`,
  '美食': `${import.meta.env.BASE_URL}activities/undraw_barbecue_k11q.png`,
  '旅行': `${import.meta.env.BASE_URL}activities/undraw_at-the-airport_z3b9.png`,
  '玩乐': `${import.meta.env.BASE_URL}activities/undraw_gaming-controller_qzoc.png`,
  '自己': `${import.meta.env.BASE_URL}activities/undraw_selfie_1xk7.png`,
  '朋友': `${import.meta.env.BASE_URL}activities/undraw_social-friends_mt6k.png`,
  '家人': `${import.meta.env.BASE_URL}activities/family.png`,
  '宠物': `${import.meta.env.BASE_URL}activities/with dog.png`,
  '情侣': `${import.meta.env.BASE_URL}activities/couple.png`,
  '风景': `${import.meta.env.BASE_URL}activities/undraw_landscape-mode_z2v5.png`,
  '学习': `${import.meta.env.BASE_URL}activities/undraw_reading-a-book_4cap.png`,
  '工作': `${import.meta.env.BASE_URL}activities/undraw_workspace_s6wf.png`,
  '运动': `${import.meta.env.BASE_URL}activities/undraw_morning-workout_73u9.png`,
  '作品': `${import.meta.env.BASE_URL}activities/undraw_proud-designer_1rcm.png`,
  '默认': `${import.meta.env.BASE_URL}activities/undraw_my-universe_qqch.png`
};

// 胶带素材列表
const TAPE_ASSETS = [
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (3).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (7).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (10).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (11).png`,
  `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (12).png`
];

const DesignerDiaryView = () => {
  const { selectedDate, setSelectedDate, getDiaryByDate, deleteDiary, saveDiary } = useDiary();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentBlockMedia, setCurrentBlockMedia] = useState([]);

  const diary = getDiaryByDate(currentDate);

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          setLightboxOpen(false);
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex, currentBlockMedia]);

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    setSelectedDate(nextDay);
  };

  const handleCreateDiary = () => {
    const newDiary = {
      title: format(currentDate, 'yyyy年MM月dd日的日记', { locale: zhCN }),
      blocks: []
    };
    saveDiary(currentDate, newDiary);
    navigate(`/editor/${format(currentDate, 'yyyy-MM-dd')}`);
  };

  const handleEditDiary = () => {
    navigate(`/editor/${format(currentDate, 'yyyy-MM-dd')}`);
  };

  const handleDeleteDiary = () => {
    deleteDiary(currentDate);
    navigate('/');
  };

  const openLightbox = (blockMedia, startIndex = 0) => {
    setCurrentBlockMedia(blockMedia);
    setCurrentImageIndex(startIndex);
    setLightboxOpen(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev =>
      prev < currentBlockMedia.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev =>
      prev > 0 ? prev - 1 : currentBlockMedia.length - 1
    );
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diary-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 渲染内容块 - 无媒体
  const renderTextOnlyBlock = (block, index) => (
    <motion.div
      key={block.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-6 relative"
    >
      <h3 className="text-xl font-semibold text-[#2C2C2C] mb-3 font-['Noto_Serif_SC']">
        {block.title}
      </h3>

      <div className="flex items-center space-x-4 mb-4 text-sm text-[#6B6B6B]">
        {block.status?.icon && (
          <span className="text-lg">{block.status.icon}</span>
        )}
        {block.status?.description && (
          <span>{block.status.description}</span>
        )}
        {block.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{block.location}</span>
          </div>
        )}
      </div>

      {block.content && (
        <p className="text-[#6B6B6B] leading-relaxed font-['Noto_Sans_SC']">
          {block.content}
        </p>
      )}
    </motion.div>
  );

  // 渲染内容块 - 图片和文字
  const renderMixedContentBlock = (block, index) => {
    const hasImages = block.media && block.media.length > 0;
    const hasContent = block.content && block.content.length > 0;
    const hasMultipleImages = block.media && block.media.length > 1;

    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-lg p-6 relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 文字内容区域 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#2C2C2C] font-['Noto_Serif_SC']">
              {block.title}
            </h3>

            <div className="flex items-center space-x-4 text-sm text-[#6B6B6B]">
              {block.status?.icon && (
                <span className="text-lg">{block.status.icon}</span>
              )}
              {block.status?.description && (
                <span>{block.status.description}</span>
              )}
            </div>

            {block.content && (
              <p className="text-[#6B6B6B] leading-relaxed font-['Noto_Sans_SC']">
                {block.content}
              </p>
            )}

            {block.location && (
              <div className="flex items-center space-x-2 text-sm text-[#6B6B6B]">
                <MapPin className="w-4 h-4" />
                <span className="font-['Noto_Sans_SC']">{block.location}</span>
              </div>
            )}
          </div>

          {/* 图片区域 */}
          {hasImages && (
            <div className="space-y-4">
              {/* 拍立得相纸风格的主图 */}
              <div
                className="relative cursor-pointer group"
                onClick={() => openLightbox(block.media, 0)}
              >
                <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-[#E7E5E4] transform rotate-[-1deg]">
                  <img
                    src={block.media[0]}
                    alt={block.title}
                    className="w-full aspect-square object-cover rounded"
                  />
                  {/* 拍立得底部信息 */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-[#6B6B6B] font-handwriting">
                      {block.location && `${block.location} · `}
                      {format(new Date(), 'MM/dd/yyyy')}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
              </div>

              {/* 其他图片缩略图 */}
              {hasMultipleImages && (
                <div className="grid grid-cols-3 gap-2">
                  {block.media.slice(1).map((media, mediaIndex) => (
                    <div
                      key={mediaIndex}
                      className="aspect-square cursor-pointer group relative"
                      onClick={() => openLightbox(block.media, mediaIndex + 1)}
                    >
                      <img
                        src={media}
                        alt={`Thumbnail ${mediaIndex + 1}`}
                        className="w-full h-full object-cover rounded border-2 border-white shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 分类标签 */}
        {block.categories && block.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-[#E7E5E4]">
            {block.categories.map(category => (
              <span
                key={category}
                className="px-3 py-1 bg-[#F8F6F0] text-[#8B7355] text-xs rounded-full border border-[#E7E5E4]"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // 灯箱组件
  const Lightbox = () => (
    <AnimatePresence>
      {lightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            {/* 导航按钮 */}
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <LeftIcon className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <RightIcon className="w-6 h-6" />
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 下载按钮 */}
            <button
              onClick={() => handleDownload(currentBlockMedia[currentImageIndex])}
              className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <Download className="w-6 h-6" />
            </button>

            {/* 当前图片索引 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {currentBlockMedia.length}
            </div>

            {/* 图片显示 */}
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={currentBlockMedia[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDiaryContent = () => {
    if (!diary) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#F8F6F0] rounded-full flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2 font-['Noto_Serif_SC']">暂无日记</h3>
          <button
            onClick={handleCreateDiary}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#D4A574] text-white rounded-lg hover:bg-[#8B7355] transition-colors active-press my-[40px]"
          >
            <Plus className="w-5 h-5" />
            <span>创建日记</span>
          </button>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* 主卡片容器 */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E7E5E4] overflow-hidden max-w-[660px] mx-auto paper-texture">
          {/* 卡片头部 */}
          <div className="bg-gradient-to-r from-[#F8F6F0] to-[#E7E5E4] p-6 border-b border-[#E7E5E4]">
            <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2 text-center font-['Noto_Serif_SC']">
              {diary.title}
            </h1>
            <p className="text-[#6B6B6B] text-center font-['Noto_Sans_SC']">
              {format(currentDate, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </p>
          </div>

          {/* 内容块区域 */}
          <div className="p-6 space-y-6">
            {diary.blocks.map((block, index) => {
              const hasMedia = block.media && block.media.length > 0;
              const hasContent = block.content && block.content.length > 0;

              if (!hasMedia && !hasContent) {
                return renderTextOnlyBlock(block, index);
              } else if (hasMedia && !hasContent) {
                return renderTextOnlyBlock(block, index); // 暂时使用文本块渲染
              } else {
                return renderMixedContentBlock(block, index);
              }
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] paper-texture py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 日期导航 */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          <button
            onClick={handlePrevDay}
            className="flex items-center justify-center p-3 bg-white rounded-full shadow-md hover:bg-[#F8F6F0] transition-colors active-press"
          >
            <ChevronLeft className="w-6 h-6 text-[#6B6B6B]" />
          </button>

          <div className="text-center bg-white rounded-2xl px-6 py-3 shadow-md">
            <h2 className="text-xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']">
              {format(currentDate, 'MM月dd日', { locale: zhCN })}
            </h2>
            <p className="text-[#6B6B6B] font-['Noto_Sans_SC']">
              {format(currentDate, 'EEEE', { locale: zhCN })}
            </p>
          </div>

          <button
            onClick={handleNextDay}
            className="flex items-center justify-center p-3 bg-white rounded-full shadow-md hover:bg-[#F8F6F0] transition-colors active-press"
            >
            <ChevronRight className="w-6 h-6 text-[#6B6B6B]" />
          </button>
        </div>

        {/* 日记内容 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDate.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {diary && (
              <div className="relative mb-6">
                {/* 操作按钮 */}
                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                  <button
                    onClick={handleEditDiary}
                    className="p-3 bg-white rounded-full shadow-md hover:bg-[#F8F6F0] transition-colors active-press"
                    title="编辑日记"
                  >
                    <Edit className="w-5 h-5 text-[#6B6B6B]" />
                  </button>
                  <button
                    onClick={handleDeleteDiary}
                    className="p-3 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors active-press"
                    title="删除日记"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            )}
            {renderDiaryContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 灯箱 */}
      <Lightbox />
    </div>
  );
};

export default DesignerDiaryView;
