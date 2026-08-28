import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useStudyPlan } from '../context/StudyPlanContext';
import { BookOpen, Plus, Trash2, Sparkles, School, Edit3, Check, X } from 'lucide-react';
import { ActivityType, MasteryLevel, SubjectTask, UserIdentity } from '../types';
import { getSubjectsForStudent } from '../utils/educationConfig';

interface SubjectsLessonsPageProps {
  userIdentity?: UserIdentity | null;
}

const CHAPTERS = ['الباب 1', 'الباب 2', 'الباب 3', 'الباب 4', 'الباب 5', 'الباب 6', 'الوحدة الأولى', 'الوحدة الثانية', 'الوحدة الثالثة', 'الوحدة الرابعة'];
const LESSONS = ['الدرس 1', 'الدرس 2', 'الدرس 3', 'الدرس 4', 'الدرس 5', 'الدرس 6', 'الدرس 7', 'مراجعة شمولية على الباب'];

export const SubjectsLessonsPage: React.FC<SubjectsLessonsPageProps> = ({ userIdentity }) => {
  const { subjectTasks, setSubjectTasks, subjectMastery, setSubjectMastery } = useStudyPlan();
  const navigate = useNavigate();

  // Load identity from props or localStorage
  const [identity, setIdentity] = useState<UserIdentity | null>(() => {
    if (userIdentity) return userIdentity;
    try {
      const saved = localStorage.getItem('thanaweya_user_identity');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (userIdentity) {
      setIdentity(userIdentity);
    }
  }, [userIdentity]);

  // Stage-based default subjects
  const baseSubjects = getSubjectsForStudent(
    identity?.stage || 'secondary',
    identity?.track || 'scientific',
    identity?.grade
  );

  // Custom user-added subjects stored in localStorage
  const [customSubjects, setCustomSubjects] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('custom_added_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const availableSubjects = Array.from(new Set([...baseSubjects, ...customSubjects]));

  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjects[0] || 'اللغة العربية');
  
  // Custom Subject creation state
  const [showAddSubjectInput, setShowAddSubjectInput] = useState<boolean>(false);
  const [newSubjectInput, setNewSubjectInput] = useState<string>('');

  // Chapter state: dropdown or free text
  const [isCustomChapter, setIsCustomChapter] = useState<boolean>(false);
  const [selectedChapter, setSelectedChapter] = useState<string>(CHAPTERS[0]);
  const [customChapterText, setCustomChapterText] = useState<string>('');

  // Lesson state: dropdown or free text
  const [isCustomLesson, setIsCustomLesson] = useState<boolean>(false);
  const [selectedLesson, setSelectedLesson] = useState<string>(LESSONS[0]);
  const [customLessonText, setCustomLessonText] = useState<string>('');

  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('study');
  const [isTaskDifficult, setIsTaskDifficult] = useState<boolean>(false);

  // Synchronize initial subject if baseSubjects change
  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject) && availableSubjects.length > 0) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [identity?.stage, identity?.track, identity?.grade]);

  const handleSaveCustomSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSubjectInput.trim();
    if (!trimmed) return;

    if (!availableSubjects.includes(trimmed)) {
      const updated = [...customSubjects, trimmed];
      setCustomSubjects(updated);
      try {
        localStorage.setItem('custom_added_subjects', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    setSelectedSubject(trimmed);
    setNewSubjectInput('');
    setShowAddSubjectInput(false);
  };

  const handleAddTask = () => {
    if (!selectedSubject) return;

    const finalChapter = isCustomChapter ? (customChapterText.trim() || 'الباب 1') : selectedChapter;
    const finalLesson = isCustomLesson ? (customLessonText.trim() || 'الدرس 1') : selectedLesson;

    const newTask: SubjectTask = {
      id: `st-${Date.now()}`,
      subject: selectedSubject,
      chapter: finalChapter,
      lesson: finalLesson,
      activityType: selectedActivity,
      isDifficult: isTaskDifficult,
    };

    setSubjectTasks([...subjectTasks, newTask]);
    setIsTaskDifficult(false);
    if (isCustomLesson) {
      setCustomLessonText('');
    }
  };

  const handleRemoveTask = (id: string) => {
    setSubjectTasks(subjectTasks.filter((t) => t.id !== id));
  };

  const handleSetSubjectMastery = (subject: string, level: MasteryLevel) => {
    setSubjectMastery({
      ...subjectMastery,
      [subject]: level,
    });
  };

  const uniqueAddedSubjects = Array.from(new Set<string>(subjectTasks.map((t) => t.subject)));

  const stageName = identity?.stage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية';
  const trackName = identity?.stage === 'secondary' ? (identity?.track === 'scientific' ? 'شعبة علمي' : 'شعبة أدبي') : null;
  const gradeName = identity?.gradeLabel || (identity?.stage === 'prep' ? 'المرحلة الإعدادية' : 'الثانوية العامة');

  return (
    <PageContainer title="المواد والدروس">
      <div className="card-surface p-6 sm:p-8 space-y-6" dir="rtl">
        
        {/* Header with stage badge and title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D15F70]/10 text-[#D15F70] border border-[#D15F70]/20 flex items-center gap-1">
                <School className="w-3 h-3" />
                {stageName}
              </span>
              {trackName && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {trackName}
                </span>
              )}
              <span className="text-xs text-[#6B6B6B]">
                ({gradeName})
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#2A2A2A] font-heading">
              المواد والدروس المطلوبة
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              تم تخصيص قائمة المواد تلقائياً وفقاً لمرحلتك وصفك الدراسي، ويمكنك إضافة أي مادة مخصصة بزر (+).
            </p>
          </div>
          <BookOpen className="w-6 h-6 text-[#6B6B6B] shrink-0" />
        </div>

        {/* Task Creation Box */}
        <div className="bg-[#F5F5F5] border border-[#E5E5E5] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2A2A2A] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D15F70]" /> إضافة درس جديد للجدول
            </h3>
            <button
              type="button"
              onClick={() => setShowAddSubjectInput(!showAddSubjectInput)}
              className="text-xs font-bold text-[#D15F70] hover:text-[#b04b5a] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مادة مخصصة غير موجودة بالقائمة؟</span>
            </button>
          </div>

          {/* Inline Custom Subject Adder */}
          {showAddSubjectInput && (
            <div className="bg-white p-3.5 rounded-xl border border-[#D15F70]/30 shadow-2xs space-y-2 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-[#2A2A2A]">
                اكتب اسم المادة الجديدة (ستضاف لقائمتك وتُحفظ):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: لغة فرنسية، إحصاء، مهارات بحث..."
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveCustomSubject();
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveCustomSubject()}
                  className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> حفظ المادة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSubjectInput(false);
                    setNewSubjectInput('');
                  }}
                  className="btn-secondary px-3 py-2 text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Main 3 Input Fields: Subject (+ button) / Chapter (dropdown or free text) / Lesson (dropdown or free text) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Subject selection with prominent "+" button */}
            <div>
              <label className="block text-xs font-bold text-[#6B6B6B] mb-1">
                المادة:
              </label>
              <div className="flex gap-1.5 items-center">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs cursor-pointer"
                >
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s} {customSubjects.includes(s) ? '⭐ (مخصصة)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddSubjectInput(true)}
                  title="إضافة مادة مخصصة جديدة"
                  className="p-2.5 bg-white hover:bg-[#D15F70]/10 text-[#D15F70] border border-[#E5E5E5] hover:border-[#D15F70]/40 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Chapter/Unit: with toggle for free-text or dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#6B6B6B]">
                  الباب / الوحدة:
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomChapter(!isCustomChapter)}
                  className="text-[11px] font-semibold text-[#6B6B6B] hover:text-[#D15F70] flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isCustomChapter ? 'قائمة جاهزة' : 'كتابة اسم حر'}</span>
                </button>
              </div>

              {isCustomChapter ? (
                <input
                  type="text"
                  placeholder="مثال: الباب الأول، وحدة الوراثة..."
                  value={customChapterText}
                  onChange={(e) => setCustomChapterText(e.target.value)}
                  className="w-full bg-white border border-[#D15F70] rounded-xl px-3 py-2 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs"
                />
              ) : (
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs cursor-pointer"
                >
                  {CHAPTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 3. Lesson: with toggle for free-text or dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#6B6B6B]">
                  الدرس أو الموضوع:
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomLesson(!isCustomLesson)}
                  className="text-[11px] font-semibold text-[#6B6B6B] hover:text-[#D15F70] flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isCustomLesson ? 'قائمة جاهزة' : 'كتابة اسم حر'}</span>
                </button>
              </div>

              {isCustomLesson ? (
                <input
                  type="text"
                  placeholder="مثال: الدرس الأول، قانون كيرشوف، مراجعة..."
                  value={customLessonText}
                  onChange={(e) => setCustomLessonText(e.target.value)}
                  className="w-full bg-white border border-[#D15F70] rounded-xl px-3 py-2 text-xs font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs"
                />
              ) : (
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#2A2A2A] focus:border-[#D15F70] outline-none shadow-2xs cursor-pointer"
                >
                  {LESSONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Activity Type Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { key: 'study', label: '📖 شرح جديد' },
              { key: 'practice', label: '📝 حل تدريبات' },
              { key: 'review', label: '🔄 مراجعة وتثبيت' },
            ].map((act) => (
              <button
                key={act.key}
                type="button"
                onClick={() => setSelectedActivity(act.key as ActivityType)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  selectedActivity === act.key
                    ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#2A2A2A]'
                    : 'border-[#E5E5E5] bg-transparent text-[#6B6B6B] hover:bg-[#E5E5E5]'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>

          {/* Difficult task checkbox & Add task button */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTaskDifficult}
                onChange={(e) => setIsTaskDifficult(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded bg-white border-[#E5E5E5]"
              />
              <span className="text-xs text-[#6B6B6B] font-semibold">صعب يحتاج تركيز مضاعف</span>
            </label>
            <button
              type="button"
              onClick={handleAddTask}
              className="btn-secondary py-2 px-5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> إضافة الدرس للجدول
            </button>
          </div>
        </div>

        {/* Added Tasks List */}
        {subjectTasks.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-[#2A2A2A] mb-2">المهام المضافة ({subjectTasks.length}):</h3>
            {subjectTasks.map((task, idx) => (
              <div key={task.id} className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-xl p-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#F5F5F5] flex items-center justify-center text-xs font-bold text-[#6B6B6B]">{idx + 1}</div>
                  <div>
                    <div className="text-sm font-bold text-[#2A2A2A]">
                      {task.subject} <span className="text-xs text-[#6B6B6B] font-normal">({task.chapter} - {task.lesson})</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-[#F5F5F5] px-2 py-0.5 rounded text-[#6B6B6B] font-medium">
                        {task.activityType === 'study' ? 'شرح' : task.activityType === 'practice' ? 'تدريبات' : 'مراجعة'}
                      </span>
                      {task.isDifficult && (
                        <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/20 font-bold">
                          صعب
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(task.id)}
                  className="p-2 text-[#6B6B6B] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="حذف الدرس"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mastery Levels for Unique Added Subjects (including any custom subjects) */}
        {uniqueAddedSubjects.length > 0 && (
          <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
            <h3 className="text-sm font-bold text-[#2A2A2A]">
              مستوى التأسيس في هذه المواد (يحدد كثافة الجلسات):
            </h3>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
              {uniqueAddedSubjects.map(subj => {
                const level = subjectMastery[subj] || 'medium';
                return (
                  <div key={subj} className="shrink-0 w-52 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-3 space-y-2">
                    <div className="text-xs font-bold text-[#2A2A2A] truncate" title={subj}>
                      {subj}
                    </div>
                    <div className="flex bg-white rounded-lg p-1 border border-[#E5E5E5]">
                      {[
                        { key: 'weak', label: 'ضعيف' },
                        { key: 'medium', label: 'متوسط' },
                        { key: 'strong', label: 'قوي' }
                      ].map(m => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => handleSetSubjectMastery(subj, m.key as MasteryLevel)}
                          className={`flex-1 text-[10px] py-1 text-center rounded transition-colors cursor-pointer ${
                            level === m.key
                              ? 'bg-[#E5E5E5] text-[#2A2A2A] font-bold'
                              : 'text-[#6B6B6B] hover:bg-[#F5F5F5]'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Forward Action to Schedule */}
        <div className="flex justify-end pt-4 border-t border-[#E5E5E5]">
          <button onClick={() => navigate('/schedule')} className="btn-primary px-8 py-3 flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4" />
            التالي: الجدول الزمني
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
