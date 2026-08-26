export type ScenarioType = 'Last Night' | 'Extremely Pressured' | 'Limited Time' | 'Regaining Control';

export type ExamTimeline = 'tomorrow' | 'few_days' | 'next_week' | 'none';

export type PeakTime = 'morning' | 'evening' | 'night';

export type LearningPreference = 'understanding' | 'memorization' | 'practice';

export type PlanPreference = 'strict' | 'flexible';

export type ExhaustionLevel = 'yes' | 'medium' | 'no';

export type ActivityType = 'study' | 'practice' | 'review'; // مذاكرة | حل | مراجعة

export type MasteryLevel = 'weak' | 'medium' | 'strong';

export interface SubjectTask {
  id: string;
  subject: string; // e.g. 'الفيزياء', 'الكيمياء', 'اللغة العربية'
  chapter: string; // e.g. 'الباب 1'
  lesson: string; // e.g. 'الدرس 2'
  activityType: ActivityType; // 'study' | 'practice' | 'review'
  isDifficult?: boolean;
  masteryLevel?: MasteryLevel;
}

export interface StudentInput {
  isExhausted: ExhaustionLevel;
  psychologicalState: string;
  focusLevel: number; // 1 to 5
  stressLevel: number; // 1 to 5
  availableHours: number; // e.g. 2, 3, 4.5, 6, 8
  upcomingExam: ExamTimeline;
  examSubject?: string;
  subjectTasks: SubjectTask[];
  subjects: string[];
  difficultSubjects: string[];
  subjectMastery?: Record<string, MasteryLevel>; // e.g. { 'الفيزياء': 'weak', 'اللغة العربية': 'strong' }
  completedSessionsHistoryCount?: number;
  peakTime: PeakTime;
  learningPreference: LearningPreference;
  planPreference: PlanPreference;
  additionalNotes?: string;
}

export interface StudySession {
  id: string;
  title: string;
  subject: string;
  chapter?: string;
  lesson?: string;
  activityType?: ActivityType;
  durationMinutes: number; // Flexible duration 45 to 90 min based on task & state
  breakMinutes: number;
  focusType: string; // e.g. "شرح الباب 1 الدرس 2", "حل أسئلة امتحانات ثانوية عامة", "مراجعة وتثبيت"
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  completed?: boolean;
  adaptiveTag?: string; // e.g. "مادة ضعيفة: تكثيف وقت الشرح والحل" | "قبل الامتحان: تركيز على الحل" | "مادة قوية: مراجعة سريعة"
}

export interface DiagnosisResult {
  id: string;
  timestamp: number;
  scenario: ScenarioType;
  diagnosis: string;
  whyThisPlan: string;
  todaysGoal: string;
  studyPlan: StudySession[];
  priorities: string[];
  smartTips: string[];
  motivationalMessage: string;
  inputsSummary: StudentInput;
  adaptiveInsights?: string[];
}

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  input: StudentInput;
}

export interface StudentGoal {
  targetTitle: string; // e.g. "كلية الطب البشري (95%+)"
  importanceReason: string; // e.g. "علشان أفرح أمي وأبويا وأحقق حلم طفولتي"
  targetExamDate: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'points' | 'focus' | 'mastery';
  requiredPoints?: number;
  requiredStreak?: number;
  requiredSessions?: number;
}

export type Gender = 'female' | 'male';

export type CollegeCategory =
  | 'medicine'
  | 'engineering'
  | 'computing'
  | 'arts'
  | 'literature'
  | 'other';

export interface UserIdentity {
  name: string;
  gender: Gender;
  category: CollegeCategory;
  collegeName: string;
}

export interface GamificationState {
  points: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  unlockedBadgeIds: string[];
  totalCompletedSessions: number;
  totalSkippedSessions: number;
}

export interface ChatAttachment {
  name: string;
  mimeType: string;
  data: string; // base64 string
  size?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject?: string;
  category?: string;
}

export interface DailyAchievementRecord {
  id: string;
  date: string;
  timestamp: number;
  summaryTitle: string;
  completedTasks: string[];
  reflection?: string;
  prayersCount?: number;
  studyMinutes?: number;
}

export interface WeeklyCertificateData {
  id: string;
  studentName: string;
  studentTitle: string;
  collegeTarget: string;
  weekLabel: string;
  completedLessonsCount: number;
  streakDays: number;
  prayersCommitted: boolean;
  totalFocusedHours: number;
  keyAchievements: string[];
  inspirationalVerse: string;
  issueDate: string;
}


