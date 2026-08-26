import React, { useState, useEffect } from 'react';
import { Moon, Sun, BookOpen, Heart, CheckCircle2, Circle, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Clock, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

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

// Typical approx prayer timings for Egyptian Cities (in 24h format)
const EGYPT_PRAYER_TIMES = {
  cairo: { fajr: '04:15', dhuhr: '12:02', asr: '15:32', maghrib: '18:42', isha: '20:05', name: 'القاهرة والجيزة' },
  alex: { fajr: '04:18', dhuhr: '12:07', asr: '15:39', maghrib: '18:48', isha: '20:12', name: 'الإسكندرية والبحيرة' },
  mansoura: { fajr: '04:13', dhuhr: '12:02', asr: '15:33', maghrib: '18:43', isha: '20:07', name: 'المنصورة ووجه بحري' },
  asyut: { fajr: '04:22', dhuhr: '12:03', asr: '15:29', maghrib: '18:39', isha: '19:59', name: 'أسيوط واللصعيد' },
};

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
  const [cityKey, setCityKey] = useState<keyof typeof EGYPT_PRAYER_TIMES>('cairo');

  const [tasks, setTasks] = useState<SpiritualTask[]>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_spiritual_tasks');
      if (saved) {
        const parsed: SpiritualTask[] = JSON.parse(saved);
        // check if date is today, if not reset completed status
        const lastDate = localStorage.getItem('thanaweya_spiritual_last_date');
        const todayStr = new Date().toDateString();
        if (lastDate !== todayStr) {
          localStorage.setItem('thanaweya_spiritual_last_date', todayStr);
          return parsed.map((t) => ({ ...t, completed: false }));
        }
        return parsed;
      }
      return DEFAULT_SPIRITUAL_TASKS;
    } catch {
      return DEFAULT_SPIRITUAL_TASKS;
    }
  });

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
      localStorage.setItem('thanaweya_spiritual_last_date', new Date().toDateString());
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const toggleTask = (id: string) => {
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }

    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
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

  const currentTimes = EGYPT_PRAYER_TIMES[cityKey];
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
                الورد اليومي والجانب الروحي 🕌
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
          <div className="bg-white/90 bg-white/90 rounded-2xl p-4 border border-emerald-200/60 dark:border-[#E5E5E5] shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-black text-slate-900 dark:text-[#2A2A2A]">مواقيت الصلاة اليومية (مصر)</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-[#6B6B6B]">المدينة:</label>
                <select
                  value={cityKey}
                  onChange={(e) => setCityKey(e.target.value as any)}
                  className="bg-emerald-50/80 bg-[#F5F5F5] border border-emerald-200 dark:border-[#E5E5E5] text-slate-900 dark:text-[#2A2A2A] text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-hidden"
                >
                  {Object.entries(EGYPT_PRAYER_TIMES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid of Prayer Times */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-emerald-50/60 bg-[#F5F5F5]/60 p-2 rounded-xl border border-emerald-100 dark:border-[#E5E5E5]/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-[#6B6B6B] block">الفجر</span>
                <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">{currentTimes.fajr}</span>
              </div>
              <div className="bg-emerald-50/60 bg-[#F5F5F5]/60 p-2 rounded-xl border border-emerald-100 dark:border-[#E5E5E5]/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-[#6B6B6B] block">الظهر</span>
                <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">{currentTimes.dhuhr}</span>
              </div>
              <div className="bg-emerald-50/60 bg-[#F5F5F5]/60 p-2 rounded-xl border border-emerald-100 dark:border-[#E5E5E5]/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-[#6B6B6B] block">العصر</span>
                <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">{currentTimes.asr}</span>
              </div>
              <div className="bg-emerald-50/60 bg-[#F5F5F5]/60 p-2 rounded-xl border border-emerald-100 dark:border-[#E5E5E5]/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-[#6B6B6B] block">المغرب</span>
                <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">{currentTimes.maghrib}</span>
              </div>
              <div className="bg-emerald-50/60 bg-[#F5F5F5]/60 p-2 rounded-xl border border-emerald-100 dark:border-[#E5E5E5]/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-[#6B6B6B] block">العشاء</span>
                <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">{currentTimes.isha}</span>
              </div>
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
                    ? 'bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                    : 'bg-white/90 bg-white/90 border-slate-200 dark:border-[#E5E5E5] hover:border-emerald-300 text-slate-900 text-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">{task.icon}</span>
                  <div>
                    <h4 className={`text-xs font-black ${task.completed ? 'line-through text-emerald-800 dark:text-emerald-300' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-[10px] font-medium text-slate-600 dark:text-[#6B6B6B] line-clamp-1">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#6B6B6B] hover:text-emerald-500" />
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
