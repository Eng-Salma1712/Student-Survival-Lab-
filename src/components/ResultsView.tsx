import React, { useState, useEffect } from 'react';
import { DiagnosisResult, StudySession, StudentGoal, UserIdentity } from '../types';
import { getTitleInfo } from './UserPersonalizationWidget';
import { SessionTimerModal } from './SessionTimerModal';
import { GoalCompletionModal } from './GoalCompletionModal';
import { SkippedWarningBanner } from './SkippedWarningBanner';
import { TimetableScheduleView } from './TimetableScheduleView';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Brain,
  Target,
  Clock,
  Zap,
  Lightbulb,
  HeartHandshake,
  CheckCircle2,
  Circle,
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Calendar,
  ChevronRight,
  Bell,
  BellRing
} from 'lucide-react';

interface ResultsViewProps {
  result: DiagnosisResult;
  goal?: StudentGoal | null;
  userIdentity?: UserIdentity | null;
  onReevaluate: () => void;
  onSavePlan: (plan: DiagnosisResult) => void;
  onSessionCompleted?: (session: StudySession) => void;
}

// Reusable Session Card Component
const SessionCard: React.FC<{
  session: StudySession;
  index: number;
  onToggle: (id: string) => void;
  onStartTimer: (session: StudySession) => void;
}> = ({ session, index, onToggle, onStartTimer }) => {
  const { toast } = useToast();
  const [isReminderSet, setIsReminderSet] = useState(false);

  const handleSetReminder = () => {
    if (isReminderSet) {
      setIsReminderSet(false);
      toast(`تم إلغاء التنبيه لجلسة: ${session.title}`, 'info');
      return;
    }
    
    setIsReminderSet(true);
    toast(`تم ضبط التنبيه بنجاح! سنقوم بتذكيرك بعد 5 ثوانٍ (للتجربة).`, 'success');
    
    // Simulate setting a reminder that fires in 5 seconds for preview purposes
    setTimeout(() => {
      setIsReminderSet(false);
      toast(`⏰ حان الآن وقت جلسة: ${session.title}! ابدأ الآن.`, 'info');
    }, 5000);
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        session.completed
          ? 'bg-[#F5F5F5]0 border-[#E5E5E5] opacity-60'
          : 'card-surface border-[#E5E5E5] hover:border-[#D15F70]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(session.id)}
            className="mt-0.5 text-[#6B6B6B] hover:text-[#D15F70] transition-colors cursor-pointer shrink-0"
          >
            {session.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="space-y-1.5">
            <p className={`font-bold text-sm text-[#2A2A2A] ${session.completed ? 'line-through text-[#6B6B6B]' : ''}`}>
              {index + 1}. {session.title}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#6B6B6B]">
              <span className="px-2 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                ⏱️ {session.durationMinutes} دقيقة
              </span>
              <span className="px-2 py-0.5 rounded bg-[#D15F70]/10 text-[#D15F70] border border-[#D15F70]/20">
                📚 {session.subject}
              </span>
              {session.chapter && (
                <span className="px-2 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  {session.chapter} {session.lesson ? `- ${session.lesson}` : ''}
                </span>
              )}
              {session.activityType && (
                <span className="px-2 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5]">
                  {session.activityType === 'study' ? '📖 شرح' : session.activityType === 'practice' ? '📝 تدريبات' : '🔄 مراجعة'}
                </span>
              )}
            </div>
            
            <p className="text-xs text-[#D15F70] font-bold pt-1">
              • {session.focusType}
            </p>

            {session.notes && (
              <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                💡 {session.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleSetReminder}
            disabled={session.completed}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isReminderSet
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B]'
            } ${session.completed ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="تذكير بالجلسة"
          >
            {isReminderSet ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => onStartTimer(session)}
            disabled={session.completed}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              session.completed 
                ? 'bg-[#F5F5F5] text-[#6B6B6B] cursor-not-allowed opacity-50' 
                : 'bg-[#D15F70] text-[#FFFFFF] hover:bg-[#F59E0B]'
            }`}
            title="بدء المؤقت"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  goal = null,
  userIdentity = null,
  onReevaluate,
  onSavePlan,
  onSessionCompleted,
}) => {
  const [sessions, setSessions] = useState<StudySession[]>(result.studyPlan || []);
  const [activeTimerSession, setActiveTimerSession] = useState<StudySession | null>(null);
  const [completedGoalSession, setCompletedGoalSession] = useState<StudySession | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'timetable'>('timetable');

  const titleInfo = getTitleInfo(userIdentity);

  const toggleSessionCompletion = (sessionId: string) => {
    let newlyCompletedSession: StudySession | null = null;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            newlyCompletedSession = { ...s, completed: true };
          }
          return { ...s, completed: nextCompleted };
        }
        return s;
      })
    );

    if (newlyCompletedSession) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#D4AF6A', '#F59E0B', '#10B981'],
        disableForReducedMotion: true,
      });
      setCompletedGoalSession(newlyCompletedSession);
      if (onSessionCompleted) {
        onSessionCompleted(newlyCompletedSession);
      }
    }
  };

  const completedCount = sessions.filter((s) => s.completed).length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.durationMinutes + s.breakMinutes, 0);

  const handleCopyMarkdown = () => {
    const text = `...`; // omitted for brevity
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    onSavePlan({ ...result, studyPlan: sessions });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Helper to chunk diagnosis into scannable lines
  const diagnosisLines = result.diagnosis
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  return (
    <div className="w-full space-y-6 pb-20 font-sans dir-rtl" dir="rtl">
      
      {/* Top Header Toolbar */}
      <div className="card-surface p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#D15F70]/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F5F5F5] text-[#6B6B6B] text-[10px] font-bold mb-2">
            <Sparkles className="w-3 h-3 text-[#D15F70]" />
            <span>خطة ذكية مخصصة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2A2A2A] font-heading">
            {titleInfo.emoji} خطة {titleInfo.formalTitle}: {result.scenario}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button onClick={handleCopyMarkdown} className="btn-secondary px-3 py-2 text-xs flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>نسخ الخطة</span>
          </button>
          <button onClick={handleSave} className="btn-primary px-3 py-2 text-xs flex items-center gap-2">
            {saved ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span>حفظ الخطة</span>
          </button>
          <button onClick={onReevaluate} className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 border-rose-500/20 text-rose-400 hover:bg-rose-500/10">
            <RotateCcw className="w-4 h-4" />
            <span>تعديل التقييم</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Diagnosis & Priorities */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Goal */}
          <div className="card-surface border border-[#D15F70]/30 p-5 bg-gradient-to-br from-[#F5F5F5] to-[#D15F70]/10">
            <div className="flex items-center gap-2 text-[#D15F70] text-xs font-bold mb-2">
              <Target className="w-4 h-4" />
              <span>الهدف الذهبي لليوم</span>
            </div>
            <p className="text-lg font-black text-[#2A2A2A] font-heading leading-tight">
              {result.todaysGoal}
            </p>
          </div>

          {/* Scannable Diagnosis */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2A2A2A] text-sm font-bold border-b border-[#E5E5E5] pb-2">
              <Brain className="w-4 h-4 text-[#D15F70]" />
              <span>تحليل الحالة والتوجيهات</span>
            </div>
            <div className="space-y-3">
              {diagnosisLines.slice(0, 4).map((line, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <ChevronRight className="w-4 h-4 text-[#D15F70] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{line.replace(/^[-*•]\s*/, '')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Priorities */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2A2A2A] text-sm font-bold border-b border-[#E5E5E5] pb-2">
              <Zap className="w-4 h-4 text-[#D15F70]" />
              <span>الأولويات القصوى</span>
            </div>
            <ul className="space-y-2">
              {result.priorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#F5F5F5] p-2.5 rounded-lg border border-[#E5E5E5] text-xs text-[#6B6B6B]">
                  <span className="text-[#D15F70] font-bold shrink-0">#{idx + 1}</span>
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Encouraging Quote */}
          <div className="card-surface p-5 border-r-2 border-[#D15F70]">
            <blockquote className="text-sm text-[#2A2A2A] font-bold italic leading-relaxed">
              "{result.motivationalMessage}"
            </blockquote>
          </div>
        </div>

        {/* Right Column: Study Plan Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface p-6">
            <div className="flex flex-col sm:flex-row justify-between border-b border-[#E5E5E5] pb-4 mb-4 gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D15F70]" />
                <h2 className="text-lg font-black text-[#2A2A2A] font-heading">
                  جدول الجلسات الموصى بها
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white rounded-lg p-1 border border-[#E5E5E5]">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'list' ? 'bg-[#E5E5E5] text-[#2A2A2A]' : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
                    }`}
                  >
                    قائمة
                  </button>
                  <button
                    onClick={() => setViewMode('timetable')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'timetable' ? 'bg-[#E5E5E5] text-[#2A2A2A]' : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
                    }`}
                  >
                    شبكة
                  </button>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {completedCount}/{sessions.length} مكتمل
                </span>
              </div>
            </div>

            <SkippedWarningBanner
              uncompletedCount={sessions.length - completedCount}
              totalCount={sessions.length}
              goal={goal}
              onFocusNext={() => {
                const firstUncompleted = sessions.find((s) => !s.completed);
                if (firstUncompleted) setActiveTimerSession(firstUncompleted);
              }}
              onStartMicroChallenge={() => {
                const firstUncompleted = sessions.find((s) => !s.completed);
                if (firstUncompleted) {
                  setActiveTimerSession({
                    ...firstUncompleted,
                    durationMinutes: 10,
                    title: `⚡ تحدي الـ 10 دقائق: ${firstUncompleted.subject}`,
                  });
                }
              }}
            />

            <div className="mt-4">
              {viewMode === 'list' ? (
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      index={index} 
                      onToggle={toggleSessionCompletion} 
                      onStartTimer={setActiveTimerSession} 
                    />
                  ))}
                </div>
              ) : (
                <TimetableScheduleView
                  sessions={sessions}
                  onToggleSession={toggleSessionCompletion}
                  goal={goal}
                />
              )}
            </div>
          </div>
        </div>

      </div>

      {activeTimerSession && (
        <SessionTimerModal
          session={activeTimerSession}
          onClose={() => setActiveTimerSession(null)}
          onToggleComplete={toggleSessionCompletion}
        />
      )}

      {completedGoalSession && (
        <GoalCompletionModal
          goal={goal}
          session={completedGoalSession}
          onClose={() => setCompletedGoalSession(null)}
          completedCount={sessions.filter((s) => s.completed).length}
          totalCount={sessions.length}
        />
      )}
    </div>
  );
};
