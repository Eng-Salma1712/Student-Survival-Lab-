import React from 'react';
import { Brain, Bell, BellRing, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserIdentity } from '../types';
import { getTitleInfo } from './UserPersonalizationWidget';
import { usePushNotifications } from '../utils/usePushNotifications';
import { useToast } from '../context/ToastContext';
import { useLayoutMode } from '../context/LayoutModeContext';
import { Monitor, Smartphone, MonitorSmartphone } from 'lucide-react';

interface HeaderProps {
  userIdentity?: UserIdentity | null;
}

export const Header: React.FC<HeaderProps> = ({
  userIdentity = null,
}) => {
  const titleInfo = getTitleInfo(userIdentity);
  const navigate = useNavigate();
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

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#C9DEC9] text-[#5B3C43] shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Profile / Account Icon at top-left/left side */}
          <button
            onClick={() => navigate('/achievements')}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-[#E8F2E9] border border-[#C9DEC9] hover:bg-[#C9DEC9]/50 transition-all cursor-pointer group shadow-2xs"
            title="الملف الشخصي والحساب"
          >
            <UserCircle className="w-5 h-5 text-[#426B4B]" />
            <span className="text-xs font-bold text-[#5B3C43] hidden sm:inline-block font-heading">
              الملف الشخصي
            </span>
          </button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform duration-200"
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
              <p className="hidden sm:block text-[#7A5B64] text-[10px] sm:text-[11px] font-medium tracking-wide truncate max-w-[200px] md:max-w-[300px]">
                مختبر بقاء الطالب • التشخيص الذكي وخطط الانطلاق
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

