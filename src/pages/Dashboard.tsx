import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, BookOpen, Calendar, Target, Bot, Trophy, Flame, Star, Clock, Zap, Sparkles, UserCircle } from 'lucide-react';
import { GamificationState, StudentGoal, DiagnosisResult, UserIdentity, DailyCertificateData } from '../types';
import { GoalWidget } from '../components/GoalWidget';
import { RescueModeModal } from '../components/RescueModeModal';
import { DailyCertificateModal } from '../components/DailyCertificateModal';
import { getTitleInfo } from '../components/UserPersonalizationWidget';
import {
  formatWelcomeGreeting,
  getStoredUserIdentity,
  IDENTITY_UPDATED_EVENT,
} from '../utils/userProfile';
import {
  evaluateDailyConditions,
  createCertificateData,
  saveEarnedCertificate,
  isCertificateAwardedToday,
  DAILY_ACHIEVEMENT_EVENT,
} from '../utils/dailyAchievementTracker';

interface DashboardProps {
  gamification: GamificationState;
  goal: StudentGoal | null;
  onSaveGoal: (goal: StudentGoal) => void;
  history?: DiagnosisResult[];
  currentResult?: DiagnosisResult | null;
  userIdentity?: UserIdentity | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ gamification, goal, onSaveGoal, history, currentResult, userIdentity }) => {
  const navigate = useNavigate();

  // Dynamic user profile resolution and reactive updates
  const [effectiveIdentity, setEffectiveIdentity] = useState<UserIdentity | null>(() => {
    if (userIdentity && typeof userIdentity.name === 'string' && userIdentity.name.trim().length > 0) {
      return userIdentity;
    }
    return getStoredUserIdentity();
  });

  useEffect(() => {
    if (userIdentity && typeof userIdentity.name === 'string' && userIdentity.name.trim().length > 0) {
      setEffectiveIdentity(userIdentity);
    } else {
      const stored = getStoredUserIdentity();
      if (stored) setEffectiveIdentity(stored);
    }
  }, [userIdentity]);

  useEffect(() => {
    const handleIdentityUpdate = (e: any) => {
      if (e?.detail) {
        setEffectiveIdentity(e.detail);
      } else {
        const stored = getStoredUserIdentity();
        setEffectiveIdentity(stored);
      }
    };

    window.addEventListener(IDENTITY_UPDATED_EVENT, handleIdentityUpdate);
    window.addEventListener('storage', handleIdentityUpdate);
    return () => {
      window.removeEventListener(IDENTITY_UPDATED_EVENT, handleIdentityUpdate);
      window.removeEventListener('storage', handleIdentityUpdate);
    };
  }, []);

  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isRescueModeOpen, setIsRescueModeOpen] = useState(false);
  const [dailyCertModalOpen, setDailyCertModalOpen] = useState(false);
  const [dailyCertData, setDailyCertData] = useState<DailyCertificateData | null>(null);

  // Automatic Trigger Check: ONLY triggers automatically when ALL 4 conditions are met, and only once per day
  useEffect(() => {
    const checkDailyCertificateTrigger = () => {
      const status = evaluateDailyConditions(currentResult);
      if (status.allCompleted && !isCertificateAwardedToday()) {
        const cert = createCertificateData(effectiveIdentity || userIdentity || null, status);
        saveEarnedCertificate(cert);
        setDailyCertData(cert);
        setDailyCertModalOpen(true);
      }
    };

    // Check immediately on load/change
    checkDailyCertificateTrigger();

    // Listen for habit/prayer/adhkar/session completions
    window.addEventListener(DAILY_ACHIEVEMENT_EVENT, checkDailyCertificateTrigger);
    return () => window.removeEventListener(DAILY_ACHIEVEMENT_EVENT, checkDailyCertificateTrigger);
  }, [currentResult, effectiveIdentity, userIdentity]);

  useEffect(() => {
    const DEFAULT_EXAM_DATE = '2027-06-26';
    const targetDate = goal?.targetExamDate || DEFAULT_EXAM_DATE;
    const now = new Date().getTime();
    const targetTime = new Date(targetDate).getTime();
    const diff = targetTime - now;
    if (diff > 0) {
      setDaysRemaining(Math.floor(diff / (1000 * 60 * 60 * 24)));
    } else {
      setDaysRemaining(0);
    }
  }, [goal]);

  const cards = [
    {
      title: 'المواد والدروس',
      icon: <BookOpen className="w-8 h-8 text-[#7A5BA4]" />,
      bgClass: 'icon-bg-lavender',
      path: '/subjects',
      description: 'تحديد ما ستدرسه اليوم',
    },
    {
      title: 'التقييم اليومي',
      icon: <Smile className="w-8 h-8 text-[#D97736]" />,
      bgClass: 'icon-bg-peach',
      path: '/assessment',
      description: 'حالتك المزاجية وساعات المذاكرة',
    },
    {
      title: 'جدول الجلسات',
      icon: <Calendar className="w-8 h-8 text-[#4EA67F]" />,
      bgClass: 'icon-bg-mint',
      path: '/schedule',
      description: 'خطة المذاكرة المخصصة لك',
    },
    {
      title: 'المستشار الذكي',
      icon: <Bot className="w-8 h-8 text-[#528FBA]" />,
      bgClass: 'icon-bg-blue',
      path: '/coach',
      description: 'محادثة وتوجيه ذكي',
    }
  ];

  const { greeting, hasProfile } = formatWelcomeGreeting(effectiveIdentity);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 font-sans dir-rtl animate-in fade-in duration-300">
      
      {/* Feature Bar */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 pt-2 snap-x px-1 -mx-1">
        <button 
          onClick={() => setIsRescueModeOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/50 hover:bg-amber-100 transition-colors shrink-0 snap-start cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold">وضع الإنقاذ</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60 hover:bg-emerald-100 transition-colors shrink-0 snap-start cursor-pointer"
        >
          <UserCircle className="w-4 h-4" />
          <span className="text-sm font-bold">الملف الشخصي</span>
        </button>
        <button 
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200/50 hover:bg-rose-100 transition-colors shrink-0 snap-start cursor-pointer"
        >
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">النقاط والمكافآت</span>
        </button>
      </div>

      {/* Top Welcome Banner */}
      <div className="card-surface p-5 sm:p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 border border-[#D15F70]/20 text-center sm:text-right">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D15F70]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center border border-[#E5E5E5] shrink-0 shadow-sm mx-auto sm:mx-0">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2A2A2A] font-heading">
              {greeting}
            </h1>
            <p className="text-[#6B6B6B] text-sm mt-1">نظم وقتك، التزم بخطتك، وحقق حلمك!</p>
          </div>
        </div>
        {!hasProfile && (
          <button
            onClick={() => navigate('/profile')}
            className="relative z-10 btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <span>تهيئة ملفك الآن</span>
            <span>←</span>
          </button>
        )}
      </div>

      {/* If student has not configured profile yet, show a welcoming setup card */}
      {!hasProfile && (
        <div className="card-surface p-5 sm:p-6 border-2 border-dashed border-[#D15F70]/40 bg-gradient-to-r from-rose-50/50 via-amber-50/30 to-emerald-50/40 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#D15F70] text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                ✨
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#2A2A2A] font-heading">
                  مرحباً بك يا بطل! ابدأ بتهيئة ملفك الدراسي 👋
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
                  حدد مرحلتك الدراسية (إعدادي / ثانوي) وشعبتك وهدفك لتخصيص المواد وجداول المذاكرة المناسبة لك فوراً.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary w-full sm:w-auto px-5 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
            >
              <span>إعداد الملف الشخصي الآن</span>
              <span>←</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Persistent Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">النقاط</div>
            <div className="text-lg font-black text-[#2A2A2A]">{gamification.points || 0}</div>
          </div>
        </div>

        <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">أيام متتالية</div>
            <div className="text-lg font-black text-[#2A2A2A]">{gamification.currentStreak || 0}</div>
          </div>
        </div>

        <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D15F70]/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#D15F70]" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-0.5">متبقي للامتحان</div>
            <div className="text-lg font-black text-[#2A2A2A]">{daysRemaining}</div>
          </div>
        </div>
      </div>

      {/* Goal & Countdown directly on Home Screen */}
      <div>
        <GoalWidget goal={goal} onSaveGoal={onSaveGoal} userIdentity={userIdentity} />
      </div>

      {/* Icon Navigation Grid */}
      <div>
        <h3 className="text-sm font-bold text-[#6B6B6B] mb-3 px-1">أدوات المذاكرة:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => navigate(card.path)}
              className="card-surface p-6 flex items-start gap-4 text-right hover:bg-[#F5F5F5] transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 rounded-2xl ${card.bgClass} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2A2A2A] mb-1 group-hover:text-[#D15F70] transition-colors">{card.title}</h3>
                <p className="text-sm text-[#6B6B6B]">{card.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <RescueModeModal isOpen={isRescueModeOpen} onClose={() => setIsRescueModeOpen(false)} />
      
      {/* Daily Achievement Certificate Modal (Triggers automatically upon completing all 4 conditions) */}
      <DailyCertificateModal
        isOpen={dailyCertModalOpen}
        onClose={() => setDailyCertModalOpen(false)}
        certificateData={dailyCertData}
      />
    </div>
  );
};
