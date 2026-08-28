import React, { useState } from 'react';
import { BookOpen, Copy, Check, Sparkles, Brain, Clock, ChevronRight, Award } from 'lucide-react';
import { STUDY_DUAS, StudyDuaItem } from '../data/adhkarData';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const StudyDuaWidget: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filterTiming, setFilterTiming] = useState<'all' | 'before' | 'during' | 'after' | 'exam'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDuas = filterTiming === 'all'
    ? STUDY_DUAS
    : STUDY_DUAS.filter((d) => d.timing === filterTiming);

  const handleCopy = (item: StudyDuaItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    toast('تم نسخ الدعاء المبارك بنجاح', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="card-surface p-5 sm:p-7 rounded-3xl border border-[#C9DEC9] space-y-5 bg-white/95 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F2E9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#426B4B] to-[#2E4A34] text-white flex items-center justify-center shadow-sm shadow-[#426B4B]/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#5B3C43] font-heading">
                أذكار وأدعية المذاكرة والامتحان 📚
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F2E9] text-[#426B4B] border border-[#C9DEC9]">
                طلب التوفيق والبركة
              </span>
            </div>
            <p className="text-xs text-[#7A5B64] font-medium pt-0.5">
              أدعية مأثورة لطلب الفهم وتيسير الصعب وتثبيت الحفظ قبل وبعد كل جلسة
            </p>
          </div>
        </div>

        {/* Quick Link to Schedule */}
        <button
          type="button"
          onClick={() => navigate('/schedule')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E8F2E9] hover:bg-[#C9DEC9]/70 text-[#426B4B] text-xs font-bold transition-all border border-[#C9DEC9] cursor-pointer self-start sm:self-center"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>بدء جلسة في الجدول</span>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'all', label: 'كافة الأدعية' },
          { key: 'before', label: 'قبل المذاكرة والفهم' },
          { key: 'during', label: 'تيسير الصعب والنسيان' },
          { key: 'after', label: 'ختام الجلسة واستيداع العلم' },
          { key: 'exam', label: 'يوم الامتحان' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTiming(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterTiming === tab.key
                ? 'bg-[#426B4B] text-white shadow-xs'
                : 'bg-[#F5F5F5] text-[#7A5B64] hover:bg-[#E8F2E9] hover:text-[#426B4B] border border-[#E5E5E5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Duas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDuas.map((dua) => {
          const isCopied = copiedId === dua.id;
          return (
            <div
              key={dua.id}
              className="p-4 sm:p-5 rounded-2xl border border-[#E5E5E5] bg-gradient-to-br from-white to-[#FAFDFB] hover:border-[#426B4B]/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group relative"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#426B4B]" />
                    <h4 className="text-xs sm:text-sm font-black text-[#5B3C43] font-heading">
                      {dua.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(dua)}
                    className="p-1.5 rounded-lg text-[#7A5B64] hover:text-[#5B3C43] hover:bg-[#F5F5F5] transition-colors"
                    title="نسخ الدعاء"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-[#426B4B]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-sm leading-relaxed font-arabic text-[#2A2A2A] text-justify bg-[#E8F2E9]/20 p-3 rounded-xl border border-[#C9DEC9]/40" dir="rtl">
                  {dua.text}
                </p>
              </div>

              {/* Bottom metadata */}
              <div className="flex items-center justify-between text-[11px] text-[#7A5B64] pt-2 border-t border-[#E8F2E9]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="line-clamp-1">{dua.fadl}</span>
                </div>
                {dua.source && (
                  <span className="font-bold text-[#426B4B] shrink-0 bg-[#E8F2E9] px-2 py-0.5 rounded-md">
                    {dua.source}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
