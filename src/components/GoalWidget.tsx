import React, { useState, useEffect } from 'react';
import { StudentGoal, UserIdentity } from '../types';
import {
  Trophy,
  Heart,
  Sparkles,
  Edit3,
  X,
  Zap,
  Plus,
  Check,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { getTitleInfo } from './UserPersonalizationWidget';
import {
  SCIENTIFIC_COLLEGES,
  LITERARY_COLLEGES,
  PREP_GOAL_SUGGESTIONS,
} from '../utils/educationConfig';
import { toArabicDigits } from '../utils/timeFormat';

interface GoalWidgetProps {
  goal: StudentGoal | null;
  onSaveGoal: (goal: StudentGoal) => void;
  userIdentity?: UserIdentity | null;
}

const REASON_SUGGESTIONS = [
  'لأن أهلي تعبوا معايا جداً ونفسي أشوف دموع الفرحة والافتخار في عينيهم 🥹',
  'علشان أحقق حلم طفولتي وأثبت لنفسي وقدراتي إني أستحق القمة 🚀',
  'لأن النجاح والمستقبل المرموق محتاج تعب ومثابرة، والوصول لحلمي هو خياري الوحيد 💎',
  'لأكون قدوة وفخر لنفسي وعائلتي وأضع بصمة حقيقية في مجتمعي 🌟',
];

export const GoalWidget: React.FC<GoalWidgetProps> = ({
  goal,
  onSaveGoal,
  userIdentity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Determine initial category based on user track / stage
  const initialCategory =
    userIdentity?.stage === 'prep'
      ? 'scientific'
      : userIdentity?.track === 'literary'
      ? 'literary'
      : 'scientific';

  const [activeTab, setActiveTab] = useState<'scientific' | 'literary' | 'prep'>(
    initialCategory
  );

  const [targetTitle, setTargetTitle] = useState<string>(
    goal?.targetTitle || (userIdentity?.collegeName && userIdentity.collegeName !== 'الكلية الحلم' ? userIdentity.collegeName : '')
  );
  const [importanceReason, setImportanceReason] = useState<string>(
    goal?.importanceReason || ''
  );
  const [targetExamDate, setTargetExamDate] = useState<string>(
    goal?.targetExamDate || ''
  );

  // Custom added colleges state
  const [customScientificColleges, setCustomScientificColleges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('custom_scientific_colleges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customLiteraryColleges, setCustomLiteraryColleges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('custom_literary_colleges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Adding custom college inline input states
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [customCollegeInput, setCustomCollegeInput] = useState<string>('');

  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(() => {
    if (!targetExamDate) return null;
    const now = new Date().getTime();
    const targetTime = new Date(targetExamDate).getTime();
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
      if (!targetExamDate) {
        setTimeLeft(null);
        return;
      }
      const now = new Date().getTime();
      const targetTime = new Date(targetExamDate).getTime();
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
    
    if (targetExamDate) {
      const interval = setInterval(calculateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [targetExamDate]);

  const titleInfo = getTitleInfo(userIdentity);

  const handleAddCustomCollege = (categoryType: 'scientific' | 'literary') => {
    const trimmed = customCollegeInput.trim();
    if (!trimmed) return;

    if (categoryType === 'scientific') {
      const updated = [...customScientificColleges, trimmed];
      setCustomScientificColleges(updated);
      try {
        localStorage.setItem('custom_scientific_colleges', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = [...customLiteraryColleges, trimmed];
      setCustomLiteraryColleges(updated);
      try {
        localStorage.setItem('custom_literary_colleges', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    setTargetTitle(trimmed);
    setCustomCollegeInput('');
    setShowAddCustom(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle.trim()) return;
    const newGoal: StudentGoal = {
      targetTitle: targetTitle.trim(),
      importanceReason: importanceReason.trim()
        ? importanceReason.trim()
        : 'أريد صنع مستقبلي وإسعاد أهلي',
      targetExamDate: targetExamDate || '',
      createdAt: Date.now(),
    };
    onSaveGoal(newGoal);
    setIsModalOpen(false);
  };

  const displayTargetCollege =
    goal?.targetTitle ||
    (userIdentity?.collegeName && userIdentity?.collegeName !== 'الكلية الحلم' ? userIdentity?.collegeName : null) ||
    'لم يتم تحديد الكلية أو الهدف بعد 🎯';
  const displayMotivation =
    goal?.importanceReason ||
    'حدد رسالة الدافع الخاصة بك لتلهمك يومياً أثناء المذاكرة ✨';

  const isPrep = userIdentity?.stage === 'prep';
  const stageMotivationText = isPrep
    ? 'كل درس وسؤال بتذاكره بيقربك خطوة من المركز الأول في الشهادة الإعدادية!'
    : 'كل يوم وكل دقيقة مذاكرة تصنع الفرق في مجموعك النهائي وتحقيق كليتك!';

  return (
    <>
      <div className="card-surface h-full flex flex-col justify-between" dir="rtl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D15F70]/10 flex items-center justify-center shrink-0 border border-[#D15F70]/20 shadow-2xs">
              <Trophy className="w-6 h-6 text-[#D15F70]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6B6B] font-semibold mb-0.5">
                  هدف {titleInfo.formalTitle}
                </span>
                {userIdentity?.stage && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {userIdentity.stage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية'}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-[#2A2A2A] font-heading">
                {displayTargetCollege}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {timeLeft !== null ? (
              <div className="text-center bg-[#F5F5F5] px-4 py-2 rounded-xl border border-[#E5E5E5]">
                <div className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider mb-0.5">
                  متبقي للامتحان
                </div>
                <div className="text-xl font-black text-[#D15F70] font-heading leading-none">
                  {toArabicDigits(timeLeft.days)} <span className="text-xs text-[#6B6B6B] font-normal">يوم</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-center bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors"
              >
                <div className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                  حدد موعد الامتحان
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary px-3.5 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{goal ? 'تعديل الهدف' : 'تحديد الهدف'}</span>
            </button>
          </div>
        </div>

        <div className="bg-[#F5F5F5] p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-[#6B6B6B] font-medium text-xs sm:text-sm">
            <Zap className="w-4 h-4 text-[#D15F70] shrink-0" />
            <span>رسالة الدافع: {stageMotivationText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#2A2A2A] font-semibold shrink-0 italic text-xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span>«{displayMotivation}»</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="card-surface w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border-[#E5E5E5] shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#D15F70]/10 border border-[#D15F70]/20 text-[#D15F70] flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#2A2A2A] font-heading">
                    صياغة وتحديد الهدف الدراسي
                  </h3>
                  <p className="text-xs text-[#6B6B6B]">
                    اختر كليتك الحلم من الكليات العلمية أو الأدبية، أو أضف هدفاً مخصصاً
                  </p>
                </div>
              </div>

              {goal && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-[#6B6B6B] hover:text-[#2A2A2A] rounded-xl hover:bg-[#E5E5E5] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Category Selector (Scientific vs Literary + Prep if applicable) */}
              <div className="space-y-3">
                <label className="block text-sm font-extrabold text-[#2A2A2A]">
                  1. اختر تصنيف الكليات والهدف: <span className="text-rose-500">*</span>
                </label>

                {/* Categories Tab Bar */}
                <div className="flex gap-2 p-1 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('scientific');
                      setShowAddCustom(false);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'scientific'
                        ? 'bg-white text-[#D15F70] shadow-xs border border-[#E5E5E5]'
                        : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
                    }`}
                  >
                    الكليات العلمية 🔬
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('literary');
                      setShowAddCustom(false);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'literary'
                        ? 'bg-white text-[#D15F70] shadow-xs border border-[#E5E5E5]'
                        : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
                    }`}
                  >
                    الكليات الأدبية 📚
                  </button>

                  {isPrep && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('prep');
                        setShowAddCustom(false);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'prep'
                          ? 'bg-white text-[#D15F70] shadow-xs border border-[#E5E5E5]'
                          : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
                      }`}
                    >
                      أهداف الإعدادية 🎒
                    </button>
                  )}
                </div>

                {/* Colleges Pill List */}
                <div className="space-y-2 pt-1">
                  {/* SCIENTIFIC COLLEGES */}
                  {activeTab === 'scientific' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {SCIENTIFIC_COLLEGES.map((item) => {
                          const isSelected = targetTitle.includes(item.title);
                          return (
                            <button
                              key={item.title}
                              type="button"
                              onClick={() => setTargetTitle(item.title)}
                              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#D15F70] text-white shadow-xs'
                                  : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                              }`}
                            >
                              <span>{item.icon}</span>
                              <span>{item.title}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}

                        {/* Custom Scientific Colleges added by user */}
                        {customScientificColleges.map((cName) => {
                          const isSelected = targetTitle === cName;
                          return (
                            <button
                              key={cName}
                              type="button"
                              onClick={() => setTargetTitle(cName)}
                              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#D15F70] text-white shadow-xs'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <span>⭐</span>
                              <span>{cName}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}

                        {/* Add Custom College "+" Button */}
                        <button
                          type="button"
                          onClick={() => setShowAddCustom(true)}
                          className="text-xs font-bold px-3 py-2 rounded-xl bg-white text-[#D15F70] border border-dashed border-[#D15F70] hover:bg-[#D15F70]/10 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ كلية علمية أخرى</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LITERARY COLLEGES */}
                  {activeTab === 'literary' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {LITERARY_COLLEGES.map((item) => {
                          const isSelected = targetTitle.includes(item.title);
                          return (
                            <button
                              key={item.title}
                              type="button"
                              onClick={() => setTargetTitle(item.title)}
                              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#D15F70] text-white shadow-xs'
                                  : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                              }`}
                            >
                              <span>{item.icon}</span>
                              <span>{item.title}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}

                        {/* Custom Literary Colleges added by user */}
                        {customLiteraryColleges.map((cName) => {
                          const isSelected = targetTitle === cName;
                          return (
                            <button
                              key={cName}
                              type="button"
                              onClick={() => setTargetTitle(cName)}
                              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#D15F70] text-white shadow-xs'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <span>⭐</span>
                              <span>{cName}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}

                        {/* Add Custom College "+" Button */}
                        <button
                          type="button"
                          onClick={() => setShowAddCustom(true)}
                          className="text-xs font-bold px-3 py-2 rounded-xl bg-white text-[#D15F70] border border-dashed border-[#D15F70] hover:bg-[#D15F70]/10 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ كلية أدبية أخرى</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PREP GOALS */}
                  {activeTab === 'prep' && isPrep && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {PREP_GOAL_SUGGESTIONS.map((item) => {
                          const isSelected = targetTitle.includes(item.title);
                          return (
                            <button
                              key={item.title}
                              type="button"
                              onClick={() => setTargetTitle(item.title)}
                              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#D15F70] text-white shadow-xs'
                                  : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                              }`}
                            >
                              <span>{item.icon}</span>
                              <span>{item.title}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inline Custom College Adder */}
                  {showAddCustom && (
                    <div className="bg-[#F5F5F5] border border-[#D15F70]/40 p-3 rounded-xl space-y-2 mt-2">
                      <label className="block text-xs font-bold text-[#2A2A2A]">
                        اكتب اسم الكلية أو الهدف المستهدف:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="مثال: كلية الذكاء الاصطناعي بجامعة كفر الشيخ، كلية الفنون الجميلة..."
                          value={customCollegeInput}
                          onChange={(e) => setCustomCollegeInput(e.target.value)}
                          className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCollege(
                                activeTab === 'literary' ? 'literary' : 'scientific'
                              );
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleAddCustomCollege(
                              activeTab === 'literary' ? 'literary' : 'scientific'
                            )
                          }
                          className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> إضافة
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCustom(false);
                            setCustomCollegeInput('');
                          }}
                          className="btn-secondary px-3 py-2 text-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Goal Title Field */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#6B6B6B] mb-1">
                    صيغة الهدف النهائية المعروضة بالعداد والتشخيص:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كلية الهندسة / كلية الطب / كلية الألسن (95%+)"
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Personal Motivation Reason */}
              <div className="space-y-3 pt-2 border-t border-[#E5E5E5]">
                <label className="block text-sm font-extrabold text-[#2A2A2A]">
                  2. الدافع الشخصي للنجاح: <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {REASON_SUGGESTIONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setImportanceReason(reason)}
                      className={`w-full p-3 text-right rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                        importanceReason === reason
                          ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#D15F70] border font-bold'
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
                  placeholder="أكتب الدافع الحقيقي الذي يذكرك بهدفك ويسندك في أوقات التعب..."
                  value={importanceReason}
                  onChange={(e) => setImportanceReason(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs"
                />
              </div>

              {/* Target Exam Date */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                <label className="flex items-center gap-1.5 text-sm font-extrabold text-[#2A2A2A]">
                  <Calendar className="w-4 h-4 text-[#D15F70]" />
                  3. موعد بداية الامتحانات:
                </label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 font-heading cursor-pointer shadow-xs"
                >
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
