import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Image, Trash2, X, Upload, Play, FileWarning, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import BlockMetaFields from './BlockMetaFields';
import fileUploadService from '../lib/fileUploadService';

const BlockEditor = ({ block, index, onUpdate, onRemove, onMove, date }) => {
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  // 使用 ref 保持最新的 media 数组引用
  const mediaRef = useRef(block.media || []);
  // 使用更新队列确保串行更新
  const updateQueueRef = useRef(Promise.resolve());
  
  useEffect(() => {
    mediaRef.current = block.media || [];
  }, [block.media]);

  // 串行更新函数，确保更新不会相互覆盖
  const queueUpdate = useCallback((updateFn) => {
    updateQueueRef.current = updateQueueRef.current.then(() => {
      return new Promise((resolve) => {
        const updateData = updateFn(mediaRef.current);
        onUpdate(updateData);
        // 等待一小段时间确保状态更新完成
        setTimeout(resolve, 10);
      });
    });
    return updateQueueRef.current;
  }, [onUpdate]);

  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'block',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        onMove(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const handleAddMedia = () => {
    if (newMediaUrl.trim()) {
      const newMedia = [...(block.media || []), newMediaUrl];
      onUpdate({ media: newMedia });
      setNewMediaUrl('');
      setIsAddingMedia(false);
    }
  };

  const handleRemoveMedia = (mediaIndex) => {
    const newMedia = block.media.filter((_, index) => index !== mediaIndex);
    onUpdate({ media: newMedia });
    // 清除相关的上传状态
    const newProgress = { ...uploadProgress };
    const newErrors = { ...uploadErrors };
    delete newProgress[mediaIndex];
    delete newErrors[mediaIndex];
    setUploadProgress(newProgress);
    setUploadErrors(newErrors);
    
    // 如果删除的是当前封面，清除封面设置
    const media = block.media[mediaIndex];
    const mediaUrl = typeof media === 'object' && media !== null ? (media.thumbnail || media.url) : media;
    if (block.cover === media || block.cover === mediaUrl) {
      onUpdate({ cover: '' });
    }
  };

  const handleRetryUpload = async (mediaIndex) => {
    const media = block.media[mediaIndex];
    if (!media || !media.file) return;

    // 清除错误状态
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[mediaIndex];
      return newErrors;
    });

    // 重新开始上传
    try {
      const fileData = await fileUploadService.uploadFile(media.file, 'local', new Date(date));
      
      const updatedMedia = [...block.media];
      const completedFileData = { ...fileData, uploading: false };
      updatedMedia[mediaIndex] = completedFileData;
      
      onUpdate({ media: updatedMedia });
      
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[mediaIndex];
        return newProgress;
      });
    } catch (error) {
      console.error('重新上传失败:', error);
      setUploadErrors(prev => ({ ...prev, [mediaIndex]: error.message || '上传失败，请重试' }));
    }
  };

  const handleSetCover = (mediaIndex) => {
    const media = block.media[mediaIndex];
    // 如果是对象，使用url或thumbnail；如果是字符串，直接使用
    const coverUrl = typeof media === 'object' && media !== null 
      ? (media.thumbnail || media.url) 
      : media;
    onUpdate({ cover: coverUrl });
  };

  const validateFile = (file) => {
    // 使用fileUploadService的验证方法，保持一致性
    return fileUploadService.validateFile(file);
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setIsUploading(true);

    // 处理被拒绝的文件
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessages = errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return '文件超过 500MB，无法保存到浏览器';
            case 'file-invalid-type':
              return '不支持的文件格式';
            default:
              return '文件上传失败';
          }
        });
        setUploadErrors(prev => ({ ...prev, [file.name]: errorMessages.join(', ') }));
      });
    }

    // 处理接受的文件
    if (acceptedFiles.length > 0) {
      const currentMediaCount = block.media?.length || 0;
      const newMedia = [...(block.media || [])];
      
      // 立即添加占位媒体到媒体列表，图片立即显示（压灰状态）
      const uploadTasks = acceptedFiles.map((file, i) => {
        const preview = URL.createObjectURL(file);
        
        return {
          uploading: true,
          url: preview,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          thumbnail: preview, // 图片和视频都先用预览URL
          file: file, // 保存原始文件对象以便重试
          mediaIndex: currentMediaCount + i
        };
      });

      // 将所有占位图片添加到媒体数组
      uploadTasks.forEach(task => {
        newMedia.push(task);
      });
      
      // 立即更新到UI（所有图片立即显示，但是压灰的）
      onUpdate({ media: newMedia });

      // 异步开始上传每个文件，使用 Promise.all 确保并发上传
      const uploadPromises = acceptedFiles.map(async (file, i) => {
        const mediaIndex = currentMediaCount + i;
        
        try {
          // 将文件保存到本机数据库。
          const fileData = await fileUploadService.uploadFile(file, 'local', new Date(date), { onProgress: progress => setUploadProgress(previous => ({ ...previous, [mediaIndex]: progress })) });
          
          // 设置进度到100%，短暂停留显示完成状态
          setUploadProgress(prev => ({ ...prev, [mediaIndex]: 100 }));
          
          // 等待300ms让用户看到100%完成状态
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // 先清除进度
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[mediaIndex];
            return newProgress;
          });
          
          // 上传完成后，使用队列更新确保不会相互覆盖
          await queueUpdate((currentMediaArray) => {
            const currentMedia = [...currentMediaArray];
            const completedFileData = { 
              ...fileData, 
              uploading: false,
              file: undefined // 移除文件对象引用
            };
            currentMedia[mediaIndex] = completedFileData;
            
            // 如果是第一个媒体且当前没有封面，自动设置为封面
            let updateData = { media: currentMedia };
            if (mediaIndex === 0 && !block.cover) {
              const coverUrl = completedFileData.thumbnail || completedFileData.url;
              updateData.cover = coverUrl;
            }
            
            return updateData;
          });
        } catch (error) {
          console.error('上传失败:', error);
          setUploadErrors(prev => ({ ...prev, [mediaIndex]: error.message || '上传失败，请重试' }));
        }
      });

      // 等待所有上传完成
      await Promise.all(uploadPromises);
      
      setIsUploading(false);
    } else {
      setIsUploading(false);
    }
  }, [block.media, onUpdate, date, queueUpdate, block.cover]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov']
    },
    maxSize: fileUploadService.absoluteMaxSize,
    validator: validateFile
  });

  const isVideo = (media) => {
    // 如果media是对象，检查其type属性
    if (typeof media === 'object' && media !== null) {
      return media.type === 'video';
    }
    // 如果media是字符串，使用正则表达式匹配（兼容旧数据）
    if (typeof media === 'string') {
      return media.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) ||
             media.includes('video') ||
             media.includes('nocode.meituan.com/photo/search?keyword=video');
    }
    return false;
  };

  const getMediaUrl = (media) => {
    if (typeof media === 'object' && media !== null) {
      return media.url;
    }
    return media;
  };

  const getMediaThumbnail = (media) => {
    if (typeof media === 'object' && media !== null && media.thumbnail) {
      return media.thumbnail;
    }
    return getMediaUrl(media);
  };

  const moveBlockUp = () => {
    if (index > 0) {
      onMove(index, index - 1);
    }
  };

  const moveBlockDown = () => {
    onMove(index, index + 1);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        onDrop(files, []);
      }
    };
    input.click();
  };

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl warm-shadow border border-[#E7E5E4] overflow-hidden ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* 块头部 */}
      <div className="flex items-center justify-between p-4 bg-[#F8F6F0] border-b border-[#E7E5E4]">
        <div className="flex items-center space-x-3">
          <GripVertical className="w-5 h-5 text-[#6B6B6B] cursor-move" />
          <span className="text-sm font-medium text-[#6B6B6B]">内容块 {index + 1}</span>

        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={moveBlockUp}
            disabled={index === 0}
            className="p-1 text-[#6B6B6B] hover:text-[#D4A574] transition-colors active-press disabled:opacity-50"
            title="上移"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={moveBlockDown}
            className="p-1 text-[#6B6B6B] hover:text-[#D4A574] transition-colors active-press"
            title="下移"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-[#6B6B6B] hover:text-red-500 transition-colors active-press"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 块内容 */}
      <div className="p-6 space-y-6">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
            小标题
          </label>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="输入小标题..."
            className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
          />
        </div>

        {/* 状态、分类、地点三栏布局 - 使用专用组件 */}
        <BlockMetaFields block={block} onUpdate={onUpdate} />

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
            内容描述
          </label>
          <textarea
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="输入内容描述..."
            rows={4}
            className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent resize-none"
          />
        </div>

        {/* 媒体区 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-[#2C2C2C]">
              媒体内容
            </label>
            <div className="flex space-x-2">
              <button
                onClick={handleFileSelect}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-[#D4A574] text-white rounded-lg hover:bg-[#8B7355] transition-colors active-press"
              >
                <Upload className="w-4 h-4" />
                <span>本地上传</span>
              </button>

            </div>
          </div>

          {/* 拖拽上传区域 */}
          <div
            {...getRootProps()}
            className={`mb-4 p-6 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-[#D4A574] bg-[#F8F6F0]' 
                : 'border-[#E7E5E4] hover:border-[#D4A574]'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto text-[#6B6B6B] mb-2" />
            <p className="text-sm text-[#6B6B6B] mb-2">
              {isDragActive ? '松开鼠标上传文件' : '拖拽文件到此处或点击选择'}
            </p>
            <p className="text-xs text-[#6B6B6B]">
              文件保存到本机浏览器，支持 JPG、PNG、GIF、WebP、MP4、MOV、WebM
            </p>

          </div>


          {/* 添加媒体输入框 */}
          {isAddingMedia && (
            <div className="mb-4 p-4 bg-[#F8F6F0] rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="输入媒体URL..."
                  className="flex-1 px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                />
                <button
                  onClick={handleAddMedia}
                  className="px-4 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#8B7355] transition-colors active-press"
                >
                  添加
                </button>
                <button
                  onClick={() => setIsAddingMedia(false)}
                  className="p-2 text-[#6B6B6B] hover:text-[#2C2C2C] transition-colors active-press"
                >
                  <X className="w-4 h-4" />
                </button>
                </div>
            </div>
          )}

          {/* 媒体列表 - 包括已上传和上传中的文件 */}
          {block.media && block.media.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2" style={{ rowGap: '6px' }}>
              {/* 所有媒体（包括上传中的） */}
              {block.media.map((media, mediaIndex) => (
                <div 
                  key={`media-${mediaIndex}`} 
                  className="relative group w-full"
                >
                  <div className="aspect-square rounded-lg overflow-hidden relative w-full">
                    {isVideo(media) ? (
                      <div className="w-full h-full bg-black relative">
                        <img
                          src={getMediaThumbnail(media)}
                          alt={`视频 ${mediaIndex + 1}`}
                          className={`mx-auto object-cover w-full h-full transition-all duration-300 ${
                            media.uploading ? 'grayscale brightness-75' : ''
                          }`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-[#D4A574]/90 rounded-full p-4 backdrop-blur-sm">
                            <Play className="w-10 h-10 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getMediaUrl(media)}
                        alt={`媒体 ${mediaIndex + 1}`}
                        className={`mx-auto object-cover w-full h-full rounded-lg border-2 border-[#E7E5E4] transition-all duration-300 ${
                          media.uploading ? 'grayscale brightness-75' : ''
                        }`}
                      />
                    )}
                    
                    {/* 上传状态指示器（仅在上传中显示） */}
                    {media.uploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {/* 半透明遮罩 */}
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                        
                        {/* 进度环和文字 */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="relative w-16 h-16 mb-2">
                            {/* 背景圆环 */}
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="4"
                                fill="none"
                              />
                              {/* 进度圆环 */}
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#D4A574"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - (uploadProgress[mediaIndex] || 0) / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-200 ease-out"
                                style={{ filter: 'drop-shadow(0 0 4px rgba(212, 165, 116, 0.8))' }}
                              />
                            </svg>
                            {/* 百分比文字 */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-sm font-bold drop-shadow-lg">
                                {Math.round(uploadProgress[mediaIndex] || 0)}%
                              </span>
                            </div>
                          </div>
                          
                          {/* 上传中文字 */}
                          <span className="text-white text-xs font-medium drop-shadow-lg">
                            上传中...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleSetCover(mediaIndex)}
                      className="p-2 bg-white rounded-full hover:bg-[#F8F6F0] transition-colors active-press"
                      title="设为封面"
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveMedia(mediaIndex)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors active-press"
                      title="删除"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* 封面标记 */}
                  {(() => {
                    const mediaUrl = getMediaUrl(media);
                    const mediaThumbnail = getMediaThumbnail(media);
                    return (block.cover === media || block.cover === mediaUrl || block.cover === mediaThumbnail);
                  })() && (
                    <div className="absolute top-2 left-2 px-3 py-1.5 bg-[#D4A574] text-white text-sm font-medium rounded-full shadow-md">
                      封面
                    </div>
                  )}

                  {/* 错误提示和重试 */}
                  {uploadErrors[mediaIndex] && (
                    <div className="absolute inset-0 bg-red-500/95 rounded-lg flex flex-col items-center justify-center p-3 backdrop-blur-sm z-10">
                      <FileWarning className="w-8 h-8 text-white mb-2" />
                      <p className="text-white text-xs text-center font-medium mb-3">
                        {uploadErrors[mediaIndex]}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRetryUpload(mediaIndex)}
                          className="px-3 py-1.5 bg-white text-red-600 text-xs font-medium rounded hover:bg-gray-100 transition-colors active-press"
                        >
                          重新上传
                        </button>
                        <button
                          onClick={() => handleRemoveMedia(mediaIndex)}
                          className="px-3 py-1.5 bg-white/20 text-white text-xs font-medium rounded hover:bg-white/30 transition-colors active-press"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BlockEditor;
