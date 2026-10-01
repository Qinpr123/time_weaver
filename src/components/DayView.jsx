import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, setMonth, setYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, MapPin, Clock, Heart, Image, Play, Download, X, Check } from 'lucide-react';
import { useDiary } from '../contexts/DiaryContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toPng, toJpeg } from 'html-to-image';
import { toast } from 'sonner';

const DayView = () => {
  const { selectedDate, setSelectedDate, getDiaryByDate, deleteDiary, saveDiary, diaries } = useDiary();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [tempYear, setTempYear] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const scrollContainerRef = useRef(null);
  const selectedDateRef = useRef(null);
  const diaryCardRef = useRef(null); // 日记卡片引用，用于导出
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const diary = getDiaryByDate(currentDate);


  // 版式与点缀的全局参数，便于后续微调
  const LAYOUT_CONFIG = {
    tapeSkipProbability: 0.3, // 30% 不贴胶带
    shortTextThreshold: 120,  // 文本短的阈值（字）
    maxTapeWhenManyImages: 6, // 图片多于此值不贴
  };

  // 分类 -> 多素材映射（与 BlockMetaFields 预设分类一致）
  const CATEGORY_ASSETS = {
    '日常': [
      `${import.meta.env.BASE_URL}activities/undraw_cool-break_cipj.png`,
      `${import.meta.env.BASE_URL}activities/undraw_images_v4j9.png`
    ],
    '美食': [
      `${import.meta.env.BASE_URL}activities/undraw_barbecue_k11q.png`,
      `${import.meta.env.BASE_URL}activities/undraw_coffee-run_kfzq.png`
    ],
    '旅行': [
      `${import.meta.env.BASE_URL}activities/undraw_at-the-airport_z3b9.png`,
      `${import.meta.env.BASE_URL}activities/undraw_walk-in-the-city_tk65.png`
    ],
    '玩乐': [
      `${import.meta.env.BASE_URL}activities/undraw_gaming-controller_qzoc.png`,
      `${import.meta.env.BASE_URL}activities/undraw_party_k6eg.png`
    ],
    '自己': [
      `${import.meta.env.BASE_URL}activities/undraw_my-universe_qqch.png`,
      `${import.meta.env.BASE_URL}activities/undraw_got-an-idea_1z3i.png`,
      `${import.meta.env.BASE_URL}activities/undraw_ideas_vn7a.png`,
      `${import.meta.env.BASE_URL}activities/undraw_relaxation_jsge.png`,
      `${import.meta.env.BASE_URL}activities/undraw_relax-mode_6i13.png`,
      `${import.meta.env.BASE_URL}activities/undraw_yoga_i399.png`,
      `${import.meta.env.BASE_URL}activities/undraw_loving-it_hspq.png`,
      `${import.meta.env.BASE_URL}activities/undraw_time-management_4ss6.png`
    ],
    '朋友': [
      `${import.meta.env.BASE_URL}activities/undraw_work-friends_g4mn.png`,
      `${import.meta.env.BASE_URL}activities/undraw_social-friends_mt6k.png`
    ],
    '家人': [
      `${import.meta.env.BASE_URL}activities/family.png`,
      `${import.meta.env.BASE_URL}activities/undraw_books_wxzz.png`
    ],
    '宠物': [
      `${import.meta.env.BASE_URL}activities/with dog.png`
    ],
    '情侣': [
      `${import.meta.env.BASE_URL}activities/couple.png`,
      `${import.meta.env.BASE_URL}activities/undraw_with-love_rs1k.png`
    ],
    '风景': [
      `${import.meta.env.BASE_URL}activities/undraw_landscape-mode_z2v5.png`,
      `${import.meta.env.BASE_URL}activities/undraw_beach-day_cnsv.png`,
      `${import.meta.env.BASE_URL}activities/undraw_hot-air-balloon_6knx.png`,
      `${import.meta.env.BASE_URL}activities/in the park.png`
    ],
    '学习': [
      `${import.meta.env.BASE_URL}activities/undraw_reading-a-book_4cap.png`,
      `${import.meta.env.BASE_URL}activities/undraw_book-writer_ri5u.png`
    ],
    '工作': [
      `${import.meta.env.BASE_URL}activities/undraw_workspace_s6wf.png`,
      `${import.meta.env.BASE_URL}activities/undraw_real-time-collaboration_bchs.png`
    ],
    '运动': [
      `${import.meta.env.BASE_URL}activities/undraw_morning-workout_73u9.png`,
      `${import.meta.env.BASE_URL}activities/undraw_bike-ride_ba0o.png`
    ],
    '作品': [
      `${import.meta.env.BASE_URL}activities/undraw_proud-designer_1rcm.png`,
      `${import.meta.env.BASE_URL}activities/undraw_blogging_38kl.png`
    ],
    '__default__': [
      `${import.meta.env.BASE_URL}activities/undraw_images_v4j9.png`,
      `${import.meta.env.BASE_URL}activities/undraw_you-re-here_1771.png`,
      `${import.meta.env.BASE_URL}activities/undraw_to-the-moon_w1wa.png`,
      `${import.meta.env.BASE_URL}activities/undraw_nice-to-meet-you_sqin.png`,
      `${import.meta.env.BASE_URL}activities/undraw_completing_3pe7.png`,
      `${import.meta.env.BASE_URL}activities/undraw_photographer_2rbr.png`,
      `${import.meta.env.BASE_URL}activities/selfie.png`
    ]
  };


  const pickCategoryAsset = (categories, index = 0) => {
    const key = (categories && categories[0]) || '__default__';
    const list = CATEGORY_ASSETS[key] || CATEGORY_ASSETS['__default__'];
    return list[index % list.length];
  };

  // 分类 -> 胶带素材映射（多款，随机取一）
  const TAPE_ASSETS = {
    '日常': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`
    ],
    '美食': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`
    ],
    '旅行': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`
    ],
    '玩乐': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`
    ],
    '自己': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`
    ],
    '朋友': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`
    ],
    '家人': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`
    ],
    '宠物': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`
    ],
    '情侣': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`
    ],
    '风景': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`
    ],
    '学习': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`
    ],
    '工作': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`
    ],
    '运动': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (9).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`
    ],
    '作品': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (4).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (1).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`
    ],
    '__default__': [
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (2).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (6).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (8).png`,
      `${import.meta.env.BASE_URL}washi tape vector/手绘胶带 (5).png`
    ]
  };


  const pickTapeAsset = (categories, index = 0) => {
    const key = (categories && categories[0]) || '__default__';
    const list = TAPE_ASSETS[key] || TAPE_ASSETS['__default__'];
    return list[index % list.length];
  };

  // 根据分类/状态返回主题样式与装饰
  const getThemeByDiary = (d) => {
    const firstBlock = d?.blocks?.[0];
    const category = firstBlock?.categories?.[0] || firstBlock?.status?.label || '默认';
    const baseUrl = import.meta.env.BASE_URL;
    const themeSets = {
      '日常': { accent: '#A8A29E', illos: [`${baseUrl}activities/undraw_cool-break_cipj.png`, `${baseUrl}activities/undraw_images_v4j9.png`, `${baseUrl}activities/undraw_relaxation_jsge.png`] },
      '美食': { accent: '#C97A63', illos: [`${baseUrl}activities/undraw_barbecue_k11q.png`, `${baseUrl}activities/undraw_coffee-run_kfzq.png`] },
      '旅行': { accent: '#D4A574', illos: [`${baseUrl}activities/undraw_at-the-airport_z3b9.png`, `${baseUrl}activities/undraw_walk-in-the-city_tk65.png`, `${baseUrl}activities/undraw_hot-air-balloon_6knx.png`] },
      '玩乐': { accent: '#B085D6', illos: [`${baseUrl}activities/undraw_gaming-controller_qzoc.png`, `${baseUrl}activities/undraw_party_k6eg.png`] },
      '自己': { accent: '#8EA1B8', illos: [`${baseUrl}activities/undraw_my-universe_qqch.png`, `${baseUrl}activities/undraw_got-an-idea_1z3i.png`, `${baseUrl}activities/undraw_ideas_vn7a.png`, `${baseUrl}activities/undraw_relaxation_jsge.png`, `${baseUrl}activities/undraw_relax-mode_6i13.png`, `${baseUrl}activities/undraw_yoga_i399.png`, `${baseUrl}activities/undraw_loving-it_hspq.png`, `${baseUrl}activities/undraw_time-management_4ss6.png`] },
      '朋友': { accent: '#7FB28B', illos: [`${baseUrl}activities/undraw_work-friends_g4mn.png`, `${baseUrl}activities/undraw_social-friends_mt6k.png`] },
      '家人': { accent: '#9F8268', illos: [`${baseUrl}activities/family.png`, `${baseUrl}activities/undraw_books_wxzz.png`] },
      '宠物': { accent: '#CCAA66', illos: [`${baseUrl}activities/with dog.png`] },
      '情侣': { accent: '#D48C8C', illos: [`${baseUrl}activities/couple.png`, `${baseUrl}activities/undraw_with-love_rs1k.png`] },
      '风景': { accent: '#7FA6A8', illos: [`${baseUrl}activities/undraw_landscape-mode_z2v5.png`, `${baseUrl}activities/undraw_stars_5pgw.png`] },
      '学习': { accent: '#7C8C6E', illos: [`${baseUrl}activities/undraw_reading-a-book_4cap.png`, `${baseUrl}activities/undraw_writing-down-ideas_h99r.png`, `${baseUrl}activities/undraw_book-writer_ri5u.png`] },
      '工作': { accent: '#8B7355', illos: [`${baseUrl}activities/undraw_workspace_s6wf.png`, `${baseUrl}activities/undraw_real-time-collaboration_bchs.png`] },
      '运动': { accent: '#6BA58C', illos: [`${baseUrl}activities/undraw_morning-workout_73u9.png`, `${baseUrl}activities/undraw_bike-ride_ba0o.png`] },
      '作品': { accent: '#B78C6C', illos: [`${baseUrl}activities/undraw_proud-designer_1rcm.png`, `${baseUrl}activities/undraw_blogging_38kl.png`] },
      '默认': { accent: '#A8A29E', illos: [`${baseUrl}activities/undraw_my-universe_qqch.png`, `${baseUrl}activities/undraw_stars_5pgw.png`, `${baseUrl}activities/undraw_images_v4j9.png`, `${baseUrl}activities/undraw_you-re-here_1771.png`, `${baseUrl}activities/undraw_to-the-moon_w1wa.png`, `${baseUrl}activities/undraw_space-exploration_dhu1.png`, `${baseUrl}activities/undraw_nice-to-meet-you_sqin.png`] }
    };
    const t = themeSets[category] || themeSets['默认'];
    const illo = t.illos[Math.floor(Math.random() * t.illos.length)];
    return { accent: t.accent, illo };
  };

  // 胶带是否显示与位置策略：避免过满/过少（30% 概率不贴；若块内已有插画或图片很多则不贴）
  const shouldShowTape = (block, index) => {
    const mediaCount = (block.media?.length || 0);
    const shortText = (block.content || '').length < LAYOUT_CONFIG.shortTextThreshold;
    const base = Math.random();
    if (mediaCount >= LAYOUT_CONFIG.maxTapeWhenManyImages) return false; // 图片多，避免过杂
    if (!mediaCount && !shortText && base < LAYOUT_CONFIG.tapeSkipProbability) return false; // 内容足够时偶尔不贴
    return true;
  };

  const tapePositionClass = (index) => {
    // 交替几种角位置与角度 - 适度超出边界作为装饰效果
    const mod = index % 3;
    if (mod === 0) return 'absolute top-1 -left-6 w-24 h-6 rotate-[140deg]';
    if (mod === 1) return 'absolute top-2 -right-6 w-24 h-6 -rotate-[140deg]';
    return 'absolute -bottom-3 -left-4 w-24 h-9 rotate-[28deg]';
  };

  const renderBlockTape = (block, index) => (
    shouldShowTape(block, index) && (
      <div className={`${tapePositionClass(index)} opacity-85 pointer-events-none`} style={{ zIndex: 2 }}>
        <img src={pickTapeAsset(block.categories, index)} alt="tape" className="w-full h-full object-contain" />
      </div>
    )
  );

  const handlePrevDay = () => {
    const prevDay = subDays(currentDate, 1);
    setCurrentDate(prevDay);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    setCurrentDate(nextDay);
    setSelectedDate(nextDay);
  };

  const handleCreateDiary = () => {
    // 直接跳转到编辑界面
    navigate(`/editor/${format(currentDate, 'yyyy-MM-dd')}`);
  };

  const handleEditDiary = () => {
    navigate(`/editor/${format(currentDate, 'yyyy-MM-dd')}`);
  };

  const handleDeleteDiary = async () => {
    // 使用 toast 显示确认对话框
    toast('确定要删除这篇日记吗？此操作不可撤销。', {
      duration: Infinity, // 不自动消失
      action: {
        label: '删除',
        onClick: async () => {
          try {
            await deleteDiary(currentDate);
            navigate('/');
            toast.success('日记已删除');
          } catch (error) {
            console.error('删除日记失败:', error);
            toast.error('删除失败，请重试', {
              duration: 3000,
            });
          }
        },
      },
      cancel: {
        label: '取消',
        onClick: () => {},
      },
    });
  };

  // 月份导航
  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    setCurrentDate(prevMonth);
    setSelectedDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    setCurrentDate(nextMonth);
    setSelectedDate(nextMonth);
  };

  // 年月编辑
  const handleYearClick = () => {
    setIsEditingYear(true);
    setTempYear(currentDate.getFullYear().toString());
  };

  const handleMonthClick = () => {
    setIsEditingMonth(true);
    setTempMonth((currentDate.getMonth() + 1).toString().padStart(2, '0'));
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
        const newDate = setYear(currentDate, yearNum);
        setCurrentDate(newDate);
        setSelectedDate(newDate);
      }
    }
    setIsEditingYear(false);
  };

  const handleMonthConfirm = () => {
    if (tempMonth && tempMonth.length <= 2) {
      const monthNum = parseInt(tempMonth) - 1;
      if (monthNum >= 0 && monthNum <= 11) {
        const newDate = setMonth(currentDate, monthNum);
        setCurrentDate(newDate);
        setSelectedDate(newDate);
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


  // 获取当月所有日期
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 检查某天是否有日记
  const hasDiary = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return !!diaries[dateKey];
  };

  // 检查滚动状态
  const checkScrollStatus = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // 平滑滚动
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };


  // 日期点击处理
  const handleDateClick = (date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  // 监听滚动事件，更新滚动状态
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        checkScrollStatus();
      };
      
      container.addEventListener('scroll', handleScroll);
      checkScrollStatus();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const openLightbox = (blockIndex, mediaIndex) => {
    setCurrentBlockIndex(blockIndex);
    setCurrentMediaIndex(mediaIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateLightbox = (direction) => {
    const currentBlock = diary.blocks[currentBlockIndex];
    const totalMedia = currentBlock.media.length;

    if (direction === 'next') {
      setCurrentMediaIndex((prev) => (prev + 1) % totalMedia);
    } else {
      setCurrentMediaIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
    }
  };

  // 将图片URL转换为base64，解决CORS问题
  const imageToBase64 = (url) => {
    return new Promise((resolve) => {
      // 如果是data URL，直接返回
      if (url.startsWith('data:')) {
        resolve(url);
        return;
      }
      
      // 如果是blob URL，直接转换为base64
      if (url.startsWith('blob:')) {
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => {
              console.warn('Blob转换失败，使用原URL:', url);
              resolve(url); // 转换失败时返回原URL
            };
            reader.readAsDataURL(blob);
          })
          .catch(() => {
            console.warn('Blob获取失败，使用原URL:', url);
            resolve(url); // 获取失败时返回原URL
          });
        return;
      }
      
      // 对于外部URL（包括Supabase storage），尝试通过canvas转换为base64
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 设置跨域属性
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          // 如果转换失败（可能是CORS问题），返回原URL
          console.warn('图片转换为base64失败，使用原URL:', url, error);
          resolve(url);
        }
      };
      
      img.onerror = () => {
        // 加载失败，返回原URL
        console.warn('图片加载失败，使用原URL:', url);
        resolve(url);
      };
      
      // 设置超时保护
      setTimeout(() => {
        if (!img.complete) {
          console.warn('图片加载超时，使用原URL:', url);
          resolve(url);
        }
      }, 5000);
      
      img.src = url;
    });
  };

  // 等待所有图片加载完成并转换为base64（解决CORS问题）
  const waitForImages = async (container) => {
    const images = container.querySelectorAll('img');
    if (images.length === 0) {
      return;
    }
    
    // 先等待所有图片加载完成
    await new Promise((resolve) => {
      let loadedCount = 0;
      let errorCount = 0;
      const total = images.length;
      
      const checkComplete = () => {
        if (loadedCount + errorCount >= total) {
          resolve();
        }
      };
      
      images.forEach((img) => {
        if (img.complete && img.naturalHeight !== 0) {
          loadedCount++;
          checkComplete();
        } else {
          img.onload = () => {
            loadedCount++;
            checkComplete();
          };
          img.onerror = () => {
            errorCount++;
            checkComplete();
          };
        }
      });
      
      // 超时保护：最多等待10秒
      setTimeout(() => {
        resolve();
      }, 10000);
    });
    
    // 将所有图片转换为base64，解决CORS问题
    // 优先转换blob URL（用户上传的），然后是可能跨域的URL
    const conversionPromises = Array.from(images).map(async (img) => {
      const src = img.src;
      
      // 跳过已经是data URL的图片
      if (src.startsWith('data:')) {
        return;
      }
      
      // 优先处理blob URL（用户上传的本地文件）- 必须转换
      // 也处理可能跨域的URL（如Supabase storage、nocode.meituan.com等）
      const isBlobUrl = src.startsWith('blob:');
      const isPossibleCrossOrigin = src.includes('supabase') || 
                                   src.includes('storage') ||
                                   src.includes('nocode.meituan.com') ||
                                   (src.startsWith('http') && !src.includes(window.location.origin));
      
      // blob URL必须转换（这是用户上传的图片，无法通过CORS）
      // 跨域URL也尝试转换，以确保导出成功
      const needsConversion = isBlobUrl || isPossibleCrossOrigin;
      
      if (needsConversion) {
        try {
          const base64Url = await imageToBase64(src);
          if (base64Url && base64Url !== src && base64Url.startsWith('data:')) {
            // 只有当成功转换为base64时才更新
            img.src = base64Url;
            // 等待图片更新加载
            await new Promise((resolve) => {
              if (img.complete && img.naturalHeight !== 0) {
                resolve();
              } else {
                const timeout = setTimeout(resolve, 2000); // 2秒超时
                img.onload = () => {
                  clearTimeout(timeout);
                  resolve();
                };
                img.onerror = () => {
                  clearTimeout(timeout);
                  resolve();
                };
              }
            });
          }
        } catch (error) {
          console.warn('图片转换失败，继续使用原URL:', src, error);
        }
      }
    });
    
    await Promise.all(conversionPromises);
  };

  // 导出日记为图片
  const handleExportDiary = async () => {
    if (!diaryCardRef.current || isExporting) return;
    
    setIsExporting(true);
    
    // 显示开始导出提示
    const toastId = toast.loading('正在导出...', {
      duration: Infinity, // 加载提示不自动消失
    });
    
    // 存储需要恢复的元素
    const elementsToRestore = [];
    
    try {
      // 临时隐藏操作按钮
      const buttonGroup = diaryCardRef.current?.querySelector('.absolute.top-4.left-4');
      if (buttonGroup) {
        const originalDisplay = buttonGroup.style.display;
        buttonGroup.style.display = 'none';
        elementsToRestore.push({ element: buttonGroup, property: 'display', value: originalDisplay });
      }
      
      // 隐藏右上角插图 - 使用多种选择器确保找到
      let illustration = diaryCardRef.current?.querySelector('img.decoration-illustration');
      if (!illustration) {
        // 备用选择器：通过 alt 属性查找
        illustration = Array.from(diaryCardRef.current?.querySelectorAll('img') || []).find(
          img => img.alt === 'decoration' && img.classList.contains('absolute')
        );
      }
      if (!illustration) {
        // 备用选择器：通过位置查找（右上角）
        illustration = Array.from(diaryCardRef.current?.querySelectorAll('img') || []).find(
          img => img.classList.contains('absolute') && 
                 (img.classList.contains('-right-2') || img.classList.contains('-right-4') || 
                  img.classList.contains('decoration-illustration'))
        );
      }
      
      if (illustration) {
        const originalDisplay = illustration.style.display;
        const originalVisibility = illustration.style.visibility;
        illustration.style.display = 'none';
        illustration.style.visibility = 'hidden';
        elementsToRestore.push({ 
          element: illustration, 
          properties: { 
            display: originalDisplay,
            visibility: originalVisibility
          }
        });
      }
      
      // 等待所有图片加载完成并转换为base64（解决CORS问题）
      toast.loading('正在处理图片...', {
        id: toastId,
        duration: Infinity,
      });
      await waitForImages(diaryCardRef.current);
      
      // 等待DOM更新和布局稳定（增加等待时间以适应长内容）
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 计算内容尺寸，自适应调整参数
      const cardWidth = diaryCardRef.current.offsetWidth || diaryCardRef.current.clientWidth;
      const cardHeight = diaryCardRef.current.scrollHeight;
      const aspectRatio = cardHeight / cardWidth; // 宽高比（高度/宽度）
      
      // 判断内容长度等级
      const isLongContent = cardHeight > 3000; // 超过3000px认为是长内容
      const isVeryLongContent = cardHeight > 5000; // 超过5000px认为是超长内容
      const isSuperLongContent = cardHeight > 8000 || aspectRatio > 8; // 超过8000px或宽高比>8认为是超级长图
      
      // 根据内容长度自适应调整分辨率
      // 超级长图（1:10或更长）：使用1倍分辨率，确保能导出
      // 超长内容（5000-8000px）：使用1.2倍分辨率
      // 长内容（3000-5000px）：使用1.5倍分辨率
      // 普通内容：使用2倍分辨率
      let pixelRatio = 2;
      if (isSuperLongContent) {
        pixelRatio = 1.0; // 超级长图：1倍分辨率
      } else if (isVeryLongContent) {
        pixelRatio = 1.2; // 超长内容：1.2倍分辨率
      } else if (isLongContent) {
        pixelRatio = 1.5; // 长内容：1.5倍分辨率
      }
      
      // 记录原始样式（如果之前有设置）
      const originalWidth = diaryCardRef.current.style.width || '';
      const originalMaxWidth = diaryCardRef.current.style.maxWidth || '';
      const originalBoxSizing = diaryCardRef.current.style.boxSizing || '';
      
      // 导出为高分辨率PNG图片
      // 网页截图大小不受图片文件本身大小影响，而是受DOM元素的CSS样式控制的渲染尺寸影响
      // 因此可以通过CSS控制卡片宽度，然后导出整个卡片高度，得到1:10或更长的长图
      const dataUrl = await toPng(diaryCardRef.current, {
        quality: isSuperLongContent ? 0.95 : 1.0, // 超级长图稍微降低质量
        pixelRatio: pixelRatio, // 自适应分辨率
        backgroundColor: '#FCFAF7', // 背景色
        skipAutoScale: false,
        useCORS: true,
        allowTaint: true,
        cacheBust: true,
        // 不设置最大尺寸限制，允许导出任意长度的长图（1:10或更长）
        maxWidth: undefined,
        maxHeight: undefined,
        filter: (node) => {
          // 过滤掉右上角插图和操作按钮
          if (node.classList?.contains('decoration-illustration')) return false;
          if (node.classList?.contains('absolute') && 
              (node.classList.contains('-right-2') || node.classList.contains('-right-4')) &&
              node.tagName === 'IMG' && node.alt === 'decoration') return false;
          if (node.classList?.contains('absolute') && 
              node.classList.contains('top-4') && 
              node.classList.contains('left-4')) return false;
          return true;
        }
      });
      
      // 恢复所有元素的样式
      elementsToRestore.forEach(({ element, property, value, properties }) => {
        if (properties) {
          Object.entries(properties).forEach(([prop, val]) => {
            element.style[prop] = val;
          });
        } else {
          element.style[property] = value;
        }
      });
      
      // 恢复宽度（如果之前有设置）
      if (originalWidth) diaryCardRef.current.style.width = originalWidth;
      if (originalMaxWidth) diaryCardRef.current.style.maxWidth = originalMaxWidth;
      
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `${format(currentDate, 'yyyy-MM-dd')}-${diary.title || 'diary'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('图片已下载', {
        id: toastId,
        duration: 2000,
      });
    } catch (error) {
      console.error('导出失败:', error);
      
      // 尝试降低质量重试一次（仅对长内容）
      const cardHeight = diaryCardRef.current?.scrollHeight || 0;
      const isLongContent = cardHeight > 3000;
      
      // 计算内容尺寸用于重试
      const retryCardWidth = diaryCardRef.current?.offsetWidth || diaryCardRef.current?.clientWidth || 0;
      const retryCardHeight = diaryCardRef.current?.scrollHeight || 0;
      const retryAspectRatio = retryCardHeight / retryCardWidth;
      const retryIsSuperLong = retryCardHeight > 8000 || retryAspectRatio > 8;
      
      if ((isLongContent || retryIsSuperLong) && (error.message?.includes('size') || error.message?.includes('memory'))) {
        try {
          // 更新提示：尝试降级导出
          toast.loading('内容较长，正在使用更低分辨率重新导出...', {
            id: toastId,
            duration: Infinity,
          });
          
          console.log('尝试使用更低的分辨率重新导出...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 超级长图使用0.8倍分辨率，普通长图使用1倍分辨率
          const retryPixelRatio = retryIsSuperLong ? 0.8 : 1.0;
          
          const dataUrl = await toPng(diaryCardRef.current, {
            quality: 0.9, // 进一步降低质量
            pixelRatio: retryPixelRatio, // 使用更低的分辨率
            backgroundColor: '#FCFAF7',
            skipAutoScale: false,
            useCORS: true,
            allowTaint: true,
            cacheBust: true,
            maxWidth: undefined,
            maxHeight: undefined,
            filter: (node) => {
              if (node.classList?.contains('decoration-illustration')) return false;
              if (node.classList?.contains('absolute') && 
                  (node.classList.contains('-right-2') || node.classList.contains('-right-4')) &&
                  node.tagName === 'IMG' && node.alt === 'decoration') return false;
              if (node.classList?.contains('absolute') && 
                  node.classList.contains('top-4') && 
                  node.classList.contains('left-4')) return false;
              return true;
            }
          });
          
          const link = document.createElement('a');
          link.download = `${format(currentDate, 'yyyy-MM-dd')}-${diary.title || 'diary'}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 恢复元素
          elementsToRestore.forEach(({ element, property, value, properties }) => {
            if (properties) {
              Object.entries(properties).forEach(([prop, val]) => {
                element.style[prop] = val;
              });
            } else {
              element.style[property] = value;
            }
          });
          
          // 显示成功提示（降级导出）
          toast.success('图片已下载', {
            id: toastId,
            duration: 2000,
          });
          
          setIsExporting(false);
          return;
        } catch (retryError) {
          console.error('重试导出也失败:', retryError);
          toast.error('导出失败', {
            id: toastId,
            duration: 3000,
          });
        }
      } else {
        // 非长内容错误，直接显示失败提示
        toast.error('导出失败', {
          id: toastId,
          duration: 3000,
        });
      }
      
      // 确保恢复显示 - 使用多种选择器查找
      const buttonGroup = diaryCardRef.current?.querySelector('.absolute.top-4.left-4');
      if (buttonGroup) buttonGroup.style.display = '';
      
      let illustration = diaryCardRef.current?.querySelector('img.decoration-illustration');
      if (!illustration) {
        illustration = Array.from(diaryCardRef.current?.querySelectorAll('img') || []).find(
          img => img.alt === 'decoration' && img.classList.contains('absolute')
        );
      }
      if (illustration) {
        illustration.style.display = '';
        illustration.style.visibility = '';
      }
    } finally {
      setIsExporting(false);
    }
  };

  // 判断是否为视频文件
  const isVideo = (media) => {
    // 如果media是对象，检查其type属性
    if (typeof media === 'object' && media !== null) {
      return media.type === 'video';
    }
    // 如果media是字符串，使用正则表达式匹配（兼容旧数据）
    if (typeof media === 'string') {
      return media.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) || media.includes('video');
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

  // 获取分类对应的插画
  const getCategoryIllustration = (categories) => {
    if (!categories || categories.length === 0) return null;

    const category = categories[0];
    const illustrations = {
      '日常': `${import.meta.env.BASE_URL}activities/undraw_working-out_6ksl.png`,
      '美食': `${import.meta.env.BASE_URL}activities/undraw_barbecue_k11q.png`,
      '旅行': `${import.meta.env.BASE_URL}activities/undraw_at-the-airport_z3b9.png`,
      '玩乐': `${import.meta.env.BASE_URL}activities/undraw_gaming-controller_qzoc.png`,
      '自己': [
        `${import.meta.env.BASE_URL}activities/undraw_my-universe_qqch.png`,
        `${import.meta.env.BASE_URL}activities/undraw_ideas_vn7a.png`,
        `${import.meta.env.BASE_URL}activities/undraw_relaxation_jsge.png`,
        `${import.meta.env.BASE_URL}activities/undraw_yoga_i399.png`,
        `${import.meta.env.BASE_URL}activities/undraw_loving-it_hspq.png`
      ],
      '朋友': `${import.meta.env.BASE_URL}activities/undraw_social-friends_mt6k.png`,
      '家人': `${import.meta.env.BASE_URL}activities/family.png`,
      '宠物': `${import.meta.env.BASE_URL}activities/with dog.png`,
      '情侣': `${import.meta.env.BASE_URL}activities/couple.png`,
      '风景': `${import.meta.env.BASE_URL}activities/undraw_landscape-mode_z2v5.png`,
      '学习': `${import.meta.env.BASE_URL}activities/undraw_reading-a-book_4cap.png`,
      '工作': `${import.meta.env.BASE_URL}activities/undraw_workspace_s6wf.png`,
      '运动': `${import.meta.env.BASE_URL}activities/undraw_morning-workout_73u9.png`,
      '作品': `${import.meta.env.BASE_URL}activities/undraw_proud-designer_1rcm.png`
    };

    const defaultIllustrations = [
      `${import.meta.env.BASE_URL}activities/undraw_my-universe_qqch.png`,
      `${import.meta.env.BASE_URL}activities/undraw_stars_5pgw.png`,
      `${import.meta.env.BASE_URL}activities/undraw_images_v4j9.png`,
      `${import.meta.env.BASE_URL}activities/undraw_you-re-here_1771.png`,
      `${import.meta.env.BASE_URL}activities/undraw_to-the-moon_w1wa.png`,
      `${import.meta.env.BASE_URL}activities/undraw_space-exploration_dhu1.png`
    ];

    const categoryIllo = illustrations[category];
    if (!categoryIllo) {
      return defaultIllustrations[Math.floor(Math.random() * defaultIllustrations.length)];
    }
    
    // 如果是数组，随机选择一个
    if (Array.isArray(categoryIllo)) {
      return categoryIllo[Math.floor(Math.random() * categoryIllo.length)];
    }
    
    return categoryIllo;
  };

  // 渲染纯文字内容块（参考手账板块设计，紧凑且有装饰感）
  const renderTextOnlyBlock = (block, blockIndex) => {
    const textLen = (block.content || '').length;
    const isShort = textLen < 80;
    const isMedium = textLen >= 80 && textLen < 200;
    
    return (
    <motion.div
      key={block.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: blockIndex * 0.1 }}
        className="bg-[#F8F6F0] rounded-lg shadow-md border border-[#E7E5E4] relative overflow-visible"
      >
        {/* 角落斜贴的胶带 */}
        {renderBlockTape(block, blockIndex)}

        <div className={`p-6 ${isShort ? 'min-h-[200px]' : isMedium ? 'min-h-[240px]' : ''} flex flex-col overflow-hidden`}>
          {/* 标题区 - 只在有地点/状态时显示装饰色块 */}
          <div className="flex items-start gap-3 mb-4">
            {(block.status || block.location) && (
              <div className={`w-1 h-14 rounded-full shrink-0`} style={{ 
                backgroundColor: getThemeByDiary({ blocks: [block] }).accent 
              }}></div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-2 font-['Noto_Serif_SC'] tracking-wide">
        {block.title}
      </h3>
              {(block.status || block.location) && (
                <div className="flex items-center flex-wrap gap-2 text-[#6B6B6B] text-xs">
                  {block.status?.icon && <span className="text-sm">{block.status.icon}</span>}
        {block.status?.description && <span>{block.status.description}</span>}
        {block.location && (
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {block.location}
          </span>
        )}
                </div>
              )}
            </div>
      </div>

          {/* 内容区 */}
          <div className="flex-1 relative">
            <div className={`prose max-w-none ${isShort ? 'columns-1' : ''}`}>
              <p className="text-[#2C2C2C] leading-relaxed text-justify first-line:indent-6 opacity-90">
          {block.content}
        </p>
            </div>
            
            {/* 短文本：底部装饰插画 + 分类标签 */}
            {isShort && (
              <div className="mt-6 flex items-end justify-between">
                <div className="flex flex-wrap gap-1">
                  {block.categories?.map((cat, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                      style={{ 
                        backgroundColor: `${getThemeByDiary({ blocks: [block] }).accent}20`,
                        color: getThemeByDiary({ blocks: [block] }).accent
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <img
                  src={pickCategoryAsset(block.categories, 1)}
                  alt="decoration"
                  className="w-24 h-24 opacity-90 object-contain"
                />
              </div>
            )}
            
            {/* 中等文本：右下角小插画，不遮蔽文本 */}
            {isMedium && (
              <>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="flex flex-wrap gap-1 flex-1">
                    {block.categories?.map((cat, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getThemeByDiary({ blocks: [block] }).accent}15`,
                          color: getThemeByDiary({ blocks: [block] }).accent
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <img
                    src={pickCategoryAsset(block.categories, 1)}
                    alt="decoration"
                    className="w-20 h-20 opacity-80 object-contain flex-shrink-0"
                  />
                </div>
              </>
            )}

            {/* 长文本：只显示分类标签 */}
            {!isShort && !isMedium && (
              <div className="mt-4 flex flex-wrap gap-1">
                {block.categories?.map((cat, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getThemeByDiary({ blocks: [block] }).accent}15`,
                      color: getThemeByDiary({ blocks: [block] }).accent
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
      </div>
    </motion.div>
  );
  };

  // 图片分类组件 - 根据长宽比智能分类
  const ImageCategoryLayout = ({ images, videos, blockIndex, blockMedia }) => {
    const [imageCategories, setImageCategories] = useState(null);
    
    useEffect(() => {
      if (!images || images.length === 0) {
        setImageCategories({ extreme: [], normal: [] });
        return;
      }

      let loadedCount = 0;
      const categories = {
        extreme: [],  // 极端长宽比：> 2:1 或 < 1:2，单独一排
        normal: []    // 正常长宽比：1:2 到 2:1 之间，1:1网格
      };
      
      // 检查是否在浏览器环境中
      if (typeof window === 'undefined' || !window.Image) {
        // 非浏览器环境，使用默认布局
        images.forEach((img, idx) => {
          categories.normal.push({ img, idx });
        });
        categories.normal.sort((a, b) => a.idx - b.idx);
        setImageCategories(categories);
        return;
      }

      images.forEach((img, idx) => {
        // 使用 window.Image 确保在浏览器环境中
        const imgElement = new window.Image();
        imgElement.onload = () => {
          loadedCount++;
          const aspectRatio = imgElement.width / imgElement.height;
          // 分类规则：
          // - 极端比例（> 2:1 横向超宽，或 < 1:2 纵向超高）：单独一排
          // - 其他（1:2 到 2:1 之间）：1:1网格
          const category = (aspectRatio > 2 || aspectRatio < 0.5) ? 'extreme' : 'normal';
          categories[category].push({ img, idx, aspectRatio });
          
          if (loadedCount === images.length) {
            // 按原始索引排序，保持原始顺序
            categories.extreme.sort((a, b) => a.idx - b.idx);
            categories.normal.sort((a, b) => a.idx - b.idx);
            setImageCategories(categories);
          }
        };
        imgElement.onerror = () => {
          // 加载失败时默认尝试使用原始URL重新加载
          const fallbackImg = new window.Image();
          fallbackImg.onload = () => {
            loadedCount++;
            const aspectRatio = fallbackImg.width / fallbackImg.height;
            const category = (aspectRatio > 2 || aspectRatio < 0.5) ? 'extreme' : 'normal';
            categories[category].push({ img, idx, aspectRatio });
            if (loadedCount === images.length) {
              categories.extreme.sort((a, b) => a.idx - b.idx);
              categories.normal.sort((a, b) => a.idx - b.idx);
              setImageCategories(categories);
            }
          };
          fallbackImg.onerror = () => {
            loadedCount++;
            // 如果原始URL也加载失败，默认为normal
            categories.normal.push({ img, idx, aspectRatio: 1 });
            if (loadedCount === images.length) {
              categories.extreme.sort((a, b) => a.idx - b.idx);
              categories.normal.sort((a, b) => a.idx - b.idx);
              setImageCategories(categories);
            }
          };
          fallbackImg.src = getMediaUrl(img);
        };
        // 使用原始URL来计算宽高比，而不是缩略图
        // 因为缩略图可能被裁剪成正方形，导致宽高比计算错误
        imgElement.src = getMediaUrl(img);
      });
    }, [images]);

    // 渲染单张媒体
    const renderSingleMedia = (media, index, className = '', aspectRatio = null) => (
      <div 
        key={index}
        className={`relative cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden ${className}`}
        onClick={() => openLightbox(blockIndex, blockMedia.indexOf(media))}
        style={aspectRatio ? { aspectRatio } : {}}
      >
        <img
          src={getMediaThumbnail(media)}
          alt={`媒体 ${index + 1}`}
          className="w-full h-full object-cover"
        />
        {isVideo(media) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-[#D4A574]/90 rounded-full p-3 backdrop-blur-sm">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
    );

    // 视频单独一行显示
    const videoSection = videos.length > 0 && (
      <div className="mb-2 space-y-2">
        {videos.map((video, idx) => (
          <div key={`video-${idx}`}>
            {renderSingleMedia(video, `video-${idx}`, '', '16/9')}
          </div>
        ))}
      </div>
    );

    if (!imageCategories) {
      // 加载中：显示默认布局（所有图片都显示为1:1）
      return (
        <>
          {videoSection}
          <div className={`grid w-full ${
            images.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'
          }`} style={{ gap: '6px' }}>
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={getMediaThumbnail(img)}
                  alt={`媒体 ${idx + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openLightbox(blockIndex, blockMedia.indexOf(img))}
                />
                {isVideo(img) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-[#D4A574]/90 rounded-full p-3 backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      );
    }

    // 渲染布局 - 优化后的美观布局
    return (
      <>
        {videoSection}
        <div className="space-y-2">
          {/* 极端长宽比 (>2:1 或 <1:2)：单独一排，保持原始比例 */}
          {imageCategories.extreme.length > 0 && (
            <div className="space-y-2">
              {imageCategories.extreme.map(({ img, idx, aspectRatio }) => {
                // 完全按照原始宽高比显示，不限制最大尺寸
                return (
                  <div 
                    key={idx} 
                    className="w-full overflow-hidden rounded-lg relative mx-auto"
                    style={{
                      aspectRatio: aspectRatio || undefined
                    }}
                  >
                    <img
                      src={getMediaThumbnail(img)}
                      alt={`媒体 ${idx + 1}`}
                      className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openLightbox(blockIndex, blockMedia.indexOf(img))}
                    />
                    {isVideo(img) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-[#D4A574]/90 rounded-full p-3 backdrop-blur-sm">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* 正常长宽比（1:2 到 2:1 之间）：1:1正方形网格 */}
          {imageCategories.normal.length > 0 && (
            <div className={`grid w-full ${
              imageCategories.normal.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'
            }`} style={{ gap: '6px' }}>
              {imageCategories.normal.map(({ img, idx }) => (
                <div key={idx} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={getMediaThumbnail(img)}
                    alt={`媒体 ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openLightbox(blockIndex, blockMedia.indexOf(img))}
                  />
                  {isVideo(img) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-[#D4A574]/90 rounded-full p-3 backdrop-blur-sm">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // 渲染纯图片内容块 - 智能网格布局（视频单独一行，图片根据尺寸智能排列）
  const renderImageOnlyBlock = (block, blockIndex) => {
    const hasMedia = block.media && block.media.length > 0;
    if (!hasMedia) {
      return null;
    }

    // 分离视频和图片
    const videos = block.media.filter(media => isVideo(media));
    const images = block.media.filter(media => !isVideo(media));

    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: blockIndex * 0.1 }}
        className="bg-[#F8F6F0] rounded-lg shadow-md border border-[#E7E5E4] p-5 relative overflow-visible"
      >
        {renderBlockTape(block, blockIndex)}
        
        {/* 图片拼贴区域 */}
        <div className="mb-4 overflow-hidden">
          <ImageCategoryLayout 
            images={images} 
            videos={videos} 
            blockIndex={blockIndex}
            blockMedia={block.media}
          />
        </div>

            {/* 标题和信息 */}
        <div className="text-center">
              <h4 className="text-sm font-semibold text-[#2C2C2C] mb-1 font-['Noto_Serif_SC']">
                {block.title}
              </h4>
              <div className="flex items-center justify-center space-x-2 text-[#6B6B6B] text-xs">
                {block.status?.icon && <span className="text-sm">{block.status.icon}</span>}
                {block.location && (
                  <span className="flex items-center">
                    <MapPin className="w-2 h-2 mr-1" />
                    {block.location}
                  </span>
                )}
              </div>
            </div>
      </motion.div>
    );
  };

  // 渲染图文混合内容块（Canvas风格：紧凑布局，图片围绕文字）
  const renderMixedContentBlock = (block, blockIndex) => {
    const hasMedia = block.media && block.media.length > 0;
    if (!hasMedia) {
      return null;
    }

    // 找到封面图在 media 数组中的索引
    const coverMedia = block.cover;
    let coverIndex = -1;
    if (coverMedia) {
      coverIndex = block.media.findIndex(m => {
        const mUrl = getMediaUrl(m);
        const mThumb = getMediaThumbnail(m);
        return m === coverMedia || mUrl === coverMedia || mThumb === coverMedia;
      });
    }
    
    // 如果没找到封面或没有设置封面，使用第一张
    if (coverIndex === -1) {
      coverIndex = 0;
    }
    
    const displayCover = block.media[coverIndex];
    
    // otherMedia 排除封面图，显示所有其他图片
    const otherMedia = block.media.filter((_, i) => i !== coverIndex);
    
    const textLen = (block.content || '').length;
    const mediaCount = block.media.length;
    
    // 根据文字长度和图片数量决定布局模式
    const isShortText = textLen < 100;
    const isMediumText = textLen >= 100 && textLen < 300;
    const isLongText = textLen >= 300;

    // 短文本模式：图片主导，文字作为说明
    if (isShortText) {
      return (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: blockIndex * 0.1 }}
          className="bg-[#F8F6F0] rounded-lg shadow-md border border-[#E7E5E4] p-5 relative overflow-visible"
        >
          {renderBlockTape(block, blockIndex)}
          
          {/* 主图区域 - 大幅展示 */}
          <div className="overflow-hidden">
          <div className="relative mb-4 cursor-pointer group" onClick={() => openLightbox(blockIndex, coverIndex)}>
            <img
              src={getMediaThumbnail(displayCover)}
              alt={block.title}
              className="w-full rounded-lg object-cover shadow-inner transition-transform group-hover:scale-[1.02]"
              style={{ maxHeight: '400px' }}
            />
            {isVideo(displayCover) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#D4A574]/90 rounded-full p-5 backdrop-blur-sm">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
            )}
          </div>

          {/* 文字说明区 - 顺序：标题 -> 位置 -> 描述 */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-2 font-['Noto_Serif_SC']">
              {block.title}
            </h3>
            <div className="flex items-center gap-2 text-[#6B6B6B] text-xs mb-2">
              {block.status?.icon && <span>{block.status.icon}</span>}
              {block.location && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {block.location}
                </span>
              )}
            </div>
            {block.content && (
              <p className="text-[#2C2C2C] text-sm leading-relaxed opacity-80">
                {block.content}
              </p>
            )}
          </div>

          {/* 其他图片网格排布 - 最多4列 */}
          {otherMedia.length > 0 && (
            <div className={`grid gap-2 w-full ${
              otherMedia.length === 1 ? 'grid-cols-1' :
              otherMedia.length === 2 ? 'grid-cols-2' :
              otherMedia.length === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            }`}>
              {otherMedia.map((media, idx) => {
                const realIndex = block.media.findIndex(m => m === media);
                return (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg border-2 border-white cursor-pointer hover:shadow-lg hover:scale-105 transition-all overflow-hidden"
                    onClick={() => openLightbox(blockIndex, realIndex)}
                  >
                    <img
                      src={getMediaThumbnail(media)}
                      alt={`附图 ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                    {isVideo(media) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#D4A574]/90 rounded-full p-1">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
      </motion.div>
    );
    }

    // 中等文本模式：左文右图或上文下图
    if (isMediumText && mediaCount <= 3) {
    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: blockIndex * 0.1 }}
        className="bg-[#F8F6F0] rounded-lg shadow-md border border-[#E7E5E4] p-6 relative overflow-visible"
      >
          {renderBlockTape(block, blockIndex)}
          
          <div className="grid lg:grid-cols-2 gap-5 overflow-hidden">
            {/* 左侧：文字内容 */}
            <div className="flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-1 h-12 rounded-full shrink-0" style={{ 
                  backgroundColor: getThemeByDiary({ blocks: [block] }).accent 
                }}></div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-1 font-['Noto_Serif_SC']">
              {block.title}
            </h3>
                  <div className="flex items-center gap-2 text-[#6B6B6B] text-xs">
                    {block.status?.icon && <span>{block.status.icon}</span>}
              {block.location && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {block.location}
                </span>
              )}
            </div>
                </div>
              </div>
              <p className="text-[#2C2C2C] text-sm leading-relaxed opacity-90 first-line:indent-4">
                {block.content}
              </p>
          </div>

            {/* 右侧：图片网格 */}
            <div className="grid gap-2" style={{
              gridTemplateColumns: mediaCount === 1 ? '1fr' : 'repeat(2, 1fr)'
            }}>
              {block.media.map((media, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all border-2 border-white"
                  onClick={() => openLightbox(blockIndex, idx)}
                >
                  <img
                    src={getMediaThumbnail(media)}
                    alt={`图片 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isVideo(media) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#D4A574]/90 rounded-full p-3">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                  </div>
                )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    // 长文本或多图模式：上下布局，文字在上，图片在下
    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: blockIndex * 0.1 }}
        className="bg-[#F8F6F0] rounded-lg shadow-md border border-[#E7E5E4] p-6 relative overflow-visible"
      >
        {renderBlockTape(block, blockIndex)}
        
        {/* 标题和文字区 */}
        <div className="overflow-hidden">
        <div className="mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-1 h-14 rounded-full shrink-0" style={{ 
              backgroundColor: getThemeByDiary({ blocks: [block] }).accent 
            }}></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-2 font-['Noto_Serif_SC']">
                {block.title}
              </h3>
              <div className="flex items-center gap-2 text-[#6B6B6B] text-xs flex-wrap">
                {block.status?.icon && <span>{block.status.icon}</span>}
                {block.status?.description && <span>{block.status.description}</span>}
                {block.location && (
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {block.location}
                  </span>
                )}
                  </div>
                </div>
              </div>
          <p className="text-[#2C2C2C] leading-relaxed opacity-90 first-line:indent-6">
            {block.content}
          </p>
            </div>

        {/* 媒体网格区 - 视频单独一行，图片智能排列 */}
        <div className="space-y-2">
          {/* 视频单独显示 */}
          {block.media.filter(m => isVideo(m)).length > 0 && (
            <div className="space-y-2">
              {block.media.filter(m => isVideo(m)).map((video, idx) => {
                const videoIndex = block.media.indexOf(video);
                return (
                  <div
                    key={`video-${idx}`}
                    className="relative rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all border-2 border-white aspect-video"
                    onClick={() => openLightbox(blockIndex, videoIndex)}
                  >
                    <img
                      src={getMediaThumbnail(video)}
                      alt={`视频 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#D4A574]/90 rounded-full p-3">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* 图片网格 - 确保同一排高度一致，防止超出边界 */}
          {block.media.filter(m => !isVideo(m)).length > 0 && (() => {
            const imageOnlyMedia = block.media.filter(m => !isVideo(m));
            const imageCount = imageOnlyMedia.length;
            
            // 根据图片数量动态确定列数，确保不超过容器宽度
            const getGridCols = () => {
              if (imageCount === 1) return 'grid-cols-1 max-w-md mx-auto';
              if (imageCount === 2) return 'grid-cols-2';
              if (imageCount === 3) return 'grid-cols-3';
              if (imageCount === 4) return 'grid-cols-2';
              // 图片较多时，最多使用3列，确保不会超出边界
              return 'grid-cols-3';
            };
            
            return (
              <div className={`grid gap-2 w-full max-w-full ${getGridCols()}`}>
                {imageOnlyMedia.map((img, idx) => {
                  const imgIndex = block.media.indexOf(img);
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all border-2 border-white ${
                        imageCount === 1 ? 'aspect-[4/3]' : 'aspect-square'
                      }`}
                      onClick={() => openLightbox(blockIndex, imgIndex)}
                    >
                      <img
                        src={getMediaThumbnail(img)}
                        alt={`图片 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}
          </div>
        </div>
      </motion.div>
    );
  };

  // 渲染内容块
  const renderBlock = (block, blockIndex) => {
    const hasMedia = block.media && block.media.length > 0;
    const hasContent = block.content && block.content.trim() !== '';

    if (!hasMedia && hasContent) {
      return renderTextOnlyBlock(block, blockIndex);
    }

    if (hasMedia && !hasContent) {
      return renderImageOnlyBlock(block, blockIndex);
    }

    if (hasMedia && hasContent) {
      return renderMixedContentBlock(block, blockIndex);
    }

    return null;
  };

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
        className="space-y-8 overflow-visible"
      >
        

        {(() => {
          const theme = getThemeByDiary(diary);
          return (
            <div
              ref={diaryCardRef}
              className="relative rounded-2xl shadow-xl border border-[#E7E5E4] p-6 md:p-10 overflow-visible"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 28px)',
                backgroundColor: '#FCFAF7'
              }}
            >
              {/* 操作按钮 - 左上角 */}
              <div className="absolute top-4 left-4 flex space-x-2 z-20">
                <button
                  onClick={handleEditDiary}
                  className="p-2 bg-white shadow-md hover:bg-[#F8F6F0] transition-colors active-press group"
                  title="编辑日记"
                >
                  <Edit className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#D4A574]" />
                </button>
                <button
                  onClick={handleExportDiary}
                  disabled={isExporting}
                  className="p-2 bg-white shadow-md hover:bg-[#F8F6F0] transition-colors active-press group disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isExporting ? "导出中..." : "下载为图片"}
                >
                  <Download className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#7FA6A8]" />
                </button>
                <button
                  onClick={handleDeleteDiary}
                  className="p-2 bg-white shadow-md hover:bg-red-50 transition-colors active-press group"
                  title="删除日记"
                >
                  <Trash2 className="w-4 h-4 text-[#6B6B6B] group-hover:text-red-600" />
                </button>
              </div>

               {/* 保留原始大标题与日期 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2C2C2C] mb-4 font-['Noto_Serif_SC'] tracking-tight leading-tight">
            {diary.title}
          </h1>
          <p className="text-[#8B7355] text-lg font-handwriting mb-6">
            {format(currentDate, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
          </p>
        </div>

              {/* 右上角插画装饰（随分类随机）- 适度超出边界作为装饰效果 */}
              <img src={theme.illo} alt="decoration" className="hidden md:block absolute -right-2 -top-2 w-24 opacity-50 pointer-events-none z-10 decoration-illustration" />

              {/* 内容块与分割虚线 */}
              <div className="grid gap-8">
                {diary.blocks.map((block, index) => (
                  <div key={block.id}>
                    {renderBlock(block, index)}
                    {index < diary.blocks.length - 1 && (
                      <div className="mt-8 border-t-8 border-dashed" style={{ borderColor: theme.accent + '55' }} />
                    )}
        </div>
                ))}
              </div>
            </div>
          );
        })()}
      </motion.div>
    );
  };

  // 灯箱组件（优化版：更大展示，边缘隐蔽控件，流畅切换）
  const Lightbox = () => {
    if (!lightboxOpen || !diary) return null;
              
    const currentBlock = diary.blocks[currentBlockIndex];
    const currentMedia = currentBlock.media[currentMediaIndex];
    const isCurrentVideo = isVideo(currentMedia);

    return (
      <div
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-0 group"
        onClick={closeLightbox}
      >
        {/* 关闭按钮：右上角，hover 才完全显示 */}
          <button
            onClick={closeLightbox}
          className="fixed top-6 right-6 z-10 p-2 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
          <X className="w-7 h-7" />
          </button>

        {/* 左右导航箭头：贴边，hover 才完全显示 */}
          {currentBlock.media.length > 1 && (
            <>
              <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-10 p-6 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 hover:bg-black/20"
              >
              <ChevronLeft className="w-10 h-10" />
              </button>
              <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              className="fixed right-0 top-1/2 -translate-y-1/2 z-10 p-6 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 hover:bg-black/20"
              >
              <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

        {/* 媒体内容：放大至 max-h-[90vh]（约1.5倍），无白底无圆角 */}
        <div
          className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
            {isCurrentVideo ? (
              <video
              src={getMediaUrl(currentMedia)}
                controls
              className="max-w-full max-h-[90vh] object-contain"
                autoPlay
              />
            ) : (
              <img
              src={getMediaUrl(currentMedia)}
                alt={`媒体 ${currentMediaIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </div>

        {/* 下载按钮：左下角，hover 才完全显示 */}
            <a
          href={getMediaUrl(currentMedia)}
              download
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-6 left-6 z-10 p-2 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          title="下载图片"
            >
          <Download className="w-6 h-6" />
            </a>

        {/* 页码指示器：右下角，半透明 */}
        <div className="fixed bottom-6 right-6 z-10 px-3 py-1 bg-black/40 text-white/80 text-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {currentMediaIndex + 1} / {currentBlock.media.length}
          </div>
        </div>
    );
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ maxWidth: '100%' }}>
      {/* 优雅的日期导航条 */}
      <div className="mb-8">
        {/* 年月选择器 - 精致紧凑 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-[#F8F6F0] rounded-full transition-all active-press group"
            title="上一月"
          >
            <ChevronLeft className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#D4A574] transition-colors" />
          </button>

          <div className="flex items-center gap-2">
            {/* 年份 */}
            {isEditingYear ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempYear}
                  onChange={handleYearChange}
                  onKeyDown={(e) => handleKeyPress(e, 'year')}
                  className="w-16 px-2 py-1 text-lg font-bold text-[#2C2C2C] text-center border-b-2 border-[#D4A574] focus:outline-none bg-transparent font-['Noto_Serif_SC']"
                  autoFocus
                />
                <button onClick={handleYearConfirm} className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleYearCancel} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleYearClick}
                className="px-3 py-1 text-lg font-bold text-[#2C2C2C] hover:text-[#D4A574] hover:bg-[#F8F6F0] rounded-lg transition-all font-['Noto_Serif_SC']"
              >
                {format(currentDate, 'yyyy')}
              </button>
            )}

            <span className="text-[#8B7355] text-base font-handwriting">年</span>

            {/* 月份 */}
            {isEditingMonth ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempMonth}
                  onChange={handleMonthChange}
                  onKeyDown={(e) => handleKeyPress(e, 'month')}
                  className="w-12 px-2 py-1 text-lg font-bold text-[#2C2C2C] text-center border-b-2 border-[#D4A574] focus:outline-none bg-transparent font-['Noto_Serif_SC']"
                  autoFocus
                />
                <button onClick={handleMonthConfirm} className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleMonthCancel} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleMonthClick}
                className="px-3 py-1 text-lg font-bold text-[#2C2C2C] hover:text-[#D4A574] hover:bg-[#F8F6F0] rounded-lg transition-all font-['Noto_Serif_SC']"
              >
                {format(currentDate, 'M')}
              </button>
            )}

            <span className="text-[#8B7355] text-base font-handwriting">月</span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-[#F8F6F0] rounded-full transition-all active-press group"
            title="下一月"
          >
            <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#D4A574] transition-colors" />
          </button>
        </div>

        {/* 日期卡片滑动条 - 现代流畅 */}
        <div className="relative group">
          {/* 左侧滚动按钮 */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="向左滚动"
            >
              <ChevronLeft className="w-5 h-5 text-[#D4A574]" />
            </button>
          )}

          {/* 右侧滚动按钮 */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="向右滚动"
            >
              <ChevronRight className="w-5 h-5 text-[#D4A574]" />
            </button>
          )}

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar scroll-smooth"
          >
            <div className="flex items-stretch gap-3 px-4 py-2 min-w-max mx-auto justify-center">
              {monthDays.map((day, index) => {
                const isSelected = isSameDay(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const dayHasDiary = hasDiary(day);
                const weekday = format(day, 'EEE', { locale: zhCN });
                
                return (
                  <motion.button
                    key={day.toISOString()}
                    ref={isSelected ? selectedDateRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.015,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    onClick={() => handleDateClick(day)}
                    className={`
                      group relative flex flex-col items-center justify-center
                      min-w-[68px] px-3 py-3 rounded-2xl
                      transition-all duration-300 ease-out
                      ${isSelected 
                        ? 'bg-gradient-to-br from-[#D4A574] to-[#C97A63] text-white shadow-xl scale-110 -translate-y-1' 
                        : dayHasDiary
                        ? 'bg-gradient-to-br from-white via-[#F8F6F0] to-[#F8F6F0] hover:shadow-lg hover:-translate-y-0.5 border-2 border-[#D4A574]/40'
                        : 'bg-white/60 hover:bg-white hover:shadow-md hover:-translate-y-0.5 border border-[#E7E5E4]/50'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-[#D4A574] ring-offset-2' : ''}
                    `}
                  >
                    {/* 星期 */}
                    <span className={`
                      text-[10px] font-medium mb-1 tracking-wide
                      ${isSelected ? 'text-white/90' : 'text-[#8B7355]'}
                    `}>
                      {weekday}
                    </span>

                    {/* 日期 - 使用斜杠格式 */}
                    <div className={`
                      flex items-baseline gap-0.5 font-['Noto_Serif_SC']
                      ${isSelected ? 'font-bold' : 'font-semibold'}
                    `}>
                      <span className={`
                        text-xs leading-none
                        ${isSelected ? 'text-white/80' : 'text-[#6B6B6B]'}
                      `}>
                        {format(day, 'M')}
                      </span>
                      <span className={`
                        text-[10px] leading-none
                        ${isSelected ? 'text-white/60' : 'text-[#A8A29E]'}
                      `}>
                        /
                      </span>
                      <span className={`
                        text-xl leading-none
                        ${isSelected ? 'text-white' : 'text-[#2C2C2C]'}
                      `}>
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* 日记标记 - 精致点缀 */}
                    {dayHasDiary && (
                      <div className={`
                        absolute -top-1 -right-1 w-3 h-3 rounded-full
                        ${isSelected 
                          ? 'bg-white shadow-md' 
                          : 'bg-gradient-to-br from-[#D4A574] to-[#C97A63] shadow-sm'
                        }
                        ring-2 ring-white
                      `}>
                      </div>
                    )}

                    {/* 今日角标 - 提高层级避免被遮挡 */}
                    {isToday && !isSelected && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-[#D4A574] text-white text-[8px] font-bold rounded-full shadow-sm z-20">
                        今天
                      </div>
                    )}

                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 滑动提示渐变 - 动态显示 */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FAFAF9] via-[#FAFAF9]/50 to-transparent pointer-events-none z-[5]"></div>
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#FAFAF9] via-[#FAFAF9]/50 to-transparent pointer-events-none z-[5]"></div>
          )}
        </div>

        {/* 滚动提示文字 */}
        <div className="text-center mt-3">
          <p className="text-[#A8A29E] text-xs flex items-center justify-center gap-2">
            {canScrollLeft && canScrollRight && (
              <>
                <ChevronLeft className="w-3 h-3" />
                <span>左右滑动查看更多日期</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            {canScrollLeft && !canScrollRight && (
              <>
                <ChevronLeft className="w-3 h-3" />
                <span>向左滑动查看更多</span>
              </>
            )}
            {!canScrollLeft && canScrollRight && (
              <>
                <span>向右滑动查看更多</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </p>
        </div>
      </div>

      {/* 隐藏滚动条样式 + 平滑滚动 */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {/* 日记内容容器 - 添加 padding 以容纳超出边界的装饰元素 */}
      <div className="mx-auto px-4 md:px-8" style={{ maxWidth: '660px' }}>

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
            <div className="relative mb-8"></div>
          )}
          {renderDiaryContent()}
        </motion.div>
      </AnimatePresence>

      {/* 灯箱 */}
      <AnimatePresence>
        {lightboxOpen && <Lightbox />}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default DayView;
