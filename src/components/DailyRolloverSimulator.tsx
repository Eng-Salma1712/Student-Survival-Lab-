import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  RotateCcw,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  getTodayISO,
  getYesterdayISO,
  checkAndHandleNewDay,
  evaluateDailyConditions,
  setAllPrayersStatus,
  setDailyQuranStatus,
  setDailyAdhkarStatus,
  STORAGE_KEYS,
  DAILY_ACHIEVEMENT_EVENT,
  NEW_DAY_RESET_EVENT,
  createCertificateData,
  saveEarnedCertificate,
  isCertificateAwardedToday,
  getStudySessions,
} from '../utils/dailyAchievementTracker';
import { GamificationState } from '../types';
import { useToast } from '../context/ToastContext';

interface DailyRolloverSimulatorProps {
  gamification: GamificationState;
  onRefreshGamification?: () => void;
}

export const DailyRolloverSimulator: React.FC<DailyRolloverSimulatorProps> = ({
  gamification,
  onRefreshGamification,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [today, setToday] = useState(() => getTodayISO());
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE) || localStorage.getItem(STORAGE_KEYS.DATE);
  });
  const [status, setStatus] = useState(() => evaluateDailyConditions());

  const refreshState = () => {
    setToday(getTodayISO());
    setLastActiveDate(
      localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE) || localStorage.getItem(STORAGE_KEYS.DATE)
    );
    setStatus(evaluateDailyConditions());
    if (onRefreshGamification) {
      onRefreshGamification();
    }
  };

  useEffect(() => {
    refreshState();
    const handleUpdate = () => refreshState();
    window.addEventListener(DAILY_ACHIEVEMENT_EVENT, handleUpdate);
    window.addEventListener(NEW_DAY_RESET_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(DAILY_ACHIEVEMENT_EVENT, handleUpdate);
      window.removeEventListener(NEW_DAY_RESET_EVENT, handleUpdate);
    };
  }, []);

  // Action 1: Simulate Day Rollover with Yesterday Completed
  const handleSimulateNewDaySuccess = () => {
    // 1. Mark yesterday as awarded
    const yesterday = getYesterdayISO();
    try {
      const rawAwarded = localStorage.getItem(STORAGE_KEYS.AWARDED_DATES);
      const awardedDates: string[] = rawAwarded ? JSON.parse(rawAwarded) : [];
      if (!awardedDates.includes(yesterday)) {
        awardedDates.push(yesterday);
        localStorage.setItem(STORAGE_KEYS.AWARDED_DATES, JSON.stringify(awardedDates));
      }
    } catch (e) {}

    // 2. Set lastActiveDate to yesterday
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, yesterday);
    localStorage.setItem(STORAGE_KEYS.DATE, yesterday);

    // 3. Trigger new day detection
    const result = checkAndHandleNewDay({ forceNewDay: true, simulateYesterdayCompleted: true });
    refreshState();

    toast(
      `🎉 تم الانتقال ليوم جديد بنجاح! اكتملت شروط الأمس فارتفع العداد المتتالي إلى (${result.newStreak} يوم) وتم تصفير قوائم اليوم لبدء يومك الجديد.`,
      'success'
    );
  };

  // Action 2: Simulate Day Rollover with Yesterday Missed
  const handleSimulateNewDayMissed = () => {
    // 1. Ensure yesterday is NOT awarded
    const yesterday = getYesterdayISO();
    try {
      const rawAwarded = localStorage.getItem(STORAGE_KEYS.AWARDED_DATES);
      const awardedDates: string[] = rawAwarded ? JSON.parse(rawAwarded) : [];
      const filtered = awardedDates.filter((d) => d !== yesterday);
      localStorage.setItem(STORAGE_KEYS.AWARDED_DATES, JSON.stringify(filtered));
    } catch (e) {}

    // 2. Set lastActiveDate to yesterday
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, yesterday);
    localStorage.setItem(STORAGE_KEYS.DATE, yesterday);

    // 3. Trigger new day detection
    const result = checkAndHandleNewDay({ forceNewDay: true, simulateYesterdayCompleted: false });
    refreshState();

    toast(
      `⚠️ تم الانتقال ليوم جديد: لم تكتمل شروط الأمس، فتمت إعادة العداد المتتالي إلى (0 أيام) وتصفير قوائم اليوم للبدء من جديد.`,
      'info'
    );
  };

  // Action 3: Complete all 4 conditions for today immediately
  const handleCompleteAllToday = () => {
    // 1. Complete prayers
    setAllPrayersStatus(true);
    // 2. Complete Quran
    setDailyQuranStatus(true);
    // 3. Complete Adhkar
    setDailyAdhkarStatus('morning', true);
    setDailyAdhkarStatus('evening', true);

    // 4. Mark current plan sessions complete
    try {
      const savedPlan = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.studyPlan && parsed.studyPlan.length > 0) {
          parsed.studyPlan = parsed.studyPlan.map((s: any) => ({ ...s, completed: true }));
          localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(parsed));
        }
      }
    } catch (e) {}

    // 5. Award today's certificate
    const updatedStatus = evaluateDailyConditions();
    if (!isCertificateAwardedToday()) {
      const cert = createCertificateData(null, updatedStatus);
      saveEarnedCertificate(cert);
    }

    refreshState();
    toast('✨ تم إكمال جميع شروط اليوم الأربعة بنجاح واحتساب الشهادة ونقاط الإنجاز!', 'success');
  };

  // Action 4: Reset today's conditions back to uncompleted
  const handleResetToday = () => {
    setAllPrayersStatus(false);
    setDailyQuranStatus(false);
    setDailyAdhkarStatus('morning', false);
    setDailyAdhkarStatus('evening', false);
    localStorage.setItem(STORAGE_KEYS.ADHKAR_PROGRESS, JSON.stringify({}));

    try {
      const savedPlan = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.studyPlan && parsed.studyPlan.length > 0) {
          parsed.studyPlan = parsed.studyPlan.map((s: any) => ({ ...s, completed: false }));
          localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(parsed));
        }
      }
    } catch (e) {}

    // Remove today from awarded dates
    try {
      const rawAwarded = localStorage.getItem(STORAGE_KEYS.AWARDED_DATES);
      if (rawAwarded) {
        const awardedDates: string[] = JSON.parse(rawAwarded);
        const filtered = awardedDates.filter((d) => d !== today);
        localStorage.setItem(STORAGE_KEYS.AWARDED_DATES, JSON.stringify(filtered));
      }
    } catch (e) {}

    refreshState();
    toast('🔄 تمت إعادة تعيين جميع شروط اليوم إلى البداية (غير مكتملة).', 'info');
  };

  const isTodayCertEarned = isCertificateAwardedToday();

  return (
    <div className="card-surface border border-slate-200 shadow-xs rounded-2xl overflow-hidden text-right dir-rtl">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer text-start"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2A2A2A]">نظام رصد اليوم الجديد والعداد المتتالي (New Day System)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                نشط وتلقائي
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B]">
              تتبع التاريخ النشط، التصفير التلقائي لليوم، وحساب الالتزام المتتالي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
          <span className="hidden sm:inline">أدوات الفحص والمحاكاة</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4 border-t border-slate-200 bg-white">
          {/* Status Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-[#6B6B6B] block mb-0.5">تاريخ اليوم الفعلي</span>
              <span className="text-xs font-black text-[#2A2A2A] font-mono">{today}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-[#6B6B6B] block mb-0.5">التاريخ النشط المسجل</span>
              <span className="text-xs font-black text-indigo-700 font-mono">
                {lastActiveDate || 'لم يسجل بعد'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-[#6B6B6B] block mb-0.5">العداد المتتالي الحالي</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span className="text-xs font-black text-amber-600 font-mono">
                  {gamification.currentStreak || 0} يوم
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-[#6B6B6B] block mb-0.5">شهادة إنجاز اليوم</span>
              <span
                className={`text-xs font-bold inline-flex items-center gap-1 ${
                  isTodayCertEarned ? 'text-emerald-700' : 'text-[#6B6B6B]'
                }`}
              >
                {isTodayCertEarned ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>مكتملة ومستحقة</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>قيد الإنجاز</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Checklist Status Summary */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-[#2A2A2A] block">
              حالة شروط اليوم الأربعة الحالية:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                {status.sessionsCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={status.sessionsCompleted ? 'text-emerald-700 font-bold' : 'text-[#6B6B6B]'}>
                  الجلسات ({status.sessionsCount}/{status.totalSessionsCount})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {status.prayersCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={status.prayersCompleted ? 'text-emerald-700 font-bold' : 'text-[#6B6B6B]'}>
                  الصلوات الخمس
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {status.quranCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={status.quranCompleted ? 'text-emerald-700 font-bold' : 'text-[#6B6B6B]'}>
                  الورد القرآني
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {status.adhkarCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={status.adhkarCompleted ? 'text-emerald-700 font-bold' : 'text-[#6B6B6B]'}>
                  أذكار الصباح والمساء
                </span>
              </div>
            </div>
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-extrabold text-[#2A2A2A] block">
              أزرار المحاكاة والاختبار السريع للنظام:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulateNewDaySuccess}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="محاكاة انتقال لليوم التالي مع اكتمال شروط الأمس"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>محاكاة يوم جديد (أمس اكتمل ➔ زيادة العداد)</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateNewDayMissed}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="محاكاة انتقال لليوم التالي مع تفويت شروط الأمس"
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>محاكاة يوم جديد (أمس فات ➔ تصفير العداد)</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteAllToday}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="إكمال جميع شروط اليوم الأربعة فوراً للتجربة"
              >
                <Zap className="w-4 h-4 text-amber-600" />
                <span>إكمال جميع شروط اليوم تلقائياً (تجربة)</span>
              </button>

              <button
                type="button"
                onClick={handleResetToday}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="إعادة تعيين شروط اليوم إلى البداية"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>إعادة ضبط شروط اليوم الحالي للصفر</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#6B6B6B] bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>آلية العمل التلقائية:</strong> في الاستخدام الحقيقي، يفحص التطبيق التاريخ تلقائياً عند فتحه لأول مرة في اليوم، أو عند استئناف التبويب، أو عند حلول منتصف الليل، ويقوم بتصفير القوائم وتحديث العداد دون أي تدخل يدوي.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
