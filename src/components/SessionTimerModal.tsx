import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudySession } from '../types';
import { Play, Pause, RotateCcw, X, CheckCircle, Clock, BookOpen, ChevronDown, ChevronUp, Sparkles, ExternalLink } from 'lucide-react';

interface SessionTimerModalProps {
  session: StudySession;
  onClose: () => void;
  onToggleComplete: (sessionId: string) => void;
}

export const SessionTimerModal: React.FC<SessionTimerModalProps> = ({
  session,
  onClose,
  onToggleComplete,
}) => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState<number>(session.durationMinutes * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isBreakMode, setIsBreakMode] = useState<boolean>(false);
  const [showDua, setShowDua] = useState<boolean>(true);

  const totalSeconds = (isBreakMode ? session.breakMinutes : session.durationMinutes) * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      try {
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      } catch (e) {}

      if (!isBreakMode && session.breakMinutes > 0) {
        setIsBreakMode(true);
        setSecondsLeft(session.breakMinutes * 60);
      } else {
        onToggleComplete(session.id);
        onClose();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, isBreakMode, session, onToggleComplete, onClose]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft((isBreakMode ? session.breakMinutes : session.durationMinutes) * 60);
  };
  const switchMode = (breakMode: boolean) => {
    setIsActive(false);
    setIsBreakMode(breakMode);
    setSecondsLeft((breakMode ? session.breakMinutes : session.durationMinutes) * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = Math.max(0, Math.min(100, 100 - (secondsLeft / Math.max(1, totalSeconds)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200" dir="rtl">
      <div className="card-surface w-full max-w-md p-6 sm:p-8 rounded-3xl relative space-y-6 shadow-2xl border-[#E5E5E5]">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-[#6B6B6B] hover:text-[#2A2A2A] hover:bg-[#E5E5E5] rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#D15F70]/10 text-[#D15F70] text-[10px] font-bold border border-[#D15F70]/20">
            <Clock className="w-3 h-3" />
            <span>{isBreakMode ? '🌿 استراحة وتعافي' : '🎯 مؤقت التركيز'}</span>
          </div>
          <h3 className="text-xl font-black text-[#2A2A2A] font-heading">{session.title}</h3>
          <p className="text-xs font-bold text-[#6B6B6B]">
            {session.subject} • {session.chapter} • {session.focusType}
          </p>
        </div>

        <div className="flex bg-white border border-[#E5E5E5] p-1 rounded-xl font-bold text-xs">
          <button
            onClick={() => switchMode(false)}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
              !isBreakMode ? 'bg-[#E5E5E5] text-[#2A2A2A]' : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
            }`}
          >
            التركيز ({session.durationMinutes} د)
          </button>
          <button
            onClick={() => switchMode(true)}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
              isBreakMode ? 'bg-emerald-500/20 text-emerald-400' : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
            }`}
          >
            الاستراحة ({session.breakMinutes} د)
          </button>
        </div>

        <div className="py-6 flex flex-col items-center justify-center space-y-6">
          <div className="text-6xl sm:text-7xl font-black tracking-tighter font-mono text-[#2A2A2A]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#E5E5E5]">
            <div
              className={`h-full transition-all duration-1000 ${
                isBreakMode ? 'bg-emerald-500' : 'bg-[#D15F70]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {session.notes && (
          <div className="p-4 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#6B6B6B]">
            <span className="text-[#D15F70] font-bold">ملاحظة: </span> {session.notes}
          </div>
        )}

        {/* Study Dua Prompt / Reminder */}
        <div className="rounded-2xl border border-[#C9DEC9] bg-[#FAFDFB] p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDua(!showDua)}
              className="flex items-center gap-1.5 font-bold text-[#426B4B] hover:text-[#34553B] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBreakMode ? '🌿 دعاء ختام المذاكرة والاستيداع' : '📖 دعاء بداية المذاكرة وطلب الفهم'}</span>
              {showDua ? <ChevronUp className="w-3 h-3 text-[#7A5B64]" /> : <ChevronDown className="w-3 h-3 text-[#7A5B64]" />}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/spiritual?tab=study');
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-[#7A5B64] hover:text-[#426B4B] cursor-pointer transition-colors"
              title="الانتقال إلى قسم الأدعية في الركن الروحي"
            >
              <span>جميع الأدعية</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {showDua && (
            <p className="text-[11px] font-arabic leading-relaxed text-[#5B3C43] bg-white p-2.5 rounded-xl border border-[#E8F2E9]">
              {isBreakMode
                ? '«اللَّهُمَّ إِنِّي أَسْتَوْدِعُكَ مَا قَرَأْتُ وَمَا حَفِظْتُ وَمَا تَعَلَّمْتُ، فَرُدَّهُ عَلَيَّ عِنْدَ حَاجَتِي إِلَيْهِ، إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ»'
                : '«اللَّهُمَّ إِنِّي أَسْأَلُكَ فَهْمَ النَّبِيِّينَ، وَحِفْظَ الْمُرْسَلِينَ، وَالْمَلَائِكَةِ الْمُقَرَّبِينَ... رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي»'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 font-bold text-xs">
          <button
            onClick={resetTimer}
            className="p-3.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] rounded-xl transition-colors cursor-pointer border border-[#E5E5E5]"
            title="إعادة المؤقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`flex-1 py-3.5 px-6 font-bold text-[#2A2A2A] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isActive
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                : 'bg-[#D15F70] border-[#D15F70] text-[#FFFFFF] hover:bg-amber-500'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" /> إيقاف
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> بدء {isBreakMode ? 'الاستراحة' : 'التركيز'}
              </>
            )}
          </button>

          <button
            onClick={() => {
              onToggleComplete(session.id);
              onClose();
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              session.completed
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#E5E5E5] hover:text-[#2A2A2A]'
            }`}
            title="تعليم كـ مكتملة"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
