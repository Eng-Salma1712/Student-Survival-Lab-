import React from 'react';
import { GamificationState } from '../types';
import { ALL_BADGES } from '../utils/gamification';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  X,
  Lock,
  CheckCircle2,
  Sparkles,
  Heart,
  TrendingUp,
} from 'lucide-react';

interface AchievementsModalProps {
  gamification: GamificationState;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  gamification,
  onClose,
}) => {
  const unlockedSet = new Set(gamification.unlockedBadgeIds);

  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200" dir="rtl">
      <div className="bg-[#FAFAFA] border border-[#E5E5E5] text-[#2A2A2A] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-[#6B6B6B] hover:text-[#2A2A2A] rounded-xl hover:bg-[#F5F5F5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#2A2A2A] font-heading">
              سجل التحدي والأوسمة الإنجازية 🏆
            </h3>
            <p className="text-xs text-[#6B6B6B] font-bold">
              كل دقيقة ذاكرتها بتفتح لك وسام وتأكيد على قدرتك على قهر الصعاب!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/90 border border-amber-500/30 rounded-2xl p-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>مجموع النقاط</span>
            </div>
            <p className="text-xl font-black text-amber-300 font-heading">
              {gamification.points}
            </p>
          </div>

          <div className="bg-white/90 border border-rose-500/30 rounded-2xl p-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-rose-400" />
              <span>أطول سلسلة</span>
            </div>
            <p className="text-xl font-black text-rose-300 font-heading">
              {gamification.bestStreak} <span className="text-xs">أيام</span>
            </p>
          </div>

          <div className="bg-white/90 border border-sky-500/30 rounded-2xl p-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-sky-400 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>جلسات مكتملة</span>
            </div>
            <p className="text-xl font-black text-sky-300 font-heading">
              {gamification.totalCompletedSessions}
            </p>
          </div>

          <div className="bg-white/90 border border-emerald-500/30 rounded-2xl p-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>الأوسمة المكتسبة</span>
            </div>
            <p className="text-xl font-black text-emerald-300 font-heading">
              {unlockedSet.size} / {ALL_BADGES.length}
            </p>
          </div>
        </div>

        {/* Badges List */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-[#2A2A2A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>خزانة المكافآت والأوسمة</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_BADGES.map((badge) => {
              const isUnlocked = unlockedSet.has(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-white/90 border-amber-500/40 text-[#2A2A2A] shadow-xs'
                      : 'bg-white/30 border-[#E5E5E5] text-[#6B6B6B] opacity-75'
                  }`}
                >
                  {/* Badge Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-bold ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-500/10'
                        : 'bg-[#F5F5F5] text-slate-600 border border-[#E5E5E5]'
                    }`}
                  >
                    {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-600" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs sm:text-sm font-extrabold ${isUnlocked ? 'text-amber-300' : 'text-[#6B6B6B]'}`}>
                        {badge.title}
                      </h5>
                      {isUnlocked ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> تم الفتح
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#6B6B6B] bg-[#F5F5F5] px-2 py-0.5 rounded-md">
                          مغلق
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B6B6B] font-medium leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Footer Note */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-sky-500/10 border border-amber-500/30 rounded-2xl text-xs text-[#6B6B6B] font-bold text-center leading-relaxed">
          💪 كل جلسة مذاكرة بتخلصها بتضيف لك 50 نقطة، وجلسات المواد الصعبة فيها بونص 30 نقطة إضافية! استمر لتصبح الأسطورة رقم 1.
        </div>
      </div>
    </div>
  );
};
