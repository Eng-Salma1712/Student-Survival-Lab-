import { Badge, GamificationState, StudySession } from '../types';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_session',
    title: 'الشرارة الأولى ⚡',
    description: 'أكملت أول جلسة مذاكرة حقيقية بنجاح!',
    icon: '⚡',
    category: 'focus',
    requiredSessions: 1,
  },
  {
    id: 'streak_3',
    title: 'شعلة العزيمة 🔥',
    description: 'واظبت على المذاكرة لمدة 3 أيام متتالية!',
    icon: '🔥',
    category: 'streak',
    requiredStreak: 3,
  },
  {
    id: 'streak_7',
    title: 'بطل الأسبوع 🏆',
    description: 'إنجاز أسطوري: 7 أيام متتالية من التركيز والانضباط!',
    icon: '🏆',
    category: 'streak',
    requiredStreak: 7,
  },
  {
    id: 'streak_14',
    title: 'قاهر الثانوية 🚀',
    description: '14 يوماً من العزيمة بدون استسلام!',
    icon: '🚀',
    category: 'streak',
    requiredStreak: 14,
  },
  {
    id: 'points_100',
    title: 'مستوى المئة 🌟',
    description: 'جمعت 100 نقطة من جهدك ومذاكرتك اليومية!',
    icon: '🌟',
    category: 'points',
    requiredPoints: 100,
  },
  {
    id: 'points_500',
    title: 'محارب القمة 👑',
    description: 'تجاوزت 500 نقطة! أنت تسير بخطى ثابتة نحو حلمك!',
    icon: '👑',
    category: 'points',
    requiredPoints: 500,
  },
  {
    id: 'points_1000',
    title: 'أسطورة الثانوية 💎',
    description: '1000 نقطة تميز! مكانك المحجوز في أوائل الثانوية!',
    icon: '💎',
    category: 'points',
    requiredPoints: 1000,
  },
  {
    id: 'difficult_master',
    title: 'تفكيك الصعاب 🧠',
    description: 'تغلبت على جلسة في مادة صعبة وتحديت نفسك!',
    icon: '🧠',
    category: 'mastery',
  },
  {
    id: 'sessions_10',
    title: 'صانع المستحيل 🎖️',
    description: 'أتممت 10 جلسات مذاكرة بتركيز كامل!',
    icon: '🎖️',
    category: 'focus',
    requiredSessions: 10,
  },
];

export const INITIAL_GAMIFICATION_STATE: GamificationState = {
  points: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: '',
  unlockedBadgeIds: [],
  totalCompletedSessions: 0,
  totalSkippedSessions: 0,
};

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks and updates streak based on last active date and yesterday's certificate
 */
export const checkStreakOnLoad = (state: GamificationState): GamificationState => {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (!state.lastActiveDate) {
    return { ...state, lastActiveDate: today };
  }

  // If last active was today, keep current streak
  if (state.lastActiveDate === today) {
    return state;
  }

  // If last active was yesterday, check if yesterday earned a certificate
  if (state.lastActiveDate === yesterday) {
    let isYesterdayEarned = false;
    try {
      const rawAwarded = localStorage.getItem('thanaweya_daily_cert_awarded_dates');
      const awardedDates: string[] = rawAwarded ? JSON.parse(rawAwarded) : [];
      const rawCerts = localStorage.getItem('thanaweya_earned_certificates');
      const certs: any[] = rawCerts ? JSON.parse(rawCerts) : [];
      isYesterdayEarned = awardedDates.includes(yesterday) || certs.some((c: any) => c.dateKey === yesterday);
    } catch (e) {}

    if (isYesterdayEarned) {
      if (state.lastStreakIncrementDate !== yesterday) {
        const nextStreak = (state.currentStreak || 0) + 1;
        return {
          ...state,
          currentStreak: nextStreak,
          bestStreak: Math.max(state.bestStreak || 0, nextStreak),
          lastStreakIncrementDate: yesterday,
        };
      }
      return state;
    }
  }

  // Otherwise, missed more than a day or missed completing yesterday: reset streak to 0
  return {
    ...state,
    currentStreak: 0,
    lastStreakIncrementDate: '',
  };
};

export interface ProcessSessionResult {
  updatedState: GamificationState;
  pointsEarned: number;
  bonusPoints: number;
  newlyUnlockedBadges: Badge[];
}

/**
 * Process a completed session and return updated state + points + newly unlocked badges
 */
export const processCompletedSession = (
  currentState: GamificationState,
  session: StudySession,
  isDifficultSubject: boolean = false
): ProcessSessionResult => {
  const today = getTodayDateString();

  // Calculate points
  const basePoints = 50;
  const bonusPoints = isDifficultSubject ? 30 : 0;
  const pointsEarned = basePoints + bonusPoints;
  const newPoints = currentState.points + pointsEarned;

  const newCompletedSessions = currentState.totalCompletedSessions + 1;

  let newState: GamificationState = {
    ...currentState,
    points: newPoints,
    lastActiveDate: today,
    totalCompletedSessions: newCompletedSessions,
  };

  // Check for newly unlocked badges
  const newlyUnlockedBadges: Badge[] = [];
  const currentUnlocked = new Set(newState.unlockedBadgeIds);

  for (const badge of ALL_BADGES) {
    if (currentUnlocked.has(badge.id)) continue;

    let unlocked = false;
    if (badge.id === 'difficult_master' && isDifficultSubject) {
      unlocked = true;
    }
    if (badge.requiredSessions && newCompletedSessions >= badge.requiredSessions) {
      unlocked = true;
    }
    if (badge.requiredStreak && (newState.currentStreak || 0) >= badge.requiredStreak) {
      unlocked = true;
    }
    if (badge.requiredPoints && newPoints >= badge.requiredPoints) {
      unlocked = true;
    }

    if (unlocked) {
      newlyUnlockedBadges.push(badge);
      currentUnlocked.add(badge.id);
    }
  }

  newState = {
    ...newState,
    unlockedBadgeIds: Array.from(currentUnlocked),
  };

  return {
    updatedState: newState,
    pointsEarned: basePoints,
    bonusPoints,
    newlyUnlockedBadges,
  };
};
