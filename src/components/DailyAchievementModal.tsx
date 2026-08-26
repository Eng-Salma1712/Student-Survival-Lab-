import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Flame, Sparkles, Plus, Check } from 'lucide-react';
import { StudySession, StudentGoal } from '../types';
import confetti from 'canvas-confetti';

interface DailyAchievementModalProps {
  isOpen?: boolean;
  sessions?: StudySession[];
  goal?: StudentGoal | null;
  userIdentity?: any;
  onSaveAchievement?: (entry: any) => void;
  onClose: () => void;
  onAddReflection?: (reflection: string) => void;
}

export const DailyAchievementModal: React.FC<DailyAchievementModalProps> = ({
  isOpen = true,
  sessions = [],
  goal,
  userIdentity,
  onSaveAchievement,
  onClose,
  onAddReflection
}) => {
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  if (!isOpen) return null;

  const completedSessions = sessions.filter(s => s.completed);
  const completionRate = sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0;
  const isPerfect = completionRate === 100;

  const totalMinutes = completedSessions.reduce((acc, curr) => acc + curr.durationMinutes + curr.breakMinutes, 0);

  const handleSaveReflection = () => {
    if (reflection.trim()) {
      if (onAddReflection) onAddReflection(reflection);
      if (onSaveAchievement) {
        onSaveAchievement({
          id: `ach-${Date.now()}`,
          date: new Date().toISOString(),
          reflection,
          completionRate
        });
      }
      setReflectionSaved(true);
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#D4AF6A', '#F59E0B'],
        origin: { y: 0.8 }
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200" dir="rtl">
      <div className="card-surface w-full max-w-md p-6 rounded-2xl relative border-[#E5E5E5] shadow-2xl">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D15F70]/10 text-[#D15F70] flex items-center justify-center mb-2 border border-[#D15F70]/20">
            {isPerfect ? <Sparkles className="w-8 h-8" /> : <Flame className="w-8 h-8" />}
          </div>
          <h2 className="text-xl font-black text-[#2A2A2A] font-heading">
            {isPerfect ? 'يوم استثنائي يا بطل! 🌟' : 'نهاية يوم دراسي 💪'}
          </h2>
          <p className="text-xs text-[#6B6B6B] font-bold">
            {isPerfect ? 'أنجزت خطتك بالكامل.. استمر!' : 'كل خطوة بتحسب.. بكرة أفضل!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#6B6B6B] font-bold mb-1">نسبة الإنجاز</p>
            <p className="text-xl font-black text-[#2A2A2A]">{completionRate}%</p>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#6B6B6B] font-bold mb-1">دقائق التركيز</p>
            <p className="text-xl font-black text-[#2A2A2A]">{totalMinutes} د</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-bold text-[#2A2A2A] border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#D15F70]" /> ملخص مهام اليوم
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {sessions.map(s => (
              <div key={s.id} className="flex items-start gap-2">
                {s.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <span className={`text-xs font-bold ${s.completed ? 'text-[#6B6B6B]' : 'text-[#6B6B6B] line-through'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-[#6B6B6B]">كيف تقيم تركيزك وأداءك اليوم؟ (اختياري)</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="مثال: واجهت صعوبة في البداية لكن أداءي تحسن.."
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              className="flex-1 bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#2A2A2A] focus:border-[#D15F70] outline-none"
            />
            <button
              onClick={handleSaveReflection}
              className="btn-primary p-2 flex items-center justify-center shrink-0"
            >
              {reflectionSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 btn-secondary py-2.5 text-xs">
          إغلاق ومتابعة
        </button>
      </div>
    </div>
  );
};
