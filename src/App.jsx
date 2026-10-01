import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DiaryProvider, useDiary } from './contexts/DiaryContext';
import DiaryEditor from './pages/DiaryEditor';
import Index from './pages/Index';
import Profile from './pages/Profile';
import DemoPage from './components/DemoPage';

function Content() {
  const { loading, loadError } = useDiary();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0]">正在读取本机日记…</div>;
  if (loadError) return <div role="alert" className="min-h-screen p-6 flex items-center justify-center bg-[#F8F6F0] text-red-700">读取日记失败：{loadError}</div>;
  return <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/editor/:date" element={<DiaryEditor />} />
    <Route path="/dayview/:date" element={<Index />} />
    <Route path="/day/:date" element={<Index />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/demo" element={<DemoPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <TooltipProvider><HashRouter><DiaryProvider><DndProvider backend={HTML5Backend}>
    <Toaster /><Content />
  </DndProvider></DiaryProvider></HashRouter></TooltipProvider>;
}
