import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import demoDiaries, { DEMO_INITIAL_DATE, DEMO_SEED_VERSION } from '../data/demoDiaries';
import { readDiaries, putDiary, removeDiary, getSetting, setSetting } from '../lib/localStore';

const DiaryContext = createContext(null);
export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) throw new Error('useDiary must be used within a DiaryProvider');
  return context;
};

export const DiaryProvider = ({ children }) => {
  const [diaries, setDiaries] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => new Date(DEMO_INITIAL_DATE));
  const [currentView, setCurrentView] = useState('month');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refreshDiaries = useCallback(async () => {
    setLoading(true);
    try {
      let records = await readDiaries();
      const seedVersion = await getSetting('demo-seed-version');
      if (seedVersion !== DEMO_SEED_VERSION) {
        for (const diary of records) if (diary.isSample) await removeDiary(diary.date);
        const personalDates = new Set(records.filter(diary => !diary.isSample).map(diary => diary.date));
        for (const [date, diary] of Object.entries(demoDiaries)) {
          if (!personalDates.has(date)) await putDiary(diary);
        }
        await setSetting('demo-seed-version', DEMO_SEED_VERSION);
        records = await readDiaries();
      }
      setDiaries(Object.fromEntries(records.map(item => [item.date, item])));
      setLoadError('');
    } catch (error) { setLoadError(error.message); throw error; }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refreshDiaries().catch(error => console.error('读取本地日记失败:', error)); }, [refreshDiaries]);
  const getDiaryByDate = useCallback(date => diaries[format(date, 'yyyy-MM-dd')] || null, [diaries]);
  const saveDiary = useCallback(async (date, diary) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    // Editing a bundled example turns that day into a personal record, so it
    // remains distinguishable from demo content during backup recovery.
    const saved = { ...diary, id: diary.id || crypto.randomUUID(), date: dateKey, isSample: false, updatedAt: new Date().toISOString() };
    await putDiary(saved);
    setDiaries(previous => ({ ...previous, [dateKey]: saved }));
    return { ...saved, _isLocalOnly: true, updated_at: saved.updatedAt };
  }, []);
  const deleteDiary = useCallback(async date => {
    const dateKey = format(date, 'yyyy-MM-dd');
    await removeDiary(dateKey);
    setDiaries(previous => { const next = { ...previous }; delete next[dateKey]; return next; });
  }, []);
  const getAllDiaries = () => Object.values(diaries).sort((a, b) => b.date.localeCompare(a.date));
  const searchDiaries = (filters = {}) => {
    const { keyword = '', categories = [], statusIcon = '', location = '', dateRange = null } = filters;
    const query = keyword.toLowerCase();
    return getAllDiaries().filter(diary =>
      (!query || diary.title?.toLowerCase().includes(query) || diary.blocks?.some(block => block.title?.toLowerCase().includes(query) || block.content?.toLowerCase().includes(query))) &&
      (!categories.length || diary.blocks?.some(block => block.categories?.some(category => categories.includes(category)))) &&
      (!statusIcon || diary.blocks?.some(block => block.status?.icon === statusIcon)) &&
      (!location || diary.blocks?.some(block => block.location?.toLowerCase().includes(location.toLowerCase()))) &&
      (!dateRange?.start || !dateRange?.end || (new Date(diary.date) >= dateRange.start && new Date(diary.date) <= dateRange.end))
    );
  };
  const getFilterOptions = () => {
    const categories = new Set(), statusIcons = new Set(), locations = new Set();
    Object.values(diaries).forEach(diary => diary.blocks?.forEach(block => {
      block.categories?.forEach(category => categories.add(category));
      if (block.status?.icon) statusIcons.add(block.status.icon);
      if (block.location) locations.add(block.location);
    }));
    return { categories: [...categories].sort(), statusIcons: [...statusIcons].sort(), locations: [...locations].sort() };
  };
  const getStatistics = () => {
    const all = Object.values(diaries), categoryCount = {};
    all.forEach(diary => diary.blocks?.forEach(block => block.categories?.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    })));
    return {
      totalDiaries: all.length,
      totalBlocks: all.reduce((sum, diary) => sum + (diary.blocks?.length || 0), 0),
      totalMedia: all.reduce((sum, diary) => sum + (diary.blocks?.reduce((count, block) => count + (block.media?.length || 0), 0) || 0), 0),
      topCategories: Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([category, count]) => ({ category, count }))
    };
  };
  return <DiaryContext.Provider value={{ diaries, selectedDate, setSelectedDate, currentView, setCurrentView,
    getDiaryByDate, saveDiary, deleteDiary, getAllDiaries, searchDiaries, getFilterOptions, getStatistics,
    loading, loadError, refreshDiaries,
    syncLocalFiles: async () => ({ synced: 0, failed: 0, errors: [] }) }}>{children}</DiaryContext.Provider>;
};
