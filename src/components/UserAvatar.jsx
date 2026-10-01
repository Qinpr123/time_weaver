import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserAvatar() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/profile')} aria-label="本机数据与设置" title="本机数据与设置"
    className="w-10 h-10 bg-[#D4A574] rounded-full flex items-center justify-center text-white hover:bg-[#8B7355] transition-colors">
    <Settings className="w-5 h-5" />
  </button>;
}
