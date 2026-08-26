import React, { useState } from 'react';
import { PageContainer } from '../components/PageContainer';
import { useStudyPlan } from '../context/StudyPlanContext';
import { ResultsView } from '../components/ResultsView';
import { AnalyzeMeWidget } from '../components/AnalyzeMeWidget';
import { Compass, Sparkles } from 'lucide-react';
import { PeakTime, PlanPreference, DiagnosisResult, StudentGoal, StudySession, UserIdentity } from '../types';
import { generateLocalDiagnosis } from '../utils/localEngine';

interface StudySchedulePageProps {
  currentResult: DiagnosisResult | null;
  setCurrentResult: (res: DiagnosisResult | null) => void;
  goal: StudentGoal | null;
  userIdentity: UserIdentity | null;
  onSessionCompleted: (session: StudySession) => void;
}

export const StudySchedulePage: React.FC<StudySchedulePageProps> = ({ currentResult, setCurrentResult, goal, userIdentity, onSessionCompleted }) => {
  const { peakTime, setPeakTime, planPreference, setPlanPreference, additionalNotes, setAdditionalNotes, generateInputPayload } = useStudyPlan();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const input = generateInputPayload();
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data: DiagnosisResult = await response.json();
      setCurrentResult(data);
    } catch (err) {
      console.warn('Backend call failed, utilizing fallback:', err);
      setCurrentResult(generateLocalDiagnosis(input));
    } finally {
      setIsLoading(false);
    }
  };

  if (currentResult) {
    return (
      <PageContainer title="جدول الجلسات">
        <div className="space-y-6">
          <AnalyzeMeWidget sessions={currentResult.studyPlan} goal={goal} />
          <ResultsView
            result={currentResult}
            goal={goal}
            userIdentity={userIdentity}
            onReevaluate={() => setCurrentResult(null)}
            onSavePlan={() => {}}
            onSessionCompleted={onSessionCompleted}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="تفضيلات التنفيذ والجدول">
      <div className="card-surface p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2A2A2A] font-heading mt-1">تفضيلات التنفيذ</h2>
          </div>
          <Compass className="w-6 h-6 text-[#6B6B6B]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#6B6B6B]">أعلى أوقات التركيز:</label>
            <div className="flex flex-col gap-2">
              {[
                { key: 'morning', label: '🌅 الصباح (فجر - ظهر)' },
                { key: 'evening', label: '🌇 المساء (عصر - عشاء)' },
                { key: 'night', label: '🌙 الليل (سهر)' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPeakTime(item.key as PeakTime)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-colors text-right ${
                    peakTime === item.key
                      ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#2A2A2A]'
                      : 'border-[#E5E5E5] bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#6B6B6B]">مرونة الجلسات:</label>
            <div className="flex flex-col gap-2">
              {[
                { key: 'flexible', label: '🌿 مرنة (45 - 90 دقيقة حسب الدرس)' },
                { key: 'strict', label: '📌 بومودورو ثابتة (25 - 50 دقيقة)' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPlanPreference(item.key as PlanPreference)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-colors text-right ${
                    planPreference === item.key
                      ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#2A2A2A]'
                      : 'border-[#E5E5E5] bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-[#E5E5E5]">
          <label className="block text-sm font-bold text-[#6B6B6B]">ملاحظات إضافية (اختياري):</label>
          <textarea
            rows={2}
            placeholder="مثال: عندي دروس أونلاين مسائية، لا تضع جلسات وقت العصر..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-sm text-[#2A2A2A] focus:border-[#D15F70] outline-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E5E5E5]">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="btn-primary px-8 py-3.5 flex items-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                <span>جاري التوليد...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد الجدول</span>
              </>
            )}
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
