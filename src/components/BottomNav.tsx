import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, BookOpen, Bot, Smile, Trophy } from 'lucide-react';
import { useLayoutMode } from '../context/LayoutModeContext';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { layoutMode } = useLayoutMode();
  const location = useLocation();
  const isCoachPage = location.pathname === '/coach';

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية', color: 'coral' },
    { path: '/schedule', icon: Calendar, label: 'الجدول', color: 'mint' },
    { path: '/spiritual', icon: BookOpen, label: 'الجانب الديني', color: 'peach' },
    { path: '/coach', icon: Bot, label: 'المستشار', color: 'blue' },
    { path: '/assessment', icon: Smile, label: 'التقييم', color: 'peach' },
    { path: '/achievements', icon: Trophy, label: 'النقاط', color: 'gold' },
  ];

  return (
    <div className={`fixed bottom-0 ${isCoachPage ? 'hidden sm:block' : ''} left-0 right-0 mx-auto bg-white/95 backdrop-blur-md border-t border-[#C9DEC9] z-50 ${layoutMode === 'mobile' ? 'max-w-[414px]' : layoutMode === 'desktop' ? 'min-w-[1024px]' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-[#426B4B]' : 'text-[#7A5B64] hover:text-[#5B3C43]'
              }`}
            >
              <div className={`p-1.5 sm:p-2 rounded-xl transition-colors ${isActive ? 'bg-[#C9DEC9]/60 text-[#426B4B]' : ''}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

