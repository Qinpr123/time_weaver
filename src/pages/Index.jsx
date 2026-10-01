import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiary } from '../contexts/DiaryContext';
import Header from '../components/Header';
import YearView from '../components/YearView';
import MonthView from '../components/MonthView';
import DayView from '../components/DayView';
import SearchResultsView from '../components/SearchResultsView';

export default function Index() {
  const { date: routeDate } = useParams();
  const navigate = useNavigate();
  const { currentView, setCurrentView, setSelectedDate, selectedDate, searchDiaries } = useDiary();
  const [searchFilters, setSearchFilters] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!routeDate) return;
    setCurrentView('day');
    setSelectedDate(new Date(`${routeDate}T12:00:00`));
  }, [routeDate, setCurrentView, setSelectedDate]);

  useEffect(() => {
    if (currentView === 'day' && selectedDate) {
      navigate(`/dayview/${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`, { replace: true });
    } else if (currentView === 'month' || currentView === 'year') navigate('/', { replace: true });
  }, [currentView, selectedDate, navigate]);

  const openSearch = filters => {
    setSearchFilters(filters);
    setSearchResults(searchDiaries(filters));
    setCurrentView('search');
  };
  const closeSearch = () => { setSearchFilters(null); setSearchResults([]); setCurrentView('month'); };
  const view = currentView === 'year' ? <YearView />
    : currentView === 'day' ? <DayView />
    : currentView === 'search' ? <SearchResultsView results={searchResults} filters={searchFilters} onClose={closeSearch} onClearFilters={() => { setSearchFilters(null); setSearchResults([]); }} />
    : <MonthView />;

  return <div className="min-h-screen bg-[#F8F6F0] paper-texture overflow-x-hidden">
    <Header onSearchOpen={openSearch} searchFilters={searchFilters} />
    <main className="relative">
      <div className="absolute top-0 left-0 w-16 h-16 sm:w-32 sm:h-32 opacity-10 pointer-events-none"><div className="w-full h-full border-l-2 border-t-2 border-[#D4A574] rounded-tl-3xl" /></div>
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 opacity-10 pointer-events-none"><div className="w-full h-full border-r-2 border-t-2 border-[#D4A574] rounded-tr-3xl" /></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-32 sm:h-32 opacity-10 pointer-events-none"><div className="w-full h-full border-l-2 border-b-2 border-[#D4A574] rounded-bl-3xl" /></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-32 sm:h-32 opacity-10 pointer-events-none"><div className="w-full h-full border-r-2 border-b-2 border-[#D4A574] rounded-br-3xl" /></div>
      {view}
    </main>
  </div>;
}
