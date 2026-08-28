import React, { useState, useEffect } from 'react';
import { Sun, Moon, Check, RotateCcw, Copy, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import { SABAH_ADHKAR, MASSA_ADHKAR, DhikrItem } from '../data/adhkarData';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

interface AdhkarProgress {
  [id: string]: number; // id -> current count
}

export const DailyAdhkarWidget: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'sabah' | 'massa'>('sabah');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize progress from localStorage with day reset
  const [progress, setProgress] = useState<AdhkarProgress>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_adhkar_progress');
      const savedDate = localStorage.getItem('thanaweya_adhkar_date');
      const today = new Date().toDateString();
      if (saved && savedDate === today) {
        return JSON.parse(saved);
      }
      return {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('thanaweya_adhkar_progress', JSON.stringify(progress));
      localStorage.setItem('thanaweya_adhkar_date', new Date().toDateString());
    } catch (e) {
      console.error(e);
    }
  }, [progress]);

  const currentList = activeTab === 'sabah' ? SABAH_ADHKAR : MASSA_ADHKAR;

  const handleIncrement = (item: DhikrItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const currentCount = progress[item.id] || 0;
    if (currentCount >= item.repeat) return; // already completed

    const nextCount = currentCount + 1;
    const isNowDone = nextCount >= item.repeat;

    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(isNowDone ? [30, 50, 30] : 15);
      } catch {}
    }

    setProgress((prev) => {
      const updated = { ...prev, [item.id]: nextCount };
      
      // Check if all items in current section are completed
      if (isNowDone) {
        const allCompleted = currentList.every((d) => (updated[d.id] || 0) >= d.repeat);
        if (allCompleted) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#426B4B', '#10B981', '#34D399', '#FBBF24'],
          });
          toast(activeTab === 'sabah' ? 'هنيئاً لك! أتممت أذكار الصباح بالكامل مباركاً يومك ☀️' : 'هنيئاً لك! أتممت أذكار المساء طمأنينة لقلبك 🌙', 'success');
        }
      }

      return updated;
    });
  };

  const handleReset = () => {
    setProgress((prev) => {
      const next = { ...prev };
      currentList.forEach((item) => {
        delete next[item.id];
      });
      return next;
    });
    toast(`تمت إعادة تعيين ${activeTab === 'sabah' ? 'أذكار الصباح' : 'أذكار المساء'} ليوم جديد`, 'info');
  };

  const handleCopy = (item: DhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    toast('تم نسخ نص الذكر المبارك بنجاح', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const completedItemsCount = currentList.filter(
    (item) => (progress[item.id] || 0) >= item.repeat
  ).length;

  const progressPercentage = Math.round((completedItemsCount / currentList.length) * 100);

  return (
    <div className="card-surface p-5 sm:p-7 rounded-3xl border border-[#C9DEC9] space-y-5 bg-white/95 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F2E9] pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm transition-colors ${
            activeTab === 'sabah' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-[#426B4B] shadow-[#426B4B]/20'
          }`}>
            {activeTab === 'sabah' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#5B3C43] font-heading">
                أذكار الصباح والمساء 📿
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F2E9] text-[#426B4B] border border-[#C9DEC9]">
                {completedItemsCount} من {currentList.length} مكتمل
              </span>
            </div>
            <p className="text-xs text-[#7A5B64] font-medium pt-0.5">
              حصن المسلم اليومي مع سبحة تفاعلية بنقرة واحدة
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F5] hover:bg-[#E8F2E9] text-[#7A5B64] hover:text-[#426B4B] text-xs font-bold transition-all border border-[#E5E5E5] cursor-pointer"
            title="إعادة تعيين العدادات للبدء من جديد"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-[#F5F5F5] hover:bg-[#E8F2E9] text-[#7A5B64] hover:text-[#426B4B] text-xs font-bold transition-all border border-[#E5E5E5] cursor-pointer"
            title={isCollapsed ? 'توسيع' : 'طي'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Section Tabs & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-[#F5F5F5] p-1 rounded-2xl border border-[#E5E5E5] text-xs font-bold gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sabah')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sabah'
                ? 'bg-white text-amber-700 shadow-xs border border-amber-200/80 font-black'
                : 'text-[#7A5B64] hover:text-[#5B3C43]'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>أذكار الصباح ({SABAH_ADHKAR.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('massa')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'massa'
                ? 'bg-white text-[#426B4B] shadow-xs border border-[#C9DEC9] font-black'
                : 'text-[#7A5B64] hover:text-[#5B3C43]'
            }`}
          >
            <Moon className="w-4 h-4 text-[#426B4B]" />
            <span>أذكار المساء ({MASSA_ADHKAR.length})</span>
          </button>
        </div>

        {/* Mini Completion Indicator */}
        <div className="flex items-center gap-3 bg-[#E8F2E9]/60 px-3.5 py-1.5 rounded-xl border border-[#C9DEC9]/60">
          <div className="w-24 sm:w-32 bg-white h-2 rounded-full overflow-hidden border border-[#C9DEC9]">
            <div
              className={`h-full transition-all duration-300 ${
                activeTab === 'sabah' ? 'bg-amber-500' : 'bg-[#426B4B]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-[#5B3C43] min-w-[36px] text-left">
            %{progressPercentage}
          </span>
        </div>
      </div>

      {/* Adhkar List */}
      {!isCollapsed && (
        <div className="space-y-3.5 pt-2">
          {currentList.map((item, idx) => {
            const currentCount = progress[item.id] || 0;
            const isDone = currentCount >= item.repeat;
            const remaining = Math.max(0, item.repeat - currentCount);

            return (
              <div
                key={item.id}
                onClick={(e) => handleIncrement(item, e)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden group ${
                  isDone
                    ? 'bg-[#E8F2E9]/50 border-[#426B4B]/40 shadow-xs'
                    : 'bg-white border-[#E5E5E5] hover:border-[#426B4B]/50 hover:bg-[#FDFEFE]'
                }`}
              >
                {/* Progress bar line at top */}
                {item.repeat > 1 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#F0F0F0]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isDone ? 'bg-[#426B4B]' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (currentCount / item.repeat) * 100)}%` }}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {/* Top row: Title + Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#E8F2E9] text-[#426B4B] text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-black text-[#5B3C43] font-heading">
                        {item.title}
                      </h4>
                      {item.reference && (
                        <span className="text-[10px] font-bold text-[#7A5B64] bg-[#F5F5F5] px-2 py-0.5 rounded-md border border-[#E5E5E5]">
                          {item.reference}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(item, e)}
                        className="p-1.5 rounded-lg text-[#7A5B64] hover:text-[#5B3C43] hover:bg-[#F5F5F5] transition-colors"
                        title="نسخ الذكر"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-[#426B4B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Repetition / Counter Button */}
                      <button
                        type="button"
                        onClick={(e) => handleIncrement(item, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black text-xs transition-all shadow-xs cursor-pointer ${
                          isDone
                            ? 'bg-[#426B4B] text-white border border-[#426B4B]'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 active:scale-95'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>مكتمل ({item.repeat})</span>
                          </>
                        ) : (
                          <>
                            <span>{currentCount} / {item.repeat}</span>
                            <span className="text-[10px] font-sans opacity-90">({remaining} متبقي)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text with Tashkeel */}
                  <p className={`text-sm sm:text-base leading-loose font-arabic text-justify transition-colors ${
                    isDone ? 'text-[#35523C] font-semibold' : 'text-[#2A2A2A]'
                  }`} dir="rtl">
                    {item.text}
                  </p>

                  {/* Fadl / Benefit */}
                  {item.benefit && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-[#7A5B64] font-medium border-t border-[#E8F2E9]/70">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item.benefit}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
