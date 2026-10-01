import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronDown, Smile, Tag, MapPin, Edit, Check, Minus } from 'lucide-react';

// 预设图标列表（80个代表性图标）
const ICONS = [
  // 心情类
  '😊', '😂', '😍', '🥰', '😎', '😢', '😡', '😴', '🤔', '🥺',
  '😇', '😋', '😜', '🤩', '😏', '😌', '😔', '😷', '🤒', '🤕',

  // 活动类
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🎸', '🎹', '🎨',
  '🎭', '🎬', '🎮', '🎯', '🎲', '🎳', '🎪', '🎢', '🎡', '🏆',

  // 食物类
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑',
  '🍍', '🥭', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌽',

  // 旅行类
  '✈️', '🚗', '🚂', '🚢', '🚀', '🏖️', '🏞️', '🏔️', '🌋', '🏕️',
  '🏝️', '🏜️', '🏛️', '🏰', '🏯', '🗼', '🗽', '🌅', '🌄', '🌇',

  // 天气类
  '☀️', '⛅', '☁️', '🌧️', '⛈️', '🌩️', '❄️', '🌨️', '🌪️', '🌈',
  '🌊', '🌀', '🌁', '🌫️', '🌡️', '💧', '💨', '🔥', '💫', '⭐',
  '❤️', '🎈', '🎉', '🎁', '💡', '🔑', '🕰️', '📱', '💻', '📷'
];

// 系统内置分类标签（初始预设）
const SYSTEM_PRESET_CATEGORIES = [
  '日常', '美食', '旅行', '玩乐', '自己', '朋友', '家人',
  '宠物', '情侣', '风景', '学习', '工作', '运动', '作品'
];

const BlockMetaFields = ({ block, onUpdate }) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 从localStorage获取或初始化系统标签组
  const [systemCategories, setSystemCategories] = useState(() => {
    const saved = localStorage.getItem('diary_system_categories');
    return saved ? JSON.parse(saved) : SYSTEM_PRESET_CATEGORIES;
  });

  const iconPickerRef = useRef(null);
  const categoryPickerRef = useRef(null);
  const categoryInputRef = useRef(null);

  // 保存系统标签组到localStorage
  useEffect(() => {
    localStorage.setItem('diary_system_categories', JSON.stringify(systemCategories));
  }, [systemCategories]);

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target)) {
        setShowIconPicker(false);
      }
      if (categoryPickerRef.current && !categoryPickerRef.current.contains(event.target)) {
        setShowCategoryPicker(false);
        setIsAddingCategory(false);
        setIsEditingCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理图标选择
  const handleIconSelect = (icon) => {
    onUpdate({
      status: {
        icon,
        description: block.status?.description || ''
      }
    });
    setShowIconPicker(false);
  };

  // 处理状态描述变化
  const handleStatusDescriptionChange = (description) => {
    onUpdate({
      status: {
        icon: block.status?.icon || '😊',
        description
      }
    });
  };

  // 处理分类选择
  const handleCategoryToggle = (category) => {
    const currentCategories = block.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    onUpdate({ categories: newCategories });
  };

  // 添加自定义分类
  const handleAddCustomCategory = () => {
    if (newCategoryName.trim() && !systemCategories.includes(newCategoryName.trim())) {
      const updatedCategories = [...systemCategories, newCategoryName.trim()];
      setSystemCategories(updatedCategories);
      handleCategoryToggle(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  // 移除分类标签
  const handleRemoveCategory = (category, e) => {
    e.stopPropagation();
    const updatedCategories = systemCategories.filter(c => c !== category);
    setSystemCategories(updatedCategories);

    // 如果该分类当前被选中，则取消选中
    if (block.categories?.includes(category)) {
      onUpdate({
        categories: (block.categories || []).filter(c => c !== category)
      });
    }
  };

  // 取消选择分类
  const handleDeselectCategory = (category, e) => {
    e.stopPropagation();
    if (block.categories?.includes(category)) {
      onUpdate({
        categories: (block.categories || []).filter(c => c !== category)
      });
    }
  };

  // 处理地点变化
  const handleLocationChange = (location) => {
    onUpdate({ location });
  };

  // 渲染分类标签
  const renderCategoryTags = () => {
    const selectedCategories = block.categories || [];
    const visibleTags = selectedCategories.slice(0, 3);
    const hiddenCount = selectedCategories.length - visibleTags.length;

    return (
      <div className="flex items-center flex-wrap gap-1">
        {visibleTags.map((category) => (
          <div
            key={category}
            className="relative group"
          >
            <span className="px-2 py-1 bg-[#D4A574] text-white text-xs rounded-full">
              {category}
            </span>
            <button
              onClick={(e) => handleDeselectCategory(category, e)}
              className="absolute -top-1 -right-1 w-3 h-3 bg-[#E7E5E4] text-[#6B6B6B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity active-press flex items-center justify-center hover:bg-[#A8A29E] hover:text-white"
              title="取消选择"
            >
              <Minus className="w-2 h-2 stroke-2" />
            </button>
          </div>
        ))}
        {hiddenCount > 0 && (
          <span className="px-2 py-1 bg-[#F8F6F0] text-[#6B6B6B] text-xs rounded-full">
            +{hiddenCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 状态模块 */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-2 flex items-center">
          <Smile className="w-4 h-4 mr-1 text-[#6B6B6B]" />
          状态
        </label>
        <div className="flex items-center space-x-3">
          <div className="relative" ref={iconPickerRef}>
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="flex-shrink-0 w-10 h-10 bg-[#F8F6F0] border border-[#E7E5E4] rounded-lg flex items-center justify-center hover:bg-[#E7E5E4] transition-colors active-press"
            >
              <span className="text-lg">{block.status?.icon || '😊'}</span>
            </button>

            {/* 图标选择器弹窗 */}
            {showIconPicker && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#E7E5E4] z-50 p-3">
                <h4 className="text-sm font-medium text-[#2C2C2C] mb-3">选择状态图标</h4>
                <div className="grid grid-cols-10 gap-2 max-h-60 overflow-y-auto overflow-x-hidden" style={{ paddingRight: '3px' }}>
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => handleIconSelect(icon)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F8F6F0] transition-colors active-press text-lg hover:scale-150 hover:z-10 transform-gpu transition-transform duration-200"
                      title={icon}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            value={block.status?.description || ''}
            onChange={(e) => handleStatusDescriptionChange(e.target.value)}
            placeholder="心情描述..."
            className="flex-1 px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
            style={{ minWidth: '120px' }}
          />
        </div>
      </div>

      {/* 分类模块 */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-2 flex items-center">
          <Tag className="w-4 h-4 mr-1 text-[#6B6B6B]" />
          分类
        </label>
        <div className="relative" ref={categoryPickerRef}>
          <div
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent cursor-pointer flex items-center min-h-10"
          >
            {block.categories?.length > 0 ? (
              renderCategoryTags()
            ) : (
              <span className="text-[#6B6B6B]">选择分类...</span>
            )}
            <ChevronDown className="w-4 h-4 text-[#6B6B6B] ml-auto" />
          </div>

          {/* 分类选择器弹窗 */}
          {showCategoryPicker && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-2xl border border-[#E7E5E4] z-50 p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-[#2C2C2C]">选择分类</h4>
                <button
                  onClick={() => setIsEditingCategories(!isEditingCategories)}
                  className={`p-1 transition-colors active-press ${
                    isEditingCategories
                      ? 'text-[#D4A574]'
                      : 'text-[#6B6B6B] hover:text-[#D4A574]'
                  }`}
                  title={isEditingCategories ? '完成编辑' : '编辑标签'}
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* 系统标签 */}
              <div className="flex flex-wrap gap-1 mb-2">
                {systemCategories.map((category) => (
                  <div
                    key={category}
                    className="relative group"
                    onClick={() => !isEditingCategories && handleCategoryToggle(category)}
                  >
                    <span
                      className={`px-2 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                        block.categories?.includes(category)
                          ? 'bg-[#D4A574] text-white'
                          : 'bg-[#F8F6F0] text-[#2C2C2C] hover:bg-[#E7E5E4]'
                      }`}
                    >
                      {category}
                    </span>
                    {isEditingCategories && (
                      <button
                        onClick={(e) => handleRemoveCategory(category, e)}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-[#E7E5E4] text-[#6B6B6B] rounded-full flex items-center justify-center hover:bg-[#A8A29E] hover:text-white transition-colors active-press"
                        title="删除标签"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    )}
                  </div>
                ))}

                {/* 添加新标签按钮 */}
                {!isAddingCategory && (
                  <button
                    onClick={() => {
                      setIsAddingCategory(true);
                      setTimeout(() => categoryInputRef.current?.focus(), 0);
                    }}
                    className="w-6 h-6 bg-[#F8F6F0] text-[#2C2C2C] rounded-full hover:bg-[#E7E5E4] transition-colors active-press flex items-center justify-center"
                    title="添加新标签"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* 添加新标签输入框 */}
              {isAddingCategory && (
                <div className="flex items-center space-x-1">
                  <input
                    ref={categoryInputRef}
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="新标签..."
                    className="flex-1 px-2 py-1 border border-[#E7E5E4] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A574]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomCategory();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    className="w-6 h-6 bg-[#D4A574] text-white rounded-full hover:bg-[#8B7355] transition-colors active-press flex items-center justify-center"
                    title="确认添加"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 地点模块 */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-[#6B6B6B]" />
          地点
        </label>
        <input
          type="text"
          value={block.location || ''}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="输入地点..."
          className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default BlockMetaFields;
