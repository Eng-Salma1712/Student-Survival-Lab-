import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useStudyPlan } from '../context/StudyPlanContext';
import { BookOpen, Plus, Trash2, Sparkles } from 'lucide-react';
import { ActivityType, MasteryLevel, SubjectTask } from '../types';

const THANAWEYA_SUBJECTS = [
  'الفيزياء', 'الكيمياء', 'الأحياء', 'الرياضيات (تفاضل وتكامل)',
  'الرياضيات (جبر وهندسة فراغية)', 'الديناميكا والاستاتيكا', 'اللغة العربية',
  'اللغة الإنجليزية', 'اللغة الثانية (فرنسي/ألماني/إيطالي)',
  'الجيولوجيا والعلوم البيئية', 'التاريخ', 'الجغرافيا السياسية',
  'الفلسفة والمنطق', 'علم النفس والاجتماع',
];

const CHAPTERS = ['الباب 1', 'الباب 2', 'الباب 3', 'الباب 4', 'الباب 5', 'الباب 6', 'الوحدة الأولى', 'الوحدة الثانية', 'الوحدة الثالثة', 'الوحدة الرابعة'];
const LESSONS = ['الدرس 1', 'الدرس 2', 'الدرس 3', 'الدرس 4', 'الدرس 5', 'الدرس 6', 'الدرس 7', 'مراجعة شمولية على الباب'];

export const SubjectsLessonsPage: React.FC = () => {
  const { subjectTasks, setSubjectTasks, subjectMastery, setSubjectMastery } = useStudyPlan();
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState<string>('الفيزياء');
  const [selectedChapter, setSelectedChapter] = useState<string>('الباب 1');
  const [selectedLesson, setSelectedLesson] = useState<string>('الدرس 2');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('study');
  const [isTaskDifficult, setIsTaskDifficult] = useState<boolean>(false);

  const handleAddTask = () => {
    if (!selectedSubject) return;
    const newTask: SubjectTask = {
      id: `st-${Date.now()}`,
      subject: selectedSubject,
      chapter: selectedChapter,
      lesson: selectedLesson,
      activityType: selectedActivity,
      isDifficult: isTaskDifficult,
    };
    setSubjectTasks([...subjectTasks, newTask]);
    setIsTaskDifficult(false);
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

  return (
    <PageContainer title="المواد والدروس">
      <div className="card-surface p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2A2A2A] font-heading mt-1">المواد والدروس المطلوبة</h2>
          </div>
          <BookOpen className="w-6 h-6 text-[#6B6B6B]" />
        </div>

        <div className="bg-[#F5F5F5] border border-[#E5E5E5] p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-[#2A2A2A] flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-[#D15F70]" /> إضافة درس جديد للجدول
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm text-[#2A2A2A] focus:border-[#D15F70] outline-none"
            >
              {THANAWEYA_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm text-[#2A2A2A] focus:border-[#D15F70] outline-none"
            >
              {CHAPTERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm text-[#2A2A2A] focus:border-[#D15F70] outline-none"
            >
              {LESSONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

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
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                  selectedActivity === act.key
                    ? 'border-[#D15F70] bg-[#D15F70]/10 text-[#2A2A2A]'
                    : 'border-[#E5E5E5] bg-transparent text-[#6B6B6B] hover:bg-[#F5F5F5]'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTaskDifficult}
                onChange={(e) => setIsTaskDifficult(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded bg-white border-[#E5E5E5]"
              />
              <span className="text-xs text-[#6B6B6B]">صعب يحتاج تركيز مضاعف</span>
            </label>
            <button
              type="button"
              onClick={handleAddTask}
              className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> إضافة
            </button>
          </div>
        </div>

        {subjectTasks.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-[#2A2A2A] mb-2">المهام المضافة ({subjectTasks.length}):</h3>
            {subjectTasks.map((task, idx) => (
              <div key={task.id} className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#F5F5F5] flex items-center justify-center text-xs font-bold text-[#6B6B6B]">{idx + 1}</div>
                  <div>
                    <div className="text-sm font-bold text-[#2A2A2A]">{task.subject} <span className="text-xs text-[#6B6B6B] font-normal">({task.chapter} - {task.lesson})</span></div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-[#F5F5F5] px-2 py-0.5 rounded text-[#6B6B6B]">
                        {task.activityType === 'study' ? 'شرح' : task.activityType === 'practice' ? 'تدريبات' : 'مراجعة'}
                      </span>
                      {task.isDifficult && <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">صعب</span>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(task.id)}
                  className="p-2 text-[#6B6B6B] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uniqueAddedSubjects.length > 0 && (
          <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
            <h3 className="text-sm font-bold text-[#2A2A2A]">مستوى التأسيس في هذه المواد:</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
              {uniqueAddedSubjects.map(subj => {
                const level = subjectMastery[subj] || 'medium';
                return (
                  <div key={subj} className="shrink-0 w-48 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-3 space-y-2">
                    <div className="text-xs font-bold text-[#2A2A2A]">{subj}</div>
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
                          className={`flex-1 text-[10px] py-1 text-center rounded transition-colors ${
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
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-[#E5E5E5]">
          <button onClick={() => navigate('/schedule')} className="btn-primary px-8 py-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            التالي: الجدول الزمني
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
