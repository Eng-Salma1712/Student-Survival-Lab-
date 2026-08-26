import React, { useState, useEffect } from 'react';
import { StudentGoal, UserIdentity } from '../types';
import {
  Trophy,
  Heart,
  Sparkles,
  Edit3,
  X,
  Zap,
} from 'lucide-react';
import { getTitleInfo } from './UserPersonalizationWidget';

interface GoalWidgetProps {
  goal: StudentGoal | null;
  onSaveGoal: (goal: StudentGoal) => void;
  userIdentity?: UserIdentity | null;
}

const DEFAULT_EXAM_DATE = '2027-06-26';

const GOAL_SUGGESTIONS = [
  { title: 'كلية الطب البشري (95%+)', icon: '🩺' },
  { title: 'كلية الهندسة (92%+)', icon: '🏗️' },
  { title: 'كلية الحاسبات والذكاء الاصطناعي (90%+)', icon: '💻' },
  { title: 'كلية الفنون التطبيقية / الجميلة (88%+)', icon: '🎨' },
];

const REASON_SUGGESTIONS = [
  'لأن أهلي تعبوا معايا جداً ونفسي أشوف دموع الفرحة في عينيهم 🥹',
  'علشان أحقق حلم طفولتي وأثبت لنفسي إني أقدر أصل للقمة 🚀',
  'لأن المستقبل محتاج تجد ومثابرة، والنجاح هو خياري الوحيد 💎',
];

export const GoalWidget: React.FC<GoalWidgetProps> = ({
  goal,
  onSaveGoal,
  userIdentity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!goal);
  const [targetTitle, setTargetTitle] = useState<string>(
    goal?.targetTitle || userIdentity?.collegeName || 'كلية الطب البشري (95%+)'
  );
  const [importanceReason, setImportanceReason] = useState<string>(
    goal?.importanceReason || 'علشان أفرح أمي وأبويا وأحقق حلم طفولتي'
  );
  const [targetExamDate, setTargetExamDate] = useState<string>(
    goal?.targetExamDate || DEFAULT_EXAM_DATE
  );

  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date().getTime();
    const targetTime = new Date(targetExamDate || DEFAULT_EXAM_DATE).getTime();
    const diff = targetTime - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const targetTime = new Date(targetExamDate || DEFAULT_EXAM_DATE).getTime();
      const diff = targetTime - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetExamDate]);

  const titleInfo = getTitleInfo(userIdentity);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle.trim()) return;
    const newGoal: StudentGoal = {
      targetTitle: targetTitle.trim(),
      importanceReason: importanceReason.trim() ? importanceReason.trim() : 'أريد صنع مستقبلي وإسعاد أهلي',
      targetExamDate: targetExamDate || DEFAULT_EXAM_DATE,
      createdAt: Date.now(),
    };
    onSaveGoal(newGoal);
    setIsModalOpen(false);
  };

  const displayTargetCollege = goal?.targetTitle || userIdentity?.collegeName || 'كلية الأحلام (95%+)';
  const displayMotivation = goal?.importanceReason || 'علشان أفرح أمي وأبويا وأحقق حلم طفولتي في القمة';

  return (
    <>
      <div className="card-surface h-full flex flex-col justify-between" dir="rtl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0 border border-[#E5E5E5]">
              <Trophy className="w-6 h-6 text-[#D15F70]" />
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] font-medium mb-0.5">
                هدف {titleInfo.formalTitle}
              </div>
              <h2 className="text-lg font-black text-[#2A2A2A] font-heading">
                {displayTargetCollege}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center bg-[#F5F5F5] px-4 py-2 rounded-xl border border-[#E5E5E5]">
              <div className="text-[10px] text-[#6B6B6B] font-medium uppercase tracking-wider mb-0.5">متبقي للامتحان</div>
              <div className="text-xl font-black text-[#D15F70] font-heading leading-none">
                {timeLeft.days} <span className="text-xs text-[#6B6B6B]">يوم</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary px-3 py-2 text-xs flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F5F5F5] p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-[#6B6B6B] font-medium">
            <Zap className="w-4 h-4 text-[#D15F70] shrink-0" />
            <span>رسالة الدافع: كل يوم وكل دقيقة مذاكرة تصنع الفرق في مجموعكِ النهائي وتصنع مستقبلكِ!</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6B6B6B] font-medium shrink-0 italic">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span>«{displayMotivation}»</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
          <div className="card-surface w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border-[#E5E5E5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D15F70]/20 border border-[#D15F70]/30 text-[#D15F70] flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#2A2A2A] font-heading">صياغة الهدف الذهبي</h3>
                  <p className="text-xs text-[#6B6B6B]">حدد رؤيتك لتستمد منها الطاقة.</p>
                </div>
              </div>

              {goal && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-[#6B6B6B] hover:text-[#2A2A2A] rounded-xl hover:bg-[#E5E5E5] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[#2A2A2A]">
                  1. الهدف الكلي أو الكلية: <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 pb-1">
                  {GOAL_SUGGESTIONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setTargetTitle(item.title)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                        targetTitle === item.title
                          ? 'bg-[#D15F70] text-[#FFFFFF]'
                          : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="أكتب هدفك بالتفصيل..."
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  className="w-full px-4 py-3"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-[#2A2A2A]">
                  2. الدافع الشخصي للنجاح: <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {REASON_SUGGESTIONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setImportanceReason(reason)}
                      className={`w-full p-3 text-right rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                        importanceReason === reason
                          ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#D15F70] border'
                          : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                      }`}
                    >
                      <Heart className="w-4 h-4 shrink-0" />
                      <span>{reason}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="أكتب الدافع الحقيقي الذي يذكرك بتعبك..."
                  value={importanceReason}
                  onChange={(e) => setImportanceReason(e.target.value)}
                  className="w-full px-4 py-3"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-[#2A2A2A]">
                  3. موعد بداية الامتحانات:
                </label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full px-4 py-3"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 font-heading">
                  <Sparkles className="w-4 h-4" />
                  <span>حفظ الهدف والانطلاق</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
