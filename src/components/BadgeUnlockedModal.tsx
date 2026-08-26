import React, { useEffect } from 'react';
import { Badge } from '../types';
import { Award, Trophy, Sparkles, CheckCircle2, ArrowLeft, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeUnlockedModalProps {
  badges: Badge[];
  pointsEarned: number;
  bonusPoints: number;
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({
  badges,
  pointsEarned,
  bonusPoints,
  onClose,
}) => {
  useEffect(() => {
    // Subtle celebratory confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EC4899', '#A855F7', '#F59E0B', '#10B981', '#3B82F6'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white/75 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl animate-in fade-in zoom-in-95 duration-200" dir="rtl">
      <div className="bg-[#FAFAFA] border border-amber-500/50 text-[#2A2A2A] rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative text-center overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-12 w-48 h-48 bg-amber-500/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Icon */}
        <div className="relative z-10 mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 scale-110 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        {/* Text */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مكافأة تميز جديدة 🎉</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#2A2A2A] font-heading">
            عاش يا بطل! كسبت نقاط وأوسمة جديدة!
          </h3>

          <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-sm pt-1">
            <Zap className="w-4 h-4 fill-amber-300" />
            <span>+{pointsEarned} نقطة أساسية</span>
            {bonusPoints > 0 && (
              <span className="text-emerald-400 font-black">+ {bonusPoints} بونص مادة صعبة! 🔥</span>
            )}
          </div>
        </div>

        {/* Unlocked Badges */}
        {badges.length > 0 && (
          <div className="relative z-10 space-y-3 pt-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3 text-right"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-2xl flex items-center justify-center shrink-0 border border-amber-500/30">
                  {badge.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-extrabold text-amber-300">{badge.title}</h4>
                  <p className="text-xs text-[#6B6B6B] font-bold">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <div className="relative z-10 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer font-heading"
          >
            <span>متابعة الإنجاز والتميز 💪</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
