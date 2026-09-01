import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, BookOpen, Bot, Smile } from 'lucide-react';
import { useLayoutMode } from '../context/LayoutModeContext';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { layoutMode } = useLayoutMode();
  const location = useLocation();
  const isCoachPage = location.pathname === '/coach';

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/schedule', icon: Calendar, label: 'الجدول' },
    { path: '/spiritual', icon: BookOpen, label: 'الجانب الديني' },
    { path: '/coach', icon: Bot, label: 'المستشار' },
    { path: '/assessment', icon: Smile, label: 'التقييم' },
  ];

  return (
    <div className={`fixed bottom-0 ${isCoachPage ? 'hidden sm:block' : ''} left-0 right-0 mx-auto bg-white/95 backdrop-blur-md border-t border-[#C9DEC9] z-50 ${layoutMode === 'mobile' ? 'max-w-[414px]' : layoutMode === 'desktop' ? 'min-w-[1024px]' : ''}`}>
      <div className="max-w-4xl mx-auto px-2 sm:px-6 py-2 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
                isActive ? 'text-[#426B4B]' : 'text-[#7A5B64] hover:text-[#5B3C43]'
              }`}
            >
              <div className={`p-1.5 sm:p-2 rounded-xl transition-colors ${isActive ? 'bg-[#C9DEC9]/60 text-[#426B4B]' : ''}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

