import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useDiary } from '../contexts/DiaryContext';
import { motion, AnimatePresence } from 'framer-motion';
import BlockEditor from '../components/BlockEditor';
import CelebrationAnimation from '../components/CelebrationAnimation';
import { toast } from 'sonner';

const createEmptyBlock = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '',
  content: '',
  media: [],
  cover: ''
});

const serializeDiaryForCompare = (diaryData) =>
  JSON.stringify({
    title: diaryData.title || '',
    blocks: (diaryData.blocks || []).map((b) => ({
      id: b.id,
      title: b.title,
      content: b.content,
      media: b.media,
      cover: b.cover,
      categories: b.categories,
      status: b.status,
      location: b.location
    }))
  });

const DiaryEditor = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const { getDiaryByDate, saveDiary, setSelectedDate } = useDiary();
  const [diary, setDiary] = useState({
    title: '',
    blocks: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const initialSnapshotRef = useRef('');

  useEffect(() => {
    const existingDiary = getDiaryByDate(new Date(date));
    const initialDiary = existingDiary
      ? existingDiary
      : {
          title: format(new Date(date), 'yyyy年MM月dd日的日记', { locale: zhCN }),
          blocks: [createEmptyBlock()]
        };
    setDiary(initialDiary);
    initialSnapshotRef.current = serializeDiaryForCompare(initialDiary);
  }, [date, getDiaryByDate]);

  const addBlock = () => {
    setDiary(prev => ({
      ...prev,
      blocks: [...prev.blocks, createEmptyBlock()]
    }));
  };

  const updateBlock = (blockId, updates) => {
    setDiary(prev => {
      const newBlocks = prev.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      );
      
      // 智能默认封面机制
      // 如果用户没有手动选择封面，且第一个内容块有媒体文件，则自动设置为封面
      const firstBlockWithMedia = newBlocks.find(block => block.media && block.media.length > 0);
      if (firstBlockWithMedia && !prev.blocks.find(b => b.id === blockId)?.cover) {
        return {
          ...prev,
          blocks: newBlocks.map(block => 
            block.id === firstBlockWithMedia.id 
              ? { ...block, cover: block.media[0] }
              : block
          )
        };
      }
      
      return {
        ...prev,
        blocks: newBlocks
      };
    });
  };

  const removeBlock = (blockId) => {
    setDiary(prev => {
      const newBlocks = prev.blocks.filter(block => block.id !== blockId);
      
      // 如果删除的是包含封面的块，则重新设置默认封面
      const deletedBlock = prev.blocks.find(block => block.id === blockId);
      if (deletedBlock && deletedBlock.cover) {
        const firstBlockWithMedia = newBlocks.find(block => block.media && block.media.length > 0);
        if (firstBlockWithMedia) {
          return {
            ...prev,
            blocks: newBlocks.map(block => 
              block.id === firstBlockWithMedia.id 
                ? { ...block, cover: block.media[0] }
                : block
            )
          };
        }
      }
      
      return {
        ...prev,
        blocks: newBlocks
      };
    });
  };

  const moveBlock = (dragIndex, hoverIndex) => {
    const newBlocks = [...diary.blocks];
    const draggedBlock = newBlocks[dragIndex];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    setDiary(prev => ({ ...prev, blocks: newBlocks }));
  };

  const handleSave = async () => {
    // 检查是否有内容块，以及内容块是否有实际内容
    if (diary.blocks.length === 0) {
      toast.warning('请至少添加一个内容块后再保存。', {
        duration: 3000,
      });
      return;
    }

    // 检查所有内容块是否都有内容（至少要有标题、内容或媒体）
    const hasValidContent = diary.blocks.some(block => {
      const hasTitle = block.title && block.title.trim() !== '';
      const hasContent = block.content && block.content.trim() !== '';
      const hasMedia = block.media && block.media.length > 0;
      return hasTitle || hasContent || hasMedia;
    });

    if (!hasValidContent) {
      toast.warning('请至少在一个内容块中输入标题、内容或添加媒体后再保存。', {
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      // 在保存对象中直接确定封面，避免异步状态更新漏存首次封面。
      const diaryToSave = { ...diary, blocks: diary.blocks.map(block => ({ ...block })) };
      if (!diaryToSave.blocks.some(block => block.cover)) {
        const first = diaryToSave.blocks.find(block => block.media?.length);
        if (first) first.cover = first.media[0]?.thumbnail || first.media[0]?.url || first.media[0];
        else diaryToSave.blocks[0].cover = `${import.meta.env.BASE_URL}demo-photos/warm-diary.jpg`;
      }

      const savedResult = await saveDiary(new Date(date), diaryToSave);
      
      // All entries are saved in this browser's local data store.
      if (savedResult?._isLocalOnly) {
        setIsSaving(false);
        toast.success('已保存到当前浏览器', {
          duration: 3000,
        });
        
        // 显示庆祝动画（但稍短一些）
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          navigate(`/dayview/${date}`);
        }, 1500);
        return;
      }
      
      // 设置选中日期，确保日期选择器显示正确的选中状态
      setSelectedDate(new Date(date));
      
      // 显示庆祝动画
      setIsSaving(false);
      setShowCelebration(true);
      
      // 庆祝动画完成后跳转
      setTimeout(() => {
        setShowCelebration(false);
        navigate(`/dayview/${date}`);
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      console.error('保存失败:', error);
      
      // 提供更详细的错误信息，区分不同类型的错误
      let errorMessage = '保存失败';
      
      // 区分文件过大错误和网络错误
      if (error.message?.includes('文件') && 
          (error.message?.includes('过大') || error.message?.includes('超过') || error.message?.includes('大小'))) {
        errorMessage = `保存失败: ${error.message}`;
      } else if (error.message?.includes('网络') || 
                 error.message?.includes('Failed to fetch') || 
                 error.message?.includes('fetch') ||
                 error.message?.includes('连接')) {
        errorMessage = `保存失败: ${error.message || '请检查浏览器可用空间后重试'}`;
      } else if (error.message?.includes('permission') || 
                 error.message?.includes('policy') || 
                 error.message?.includes('权限') ||
                 error.code === '42501') {
        errorMessage = '保存失败：浏览器未允许写入本机数据';
      } else if (error.message) {
        errorMessage = `保存失败: ${error.message}`;
      } else if (error.code) {
        errorMessage = `保存失败 (错误代码: ${error.code})`;
      } else {
        errorMessage = '保存失败，请稍后重试';
      }
      
      toast.error(errorMessage, {
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] paper-texture">
      <CelebrationAnimation 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
        message="日记保存成功！"
      />
      {/* 顶部工具栏 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#E7E5E4] sticky top-0 z-50 glass-effect">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                const hasChanges =
                  serializeDiaryForCompare(diary) !== initialSnapshotRef.current;
                if (hasChanges) {
                  toast('您有未保存的更改，是否放弃保存并返回？', {
                    duration: Infinity,
                    action: {
                      label: '放弃',
                      onClick: () => {
                        navigate('/');
                      },
                    },
                    cancel: {
                      label: '取消',
                      onClick: () => {},
                    },
                  });
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center space-x-2 text-[#6B6B6B] hover:text-[#2C2C2C] transition-colors active-press"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-[#2C2C2C] font-['Noto_Serif_SC']">
                {format(new Date(date), 'yyyy年MM月dd日', { locale: zhCN })}
              </h1>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#8B7355] disabled:opacity-50 transition-colors active-press"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题编辑 */}
        <div className="mb-8">
          <input
            type="text"
            value={diary.title}
            onChange={(e) => setDiary(prev => ({ ...prev, title: e.target.value }))}
            placeholder="输入日记标题..."
            className="w-full text-3xl font-bold text-[#2C2C2C] bg-transparent border-none outline-none placeholder-[#6B6B6B] font-['Noto_Serif_SC']"
          />
        </div>

        {/* 内容块列表 */}
        <div className="space-y-6">
          <AnimatePresence>
            {diary.blocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={index}
                date={date}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onRemove={() => removeBlock(block.id)}
                onMove={moveBlock}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 添加新块按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <button
            onClick={addBlock}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white border-2 border-dashed border-[#E7E5E4] rounded-lg hover:border-[#D4A574] hover:bg-[#F8F6F0] transition-colors active-press"
          >
            <Plus className="w-5 h-5" />
            <span>添加内容块</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DiaryEditor;
