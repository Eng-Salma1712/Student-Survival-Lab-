import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  BookOpen,
  Heart,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Compass,
  Check,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getDailyPrayers,
  setPrayerStatus,
  setAllPrayersStatus,
  getDailyQuranStatus,
  setDailyQuranStatus,
  getDailyAdhkarStatus,
  setDailyAdhkarStatus,
  DAILY_ACHIEVEMENT_EVENT,
  NEW_DAY_RESET_EVENT,
  recordDailyProgressActivity,
  getTodayISO,
} from '../utils/dailyAchievementTracker';
import {
  EGYPT_CITIES,
  fetchEgyptPrayerTimes,
  calculateFallbackPrayerTimes,
  getNextPrayer,
  PrayerTimesData,
  NextPrayerInfo,
} from '../utils/prayerTimes';
import { formatTimeTo12HourArabic } from '../utils/timeFormat';

interface SpiritualTask {
  id: string;
  title: string;
  category: 'quran' | 'adhkar' | 'prayers' | 'focus';
  description: string;
  icon: string;
  completed: boolean;
}

const DEFAULT_SPIRITUAL_TASKS: SpiritualTask[] = [
  {
    id: 'quran_wird',
    title: 'ورد القرآن الكريم اليومي',
    category: 'quran',
    description: 'قراءة صفحتين أو جزء من سور مباركة يمنح البركة والسكينة',
    icon: '📖',
    completed: false,
  },
  {
    id: 'adhkar_sabah',
    title: 'أذكار الصباح (حِصن المسلم)',
    category: 'adhkar',
    description: 'السبحة والتحصين لبداية يوم دراسي مليء بالتركيز والبركة',
    icon: '☀️',
    completed: false,
  },
  {
    id: 'adhkar_massa',
    title: 'أذكار المساء وراحة البال',
    category: 'adhkar',
    description: 'تفريغ الذهن وتجديد النية لشحن الطاقة قبل النوم',
    icon: '🌙',
    completed: false,
  },
  {
    id: 'prayers_on_time',
    title: 'الصلوات الخمس في أوقاتها',
    category: 'prayers',
    description: 'استراحات إيمانية مباركة تنظم جدول مذاكرتك وتجدد نشاطك',
    icon: '🕌',
    completed: false,
  },
];

export const SpiritualHabitsWidget: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_spiritual_enabled');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [cityKey, setCityKey] = useState<string>(() => {
    try {
      return localStorage.getItem('thanaweya_prayer_city') || 'cairo';
    } catch {
      return 'cairo';
    }
  });

  const [prayerData, setPrayerData] = useState<PrayerTimesData>(() => calculateFallbackPrayerTimes(cityKey));
  const [isLoadingPrayers, setIsLoadingPrayers] = useState<boolean>(false);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(() => getNextPrayer(calculateFallbackPrayerTimes(cityKey)));

  // Load and sync live prayer times whenever cityKey changes
  useEffect(() => {
    let isMounted = true;
    const loadPrayers = async () => {
      setIsLoadingPrayers(true);
      try {
        const data = await fetchEgyptPrayerTimes(cityKey);
        if (isMounted) {
          setPrayerData(data);
          setNextPrayer(getNextPrayer(data));
        }
      } catch (e) {
        console.error('Failed to load prayer times:', e);
      } finally {
        if (isMounted) setIsLoadingPrayers(false);
      }
    };

    loadPrayers();
    try {
      localStorage.setItem('thanaweya_prayer_city', cityKey);
    } catch {
      // ignore
    }

    return () => {
      isMounted = false;
    };
  }, [cityKey]);

  // Periodic recalculation of next prayer countdown (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setNextPrayer(getNextPrayer(prayerData));
    }, 30000);
    return () => clearInterval(timer);
  }, [prayerData]);

  const handleRefreshPrayers = async () => {
    setIsLoadingPrayers(true);
    try {
      // Clear cache for current day to force fresh remote fetch
      const now = new Date();
      const cairoDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
      localStorage.removeItem(`thanaweya_prayer_timings_${cityKey}_${cairoDateStr}`);
      const fresh = await fetchEgyptPrayerTimes(cityKey);
      setPrayerData(fresh);
      setNextPrayer(getNextPrayer(fresh));
    } catch (e) {
      console.warn('Prayer refresh error:', e);
    } finally {
      setIsLoadingPrayers(false);
    }
  };

  const [tasks, setTasks] = useState<SpiritualTask[]>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_spiritual_tasks');
      const qDone = getDailyQuranStatus();
      const aDone = getDailyAdhkarStatus();
      const p = getDailyPrayers();
      const pAll = p.fajr && p.dhuhr && p.asr && p.maghrib && p.isha;

      if (saved) {
        const parsed: SpiritualTask[] = JSON.parse(saved);
        return parsed.map((t) => {
          if (t.id === 'quran_wird') return { ...t, completed: qDone };
          if (t.id === 'adhkar_sabah') return { ...t, completed: aDone.morning };
          if (t.id === 'adhkar_massa') return { ...t, completed: aDone.evening };
          if (t.id === 'prayers_on_time') return { ...t, completed: pAll };
          return t;
        });
      }
      return DEFAULT_SPIRITUAL_TASKS.map((t) => {
        if (t.id === 'quran_wird') return { ...t, completed: qDone };
        if (t.id === 'adhkar_sabah') return { ...t, completed: aDone.morning };
        if (t.id === 'adhkar_massa') return { ...t, completed: aDone.evening };
        if (t.id === 'prayers_on_time') return { ...t, completed: pAll };
        return t;
      });
    } catch {
      return DEFAULT_SPIRITUAL_TASKS;
    }
  });

  const [prayers, setPrayers] = useState(getDailyPrayers);

  useEffect(() => {
    const handleSync = () => {
      const p = getDailyPrayers();
      setPrayers(p);
      const qDone = getDailyQuranStatus();
      const aDone = getDailyAdhkarStatus();
      const pAll = p.fajr && p.dhuhr && p.asr && p.maghrib && p.isha;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === 'quran_wird') return { ...t, completed: qDone };
          if (t.id === 'adhkar_sabah') return { ...t, completed: aDone.morning };
          if (t.id === 'adhkar_massa') return { ...t, completed: aDone.evening };
          if (t.id === 'prayers_on_time') return { ...t, completed: pAll };
          return t;
        })
      );
    };

    window.addEventListener(DAILY_ACHIEVEMENT_EVENT, handleSync);
    window.addEventListener(NEW_DAY_RESET_EVENT, handleSync);
    return () => {
      window.removeEventListener(DAILY_ACHIEVEMENT_EVENT, handleSync);
      window.removeEventListener(NEW_DAY_RESET_EVENT, handleSync);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('thanaweya_spiritual_enabled', JSON.stringify(isEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [isEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('thanaweya_spiritual_tasks', JSON.stringify(tasks));
      localStorage.setItem('thanaweya_spiritual_last_date', getTodayISO());
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const toggleTask = (id: string) => {
    recordDailyProgressActivity();
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }

    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const nextVal = !target?.completed;
      
      // Update global tracker
      if (id === 'quran_wird') setDailyQuranStatus(nextVal);
      if (id === 'adhkar_sabah') setDailyAdhkarStatus('morning', nextVal);
      if (id === 'adhkar_massa') setDailyAdhkarStatus('evening', nextVal);
      if (id === 'prayers_on_time') setAllPrayersStatus(nextVal);

      const next = prev.map((t) => (t.id === id ? { ...t, completed: nextVal } : t));
      const allCompleted = next.every((t) => t.completed);
      if (allCompleted) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#3B82F6', '#EC4899', '#F59E0B'],
        });
      }
      return next;
    });
  };

  const togglePrayer = (prayerKey: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    setPrayerStatus(prayerKey, !prayers[prayerKey]);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  if (!isEnabled) {
    return (
      <div className="w-full bg-slate-100/80 bg-white/50 border border-slate-200 dark:border-[#E5E5E5] rounded-2xl p-3 flex items-center justify-between text-xs text-[#6B6B6B] transition-all">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold">قسم العبادات والورد اليومي مخفي حالياً</span>
        </div>
        <button
          type="button"
          onClick={() => setIsEnabled(true)}
          className="px-3 py-1 bg-white bg-[#F5F5F5] hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-[#E5E5E5] text-[11px] transition-all cursor-pointer flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>إظهار القسم</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/90 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/60 border border-emerald-200/80 dark:border-emerald-900/60 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 dir-rtl transition-all duration-300">
      {/* Widget Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#2A2A2A] font-heading">
                الورد اليومي ومواقيت الصلاة 🕌
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                {completedCount} من {tasks.length} مكتمل
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-[#6B6B6B] font-medium pt-0.5">
              "أَلا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" • استراحات إيمانية تزيد البركة والسكينة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white/80 bg-[#F5F5F5]/80 text-slate-700 dark:text-[#6B6B6B] hover:bg-white dark:hover:bg-slate-700 border border-emerald-200/60 dark:border-[#E5E5E5] text-xs font-bold transition-all cursor-pointer"
            title={isCollapsed ? 'توسيع' : 'طي'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsEnabled(false)}
            className="p-2 rounded-xl bg-white/80 bg-[#F5F5F5]/80 text-[#6B6B6B] hover:text-slate-800 dark:hover:text-emerald-700 border border-[#E5E5E5] text-xs font-bold transition-all cursor-pointer"
            title="إخفاء هذا القسم"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* Prayer Times Bar */}
          <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200/60 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-black text-slate-900 dark:text-[#2A2A2A]">
                  مواقيت الصلاة الرسمية في مصر (نظام ١٢ ساعة)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                  {prayerData.isSummerTime ? 'التوقيت الصيفي النشط (UTC+3)' : 'التوقيت الشتوي (UTC+2)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <label className="text-[11px] font-bold text-slate-600">المدينة:</label>
                  <select
                    value={cityKey}
                    onChange={(e) => setCityKey(e.target.value)}
                    className="bg-emerald-50/80 border border-emerald-200 text-slate-900 text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-hidden cursor-pointer"
                  >
                    {Object.values(EGYPT_CITIES).map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshPrayers}
                  disabled={isLoadingPrayers}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                  title="تحديث المواقيت المباشرة من الهيئة المصرية للمساحة"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrayers ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Next Prayer Countdown Notice */}
            {nextPrayer && (
              <div className="bg-gradient-to-r from-emerald-100/70 via-teal-50 to-emerald-100/70 border border-emerald-300/80 rounded-xl px-3.5 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    الصلاة القادمة: <strong className="text-emerald-700 font-black">{nextPrayer.label}</strong>
                  </span>
                  <span className="px-2 py-0.5 bg-white text-emerald-800 rounded-md font-mono font-bold shadow-2xs">
                    {nextPrayer.time12}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المتبقي:</span>
                  <span className="font-extrabold text-emerald-950 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                    {nextPrayer.countdownFormatted}
                  </span>
                </div>
              </div>
            )}

            {/* Grid of Prayer Times formatted in 12-hour Arabic */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { key: 'fajr', label: 'الفجر', time: prayerData.fajr },
                { key: 'dhuhr', label: 'الظهر', time: prayerData.dhuhr },
                { key: 'asr', label: 'العصر', time: prayerData.asr },
                { key: 'maghrib', label: 'المغرب', time: prayerData.maghrib },
                { key: 'isha', label: 'العشاء', time: prayerData.isha },
              ].map((p) => {
                const isChecked = prayers[p.key as keyof typeof prayers];
                const formattedTime12 = formatTimeTo12HourArabic(p.time);
                const isNext = nextPrayer?.key === p.key;

                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePrayer(p.key as any)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer space-y-1 relative ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : isNext
                        ? 'bg-emerald-100/90 border-emerald-400 text-slate-900 shadow-2xs ring-2 ring-emerald-400/40'
                        : 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-100 text-slate-900'
                    }`}
                    title={`انقر لتسجيل صلاة ${p.label} كمنجزة`}
                  >
                    {isNext && !isChecked && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                        القادمة
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`text-[10px] font-bold ${
                          isChecked ? 'text-emerald-100' : 'text-slate-600'
                        }`}
                      >
                        {p.label}
                      </span>
                      {isChecked && <Check className="w-3 h-3 text-white shrink-0" />}
                    </div>
                    <span
                      className={`font-black text-xs sm:text-sm block tracking-tight ${
                        isChecked ? 'text-white' : 'text-emerald-950 font-bold'
                      }`}
                    >
                      {formattedTime12}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timezone and calculation method footer note */}
            <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-emerald-100">
              <span className="flex items-center gap-1">
                <span>🇪🇬 حساب الهيئة العامة للمساحة المصرية</span>
                <span>•</span>
                <span className="font-mono text-emerald-800">Africa/Cairo</span>
              </span>
              <span>
                {prayerData.hijriDate ? prayerData.hijriDate : 'نظام توقيت دقيق ومحدّث آلياً'}
              </span>
            </div>
          </div>

          {/* Checklist of Spiritual Habits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-emerald-100/50 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white/80 hover:bg-white border-emerald-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0 p-1.5 rounded-xl bg-white shadow-2xs">
                    {task.icon}
                  </span>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        task.completed
                          ? 'line-through text-slate-500'
                          : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

