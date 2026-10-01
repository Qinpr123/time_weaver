import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSampleDiary, getSampleDates } from '../data/sampleDiaries';

const DemoPage = () => {
  const sampleDates = getSampleDates();
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const currentDate = sampleDates[currentDateIndex];
  const diary = getSampleDiary(currentDate);

  const handlePrevDate = () => {
    setCurrentDateIndex((prev) => (prev - 1 + sampleDates.length) % sampleDates.length);
  };

  const handleNextDate = () => {
    setCurrentDateIndex((prev) => (prev + 1) % sampleDates.length);
  };

  const renderBlock = (block, blockIndex) => {
    const hasMedia = block.media && block.media.length > 0;
    const hasContent = block.content && block.content.trim() !== '';
    const coverMedia = block.cover || (hasMedia ? block.media[0] : null);
    const otherMedia = hasMedia ? block.media.filter((_, i) => i > 0) : [];

    if (!hasMedia && hasContent) {
      return (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: blockIndex * 0.1 }}
          className="bg-white rounded-2xl warm-shadow border border-[#E7E5E4] p-8 relative"
        >
          <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4 font-['Noto_Serif_SC'] tracking-wide">
            {block.title}
          </h3>

          <div className="flex items-center space-x-4 mb-6 text-[#6B6B6B] text-sm">
            {block.status?.icon && (
              <span className="text-lg">{block.status.icon}</span>
            )}
            {block.status?.description && (
              <span>{block.status.description}</span>
            )}
            {block.location && (
              <span className="flex items-center">
                📍 {block.location}
              </span>
            )}
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-[#6B6B6B] leading-relaxed text-justify indent-8">
              {block.content}
            </p>
          </div>

          {block.categories && block.categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {block.categories.map((category, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#F8F6F0] text-[#8B7355] text-xs rounded-full border border-[#E7E5E4]"
                >
                  #{category}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      );
    }

    if (hasMedia && !hasContent) {
      return (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: blockIndex * 0.1 }}
          className="bg-white rounded-2xl warm-shadow border border-[#E7E5E4] p-6 relative"
        >
          <div className="flex space-x-6">
            <div className="flex-1">
              <div className="relative aspect-square rounded-lg border-2 border-[#2C2C2C] p-2 bg-white">
                <img
                  src={coverMedia}
                  alt={block.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-4 border-t border-[#E7E5E4]">
                  <h4 className="text-lg font-semibold text-[#2C2C2C] mb-1 font-['Noto_Serif_SC']">
                    {block.title}
                  </h4>
                  <div className="flex items-center space-x-3 text-[#6B6B6B] text-sm">
                    {block.status?.icon && (
                      <span className="text-base">{block.status.icon}</span>
                    )}
                    {block.location && (
                      <span className="flex items-center">
                        📍 {block.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-24 space-y-3">
              {otherMedia.map((media, mediaIndex) => (
                <div
                  key={mediaIndex}
                  className="aspect-square rounded border-2 border-white"
                >
                  <img
                    src={media}
                    alt={`${block.title} ${mediaIndex + 2}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    if (hasMedia && hasContent) {
      return (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: blockIndex * 0.1 }}
          className="bg-white rounded-2xl warm-shadow border border-[#E7E5E4] p-8 relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4 font-['Noto_Serif_SC'] tracking-wide">
                {block.title}
              </h3>

              <div className="flex items-center space-x-4 mb-4 text-[#6B6B6B] text-sm">
                {block.status?.icon && (
                  <span className="text-lg">{block.status.icon}</span>
                )}
                {block.status?.description && (
                  <span>{block.status.description}</span>
                )}
                {block.location && (
                  <span className="flex items-center">
                    📍 {block.location}
                  </span>
                )}
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-[#6B6B6B] leading-relaxed text-justify indent-8">
                  {block.content}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-square bg-[#F8F6F0] rounded-lg p-4 border-2 border-[#2C2C2C]">
                  <img
                    src={coverMedia}
                    alt={block.title}
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <div className="bg-white/90 p-2 rounded border border-[#E7E5E4]">
                      <p className="text-xs text-[#8B7355] font-handwriting">
                        {block.location || '美好时刻'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {otherMedia.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {otherMedia.map((media, mediaIndex) => (
                    <div
                      key={mediaIndex}
                      className="aspect-square rounded border-2 border-white"
                    >
                      <img
                        src={media}
                        alt={`${block.title} ${mediaIndex + 2}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {block.categories && block.categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {block.categories.map((category, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#F8F6F0] text-[#8B7355] text-xs rounded-full border border-[#E7E5E4]"
                >
                  #{category}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] to-[#E7E5E4] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2C2C2C] mb-4 font-['Noto_Serif_SC']">
            精美日记示例展示
          </h1>
          <p className="text-[#6B6B6B] text-lg">
            2025年10月22日 - 10月29日
          </p>
        </div>

        {/* 日期导航 */}
        <div className="flex items-center justify-center mb-8 space-x-6">
          <button
            onClick={handlePrevDate}
            className="flex items-center justify-center p-3 hover:bg-white rounded-full transition-colors group"
          >
            <ChevronLeft className="w-6 h-6 text-[#6B6B6B] group-hover:text-[#D4A574]" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] mb-2">
              {format(parseISO(currentDate), 'MM月dd日', { locale: zhCN })}
            </h2>
            <p className="text-[#8B7355] font-handwriting text-lg">
              {format(parseISO(currentDate), 'EEEE', { locale: zhCN })}
            </p>
          </div>

          <button
            onClick={handleNextDate}
            className="flex items-center justify-center p-3 hover:bg-white rounded-full transition-colors group"
          >
            <ChevronRight className="w-6 h-6 text-[#6B6B6B] group-hover:text-[#D4A574]" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentDate}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Hero 模块 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2 font-['Noto_Serif_SC']">
                {diary.title}
              </h1>
              <p className="text-[#8B7355] text-lg font-handwriting">
                {format(parseISO(currentDate), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
              </p>
            </div>

            {/* 内容块 */}
            <div className="grid gap-8">
              {diary.blocks.map((block, index) => renderBlock(block, index))}
            </div>

            {/* 统计信息 */}
            <div className="bg-white rounded-2xl p-6 warm-shadow border border-[#E7E5E4]">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4 font-['Noto_Serif_SC']">
                日记统计
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#D4A574]">{diary.blocks.length}</div>
                  <div className="text-sm text-[#6B6B6B]">内容块</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#D4A574]">
                    {diary.blocks.reduce((acc, block) => acc + (block.media?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-[#6B6B6B]">图片数量</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#D4A574]">
                    {diary.blocks.reduce((acc, block) => acc + (block.content?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-[#6B6B6B]">文字字数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#D4A574]">
                    {new Set(diary.blocks.flatMap(block => block.categories || [])).size}
                  </div>
                  <div className="text-sm text-[#6B6B6B]">分类标签</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 说明 */}
        <div className="mt-12 text-center">
          <p className="text-[#6B6B6B] text-sm">
            使用左右箭头浏览不同日期的日记示例
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
