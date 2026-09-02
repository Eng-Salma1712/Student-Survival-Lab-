import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ExhaustionLevel, ExamTimeline, ActivityType, MasteryLevel, SubjectTask, 
  PeakTime, LearningPreference, PlanPreference, StudentInput 
} from '../types';

interface StudyPlanContextType {
  isExhausted: ExhaustionLevel;
  setIsExhausted: (val: ExhaustionLevel) => void;
  availableHours: number;
  setAvailableHours: (val: number) => void;
  upcomingExam: ExamTimeline;
  setUpcomingExam: (val: ExamTimeline) => void;
  examSubject: string;
  setExamSubject: (val: string) => void;
  
  subjectTasks: SubjectTask[];
  setSubjectTasks: (val: SubjectTask[]) => void;
  subjectMastery: Record<string, MasteryLevel>;
  setSubjectMastery: (val: Record<string, MasteryLevel>) => void;
  
  peakTime: PeakTime;
  setPeakTime: (val: PeakTime) => void;
  learningPreference: LearningPreference;
  setLearningPreference: (val: LearningPreference) => void;
  planPreference: PlanPreference;
  setPlanPreference: (val: PlanPreference) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;

  generateInputPayload: () => StudentInput;
}

const StudyPlanContext = createContext<StudyPlanContextType | undefined>(undefined);

export const StudyPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isExhausted, setIsExhausted] = useState<ExhaustionLevel>(() => (localStorage.getItem('thanaweya_is_exhausted') as ExhaustionLevel) || 'medium');
  const [availableHours, setAvailableHours] = useState<number>(() => Number(localStorage.getItem('thanaweya_available_hours')) || 4);
  const [upcomingExam, setUpcomingExam] = useState<ExamTimeline>(() => (localStorage.getItem('thanaweya_upcoming_exam') as ExamTimeline) || 'none');
  const [examSubject, setExamSubject] = useState<string>(() => localStorage.getItem('thanaweya_exam_subject') || '');

  const [subjectTasks, setSubjectTasks] = useState<SubjectTask[]>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_subject_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [subjectMastery, setSubjectMastery] = useState<Record<string, MasteryLevel>>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_subject_mastery');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [peakTime, setPeakTime] = useState<PeakTime>(() => (localStorage.getItem('thanaweya_peak_time') as PeakTime) || 'evening');
  const [learningPreference, setLearningPreference] = useState<LearningPreference>(() => (localStorage.getItem('thanaweya_learning_pref') as LearningPreference) || 'practice');
  const [planPreference, setPlanPreference] = useState<PlanPreference>(() => (localStorage.getItem('thanaweya_plan_pref') as PlanPreference) || 'flexible');
  const [additionalNotes, setAdditionalNotes] = useState<string>(() => localStorage.getItem('thanaweya_additional_notes') || '');

  useEffect(() => { localStorage.setItem('thanaweya_is_exhausted', isExhausted); }, [isExhausted]);
  useEffect(() => { localStorage.setItem('thanaweya_available_hours', availableHours.toString()); }, [availableHours]);
  useEffect(() => { localStorage.setItem('thanaweya_upcoming_exam', upcomingExam); }, [upcomingExam]);
  useEffect(() => { localStorage.setItem('thanaweya_exam_subject', examSubject); }, [examSubject]);
  useEffect(() => { localStorage.setItem('thanaweya_subject_tasks', JSON.stringify(subjectTasks)); }, [subjectTasks]);
  useEffect(() => { localStorage.setItem('thanaweya_subject_mastery', JSON.stringify(subjectMastery)); }, [subjectMastery]);
  useEffect(() => { localStorage.setItem('thanaweya_peak_time', peakTime); }, [peakTime]);
  useEffect(() => { localStorage.setItem('thanaweya_learning_pref', learningPreference); }, [learningPreference]);
  useEffect(() => { localStorage.setItem('thanaweya_plan_pref', planPreference); }, [planPreference]);
  useEffect(() => { localStorage.setItem('thanaweya_additional_notes', additionalNotes); }, [additionalNotes]);

  const generateInputPayload = (): StudentInput => {
    const uniqueSubjects: string[] = Array.from(new Set<string>(subjectTasks.map((t) => t.subject)));
    const difficultSubjects: string[] = Array.from(
      new Set<string>(
        subjectTasks
          .filter((t) => t.isDifficult || subjectMastery[t.subject] === 'weak')
          .map((t) => t.subject)
      )
    );

    const psychStateText =
      isExhausted === 'yes'
        ? 'تعبان ومجهد ومحتاج خطة مريحة'
        : isExhausted === 'medium'
        ? 'تعب خفيف وطاقة متوسطة'
        : 'طاقة ممتازة وجاهز للمذاكرة المكثفة';

    let studentStage: any = 'secondary';
    let studentTrack: any = 'scientific';
    let studentGrade = 'sec_3';
    let studentGradeLabel = 'الصف الثالث الثانوي';
    let targetGoal = 'كلية الأحلام';
    let dailyCommitments = '';

    try {
      const savedId = localStorage.getItem('thanaweya_user_identity');
      if (savedId) {
        const parsed = JSON.parse(savedId);
        if (parsed.stage) studentStage = parsed.stage;
        if (parsed.track) studentTrack = parsed.track;
        if (parsed.grade) studentGrade = parsed.grade;
        if (parsed.gradeLabel) studentGradeLabel = parsed.gradeLabel;
        if (parsed.collegeName) targetGoal = parsed.collegeName;
        if (parsed.dailyCommitments) dailyCommitments = parsed.dailyCommitments;
      }
      const savedGoal =
        localStorage.getItem('thanaweya_student_goal') ||
        localStorage.getItem('student_goal');
      if (savedGoal) {
        const parsedG = JSON.parse(savedGoal);
        if (parsedG.targetTitle) targetGoal = parsedG.targetTitle;
      }
    } catch {
      // fallback to defaults
    }

    return {
      isExhausted,
      psychologicalState: psychStateText,
      focusLevel: isExhausted === 'yes' ? 2 : isExhausted === 'medium' ? 3 : 5,
      stressLevel: upcomingExam === 'tomorrow' ? 5 : 3,
      availableHours,
      upcomingExam,
      examSubject: upcomingExam !== 'none' ? examSubject : undefined,
      subjectTasks,
      subjects: uniqueSubjects,
      difficultSubjects,
      subjectMastery,
      peakTime,
      learningPreference,
      planPreference,
      additionalNotes: additionalNotes.trim() ? additionalNotes.trim() : undefined,
      studentStage,
      studentTrack,
      studentGrade: studentGradeLabel || studentGrade,
      targetGoal,
      dailyCommitments,
    };
  };

  return (
    <StudyPlanContext.Provider value={{
      isExhausted, setIsExhausted,
      availableHours, setAvailableHours,
      upcomingExam, setUpcomingExam,
      examSubject, setExamSubject,
      subjectTasks, setSubjectTasks,
      subjectMastery, setSubjectMastery,
      peakTime, setPeakTime,
      learningPreference, setLearningPreference,
      planPreference, setPlanPreference,
      additionalNotes, setAdditionalNotes,
      generateInputPayload
    }}>
      {children}
    </StudyPlanContext.Provider>
  );
};

export const useStudyPlan = () => {
  const context = useContext(StudyPlanContext);
  if (!context) throw new Error('useStudyPlan must be used within StudyPlanProvider');
  return context;
};
