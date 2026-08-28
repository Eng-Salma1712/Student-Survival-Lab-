import React from 'react';
import { Brain, Bell, BellRing, UserCircle, Trophy, Monitor, Smartphone, MonitorSmartphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserIdentity, GamificationState } from '../types';
import { getTitleInfo } from './UserPersonalizationWidget';
import { usePushNotifications } from '../utils/usePushNotifications';
import { useToast } from '../context/ToastContext';
import { useLayoutMode } from '../context/LayoutModeContext';

interface HeaderProps {
  userIdentity?: UserIdentity | null;
  gamification?: GamificationState | null;
}

export const Header: React.FC<HeaderProps> = ({
  userIdentity = null,
  gamification = null,
}) => {
  const titleInfo = getTitleInfo(userIdentity);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubscribed, subscribeUser, permission } = usePushNotifications();
  const { toast } = useToast();
  const { layoutMode, setLayoutMode } = useLayoutMode();

  const handleNotificationsClick = async () => {
    if (isSubscribed) {
      toast('الإشعارات الذكية مفعلة بالفعل 🎉', 'success');
    } else {
      const res = await subscribeUser();
      if (res.success || res.status === 'granted') {
        toast('تم تفعيل الإشعارات بنجاح! 🔔', 'success');
      } else if (res.status === 'unsupported') {
        toast('المتصفح الحالي لا يدعم إشعارات الويب المباشرة.', 'info');
      } else {
        toast('يرجى السماح للإشعارات من إعدادات المتصفح.', 'warning');
      }
    }
  };

  const isProfileActive = location.pathname === '/profile';
  const isPointsActive = location.pathname === '/achievements';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#C9DEC9] text-[#5B3C43] shadow-xs transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Profile Button -> ONLY /profile */}
          <button
            onClick={() => navigate('/profile')}
            className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all cursor-pointer group shadow-2xs ${
              isProfileActive
                ? 'bg-[#426B4B] text-white border-[#426B4B]'
                : 'bg-[#E8F2E9] border-[#C9DEC9] hover:bg-[#C9DEC9]/60 text-[#5B3C43]'
            }`}
            title="الملف الشخصي وإعدادات المرحلة"
          >
            <UserCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${isProfileActive ? 'text-white' : 'text-[#426B4B]'}`} />
            <span className="text-xs font-bold hidden sm:inline-block font-heading">
              الملف الشخصي
            </span>
          </button>

          {/* 2. Points Button -> ONLY /achievements */}
          <button
            onClick={() => navigate('/achievements')}
            className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all cursor-pointer group shadow-2xs ${
              isPointsActive
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-amber-50 border-amber-200 hover:bg-amber-100/70 text-amber-900'
            }`}
            title="النقاط وسجل الأوسمة والمكافآت"
          >
            <Trophy className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isPointsActive ? 'text-white' : 'text-amber-600'}`} />
            <span className="text-xs font-extrabold hidden sm:inline-block font-heading">
              النقاط
            </span>
            {gamification && (
              <span className={`text-[11px] font-black px-1.5 py-0.2 rounded-full ${
                isPointsActive ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                {gamification.points}
              </span>
            )}
          </button>

          {/* Logo & App Title */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform duration-200 mr-1 sm:mr-2"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#9EB39F]/20 border border-[#9EB39F]/40 flex items-center justify-center text-[#426B4B] group-hover:bg-[#426B4B] group-hover:text-[#FFFFFF] transition-all">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            </div>
            <div className="block pl-1 sm:pl-2">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight font-heading leading-tight line-clamp-1">
                  Student Survival Lab
                </span>
              </div>
              <p className="hidden sm:block text-[#7A5B64] text-[10px] sm:text-[11px] font-medium tracking-wide truncate max-w-[180px] md:max-w-[260px]">
                مختبر بقاء الطالب • التشخيص الذكي
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">

          <div className="flex items-center gap-1 sm:gap-2 mr-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setLayoutMode('auto')}
              className={`p-1.5 rounded-lg transition-all ${layoutMode === 'auto' ? 'bg-white shadow-sm text-[#426B4B]' : 'text-slate-400 hover:text-slate-600'}`}
              title="تلقائي (Auto)"
            >
              <MonitorSmartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('desktop')}
              className={`p-1.5 rounded-lg transition-all ${layoutMode === 'desktop' ? 'bg-white shadow-sm text-[#426B4B]' : 'text-slate-400 hover:text-slate-600'}`}
              title="كمبيوتر (Desktop)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('mobile')}
              className={`p-1.5 rounded-lg transition-all ${layoutMode === 'mobile' ? 'bg-white shadow-sm text-[#426B4B]' : 'text-slate-400 hover:text-slate-600'}`}
              title="موبايل (Mobile)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleNotificationsClick}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isSubscribed || permission === 'granted'
                ? 'bg-[#E8F2E9] border-[#9EB39F] text-[#426B4B] hover:bg-[#C9DEC9]'
                : 'bg-[#FBE8EE] border-[#F4C7D5] text-[#9E4D68] hover:bg-[#F4C7D5]'
            }`}
            title="الإشعارات"
          >
            {isSubscribed || permission === 'granted' ? (
              <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

