import React, { useState } from 'react';
import { Search, Calendar, Grid3X3, Clock } from 'lucide-react';
import { useDiary } from '../contexts/DiaryContext';
import UserAvatar from './UserAvatar';
import SearchPanel from './SearchPanel';

const Header = ({ onSearchOpen, searchFilters }) => {
  const { currentView, setCurrentView } = useDiary();
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const viewOptions = [
    { key: 'year', label: '年视图', icon: Grid3X3 },
    { key: 'month', label: '月视图', icon: Calendar },
    { key: 'day', label: '日视图', icon: Clock }
  ];

  const handleSearchClick = () => {
    setShowSearchPanel(!showSearchPanel);
  };

  const handleSearch = (filters) => {
    onSearchOpen && onSearchOpen(filters);
    setShowSearchPanel(false);
  };

  const handleCloseSearchPanel = () => {
    setShowSearchPanel(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#E7E5E4] sticky top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
          {/* 网站名称 */}
          <div className="flex items-center min-w-0 shrink">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC'] truncate tracking-wide">
              时光织语
            </h1>
          </div>

          {/* 视图切换器 */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="hidden md:inline text-sm text-[#6B6B6B]">视图:</span>
            <div className="flex items-center space-x-0.5 sm:space-x-1 bg-[#F8F6F0] rounded-lg p-0.5 sm:p-1">
              {viewOptions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key)}
                  aria-label={label}
                  title={label}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentView === key
                      ? 'bg-white text-[#D4A574] warm-shadow'
                      : 'text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 搜索框和用户头像 */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative">
              {/* 手机端：仅图标按钮 */}
              <button
                onClick={handleSearchClick}
                aria-label="搜索日记"
                className="sm:hidden p-2 bg-[#F8F6F0] border border-[#E7E5E4] rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <Search className="w-4 h-4 text-[#6B6B6B]" />
              </button>
              {/* 平板/PC：完整搜索框 */}
              <button
                onClick={handleSearchClick}
                className="hidden sm:block relative pl-10 pr-4 py-2 w-40 md:w-56 lg:w-64 bg-[#F8F6F0] border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent transition-all duration-200 text-left hover:bg-white hover:shadow-sm"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
                <span className="text-[#6B6B6B]">搜索日记...</span>
              </button>
              {showSearchPanel && (
                <SearchPanel onSearch={handleSearch} onClose={handleCloseSearchPanel} />
              )}
            </div>
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
