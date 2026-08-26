import React from 'react';
import { GamificationState } from '../types';
import { ALL_BADGES } from '../utils/gamification';
import { Flame, Award, Zap, Trophy } from 'lucide-react';

interface GamificationWidgetProps {
  gamification: GamificationState;
  onOpenAchievements: () => void;
}

export const GamificationWidget: React.FC<GamificationWidgetProps> = ({
  gamification,
  onOpenAchievements,
}) => {
  const unlockedCount = gamification.unlockedBadgeIds.length;
  const totalBadges = ALL_BADGES.length;

  return (
    <div className="card-surface h-full flex flex-col justify-center gap-4" dir="rtl">
      
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#6B6B6B]">سلسلة الالتزام</div>
            <div className="text-lg font-black font-heading text-[#2A2A2A]">
              {gamification.currentStreak} <span className="text-xs text-[#6B6B6B] font-medium">أيام</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-current text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#6B6B6B]">النقاط</div>
            <div className="text-lg font-black font-heading text-[#2A2A2A]">
              {gamification.points}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] text-[#6B6B6B] border border-[#E5E5E5] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#6B6B6B]">الأوسمة</div>
            <div className="text-sm font-bold text-[#2A2A2A]">{unlockedCount} / {totalBadges}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAchievements}
          className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-2"
        >
          <Trophy className="w-3.5 h-3.5 text-[#D15F70]" />
          <span>المكافآت</span>
        </button>
      </div>

    </div>
  );
};
