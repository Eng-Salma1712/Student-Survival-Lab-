import React, { useEffect } from 'react';
import { StudentGoal, StudySession } from '../types';
import { Trophy, Heart, Sparkles, CheckCircle2, ArrowLeft, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoalCompletionModalProps {
  goal: StudentGoal | null;
  session: StudySession;
  onClose: () => void;
  completedCount: number;
  totalCount: number;
}

export const GoalCompletionModal: React.FC<GoalCompletionModalProps> = ({
  goal,
  session,
  onClose,
  completedCount,
  totalCount,
}) => {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  useEffect(() => {
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#D4AF6A', '#F59E0B', '#10B981'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200" dir="rtl">
      <div className="card-surface w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative text-center border-[#E5E5E5]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-48 h-48 bg-[#D15F70]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-[#D15F70]/10 text-[#D15F70] border border-[#D15F70]/20 flex items-center justify-center shadow-lg">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#D15F70]/10 text-[#D15F70] text-[10px] font-bold border border-[#D15F70]/20">
            <Sparkles className="w-3 h-3" />
            <span>إنجاز خطوة حقيقية</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#2A2A2A] font-heading">
            عاش يا بطل! أنت اليوم أقرب لحلمك 🎉
          </h3>
          <p className="text-xs text-[#6B6B6B] font-bold">
            أكملت جلسة: <span className="text-[#D15F70]">{session.title}</span> ({session.subject})
          </p>
        </div>

        <div className="relative z-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4 sm:p-5 text-right space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B6B6B] border-b border-[#E5E5E5] pb-2">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#D15F70]" />
              <span>هدفك الذهبي:</span>
            </span>
            <span className="text-[#2A2A2A]">{goal?.targetTitle || 'حلمك'}</span>
          </div>

          <p className="text-xs sm:text-sm text-[#2A2A2A] font-bold leading-relaxed flex items-start gap-2">
            <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>
              «{goal?.importanceReason || 'أريد صنع مستقبلي وإسعاد أهلي'}»
            </span>
          </p>
        </div>

        <div className="relative z-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-[#6B6B6B]">
              إنجاز خطة اليوم: <strong className="text-[#2A2A2A]">{completedCount}</strong> من <strong className="text-[#2A2A2A]">{totalCount}</strong>
            </span>
          </div>
          <span className="font-bold text-[#D15F70] bg-[#D15F70]/10 px-2.5 py-0.5 rounded text-[11px] border border-[#D15F70]/20">
            {percent}%
          </span>
        </div>

        <div className="relative z-10 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
          >
            <span>متابعة المذاكرة واستكمال التحدي</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
