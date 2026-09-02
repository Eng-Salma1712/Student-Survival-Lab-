import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Brain, Clock, Zap } from 'lucide-react';
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
  const { 
    isExhausted, setIsExhausted, 
    availableHours, setAvailableHours, 
    upcomingExam, setUpcomingExam, 
    examSubject, setExamSubject,
    dailyCommitments, setDailyCommitments,
    planIntensity, setPlanIntensity
  } = useStudyPlan();
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

          {upcomingExam !== 'none' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1.5">
                ما هي مادة الامتحان القريب؟
              </label>
              <input
                type="text"
                value={examSubject || ''}
                onChange={(e) => setExamSubject(e.target.value)}
                placeholder="مثال: فيزياء، كيمياء، أحياء، تاريخ..."
                className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#2A2A2A] focus:border-[#D15F70] outline-none"
              />
            </div>
          )}
        </div>

        {/* 4. مواعيدك الثابتة والروتين اليومي */}
        <div className="space-y-3 pt-5 border-t border-[#E5E5E5]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A2A2A] font-heading">
                4. مواعيدك الثابتة والروتين اليومي
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                أوقات النوم، الوجبات، الدروس، أو أي التزامات ثابتة ليتجنب المحرك التكيفي وضع جلسات مذاكرة فيها
              </p>
            </div>
          </div>
          <textarea
            value={dailyCommitments}
            onChange={(e) => setDailyCommitments(e.target.value)}
            placeholder="مثال:&#10;• أنام من ١٢ بالليل وأصحى ٧ الصبح.&#10;• وجبات: فطار ٨:٠٠، غداء ٣:٠٠، عشاء ٩:٠٠.&#10;• درس فيزياء من ٤:٠٠ لـ ٦:٠٠ مساءً."
            className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#2A2A2A] focus:border-[#D15F70] outline-none min-h-[105px] resize-y leading-relaxed font-sans"
            dir="rtl"
          />
        </div>

        {/* 5. أسلوب الخطة المفضل في المحرك التكيفي */}
        <div className="space-y-3 pt-5 border-t border-[#E5E5E5]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A2A2A] font-heading">
                5. أسلوب خطتك المفضل في المحرك التكيفي
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                اختر أسلوب وكثافة الجلسات الدراسية الأنسب ليومك
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'balanced', label: 'متوازن ⚖️', desc: 'جلسات 45 دقيقة مع استراحات مريحة' },
              { id: 'deep', label: 'مكثف 🚀', desc: 'جلسات 60 دقيقة وتركيز عميق' },
              { id: 'rescue', label: 'إنقاذ ⚡', desc: 'تركيز على 20% الأكثر أهمية (قاعدة باريتو)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlanIntensity(item.id as 'balanced' | 'deep' | 'rescue')}
                className={`p-3.5 rounded-xl text-right border transition-all cursor-pointer ${
                  planIntensity === item.id
                    ? 'border-[#D15F70] bg-[#D15F70]/15 text-[#2A2A2A] ring-1 ring-[#D15F70]'
                    : 'border-[#E5E5E5] bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                }`}
              >
                <div className="text-xs font-bold mb-1 text-[#2A2A2A]">{item.label}</div>
                <div className="text-[11px] opacity-75 leading-relaxed">{item.desc}</div>
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
