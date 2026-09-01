import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Brain } from 'lucide-react';
import { ExhaustionLevel, ExamTimeline, UserIdentity, DiagnosisResult, StudySession } from '../types';
import { SpiritualHabitsWidget } from '../components/SpiritualHabitsWidget';
import { DailyMotivationWidget } from '../components/DailyMotivationWidget';
import { AnalyzeMeWidget } from '../components/AnalyzeMeWidget';

interface DailyAssessmentPageProps {
  userIdentity: UserIdentity | null;
  history: DiagnosisResult[];
  currentResult: DiagnosisResult | null;
}

export const DailyAssessmentPage: React.FC<DailyAssessmentPageProps> = ({ userIdentity, history, currentResult }) => {
  const { isExhausted, setIsExhausted, availableHours, setAvailableHours, upcomingExam, setUpcomingExam, examSubject, setExamSubject } = useStudyPlan();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/subjects');
  };

  const allSessions = useMemo(() => {
    let sessions: StudySession[] = [];
    if (currentResult && currentResult.studyPlan) {
      sessions = [...currentResult.studyPlan];
    } else if (history.length > 0) {
      // Pull sessions from the most recent history item if no active result
      sessions = history[0].studyPlan || [];
    }
    return sessions;
  }, [currentResult, history]);

  return (
    <PageContainer title="التقييم اليومي">
      <div className="space-y-6">
        <div className="card-surface p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#2A2A2A] font-heading mt-1">التقييم المبدئي للحالة</h2>
            </div>
            <Brain className="w-6 h-6 text-[#6B6B6B]" />
          </div>

          <div className="space-y-3">
          <label className="block text-sm font-bold text-[#6B6B6B]">
            1. ما هو مستوى طاقتك وتركيزك اليوم؟ <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'yes', label: 'تعبان ومجهد 😓', desc: 'خطة مريحة' },
              { key: 'medium', label: 'تعب خفيف 😐', desc: 'خطة متوازنة' },
              { key: 'no', label: 'طاقة ممتازة 🚀', desc: 'إنجاز مكثف' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setIsExhausted(item.key as ExhaustionLevel)}
                className={`p-4 rounded-xl border text-right transition-all cursor-pointer ${
                  isExhausted === item.key
                    ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#2A2A2A]'
                    : 'border-[#E5E5E5] bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                }`}
              >
                <div className="font-bold text-sm mb-1">{item.label}</div>
                <div className="text-[11px] opacity-70">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#6B6B6B]">
            2. كم عدد الساعات المتاحة للمذاكرة؟ <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5, 6, 8].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setAvailableHours(hours)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  availableHours === hours
                    ? 'border-[#D15F70] bg-[#D15F70] text-[#FFFFFF]'
                    : 'border-[#E5E5E5] bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                }`}
              >
                {hours} ساعات
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#6B6B6B]">
            3. هل لديك امتحان قريب؟
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'tomorrow', label: 'غداً 🚨' },
              { key: 'few_days', label: 'خلال أيام ⏳' },
              { key: 'next_week', label: 'الأسبوع القادم 📅' },
              { key: 'none', label: 'لا يوجد 🌿' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setUpcomingExam(item.key as ExamTimeline)}
                className={`p-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                  upcomingExam === item.key
                    ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#2A2A2A]'
                    : 'border-[#E5E5E5] bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E5E5E5]">
          <button onClick={handleNext} className="btn-primary px-8 py-3">
            التالي: المواد والدروس
          </button>
        </div>
      </div>

        <DailyMotivationWidget userIdentity={userIdentity} />
        
        {allSessions.length > 0 && (
          <AnalyzeMeWidget sessions={allSessions} goal={null} />
        )}
        
        <SpiritualHabitsWidget />
      </div>
    </PageContainer>
  );
};
