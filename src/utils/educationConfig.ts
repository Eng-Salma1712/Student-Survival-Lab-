import { EducationStage, SecondaryTrack, GradeYear } from '../types';

export interface GradeOption {
  id: GradeYear;
  label: string;
  stage: EducationStage;
}

export const PREP_GRADES: GradeOption[] = [
  { id: 'prep_1', label: 'الصف الأول الإعدادي', stage: 'prep' },
  { id: 'prep_2', label: 'الصف الثاني الإعدادي', stage: 'prep' },
  { id: 'prep_3', label: 'الصف الثالث الإعدادي (الشهادة الإعدادية)', stage: 'prep' },
];

export const SECONDARY_GRADES: GradeOption[] = [
  { id: 'sec_1', label: 'الصف الأول الثانوي', stage: 'secondary' },
  { id: 'sec_2', label: 'الصف الثاني الثانوي', stage: 'secondary' },
  { id: 'sec_3', label: 'الصف الثالث الثانوي (الثانوية العامة)', stage: 'secondary' },
];

export const PREP_SUBJECTS = [
  'اللغة العربية',
  'الرياضيات (جبر وإحصاء، هندسة)',
  'العلوم',
  'الدراسات الاجتماعية',
  'اللغة الإنجليزية',
  'الحاسب الآلي وتكنولوجيا المعلومات',
  'التربية الدينية',
];

export const SECONDARY_SCIENTIFIC_SUBJECTS = [
  'الفيزياء',
  'الكيمياء',
  'الأحياء',
  'الرياضيات (تفاضل وتكامل)',
  'الرياضيات (جبر وهندسة فراغية)',
  'الديناميكا والاستاتيكا',
  'الجيولوجيا والعلوم البيئية',
  'اللغة العربية',
  'اللغة الإنجليزية',
  'اللغة الثانية (فرنسي/ألماني/إيطالي)',
  'التربية الوطنية والدينية',
];

export const SECONDARY_LITERARY_SUBJECTS = [
  'التاريخ',
  'الجغرافيا السياسية',
  'الفلسفة والمنطق',
  'علم النفس والاجتماع',
  'الإحصاء',
  'اللغة العربية',
  'اللغة الإنجليزية',
  'اللغة الثانية (فرنسي/ألماني/إيطالي)',
  'التربية الوطنية والدينية',
];

export const SECONDARY_FIRST_YEAR_SUBJECTS = [
  'اللغة العربية',
  'اللغة الإنجليزية',
  'اللغة الثانية',
  'الرياضيات',
  'العلوم المتكاملة',
  'التاريخ',
  'الجغرافيا',
  'الفلسفة',
  'التربية الدينية والوطنية',
];

/**
 * Returns default subjects based on stage, grade, and track.
 */
export const getSubjectsForStudent = (
  stage: EducationStage = 'secondary',
  track: SecondaryTrack = 'scientific',
  grade?: string
): string[] => {
  if (stage === 'prep') {
    return PREP_SUBJECTS;
  }
  if (grade === 'sec_1') {
    return SECONDARY_FIRST_YEAR_SUBJECTS;
  }
  if (track === 'literary') {
    return SECONDARY_LITERARY_SUBJECTS;
  }
  return SECONDARY_SCIENTIFIC_SUBJECTS;
};

// Colleges Categories as requested
export const SCIENTIFIC_COLLEGES = [
  { title: 'كلية الطب', icon: '🩺' },
  { title: 'كلية الهندسة', icon: '🏗️' },
  { title: 'كلية الحاسبات والذكاء الاصطناعي', icon: '💻' },
  { title: 'كلية الصيدلة', icon: '💊' },
  { title: 'كلية طب الأسنان', icon: '🦷' },
  { title: 'كلية العلاج الطبيعي', icon: '🏃‍♂️' },
  { title: 'كلية العلوم', icon: '🔬' },
  { title: 'كلية الزراعة', icon: '🌾' },
  { title: 'كلية التمريض', icon: '🏥' },
];

export const LITERARY_COLLEGES = [
  { title: 'كلية الآداب', icon: '📖' },
  { title: 'كلية الحقوق', icon: '⚖️' },
  { title: 'كلية التجارة', icon: '📊' },
  { title: 'كلية الألسن', icon: '🌐' },
  { title: 'كلية الإعلام', icon: '🎙️' },
  { title: 'كلية التربية', icon: '👩‍🏫' },
  { title: 'كلية السياحة والفنادق', icon: '🏨' },
  { title: 'كلية الآثار', icon: '🏛️' },
];

// Special goals for Prep students (e.g. STEM schools, high scores)
export const PREP_GOAL_SUGGESTIONS = [
  { title: 'الالتحاق بمدارس المتفوقين (STEM)', icon: '🚀' },
  { title: 'المركز الأول في الشهادة الإعدادية (280/280)', icon: '🥇' },
  { title: 'الالتحاق بالثانوية العامة بتفوق', icon: '🎓' },
  { title: 'كلية الطب (حلم المستقبل)', icon: '🩺' },
  { title: 'كلية الهندسة والحاسبات (حلم المستقبل)', icon: '💻' },
];
