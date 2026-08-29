import React, { useState } from 'react';
import { User, Check, Settings2, GraduationCap, School, BookOpen, Compass } from 'lucide-react';
import { UserIdentity, EducationStage, SecondaryTrack } from '../types';
import { PREP_GRADES, SECONDARY_GRADES } from '../utils/educationConfig';
import { getTitleInfo, TitleInfo, saveUserIdentity } from '../utils/userProfile';

export { getTitleInfo };
export type { TitleInfo };

interface UserPersonalizationWidgetProps {
  identity: UserIdentity | null;
  onSaveIdentity: (identity: UserIdentity) => void;
}

export const UserPersonalizationWidget: React.FC<UserPersonalizationWidgetProps> = ({
  identity,
  onSaveIdentity,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!identity);
  
  const [name, setName] = useState(identity?.name || '');
  const [gender, setGender] = useState<'male' | 'female'>(identity?.gender || 'male');
  const [stage, setStage] = useState<EducationStage>(identity?.stage || 'secondary');
  const [track, setTrack] = useState<SecondaryTrack>(identity?.track || 'scientific');
  const [grade, setGrade] = useState<string>(
    identity?.grade || (identity?.stage === 'prep' ? 'prep_3' : 'sec_3')
  );
  const [category, setCategory] = useState<'medicine' | 'engineering' | 'computing' | 'arts' | 'literature' | 'other'>(
    identity?.category || 'medicine'
  );

  // When stage changes, automatically reset grade to appropriate default
  const handleStageChange = (newStage: EducationStage) => {
    setStage(newStage);
    if (newStage === 'prep') {
      setGrade('prep_3');
    } else {
      setGrade('sec_3');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    let defaultCollege = 'الكلية الحلم';
    if (category === 'medicine') defaultCollege = 'كلية الطب';
    if (category === 'engineering') defaultCollege = 'كلية الهندسة';
    if (category === 'computing') defaultCollege = 'كلية الحاسبات والمعلومات';
    if (category === 'arts') defaultCollege = 'كلية الفنون والتصميم';
    if (category === 'literature') defaultCollege = 'كلية الألسن والآداب';
    if (category === 'other') {
      defaultCollege = stage === 'prep' ? 'مدارس المتفوقين (STEM)' : 'الكلية الحلم';
    }

    const currentGradeOptions = stage === 'prep' ? PREP_GRADES : SECONDARY_GRADES;
    const matchedGrade = currentGradeOptions.find(g => g.id === grade);
    const gradeLabel = matchedGrade ? matchedGrade.label : (stage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية');

    const newIdentity: UserIdentity = {
      name: name.trim(),
      gender,
      category,
      collegeName: identity?.collegeName || defaultCollege,
      stage,
      track: stage === 'secondary' ? track : undefined,
      grade,
      gradeLabel,
    };

    saveUserIdentity(newIdentity);
    onSaveIdentity(newIdentity);
    setIsEditing(false);
  };

  const info = getTitleInfo(identity);

  if (!isEditing && identity) {
    const stageLabel = identity.stage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية';
    const trackLabel = identity.stage === 'secondary' ? (identity.track === 'scientific' ? 'علمي' : 'أدبي') : null;

    return (
      <div className="card-surface p-5 border border-[#E5E5E5] space-y-3" dir="rtl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D15F70]/10 border border-[#D15F70]/20 flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-2xl">{info.emoji}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                  الملف الشخصي
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D15F70]/10 text-[#D15F70] border border-[#D15F70]/20">
                  {stageLabel}
                </span>
                {trackLabel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {trackLabel}
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-[#2A2A2A] font-heading">
                {info.formalTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2.5 rounded-xl bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] hover:text-[#2A2A2A] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="تعديل بيانات الملف الشخصي والمرحلة الدراسية"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">تعديل المرحلة</span>
          </button>
        </div>

        {/* Detailed Education Summary Pill */}
        <div className="pt-2 border-t border-[#E5E5E5] flex flex-wrap items-center gap-2 text-xs text-[#6B6B6B]">
          <span className="font-semibold text-[#2A2A2A] flex items-center gap-1">
            <School className="w-3.5 h-3.5 text-[#D15F70]" />
            {identity.gradeLabel || (identity.stage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية')}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
            الهدف: <strong className="text-[#2A2A2A]">{identity.collegeName}</strong>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface p-5 sm:p-6 space-y-5 border border-[#D15F70]/30 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D15F70]/10 flex items-center justify-center text-[#D15F70]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2A2A2A] font-heading">
              إعداد الملف الشخصي والمرحلة الدراسية
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              حدد مرحلتك وصفك الدراسي لتخصيص المواد وخطط المذاكرة بدقة
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Name input */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A] mb-1.5">
            <User className="w-3.5 h-3.5 text-[#D15F70]" /> اسم الطالب / الطالبة:
          </label>
          <input
            type="text"
            required
            placeholder="اكتب اسمك الأول..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs"
          />
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-bold text-[#2A2A2A] mb-1.5">
            النوع:
          </label>
          <div className="flex gap-2">
            {[
              { id: 'male', label: 'طالب 👨‍🎓' },
              { id: 'female', label: 'طالبة 👩‍🎓' }
            ].map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGender(g.id as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  gender === g.id
                    ? 'bg-[#D15F70] text-white border-[#D15F70] shadow-xs'
                    : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-100'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: Education Stage (Required First Choice) */}
        <div className="pt-2 border-t border-[#E5E5E5]">
          <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#2A2A2A] mb-2">
            <School className="w-4 h-4 text-[#D15F70]" />
            1. المرحلة الدراسية (اختيار إلزامي):
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleStageChange('prep')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                stage === 'prep'
                  ? 'bg-[#D15F70]/10 border-[#D15F70] text-[#2A2A2A] shadow-xs ring-1 ring-[#D15F70]'
                  : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold font-heading">المرحلة الإعدادية</span>
                <span className="text-lg">🎒</span>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">من الصف الأول إلى الثالث الإعدادي</p>
              {stage === 'prep' && (
                <span className="mt-2 text-[10px] font-bold text-[#D15F70] flex items-center gap-1">
                  <Check className="w-3 h-3" /> تم الاختيار
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleStageChange('secondary')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                stage === 'secondary'
                  ? 'bg-[#D15F70]/10 border-[#D15F70] text-[#2A2A2A] shadow-xs ring-1 ring-[#D15F70]'
                  : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold font-heading">المرحلة الثانوية</span>
                <span className="text-lg">🎓</span>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">من الصف الأول إلى الثالث الثانوي</p>
              {stage === 'secondary' && (
                <span className="mt-2 text-[10px] font-bold text-[#D15F70] flex items-center gap-1">
                  <Check className="w-3 h-3" /> تم الاختيار
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: If Secondary is selected -> Show scientific (علمي) or literary (أدبي) */}
        {stage === 'secondary' && (
          <div className="pt-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A] mb-2">
              <Compass className="w-4 h-4 text-[#D15F70]" />
              2. الشعبة (لطلاب المرحلة الثانوية):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrack('scientific')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  track === 'scientific'
                    ? 'bg-[#D15F70] text-white border-[#D15F70] shadow-xs'
                    : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-100'
                }`}
              >
                <span>علمي (علوم / رياضة) 🔬</span>
                {track === 'scientific' && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setTrack('literary')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  track === 'literary'
                    ? 'bg-[#D15F70] text-white border-[#D15F70] shadow-xs'
                    : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-100'
                }`}
              >
                <span>أدبي 📚</span>
                {track === 'literary' && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Grade / Year Dropdown */}
        <div className="pt-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A] mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#D15F70]" />
            {stage === 'secondary' ? '3. الصف الدراسي:' : '2. الصف الدراسي:'}
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs"
          >
            {(stage === 'prep' ? PREP_GRADES : SECONDARY_GRADES).map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Step 4: Target Field / College Category */}
        <div className="pt-2 border-t border-[#E5E5E5]">
          <label className="block text-xs font-bold text-[#2A2A2A] mb-1.5">
            المجال المستهدف أو الكلية الحلم:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'medicine', label: 'القطاع الطبي 🩺' },
              { id: 'engineering', label: 'القطاع الهندسي 🏗️' },
              { id: 'computing', label: 'الحاسبات والذكاء 💻' },
              { id: 'arts', label: 'الفنون والتصميم 🎨' },
              { id: 'literature', label: 'الأدبي والألسن 📚' },
              { id: 'other', label: stage === 'prep' ? 'مدارس STEM / تفوق 🚀' : 'مجال آخر 🎯' }
            ].map(c => {
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={`p-2.5 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#D15F70]/15 border-[#D15F70] text-[#2A2A2A] font-extrabold'
                      : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B] hover:bg-slate-100'
                  }`}
                >
                  <span>{c.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-[#D15F70]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-3 flex gap-2">
          <button type="submit" className="btn-primary flex-1 py-2.5 text-xs font-bold">
            حفظ إعدادات المرحلة والملف
          </button>
          {identity && (
            <button
              type="button"
              onClick={() => {
                setName(identity.name);
                setGender(identity.gender);
                setStage(identity.stage || 'secondary');
                setTrack(identity.track || 'scientific');
                setGrade(identity.grade || (identity.stage === 'prep' ? 'prep_3' : 'sec_3'));
                setCategory(identity.category || 'medicine');
                setIsEditing(false);
              }}
              className="btn-secondary px-4 text-xs cursor-pointer"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
