import React from 'react';
import { DiagnosisResult } from '../types';
import { History, Calendar, Trash2, Clock, ArrowLeft, Sparkles } from 'lucide-react';

interface HistoryViewProps {
  history: DiagnosisResult[];
  onSelectPlan: (plan: DiagnosisResult) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectPlan,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto py-20 text-center space-y-4 font-sans dir-rtl animate-in fade-in duration-300" dir="rtl">
        <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800 rounded-3xl flex items-center justify-center mx-auto text-pink-600 dark:text-pink-300 shadow-xs">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-[#2A2A2A] font-heading">لا توجد خطط محفوظة بعد 📂</h2>
        <p className="text-slate-700 dark:text-[#6B6B6B] text-xs sm:text-sm font-bold leading-relaxed max-w-md mx-auto">
          قم بتشخيص حالتك من الصفحة الرئيسية وانقر على "حفظ الخطة" للرجوع إليها ومتابعتها في أي وقت.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 font-sans dir-rtl animate-in fade-in duration-300" dir="rtl">
      <div className="bg-white bg-white border border-pink-200/80 dark:border-[#E5E5E5] rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4 transition-colors duration-300">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-pink-700 dark:text-pink-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>سجل الخطط والتشخيصات 📈</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#2A2A2A] font-heading">
            الخطط الدراسية المحفوظة ({history.length})
          </h1>
        </div>
        <button
          onClick={onClearHistory}
          className="px-4 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-rose-200 dark:border-rose-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>مسح الكل 🗑️</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white bg-white border border-pink-200/80 dark:border-[#E5E5E5] rounded-2xl p-5 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200 hover:scale-[1.01] space-y-3 shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="font-extrabold px-2.5 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950 text-pink-900 dark:text-pink-200 border border-pink-300 dark:border-pink-800">
                  🎯 {item.scenario}
                </span>
                <span className="text-slate-600 dark:text-[#6B6B6B] flex items-center gap-1 text-[11px] font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.timestamp).toLocaleDateString('ar-EG')}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-[#2A2A2A] font-heading line-clamp-1">{item.todaysGoal}</h3>
              <p className="text-xs text-slate-700 dark:text-[#6B6B6B] font-medium line-clamp-2 leading-relaxed">{item.diagnosis}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#E5E5E5] flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-slate-700 dark:text-[#6B6B6B] font-bold">
                <Clock className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" /> {item.studyPlan.length} جلسات دراسية ⏳
              </span>

              <button
                onClick={() => onSelectPlan(item)}
                className="px-3 py-1.5 pink-purple-gradient text-[#2A2A2A] font-extrabold rounded-xl flex items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <span>عرض الخطة 💪</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

