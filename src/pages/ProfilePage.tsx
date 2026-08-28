import React, { useState } from 'react';
import { PageContainer } from '../components/PageContainer';
import { UserPersonalizationWidget, getTitleInfo } from '../components/UserPersonalizationWidget';
import { UserIdentity, StudentGoal, EducationStage, SecondaryTrack } from '../types';
import {
  GraduationCap,
  Sparkles,
  Heart,
  Calendar,
  Check,
  Plus,
  Bell,
  BellRing,
  Monitor,
  Smartphone,
  MonitorSmartphone,
  Clock,
  Settings,
  Target,
  Edit3,
} from 'lucide-react';
import {
  SCIENTIFIC_COLLEGES,
  LITERARY_COLLEGES,
  PREP_GOAL_SUGGESTIONS,
} from '../utils/educationConfig';
import { usePushNotifications } from '../utils/usePushNotifications';
import { useLayoutMode } from '../context/LayoutModeContext';
import { useToast } from '../context/ToastContext';

interface ProfilePageProps {
  userIdentity: UserIdentity | null;
  onSaveIdentity: (identity: UserIdentity) => void;
  goal: StudentGoal | null;
  onSaveGoal: (goal: StudentGoal) => void;
}

const DEFAULT_EXAM_DATE = '2027-06-26';

const REASON_PRESETS = [
  'لأن أهلي تعبوا معايا جداً ونفسي أشوف دموع الفرحة والافتخار في عينيهم 🥹',
  'علشان أحقق حلم طفولتي وأثبت لنفسي وقدراتي إني أستحق القمة 🚀',
  'لأن النجاح والمستقبل المرموق محتاج تعب ومثابرة، والوصول لحلمي هو خياري الوحيد 💎',
  'لأكون قدوة وفخر لنفسي وعائلتي وأضع بصمة حقيقية في مجتمعي 🌟',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userIdentity,
  onSaveIdentity,
  goal,
  onSaveGoal,
}) => {
  const { toast } = useToast();
  const { isSubscribed, subscribeUser, permission } = usePushNotifications();
  const { layoutMode, setLayoutMode } = useLayoutMode();

  // Goal & College selection local states
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(!goal);
  const [targetTitle, setTargetTitle] = useState<string>(
    goal?.targetTitle || userIdentity?.collegeName || 'كلية الطب (95%+)'
  );
  const [percentageGoal, setPercentageGoal] = useState<string>(
    goal?.percentageGoal || '95%+'
  );
  const [targetExamDate, setTargetExamDate] = useState<string>(
    goal?.targetExamDate || DEFAULT_EXAM_DATE
  );
  const [importanceReason, setImportanceReason] = useState<string>(
    goal?.importanceReason || REASON_PRESETS[0]
  );
  const [customGoalInput, setCustomGoalInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Personal study preferences
  const [studyRhythm, setStudyRhythm] = useState<'morning' | 'evening' | 'flexible'>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_study_rhythm');
      return (saved as any) || 'morning';
    } catch {
      return 'morning';
    }
  });

  const [planIntensity, setPlanIntensity] = useState<'balanced' | 'deep' | 'rescue'>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_plan_intensity');
      return (saved as any) || 'balanced';
    } catch {
      return 'balanced';
    }
  });

  const titleInfo = getTitleInfo(userIdentity);
  const isPrep = userIdentity?.stage === 'prep';
  const isLiterary = userIdentity?.track === 'literary';

  // Handle Notifications click
  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      toast('الإشعارات الذكية مفعلة بالفعل 🎉', 'success');
    } else {
      const res = await subscribeUser();
      if (res.success || res.status === 'granted') {
        toast('تم تفعيل الإشعارات بنجاح! 🔔', 'success');
      } else if (res.status === 'unsupported') {
        toast('المتصفح الحالي لا يدعم إشعارات الويب المباشرة.', 'info');
      } else {
        toast('يرجى السماح للإشعارات من إعدادات المتصفح.', 'warning');
      }
    }
  };

  // Handle saving goal
  const handleSaveGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = targetTitle.trim() || 'الكلية الحلم';

    const updatedGoal: StudentGoal = {
      targetTitle: finalTitle,
      importanceReason: importanceReason.trim() || REASON_PRESETS[0],
      targetExamDate,
      percentageGoal,
      createdAt: goal?.createdAt || Date.now(),
    };

    onSaveGoal(updatedGoal);

    // Synchronize with user identity collegeName
    if (userIdentity) {
      onSaveIdentity({
        ...userIdentity,
        collegeName: finalTitle,
      });
    }

    setIsEditingGoal(false);
    toast('تم حفظ الهدف والكلية المنشودة بنجاح 🎯', 'success');
  };

  const handleSelectGoalPreset = (title: string) => {
    setTargetTitle(title);
    setShowCustomInput(false);
  };

  const handleAddCustomGoal = () => {
    if (!customGoalInput.trim()) return;
    setTargetTitle(customGoalInput.trim());
    setCustomGoalInput('');
    setShowCustomInput(false);
  };

  const handleSaveRhythm = (rhythm: 'morning' | 'evening' | 'flexible') => {
    setStudyRhythm(rhythm);
    localStorage.setItem('thanaweya_study_rhythm', rhythm);
    toast('تم حفظ تفضيل وقت المذاكرة ✨', 'info');
  };

  const handleSaveIntensity = (intensity: 'balanced' | 'deep' | 'rescue') => {
    setPlanIntensity(intensity);
    localStorage.setItem('thanaweya_plan_intensity', intensity);
    toast('تم حفظ نمط الخطة المفضل ⚡', 'info');
  };

  // Select college presets list according to user stage and track
  const availableColleges = isPrep
    ? PREP_GOAL_SUGGESTIONS
    : isLiterary
    ? LITERARY_COLLEGES
    : SCIENTIFIC_COLLEGES;

  return (
    <PageContainer title="الملف الشخصي">
      <div className="space-y-6 dir-rtl" dir="rtl">
        
        {/* Profile Overview Card */}
        <div className="card-surface p-5 sm:p-6 border border-[#D15F70]/25 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#D15F70]/10 border border-[#D15F70]/20 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                {titleInfo.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D15F70]/10 text-[#D15F70] border border-[#D15F70]/20">
                    {userIdentity?.stage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية'}
                  </span>
                  {userIdentity?.stage === 'secondary' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {userIdentity.track === 'scientific' ? 'شعبة علمي' : 'شعبة أدبي'}
                    </span>
                  )}
                  {userIdentity?.gradeLabel && (
                    <span className="text-[11px] font-semibold text-slate-600">
                      {userIdentity.gradeLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#2A2A2A] font-heading">
                  {titleInfo.formalTitle}
                </h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  الهدف الأكاديمي: <strong className="text-[#2A2A2A]">{goal?.targetTitle || userIdentity?.collegeName || 'كلية الأحلام'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Academic Stage, Grade & Track Setup */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <GraduationCap className="w-5 h-5 text-[#D15F70]" />
            <h3 className="text-base font-extrabold text-[#2A2A2A] font-heading">
              1. بيانات المرحلة والصف والشعبة الدراسية
            </h3>
          </div>
          <UserPersonalizationWidget identity={userIdentity} onSaveIdentity={onSaveIdentity} />
        </div>

        {/* 2. Target Goal & College Selection */}
        <div className="card-surface p-5 sm:p-6 border border-[#E5E5E5] space-y-5" dir="rtl">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2A2A2A] font-heading">
                  2. الكلية الحلم والهدف المنشود
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  حدد وجهتك التعليمية والنسبة المئوية التي تطمح للوصول إليها
                </p>
              </div>
            </div>

            {!isEditingGoal && goal && (
              <button
                type="button"
                onClick={() => setIsEditingGoal(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] hover:text-[#2A2A2A] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">تعديل الهدف</span>
              </button>
            )}
          </div>

          {!isEditingGoal && goal ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E5E5E5]">
                  <span className="text-[11px] font-bold text-[#6B6B6B] block mb-1">الكلية / المسار المستهدف:</span>
                  <span className="text-sm font-extrabold text-[#2A2A2A]">{goal.targetTitle}</span>
                </div>
                <div className="bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E5E5E5]">
                  <span className="text-[11px] font-bold text-[#6B6B6B] block mb-1">النسبة المئوية المستهدفة:</span>
                  <span className="text-sm font-extrabold text-[#D15F70]">{goal.percentageGoal || '95%+'}</span>
                </div>
                <div className="bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E5E5E5]">
                  <span className="text-[11px] font-bold text-[#6B6B6B] block mb-1">موعد الامتحان:</span>
                  <span className="text-sm font-extrabold text-[#2A2A2A]">{goal.targetExamDate}</span>
                </div>
              </div>

              {goal.importanceReason && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed font-semibold flex items-start gap-2">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5 text-amber-950">دافع السعي والإصرار:</span>
                    "{goal.importanceReason}"
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveGoalSubmit} className="space-y-4">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold text-[#2A2A2A] mb-2">
                  اختر من ترشيحات {isPrep ? 'المرحلة الإعدادية' : isLiterary ? 'الشعبة الأدبية' : 'الشعبة العلمية'}:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableColleges.map((col, idx) => {
                    const isSelected = targetTitle.includes(col.title);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectGoalPreset(col.title)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#D15F70]/15 border-[#D15F70] text-[#2A2A2A] font-extrabold shadow-2xs'
                            : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{col.icon} {col.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D15F70] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Goal Input */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-xs font-bold text-[#D15F70] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>كتابة كلية أو هدف مخصص آخر...</span>
                </button>
              ) : (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    placeholder="اكتب اسم الكلية أو الهدف الخاص بك..."
                    className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomGoal}
                    className="btn-primary px-3 text-xs"
                  >
                    تأكيد
                  </button>
                </div>
              )}

              {/* Target Percentage & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#2A2A2A] mb-1.5">
                    النسبة المئوية المستهدفة:
                  </label>
                  <select
                    value={percentageGoal}
                    onChange={(e) => setPercentageGoal(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none"
                  >
                    <option value="98%+">98%+ (قمة التميز والتفوق المطلق)</option>
                    <option value="95%+">95%+ (كليات القمة والقطاع الطبي/الهندسي)</option>
                    <option value="90%+">90%+ (تفوق عالي ومستقبل واعد)</option>
                    <option value="85%+">85%+ (الدرجات المتقدمة)</option>
                    <option value="80%+">80%+ (مستوى جيد جداً)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A2A2A] mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#D15F70]" /> موعد الامتحان النهائي:
                  </label>
                  <input
                    type="date"
                    value={targetExamDate}
                    onChange={(e) => setTargetExamDate(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none"
                  />
                </div>
              </div>

              {/* Driving Reason */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#2A2A2A] mb-1.5 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> لماذا هذا الهدف مصيري بالنسبة لك؟
                </label>
                <textarea
                  rows={2}
                  value={importanceReason}
                  onChange={(e) => setImportanceReason(e.target.value)}
                  placeholder="اكتب دافعك الشخصي القوي..."
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#2A2A2A] focus:border-[#D15F70] outline-none leading-relaxed resize-none"
                />

                <div className="flex gap-1.5 flex-wrap pt-1.5">
                  {REASON_PRESETS.slice(0, 2).map((reason, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImportanceReason(reason)}
                      className="text-[10px] bg-[#F5F5F5] hover:bg-slate-200 text-[#6B6B6B] px-2 py-1 rounded-lg transition-colors cursor-pointer text-right line-clamp-1"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex gap-2">
                <button type="submit" className="btn-primary flex-1 py-2.5 text-xs font-bold">
                  حفظ الكلية والهدف
                </button>
                {goal && (
                  <button
                    type="button"
                    onClick={() => setIsEditingGoal(false)}
                    className="btn-secondary px-4 text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* 3. Personal Settings & Preferences */}
        <div className="card-surface p-5 sm:p-6 border border-[#E5E5E5] space-y-5" dir="rtl">
          <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A2A2A] font-heading">
                3. التفضيلات الشخصية وإعدادات التطبيق
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                خصص تنبيهاتك، وضع العرض، وأوقات المذاكرة المفضلة لديك
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Notifications preference */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSubscribed || permission === 'granted'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isSubscribed || permission === 'granted' ? (
                    <BellRing className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#2A2A2A]">إشعارات المذاكرة والتذكير</h4>
                  <p className="text-[11px] text-[#6B6B6B]">
                    {isSubscribed || permission === 'granted'
                      ? 'مفعلة وتصلك مواعيد الجلسات والتحفيز الذكي'
                      : 'تنبيهات في المواعيد المحددة لبدء الجلسات'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSubscribed || permission === 'granted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'btn-primary'
                }`}
              >
                {isSubscribed || permission === 'granted' ? 'مفعلة بنجاح ✓' : 'تفعيل الإشعارات'}
              </button>
            </div>

            {/* Layout Mode preference */}
            <div className="p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-[#2A2A2A]">وضع العرض والتصميم</h4>
                  <p className="text-[11px] text-[#6B6B6B]">اختر التخطيط الأنسب لشاشتك</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] rounded-xl p-1 shadow-2xs">
                  {[
                    { id: 'auto', label: 'تلقائي', icon: MonitorSmartphone },
                    { id: 'desktop', label: 'كمبيوتر', icon: Monitor },
                    { id: 'mobile', label: 'موبايل', icon: Smartphone },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isActive = layoutMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setLayoutMode(mode.id as any)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#D15F70] text-white shadow-2xs'
                            : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Study Rhythm */}
            <div className="p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-2">
              <label className="block text-xs font-extrabold text-[#2A2A2A] mb-1">
                الوقت المفضل للمذاكرة اليومية:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'morning', label: 'صباحي 🌅', desc: 'بركة البكور والتركيز العالي' },
                  { id: 'evening', label: 'مسائي 🌙', desc: 'الهدوء والتركيز الليلي' },
                  { id: 'flexible', label: 'مرن ⏱️', desc: 'حسب ظروف اليوم' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSaveRhythm(item.id as any)}
                    className={`p-2.5 rounded-xl text-right border transition-all cursor-pointer ${
                      studyRhythm === item.id
                        ? 'bg-[#D15F70]/15 border-[#D15F70] text-[#2A2A2A] font-extrabold shadow-2xs ring-1 ring-[#D15F70]'
                        : 'bg-white border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-[#6B6B6B] block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Study Plan Intensity */}
            <div className="p-3.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-2">
              <label className="block text-xs font-extrabold text-[#2A2A2A] mb-1">
                أسلوب الخطة المفضل في المحرك التكيفي:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'balanced', label: 'متوازن ⚖️', desc: 'جلسات 45 دقيقة مع استراحات' },
                  { id: 'deep', label: 'مكثف 🚀', desc: 'جلسات 60 دقيقة وتركيز عميق' },
                  { id: 'rescue', label: 'إنقاذ ⚡', desc: 'تركيز على 20% الأكثر أهمية' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSaveIntensity(item.id as any)}
                    className={`p-2.5 rounded-xl text-right border transition-all cursor-pointer ${
                      planIntensity === item.id
                        ? 'bg-[#D15F70]/15 border-[#D15F70] text-[#2A2A2A] font-extrabold shadow-2xs ring-1 ring-[#D15F70]'
                        : 'bg-white border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-[#6B6B6B] block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </PageContainer>
  );
};
