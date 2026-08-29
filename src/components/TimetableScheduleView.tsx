import React, { useState, useMemo } from 'react';
import { StudySession, StudentGoal } from '../types';
import { useToast } from '../context/ToastContext';
import { SessionTimerModal } from './SessionTimerModal';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Play, 
  Bell, 
  BellRing, 
  Coffee, 
  Sparkles, 
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Timer,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTimeTo12HourArabic, toArabicDigits } from '../utils/timeFormat';
import { calculateTimedSessions, TimedSession } from '../utils/scheduleCalculator';

interface TimetableScheduleViewProps {
  sessions: StudySession[];
  onToggleSession: (id: string) => void;
  goal?: StudentGoal | null;
  defaultStartTime?: string;
}

export const TimetableScheduleView: React.FC<TimetableScheduleViewProps> = ({
  sessions,
  onToggleSession,
  goal,
  defaultStartTime = '10:00'
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [activeTimerSession, setActiveTimerSession] = useState<StudySession | null>(null);
  const [reminderIds, setReminderIds] = useState<Record<string, boolean>>({});

  // Schedule start time (defaults to 10:00 AM as requested)
  const [scheduleStartTime, setScheduleStartTime] = useState<string>(() => {
    try {
      return localStorage.getItem('thanaweya_schedule_start_time') || defaultStartTime;
    } catch {
      return defaultStartTime;
    }
  });

  const handleStartTimeChange = (newTime: string) => {
    setScheduleStartTime(newTime);
    try {
      localStorage.setItem('thanaweya_schedule_start_time', newTime);
    } catch {}
    toast(`تم ضبط موعد بدء الجدول عند ${formatTimeTo12HourArabic(newTime)} ⏰`, 'info');
  };

  // Calculate start/end times sequentially across the entire day:
  // Each session start time accounts for cumulative duration + ALL previous breaks!
  const timedSessions: TimedSession[] = useMemo(() => {
    return calculateTimedSessions(sessions, scheduleStartTime);
  }, [sessions, scheduleStartTime]);

  const completedCount = sessions.filter(s => s.completed).length;

  const totalStudyMinutes = timedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalBreakMinutes = timedSessions.slice(0, -1).reduce((sum, s) => sum + s.breakDuration, 0);
  const scheduleStartTimeFormatted = timedSessions[0]?.startTimeFormatted || formatTimeTo12HourArabic(scheduleStartTime);
  const scheduleEndTimeFormatted = timedSessions[timedSessions.length - 1]?.endTimeFormatted || '';

  const handleReminderToggle = (id: string, title: string) => {
    const isSet = !!reminderIds[id];
    setReminderIds(prev => ({ ...prev, [id]: !isSet }));
    if (!isSet) {
      toast(`تم ضبط التنبيه لجلسة "${title}" بنجاح 🔔`, 'success');
      setTimeout(() => {
        toast(`⏰ حان الآن وقت جلسة: ${title}! استعد للانطلاق.`, 'info');
      }, 6000);
    } else {
      toast(`تم إلغاء التنبيه.`, 'info');
    }
  };

  return (
    <div className="space-y-6 dir-rtl font-sans" dir="rtl">
      
      {/* Daily / Weekly Navigation Header with Start Time Selector */}
      <div className="card-surface p-4 space-y-3 bg-gradient-to-r from-[#E8F2E9] via-white to-[#FBE8EE] border border-[#C9DEC9]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#426B4B] text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#5B3C43] font-heading">
                جدول الحصص والزمن الدراسي (نظام ١٢ ساعة)
              </h3>
              <p className="text-[11px] text-[#7A5B64] font-medium">
                مخطط زمني دقيق يدمج فترات الاستراحة آلياً في موعد كل جلسة تالية
              </p>
            </div>
          </div>

          {/* Tab Switcher: Today, Tomorrow, This Week */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#C9DEC9] shadow-2xs">
            {[
              { id: 'today', label: 'اليوم' },
              { id: 'tomorrow', label: 'غداً' },
              { id: 'week', label: 'هذا الأسبوع' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#426B4B] text-white shadow-xs'
                    : 'text-[#7A5B64] hover:bg-[#E8F2E9]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Time Selector & Cumulative Stats Bar */}
        <div className="pt-3 border-t border-[#C9DEC9]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#5B3C43] font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#426B4B]" />
              موعد بدء الجدول:
            </span>
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-[#C9DEC9]">
              {[
                { time: '10:00', label: '١٠:٠٠ ص' },
                { time: '09:00', label: '٠٩:٠٠ ص' },
                { time: '08:00', label: '٠٨:٠٠ ص' },
                { time: '13:00', label: '٠١:٠٠ م' },
                { time: '16:00', label: '٠٤:٠٠ م' },
              ].map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleStartTimeChange(slot.time)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scheduleStartTime === slot.time
                      ? 'bg-[#426B4B] text-white'
                      : 'text-[#7A5B64] hover:bg-[#E8F2E9]'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#5B3C43]">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#C9DEC9] text-[#426B4B]">
              ⏱️ المدى: {scheduleStartTimeFormatted} ← {scheduleEndTimeFormatted}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#C9DEC9] text-[#9E4D68]">
              ☕ الاستراحات: {toArabicDigits(totalBreakMinutes)} دقيقة مضافة
            </span>
          </div>
        </div>
      </div>

      {/* Active Session Highlight Banner (if any current session exists) */}
      {timedSessions.some(s => s.computedStatus === 'current') && (
        <div className="card-surface p-5 bg-gradient-to-r from-[#426B4B] to-[#34533a] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wide animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                NOW STUDYING • الجلسة الحالية الآن
              </div>
              {(() => {
                const current = timedSessions.find(s => s.computedStatus === 'current');
                if (!current) return null;
                return (
                  <>
                    <h4 className="text-lg font-black font-heading">
                      {current.subject} — {current.title}
                    </h4>
                    <p className="text-xs text-emerald-100 font-medium">
                      🕐 {current.startTimeFormatted} – {current.endTimeFormatted} ({toArabicDigits(current.durationMinutes)} دقيقة) • {current.focusType}
                    </p>
                  </>
                );
              })()}
            </div>

            {(() => {
              const current = timedSessions.find(s => s.computedStatus === 'current');
              if (!current) return null;
              return (
                <button
                  onClick={() => setActiveTimerSession(current)}
                  className="px-5 py-2.5 rounded-xl bg-white text-[#426B4B] font-bold text-xs hover:bg-emerald-50 transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>فتح مؤقت الجلسة النشطة</span>
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Timetable Grid / List Structure */}
      <div className="space-y-4">
        {timedSessions.map((session, index) => {
          const isCompleted = session.computedStatus === 'completed';
          const isCurrent = session.computedStatus === 'current';
          const isUpcoming = session.computedStatus === 'upcoming';
          const isReminder = !!reminderIds[session.id];
          const nextSession = timedSessions[index + 1];

          return (
            <React.Fragment key={session.id}>
              {/* Session Timetable Cell Card */}
              <div
                onClick={() => setActiveTimerSession(session)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative group ${
                  isCurrent
                    ? 'bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/50 border-[#426B4B] shadow-md ring-2 ring-[#426B4B]/20'
                    : isCompleted
                    ? 'bg-[#F9FBF9] border-[#C9DEC9] opacity-75'
                    : 'bg-white border-[#C9DEC9]/80 hover:border-[#426B4B]/60 shadow-2xs hover:shadow-md'
                }`}
              >
                {/* Status Indicator Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {isCurrent && (
                    <span className="px-2.5 py-1 rounded-full bg-[#426B4B] text-white text-[10px] font-bold shadow-xs flex items-center gap-1 animate-bounce">
                      <Sparkles className="w-3 h-3" /> جلسة حالية
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> مكتملة
                    </span>
                  )}
                  {isUpcoming && (
                    <span className="px-2.5 py-1 rounded-full bg-[#FBE8EE] text-[#9E4D68] text-[10px] font-bold">
                      قادمة
                    </span>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Left: Time block & Subject */}
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSession(session.id);
                      }}
                      className="mt-1 text-[#7A5B64] hover:text-[#426B4B] transition-colors cursor-pointer shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-[#426B4B]" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#C9DEC9] group-hover:text-[#426B4B]" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#426B4B]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tracking-wide text-sm font-black">
                          {session.startTimeFormatted} – {session.endTimeFormatted}
                        </span>
                        <span className="text-[#7A5B64] font-semibold bg-[#E8F2E9] px-2 py-0.5 rounded-md text-[11px]">
                          {toArabicDigits(session.durationMinutes)} دقيقة تركيز
                        </span>
                      </div>

                      <h4 className={`text-base sm:text-lg font-black font-heading ${isCompleted ? 'line-through text-[#7A5B64]' : 'text-[#5B3C43]'}`}>
                        {session.subject} — {session.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#E8F2E9] text-[#426B4B] font-bold border border-[#C9DEC9]">
                          📚 {session.subject}
                        </span>
                        {session.chapter && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#FBE8EE]/60 text-[#7A5B64] font-medium border border-[#F4C7D5]">
                            {session.chapter} {session.lesson ? `- ${session.lesson}` : ''}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#F5F5F5] text-[#5B3C43] font-medium border border-[#E5E5E5]">
                          {session.activityType === 'study' ? '📖 شرح ومذاكرة' : session.activityType === 'practice' ? '📝 تدريبات وحل' : '🔄 مراجعة شاملة'}
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-xs text-[#7A5B64] pt-1 leading-relaxed">
                          💡 {session.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#C9DEC9]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReminderToggle(session.id, session.title);
                      }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                        isReminder
                          ? 'bg-[#E8F2E9] border-[#426B4B] text-[#426B4B]'
                          : 'bg-white border-[#C9DEC9] text-[#7A5B64] hover:bg-[#E8F2E9]/50'
                      }`}
                      title="تذكير الموعد"
                    >
                      {isReminder ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTimerSession(session);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#426B4B] text-white font-bold text-xs hover:bg-[#34533a] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrent ? 'ابدأ الآن' : 'التفاصيل والمؤقت'}</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Break Cell (if not the last session and break duration > 0) */}
              {index < timedSessions.length - 1 && session.breakDuration > 0 && nextSession && (
                <div className="flex flex-col items-center justify-center my-3 relative">
                  <div className="w-0.5 h-3 bg-[#F4C7D5] mb-1" />
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FBE8EE] via-white to-[#FBE8EE] border border-[#F4C7D5] text-[#9E4D68] text-xs font-bold flex flex-wrap items-center justify-center gap-2 shadow-2xs">
                    <Coffee className="w-4 h-4 animate-pulse text-[#DE5D83] shrink-0" />
                    <span>
                      استراحة بينية: <strong className="text-[#DE5D83]">{toArabicDigits(session.breakDuration)} دقيقة</strong> ({session.breakStartTimeFormatted} – {session.breakEndTimeFormatted})
                    </span>
                    <span className="text-[10px] text-[#7A5B64] font-medium bg-white px-2 py-0.5 rounded-full border border-[#F4C7D5]/70">
                      ← الجلسة التالية تبدأ عند {nextSession.startTimeFormatted}
                    </span>
                  </div>
                  <div className="w-0.5 h-3 bg-[#F4C7D5] mt-1" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Session Timer Modal */}
      {activeTimerSession && (
        <SessionTimerModal
          session={activeTimerSession}
          onClose={() => setActiveTimerSession(null)}
          onToggleComplete={onToggleSession}
        />
      )}
    </div>
  );
};
