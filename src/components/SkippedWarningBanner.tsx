import React, { useState } from 'react';
import { AlertTriangle, Sparkles, ArrowLeft, Zap, Target, RefreshCw } from 'lucide-react';
import { StudentGoal } from '../types';

interface SkippedWarningBannerProps {
  uncompletedCount: number;
  totalCount: number;
  goal?: StudentGoal | null;
  onFocusNext: () => void;
  onStartMicroChallenge?: () => void;
}

export const SkippedWarningBanner: React.FC<SkippedWarningBannerProps> = ({
  uncompletedCount,
  totalCount,
  goal,
  onFocusNext,
  onStartMicroChallenge,
}) => {
  const [msgIndex, setMsgIndex] = useState<number>(0);

  if (uncompletedCount === 0 || totalCount === 0) return null;

  const targetCollege = goal?.targetTitle || 'كليتك الحلم';
  const reasonText = goal?.importanceReason ? `"${goal.importanceReason}"` : null;

  const motivationalMessages = [
    `طريقك لـ ${targetCollege} محتاج استمرارية! ارجع للمضمار وحقق حلمك الآن! 🔥`,
    `التردد هو السر الأكبر لضياع الوقت. انجز جلسة واحدة فقط دلوقتي واكسر حاجز التكاسل! 🚀`,
    reasonText ? `افتكر السبب: ${reasonText}. لا تدع التراكم يسرق منك فرحة النتيجة! ✨` : `ارجع وركز في خطوة واحدة قدامك دلوقتي! 🎯`,
  ];

  const currentMessage = motivationalMessages[msgIndex % motivationalMessages.length];

  return (
    <div className="w-full bg-white border border-rose-500/30 rounded-xl p-4 sm:p-5 flex flex-col space-y-3 transition-all duration-300" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> نظام التذكير
              </span>
              <span className="text-xs text-[#6B6B6B] font-bold">
                متبقي {uncompletedCount} من {totalCount} جلسات لم تُكتمل
              </span>
            </div>

            <p className="text-sm text-[#2A2A2A] font-bold leading-relaxed">
              {currentMessage}
            </p>

            {goal && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] font-medium">
                <Target className="w-3.5 h-3.5 text-[#D15F70] shrink-0" />
                <span>الهدف: <strong className="text-[#2A2A2A]">{goal.targetTitle}</strong></span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setMsgIndex((prev) => prev + 1)}
            className="p-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] rounded-lg text-xs font-bold transition-all cursor-pointer border border-[#E5E5E5]"
            title="رسالة تشجيعية أخرى"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {onStartMicroChallenge && (
            <button
              type="button"
              onClick={onStartMicroChallenge}
              className="px-3 py-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#6B6B6B] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D15F70]" />
              <span>تحدي 10 دقائق ⏱️</span>
            </button>
          )}

          <button
            type="button"
            onClick={onFocusNext}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-2"
          >
            <span>ابدأ الجلسة القادمة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
