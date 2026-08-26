import React, { useState } from 'react';
import { User, Check, Settings2, GraduationCap } from 'lucide-react';
import { UserIdentity } from '../types';

interface UserPersonalizationWidgetProps {
  identity: UserIdentity | null;
  onSaveIdentity: (identity: UserIdentity) => void;
}

export const getTitleInfo = (identity?: UserIdentity | null) => {
  if (!identity) return { formalTitle: 'طالب', emoji: '🧑‍🎓', pronoun: 'أنت' };
  
  const isFemale = identity.gender === 'female';
  let title = isFemale ? 'دكتورة' : 'دكتور';
  let emoji = isFemale ? '👩‍⚕️' : '👨‍⚕️';
  
  if (identity.category === 'engineering') {
    title = isFemale ? 'بشمهندسة' : 'بشمهندس';
    emoji = isFemale ? '👩‍🔬' : '👨‍🔧';
  } else if (identity.category === 'computing') {
    title = isFemale ? 'مبرمجة' : 'مبرمج';
    emoji = '💻';
  } else if (identity.category === 'arts') {
    title = isFemale ? 'فنانة' : 'فنان';
    emoji = '🎨';
  } else if (identity.category === 'literature') {
    title = isFemale ? 'أستاذة' : 'أستاذ';
    emoji = '📚';
  } else if (identity.category === 'other') {
    title = isFemale ? 'أستاذة' : 'أستاذ';
    emoji = '🎯';
  }

  const name = identity.name.split(' ')[0] || '';
  
  return {
    formalTitle: name ? `${title} ${name}` : title,
    emoji,
    pronoun: isFemale ? 'أنتِ' : 'أنت',
  };
};

export const UserPersonalizationWidget: React.FC<UserPersonalizationWidgetProps> = ({
  identity,
  onSaveIdentity,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!identity);
  
  const [name, setName] = useState(identity?.name || '');
  const [gender, setGender] = useState<'male' | 'female'>(identity?.gender || 'male');
  const [category, setCategory] = useState<'medicine' | 'engineering' | 'computing' | 'arts' | 'literature' | 'other'>(identity?.category || 'medicine');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    let defaultCollege = 'كلية الطب البشري';
    if (category === 'engineering') defaultCollege = 'كلية الهندسة';
    if (category === 'computing') defaultCollege = 'كلية الحاسبات والمعلومات';
    if (category === 'arts') defaultCollege = 'كلية الفنون والتصميم';
    if (category === 'literature') defaultCollege = 'كلية الألسن والآداب';
    if (category === 'other') defaultCollege = 'الكلية الحلم';

    onSaveIdentity({
      name: name.trim(),
      gender,
      category,
      collegeName: identity?.collegeName || defaultCollege,
    });
    setIsEditing(false);
  };

  const info = getTitleInfo(identity);

  if (!isEditing && identity) {
    return (
      <div className="card-surface p-4 flex items-center justify-between gap-3 border border-[#E5E5E5]" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center shrink-0">
            <span className="text-xl">{info.emoji}</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#6B6B6B] mb-0.5">
              الملف الشخصي
            </div>
            <h3 className="text-sm font-bold text-[#2A2A2A] font-heading">
              {info.formalTitle}
            </h3>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 rounded-lg bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] transition-colors"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="card-surface p-5 space-y-4 border border-[#D15F70]/20" dir="rtl">
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
        <GraduationCap className="w-5 h-5 text-[#D15F70]" />
        <h3 className="text-sm font-bold text-[#2A2A2A] font-heading">
          بطاقة تعريف الطالب
        </h3>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] mb-1.5">
            <User className="w-3.5 h-3.5 text-[#D15F70]" /> الاسم:
          </label>
          <input
            type="text"
            required
            placeholder="اكتب اسمك الأول..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#6B6B6B] mb-1.5">
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
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                  gender === g.id
                    ? 'bg-[#D15F70]/10 border-[#D15F70] text-[#2A2A2A]'
                    : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#6B6B6B] mb-1.5">
            المجال / الشعبة المستهدفة:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'medicine', label: 'القطاع الطبي 🩺' },
              { id: 'engineering', label: 'القطاع الهندسي 🏗️' },
              { id: 'computing', label: 'الحاسبات والذكاء 💻' },
              { id: 'arts', label: 'الفنون والتطبيقي 🎨' },
              { id: 'literature', label: 'الأدبي والألسن 📚' },
              { id: 'other', label: 'مجال آخر 🎯' }
            ].map(c => {
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={`p-2 rounded-lg text-[11px] font-bold transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#D15F70]/10 border-[#D15F70] text-[#2A2A2A]'
                      : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B]'
                  }`}
                >
                  <span>{c.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-[#D15F70]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button type="submit" className="btn-primary flex-1 py-2 text-xs">
            حفظ البيانات
          </button>
          {identity && (
            <button
              type="button"
              onClick={() => {
                setName(identity.name);
                setGender(identity.gender);
                setCategory(identity.category || 'medicine');
                setIsEditing(false);
              }}
              className="btn-secondary px-4 text-xs"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
