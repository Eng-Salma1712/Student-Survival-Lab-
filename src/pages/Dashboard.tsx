import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, BookOpen, Calendar, Target, Bot, Trophy, Flame, Star, Clock, Zap, Sparkles } from 'lucide-react';
import { GamificationState, StudentGoal, DiagnosisResult, UserIdentity } from '../types';
import { GoalWidget } from '../components/GoalWidget';
import { RescueModeModal } from '../components/RescueModeModal';
import { WeeklyCertificateModal } from '../components/WeeklyCertificateModal';

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

  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isRescueModeOpen, setIsRescueModeOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 font-sans dir-rtl animate-in fade-in duration-300">
      
      {/* Feature Bar */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 pt-2 snap-x px-1 -mx-1">
        <button 
          onClick={() => setIsRescueModeOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/50 hover:bg-amber-100 transition-colors shrink-0 snap-start"
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold">وضع الإنقاذ</span>
        </button>
        <button 
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200/50 hover:bg-rose-100 transition-colors shrink-0 snap-start"
        >
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">راصد الإنجازات</span>
        </button>
        <button 
          onClick={() => setIsCertificateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D15F70]/10 text-[#D15F70] rounded-xl border border-[#D15F70]/20 hover:bg-[#D15F70]/20 transition-colors shrink-0 snap-start"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold">شهادة الأسبوع</span>
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
            <h1 className="text-xl font-bold text-[#2A2A2A] font-heading">أهلاً بك في Student Survival Lab</h1>
            <p className="text-[#6B6B6B] text-sm mt-1">نظم وقتك، التزم بخطتك، وحقق حلمك!</p>
          </div>
        </div>
      </div>

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
        <GoalWidget goal={goal} onSaveGoal={onSaveGoal} />
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
      
      <WeeklyCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        userIdentity={userIdentity || null}
        goal={goal}
        certificateData={{
          studentName: userIdentity?.name || 'طالب متميز',
          weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          weekEndDate: new Date().toISOString(),
          totalFocusedHours: Math.floor((gamification.points || 0) / 10),
          completedLessonsCount: Math.floor((gamification.points || 0) / 5),
          streakDays: gamification.currentStreak || 0,
          keyAchievements: ['إنجاز مهام الأسبوع بنجاح', 'الالتزام بجدول المذاكرة'],
          inspirationalVerse: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
          encouragementMsg: "أنت أقرب لحلمك خطوة إضافية!"
        }}
      />
    </div>
  );
};
