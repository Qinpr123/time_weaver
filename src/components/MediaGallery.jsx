import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MediaGallery = ({
  media = [],
  className = '',
  onMediaClick,
  showControls = true,
  maxColumns = 4,
  gap = 'gap-2'
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [videoStates, setVideoStates] = useState({});
  const videoRefs = useRef({});

  // 打开灯箱
  const openLightbox = useCallback((index) => {
    setCurrentMediaIndex(index);
    setLightboxOpen(true);

    // 暂停所有视频
    Object.values(videoRefs.current).forEach(video => {
      if (video && !video.paused) {
        video.pause();
      }
    });

    if (onMediaClick) {
      onMediaClick(index);
    }
  }, [onMediaClick]);

  // 关闭灯箱
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);

    // 暂停当前播放的视频
    const currentMedia = media[currentMediaIndex];
    if (currentMedia?.type === 'video') {
      const video = videoRefs.current[currentMediaIndex];
      if (video && !video.paused) {
        video.pause();
      }
    }
  }, [media, currentMediaIndex]);

  // 导航到上一个媒体
  const goToPrevious = useCallback(() => {
    setCurrentMediaIndex(prev => (prev > 0 ? prev - 1 : media.length - 1));
  }, [media.length]);

  // 导航到下一个媒体
  const goToNext = useCallback(() => {
    setCurrentMediaIndex(prev => (prev < media.length - 1 ? prev + 1 : 0));
  }, [media.length]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    if (!lightboxOpen) return;

    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      default:
        break;
    }
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext]);

  // 视频播放控制
  const toggleVideoPlay = useCallback((index, event) => {
    event?.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
      setVideoStates(prev => ({ ...prev, [index]: { ...prev[index], playing: true } }));
    } else {
      video.pause();
      setVideoStates(prev => ({ ...prev, [index]: { ...prev[index], playing: false } }));
    }
  }, []);

  // 视频音量控制
  const toggleVideoMute = useCallback((index, event) => {
    event?.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;

    video.muted = !video.muted;
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        muted: video.muted
      }
    }));
  }, []);

  // 下载媒体文件
  const downloadMedia = useCallback(async (mediaItem, event) => {
    event?.stopPropagation();

    try {
      const response = await fetch(mediaItem.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = mediaItem.fileName || `media_${Date.now()}.${mediaItem.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载文件失败:', error);
    }
  }, []);

  // 计算网格列数
  const getGridColumns = () => {
    if (media.length === 1) return 'grid-cols-1';
    if (media.length === 2) return 'grid-cols-2';
    if (media.length <= 4) return `grid-cols-${Math.min(media.length, maxColumns)}`;
    return `grid-cols-${maxColumns}`;
  };

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <>
      {/* 媒体网格 */}
      <div
        className={`media-gallery ${className} grid ${getGridColumns()} ${gap}`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {media.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100"
            onClick={() => openLightbox(index)}
          >
            {/* 图片展示 */}
            {item.type === 'image' && (
              <img
                src={item.thumbnail || item.url}
                alt={`图片 ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {/* 视频展示 */}
            {item.type === 'video' && (
              <div className="relative w-full h-full">
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={item.url}
                  poster={item.thumbnail}
                  className="w-full h-full object-cover"
                  onClick={(e) => toggleVideoPlay(index, e)}
                  onPlay={() => setVideoStates(prev => ({ ...prev, [index]: { ...prev[index], playing: true } }))}
                  onPause={() => setVideoStates(prev => ({ ...prev, [index]: { ...prev[index], playing: false } }))}
                  muted={videoStates[index]?.muted ?? true}
                  loop
                />

                {/* 视频控制覆盖层 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2">
                    <button
                      onClick={(e) => toggleVideoPlay(index, e)}
                      className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                    >
                      {videoStates[index]?.playing ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => toggleVideoMute(index, e)}
                      className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                    >
                      {videoStates[index]?.muted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 视频播放指示器 */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-xs text-white">
                  视频
                </div>
              </div>
            )}

            {/* 悬停覆盖层 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* 下载按钮 */}
            {showControls && (
              <button
                onClick={(e) => downloadMedia(item, e)}
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70"
              >
                <Download className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* 灯箱预览 */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* 关闭按钮 */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 导航按钮 */}
            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* 当前媒体内容 */}
            <div
              className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={currentMediaIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {media[currentMediaIndex]?.type === 'image' && (
                  <img
                    src={media[currentMediaIndex].url}
                    alt={`图片 ${currentMediaIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                )}

                {media[currentMediaIndex]?.type === 'video' && (
                  <div className="relative">
                    <video
                      ref={el => videoRefs.current[currentMediaIndex] = el}
                      src={media[currentMediaIndex].url}
                      poster={media[currentMediaIndex].thumbnail}
                      className="max-w-full max-h-full"
                      controls
                      autoPlay
                    />
                  </div>
                )}
              </motion.div>
            </div>

            {/* 缩略图导航 */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {media.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentMediaIndex
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-70'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* 下载按钮 */}
            {showControls && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadMedia(media[currentMediaIndex]);
                }}
                className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 rounded text-white hover:bg-opacity-70 transition-colors z-10"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MediaGallery;
