import React from 'react';
import { Target, TrendingUp, Sparkles, BookOpen, Clock, BarChart3 } from 'lucide-react';
import { StudySession, StudentGoal } from '../types';

interface AnalyzeMeWidgetProps {
  sessions: StudySession[];
  goal: StudentGoal | null;
}

export const AnalyzeMeWidget: React.FC<AnalyzeMeWidgetProps> = ({ sessions = [], goal }) => {
  const completed = sessions.filter(s => s.completed);
  const totalMinutes = completed.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const subjectCounts = completed.reduce((acc, curr) => {
    acc[curr.subject] = (acc[curr.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSubjects = Object.entries(subjectCounts).sort((a, b) => (b[1] as number) - (a[1] as number));
  const maxSubjectCount = sortedSubjects.length > 0 ? (sortedSubjects[0][1] as number) : 1;

  const progressPercentage = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;

  return (
    <div className="card-surface p-6 space-y-6 border border-[#E5E5E5]" dir="rtl">
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-4">
        <div className="w-8 h-8 rounded-xl bg-[#D15F70]/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-[#D15F70]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#2A2A2A] font-heading">
            تحليل مستوى الأداء والإنجاز
          </h3>
          <p className="text-[11px] text-[#6B6B6B]">مؤشرات الأداء لجلسات المذاكرة الحالية</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-[#F5F5F5]">
            <div className="h-full bg-[#D15F70] transition-all duration-1000" style={{ width: '100%' }} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-bold">
              <Clock className="w-4 h-4 text-[#D15F70]" /> إجمالي التركيز
            </div>
          </div>
          <div className="text-2xl font-black text-[#2A2A2A]">{totalMinutes} <span className="text-sm font-bold text-[#6B6B6B]">دقيقة</span></div>
        </div>
        
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-[#F5F5F5]">
            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-bold">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> جلسات الإنجاز
            </div>
            <span className="text-emerald-500 text-xs font-bold">{progressPercentage}%</span>
          </div>
          <div className="text-2xl font-black text-[#2A2A2A]">{completed.length} <span className="text-sm font-bold text-[#6B6B6B]">/ {sessions.length}</span></div>
        </div>
      </div>

      {sortedSubjects.length > 0 ? (
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-[#6B6B6B] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#6B6B6B]" /> 
            توزيع الجهد حسب المواد (مخطط الأداء):
          </h4>
          <div className="space-y-3">
            {sortedSubjects.map(([subject, count], idx) => {
              const width = Math.max(5, ((count as number) / maxSubjectCount) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#2A2A2A]">{subject}</span>
                    <span className="text-[#6B6B6B]">{count} جلسة</span>
                  </div>
                  <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-[#E5E5E5]">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        idx === 0 ? 'bg-[#D15F70]' : idx === 1 ? 'bg-emerald-500' : 'bg-[#D15F70]'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-[#6B6B6B] border border-dashed border-[#E5E5E5] rounded-xl">
          أكمل بعض جلسات المذاكرة لترى مخطط الأداء هنا.
        </div>
      )}
      
      {goal && (
        <div className="mt-4 p-4 bg-[#D15F70]/5 border border-[#D15F70]/20 rounded-xl text-xs font-bold text-[#6B6B6B] flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D15F70]/10 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-[#D15F70]" />
          </div>
          <p className="mt-1 leading-relaxed">
            تذكر دائمًا: كل دقيقة تركيز وكل جلسة دراسية تقربك خطوة حقيقية من حلمك في <span className="text-[#D15F70]">{goal.targetTitle}</span>. استمر يا بطل!
          </p>
        </div>
      )}
    </div>
  );
};
