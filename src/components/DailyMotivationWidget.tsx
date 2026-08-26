import React, { useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { UserIdentity } from '../types';
import { getTitleInfo } from './UserPersonalizationWidget';

interface DailyMotivationWidgetProps {
  userIdentity?: UserIdentity | null;
}

const DAILY_TIPS = [
  {
    category: 'همسة تركيز ودعم',
    quote: 'تذكري دائماً أن التركيز الشديد لمدة ساعة واحدة فقط يغنيكِ عن أربع ساعات من المذاكرة المشتتة. جودة الوقت هي سر التفوق!',
    emoji: '🌸',
  },
  {
    category: 'إيمان بالقدرات',
    quote: 'لا يوجد درس معقد عصي على الفهم، كل موضوع يبدو صعباً حتى يتم تقسيمه إلى خطوات صغيرة. ابدئي بأول خطوة الآن!',
    emoji: '💪',
  },
  {
    category: 'العناية بالنفس والهدوء',
    quote: 'الراحة والجلسات المريحة ليست رفاهية بل جزء أساسي من تثبيت المعلومات في الذاكرة. خذي تنفساً عميقاً واستمري!',
    emoji: '🌷',
  },
  {
    category: 'حلم القمة',
    quote: 'تخيلي لحظة استلام النتيجة وفرحة والديّكِ بكِ.. كل دقيقة جهد تضعينها اليوم هي اللبنة التي تبني هذه اللحظة العظيمة!',
    emoji: '✨',
  },
  {
    category: 'التعامل مع الأخطاء',
    quote: 'الأخطاء التي تقعين فيها أثناء الحل والتدريب الآن هي أثمن ما تملكين! تدوين الخطأ وفهمه يضمن ألا يكرر مطلقاً في الامتحان النهائي.',
    emoji: '💡',
  },
  {
    category: 'القوة والاستمرارية',
    quote: 'السر في الثانوية ليس في المذاكرة لـ 15 ساعة يوماً واحداً، بل في 4-6 ساعات متواصلة يومياً بدون انقطاع.',
    emoji: '🚀',
  },
];

export const DailyMotivationWidget: React.FC<DailyMotivationWidgetProps> = ({ userIdentity }) => {
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const titleInfo = getTitleInfo(userIdentity);

  const currentTip = DAILY_TIPS[tipIndex % DAILY_TIPS.length];

  return (
    <div className="w-full bg-white bg-white border border-slate-200 dark:border-[#E5E5E5] rounded-3xl p-5 sm:p-6 shadow-2xs relative overflow-hidden dir-rtl transition-all duration-300" dir="rtl">
      <div className="relative z-10 space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {currentTip.category}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-[#2A2A2A] font-heading pt-0.5">
                نصيحة اليوم الملهمة
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTipIndex((prev) => prev + 1)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 bg-[#F5F5F5] dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 rounded-2xl border border-slate-200 dark:border-[#E5E5E5] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
              title="نصيحة ملهمة أخرى"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">تغيير النصيحة</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-slate-50 bg-[#F5F5F5] text-slate-600 dark:text-[#6B6B6B] border border-slate-200 dark:border-[#E5E5E5] text-xs font-bold transition-all cursor-pointer"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Motivation Tip Box */}
        {!isCollapsed && (
          <div className="bg-slate-50 bg-[#F5F5F5]/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-[#E5E5E5] space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{currentTip.emoji}</span>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-slate-900 text-[#2A2A2A] font-extrabold leading-relaxed">
                  "{currentTip.quote}"
                </p>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 font-bold pt-1">
                  — خطوة بخطوة نحو تحقيق حلمكِ في {userIdentity?.collegeName || 'كلية الأحلام'}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

