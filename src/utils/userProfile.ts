import { UserIdentity } from '../types';

export const IDENTITY_STORAGE_KEY = 'thanaweya_user_identity';
export const IDENTITY_UPDATED_EVENT = 'thanaweya_identity_updated';

const CANDIDATE_STORAGE_KEYS = [
  'thanaweya_user_identity',
  'student_identity',
  'user_identity',
  'thanaweya_profile',
  'user_profile',
  'student_profile',
  'thanaweya_student_identity',
  'thanaweya_user',
  'student_name',
  'userName',
  'thanaweya_user_name',
];

export interface TitleInfo {
  title: string;
  formalTitle: string;
  emoji: string;
  pronoun: string;
}

export const getTitleInfo = (identity?: UserIdentity | null): TitleInfo => {
  if (!identity) {
    return { title: 'طالب', formalTitle: 'طالب', emoji: '🧑‍🎓', pronoun: 'أنت' };
  }

  const isFemale = identity.gender === 'female';
  let title = isFemale ? 'دكتورة' : 'دكتور';
  let emoji = isFemale ? '👩‍⚕️' : '👨‍⚕️';

  if (identity.category === 'engineering') {
    title = isFemale ? 'بشمهندسة' : 'بشمهندس';
    emoji = isFemale ? '👩‍🔬' : '👨‍🔧';
  } else if (identity.category === 'computing') {
    title = isFemale ? 'مبرمجة' : 'مبرمج';
    emoji = '💻';
  } else if (identity.category === 'arts') {
    title = isFemale ? 'فنانة' : 'فنان';
    emoji = '🎨';
  } else if (identity.category === 'literature') {
    title = isFemale ? 'أستاذة' : 'أستاذ';
    emoji = '📚';
  } else if (identity.category === 'other') {
    if (identity.stage === 'prep') {
      title = isFemale ? 'بطلة الإعدادية' : 'بطل الإعدادية';
      emoji = '🌟';
    } else {
      title = isFemale ? 'المتفوقة' : 'المتفوق';
      emoji = '🎯';
    }
  }

  const rawName = (typeof identity.name === 'string' ? identity.name.trim() : '') || '';
  const firstName = rawName ? rawName.split(' ')[0] : '';

  return {
    title,
    formalTitle: firstName ? `${title} ${firstName}` : title,
    emoji,
    pronoun: isFemale ? 'أنتِ' : 'أنت',
  };
};

/**
 * Safely inspects local storage to locate and normalize any saved student profile or name.
 */
export const getStoredUserIdentity = (): UserIdentity | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  for (const key of CANDIDATE_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // May be a raw plain string name (e.g. "سلمى سلمى")
        if (typeof raw === 'string' && raw.trim().length > 0 && !raw.startsWith('{')) {
          parsed = { name: raw.trim() };
        }
      }

      if (parsed) {
        const candidateName =
          (typeof parsed === 'string' ? parsed : null) ||
          parsed.name ||
          parsed.studentName ||
          parsed.fullName ||
          parsed.userName ||
          parsed.displayName;

        if (typeof candidateName === 'string' && candidateName.trim().length > 0) {
          const cleanName = candidateName.trim();
          return {
            name: cleanName,
            gender: parsed.gender === 'male' ? 'male' : 'female',
            category: parsed.category || 'computing',
            collegeName: parsed.collegeName || 'كلية الأحلام',
            stage: parsed.stage || 'secondary',
            track: parsed.track || 'scientific',
            grade: parsed.grade || 'sec_3',
            gradeLabel: parsed.gradeLabel || 'الصف الثالث الثانوي',
          };
        }
      }
    } catch {
      // Continue searching other keys
    }
  }

  // Also check if studentName is embedded in goal
  const goalKeys = ['thanaweya_student_goal', 'student_goal'];
  for (const gKey of goalKeys) {
    try {
      const raw = localStorage.getItem(gKey);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const candidateName = parsed?.studentName || parsed?.name || parsed?.userName;
      if (typeof candidateName === 'string' && candidateName.trim().length > 0) {
        return {
          name: candidateName.trim(),
          gender: 'female',
          category: 'computing',
          collegeName: parsed.targetTitle || 'كلية الأحلام',
          stage: 'secondary',
          track: 'scientific',
          grade: 'sec_3',
          gradeLabel: 'الصف الثالث الثانوي',
        };
      }
    } catch {
      // Ignore
    }
  }

  return null;
};

/**
 * Saves identity to localStorage and notifies all components across the app.
 */
export const saveUserIdentity = (identity: UserIdentity): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
    window.dispatchEvent(new CustomEvent(IDENTITY_UPDATED_EVENT, { detail: identity }));
  } catch {
    // LocalStorage write fail protection
  }
};

/**
 * Builds the dynamic personalized greeting for the welcome card.
 * If student has a profile: "أهلاً بك يا [اسم الطالب] 🌟" (e.g. "أهلاً بك يا مبرمجة سلمى سلمى 🌟")
 * If no profile is set: "أهلاً بك في Student Survival Lab"
 */
export const formatWelcomeGreeting = (
  userIdentity?: UserIdentity | null
): { greeting: string; hasProfile: boolean; studentName: string; title: string } => {
  // If identity prop is not provided or lacks a name, fall back to storage
  const identity = (userIdentity && typeof userIdentity.name === 'string' && userIdentity.name.trim().length > 0)
    ? userIdentity
    : getStoredUserIdentity();

  if (!identity || typeof identity.name !== 'string' || !identity.name.trim()) {
    return {
      greeting: 'أهلاً بك في Student Survival Lab',
      hasProfile: false,
      studentName: '',
      title: '',
    };
  }

  const cleanName = identity.name.trim();
  const titleInfo = getTitleInfo(identity);
  const roleTitle = titleInfo.title;

  // If there is an academic/career title (e.g. مبرمجة, دكتورة, بشمهندسة, فنانة, أستاذة)
  // and the student's name doesn't already contain it, include it respectfully.
  let personalizedTitle = cleanName;
  if (roleTitle && roleTitle !== 'طالب' && roleTitle !== 'المتفوق' && !cleanName.includes(roleTitle)) {
    personalizedTitle = `${roleTitle} ${cleanName}`;
  }

  return {
    greeting: `أهلاً بك يا ${personalizedTitle} 🌟`,
    hasProfile: true,
    studentName: cleanName,
    title: roleTitle,
  };
};
