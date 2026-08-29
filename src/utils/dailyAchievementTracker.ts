import { DailyConditionsStatus, DailyCertificateData, StudySession, UserIdentity, DiagnosisResult, GamificationState } from '../types';
import { CERTIFICATE_TEMPLATES, formatArabicDate, getTemplateForDate } from '../data/certificateTemplates';

export const STORAGE_KEYS = {
  LAST_ACTIVE_DATE: 'thanaweya_last_active_date',
  DATE: 'thanaweya_daily_tracker_date',
  PRAYERS: 'thanaweya_daily_prayers',
  QURAN: 'thanaweya_daily_quran',
  ADHKAR: 'thanaweya_daily_adhkar',
  ADHKAR_PROGRESS: 'thanaweya_adhkar_progress',
  ADHKAR_DATE: 'thanaweya_adhkar_date',
  SPIRITUAL_TASKS: 'thanaweya_spiritual_tasks',
  SPIRITUAL_LAST_DATE: 'thanaweya_spiritual_last_date',
  CERTIFICATES: 'thanaweya_earned_certificates',
  AWARDED_DATES: 'thanaweya_daily_cert_awarded_dates',
  CURRENT_PLAN: 'thanaweya_current_plan',
  GAMIFICATION: 'thanaweya_gamification_state',
};

export const DAILY_ACHIEVEMENT_EVENT = 'thanaweya_daily_achievement_updated';
export const NEW_DAY_RESET_EVENT = 'thanaweya_new_day_reset';

/**
 * Returns today's ISO date (YYYY-MM-DD) based on client local time
 */
export function getTodayISO(dateObj: Date = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's ISO date (YYYY-MM-DD) relative to a given ISO date or today
 */
export function getYesterdayISO(referenceISO: string = getTodayISO()): string {
  const parts = referenceISO.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - 1);
  return getTodayISO(d);
}

/**
 * Normalizes legacy date strings (e.g., toDateString "Sat Aug 29 2026") into YYYY-MM-DD
 */
export function normalizeDateToISO(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return getTodayISO(parsed);
  }
  return null;
}

/**
 * Records activity on the current date every time the user completes or interacts with
 * daily checklists (tasks/sessions, prayers, adhkar, quran portion, spiritual tasks).
 */
export function recordDailyProgressActivity(): void {
  try {
    const today = getTodayISO();
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
    localStorage.setItem(STORAGE_KEYS.DATE, today);
  } catch (e) {
    console.error('Error recording daily progress activity:', e);
  }
}

/**
 * Core New Day Detection & Rollover Engine
 * Checks whether today's date differs from stored lastActiveDate.
 * If a new day is detected:
 * 1. Evaluates yesterday's completion: if all conditions met (certificate earned), increments streak.
 *    If missed or incomplete, resets streak to 0.
 * 2. Resets all daily checklist statuses to false (sessions, prayers, adhkar, quran, spiritual tasks).
 * 3. Clears today's certificate awarded flag.
 * 4. Updates lastActiveDate to today.
 * 5. Dispatches notifications to update all UI views live.
 */
export function checkAndHandleNewDay(options?: {
  forceNewDay?: boolean;
  simulateYesterdayCompleted?: boolean;
  simulatedTodayISO?: string;
}): {
  isNewDay: boolean;
  today: string;
  previousDate: string | null;
  streakUpdated: boolean;
  newStreak: number;
} {
  try {
    const today = options?.simulatedTodayISO || getTodayISO();
    const yesterday = getYesterdayISO(today);

    const storedRaw = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE) || localStorage.getItem(STORAGE_KEYS.DATE);
    const lastActiveDate = normalizeDateToISO(storedRaw);

    // Initial setup if no lastActiveDate exists yet
    if (!lastActiveDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
      localStorage.setItem(STORAGE_KEYS.DATE, today);
      return { isNewDay: false, today, previousDate: null, streakUpdated: false, newStreak: 0 };
    }

    // Same day check
    if (lastActiveDate === today && !options?.forceNewDay) {
      return { isNewDay: false, today, previousDate: lastActiveDate, streakUpdated: false, newStreak: 0 };
    }

    // --- NEW DAY DETECTED ---
    // 1. History & Streak Evaluation (BEFORE resetting today's checklist)
    let awardedDates: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AWARDED_DATES);
      if (raw) awardedDates = JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }

    let earnedCertificates: DailyCertificateData[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      if (raw) earnedCertificates = JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }

    const isYesterdayEarned =
      Boolean(options?.simulateYesterdayCompleted) ||
      awardedDates.includes(yesterday) ||
      earnedCertificates.some((c) => c.dateKey === yesterday);

    const isLastActiveYesterday = lastActiveDate === yesterday || Boolean(options?.forceNewDay);

    let currentStreak = 0;
    let streakUpdated = false;

    try {
      const rawG = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      if (rawG) {
        const gamification: GamificationState = JSON.parse(rawG);
        
        if (isLastActiveYesterday && isYesterdayEarned) {
          // Completed all conditions yesterday: increment streak if not already counted
          if (gamification.lastStreakIncrementDate !== yesterday) {
            gamification.currentStreak = (gamification.currentStreak || 0) + 1;
            gamification.bestStreak = Math.max(gamification.bestStreak || 0, gamification.currentStreak);
            gamification.lastStreakIncrementDate = yesterday;
            streakUpdated = true;
          }
        } else {
          // Missed a day or didn't complete everything: reset streak to 0
          if (gamification.currentStreak !== 0) {
            gamification.currentStreak = 0;
            gamification.lastStreakIncrementDate = '';
            streakUpdated = true;
          }
        }

        // Check badge unlocks for streak milestones
        const badges = new Set(gamification.unlockedBadgeIds || []);
        if (gamification.currentStreak >= 3 && !badges.has('streak_3')) {
          gamification.unlockedBadgeIds.push('streak_3');
        }
        if (gamification.currentStreak >= 7 && !badges.has('streak_7')) {
          gamification.unlockedBadgeIds.push('streak_7');
        }
        if (gamification.currentStreak >= 14 && !badges.has('streak_14')) {
          gamification.unlockedBadgeIds.push('streak_14');
        }

        gamification.lastActiveDate = today;
        currentStreak = gamification.currentStreak;
        localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(gamification));
      }
    } catch (e) {
      console.error('Error updating streak in new day rollover:', e);
    }

    // 2. Reset all daily completion statuses to false
    // A. Prayers (5 daily prayers)
    localStorage.setItem(
      STORAGE_KEYS.PRAYERS,
      JSON.stringify({ date: today, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false })
    );

    // B. Quran daily portion
    localStorage.setItem(
      STORAGE_KEYS.QURAN,
      JSON.stringify({ date: today, completed: false })
    );

    // C. Adhkar (morning & evening + individual counts)
    localStorage.setItem(
      STORAGE_KEYS.ADHKAR,
      JSON.stringify({ date: today, morning: false, evening: false })
    );
    localStorage.setItem(STORAGE_KEYS.ADHKAR_PROGRESS, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.ADHKAR_DATE, today);

    // D. Spiritual Habit Tasks
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEYS.SPIRITUAL_TASKS);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) {
          const resetTasks = parsed.map((t: any) => ({ ...t, completed: false }));
          localStorage.setItem(STORAGE_KEYS.SPIRITUAL_TASKS, JSON.stringify(resetTasks));
        }
      }
      localStorage.setItem(STORAGE_KEYS.SPIRITUAL_LAST_DATE, today);
    } catch (e) {
      console.error(e);
    }

    // E. Study Sessions in current plan
    try {
      const savedPlan = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
      if (savedPlan) {
        const plan: DiagnosisResult = JSON.parse(savedPlan);
        if (plan.studyPlan && Array.isArray(plan.studyPlan)) {
          plan.studyPlan = plan.studyPlan.map((s: StudySession) => ({ ...s, completed: false }));
          localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(plan));
        }
      }
    } catch (e) {
      console.error(e);
    }

    // F. Certificate awarded trigger for today (reset flag so today can earn a certificate)
    if (awardedDates.includes(today)) {
      const filtered = awardedDates.filter((d) => d !== today);
      localStorage.setItem(STORAGE_KEYS.AWARDED_DATES, JSON.stringify(filtered));
    }

    // 3. Update lastActiveDate to today after resetting
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
    localStorage.setItem(STORAGE_KEYS.DATE, today);

    // 4. Notify all components
    notifyNewDayReset({ today, previousDate: lastActiveDate, newStreak: currentStreak });
    notifyTrackerUpdated();

    return {
      isNewDay: true,
      today,
      previousDate: lastActiveDate,
      streakUpdated,
      newStreak: currentStreak,
    };
  } catch (e) {
    console.error('Error during checkAndHandleNewDay:', e);
    return { isNewDay: false, today: getTodayISO(), previousDate: null, streakUpdated: false, newStreak: 0 };
  }
}

/**
 * Ensures daily state resets if a new day has started.
 * Automatically called on reading any daily status.
 */
export function ensureDailyStateReset(): void {
  checkAndHandleNewDay();
}

/**
 * Get the current 5 prayers state
 */
export function getDailyPrayers(): { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean } {
  ensureDailyStateReset();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRAYERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayISO()) {
        return {
          fajr: Boolean(parsed.fajr),
          dhuhr: Boolean(parsed.dhuhr),
          asr: Boolean(parsed.asr),
          maghrib: Boolean(parsed.maghrib),
          isha: Boolean(parsed.isha),
        };
      }
    }
  } catch (e) {
    console.error(e);
  }
  return { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
}

/**
 * Update prayer status
 */
export function setPrayerStatus(prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', completed: boolean): void {
  const current = getDailyPrayers();
  const updated = { ...current, [prayer]: completed, date: getTodayISO() };
  localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(updated));
  recordDailyProgressActivity();
  notifyTrackerUpdated();
}

/**
 * Mark all 5 prayers as completed or not
 */
export function setAllPrayersStatus(completed: boolean): void {
  const updated = {
    date: getTodayISO(),
    fajr: completed,
    dhuhr: completed,
    asr: completed,
    maghrib: completed,
    isha: completed,
  };
  localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(updated));
  recordDailyProgressActivity();
  notifyTrackerUpdated();
}

/**
 * Get daily Quran portion status
 */
export function getDailyQuranStatus(): boolean {
  ensureDailyStateReset();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QURAN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayISO()) {
        return Boolean(parsed.completed);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

export function setDailyQuranStatus(completed: boolean): void {
  localStorage.setItem(
    STORAGE_KEYS.QURAN,
    JSON.stringify({ date: getTodayISO(), completed })
  );
  recordDailyProgressActivity();
  notifyTrackerUpdated();
}

/**
 * Get daily Adhkar status (morning and evening)
 */
export function getDailyAdhkarStatus(): { morning: boolean; evening: boolean } {
  ensureDailyStateReset();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADHKAR);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayISO()) {
        return {
          morning: Boolean(parsed.morning),
          evening: Boolean(parsed.evening),
        };
      }
    }
  } catch (e) {
    console.error(e);
  }
  return { morning: false, evening: false };
}

export function setDailyAdhkarStatus(type: 'morning' | 'evening', completed: boolean): void {
  const current = getDailyAdhkarStatus();
  const updated = { ...current, [type]: completed, date: getTodayISO() };
  localStorage.setItem(STORAGE_KEYS.ADHKAR, JSON.stringify(updated));
  recordDailyProgressActivity();
  notifyTrackerUpdated();
}

/**
 * Get study sessions from active plan or localStorage
 */
export function getStudySessions(currentResult?: DiagnosisResult | null): StudySession[] {
  if (currentResult?.studyPlan && currentResult.studyPlan.length > 0) {
    return currentResult.studyPlan;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
    if (saved) {
      const parsed: DiagnosisResult = JSON.parse(saved);
      if (parsed.studyPlan && parsed.studyPlan.length > 0) {
        return parsed.studyPlan;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

/**
 * Check the strict 4 conditions for today:
 * 1. All scheduled study tasks/sessions in "جدول الجلسات" marked as done (sessions > 0 and all completed)
 * 2. All 5 daily prayers marked as completed
 * 3. Daily Quran portion marked as read/completed
 * 4. Both morning and evening Adhkar fully completed
 */
export function evaluateDailyConditions(currentResult?: DiagnosisResult | null): DailyConditionsStatus {
  ensureDailyStateReset();

  const sessions = getStudySessions(currentResult);
  const totalSessionsCount = sessions.length;
  const sessionsCount = sessions.filter((s) => s.completed).length;
  // STRICT: sessions must exist (> 0) and ALL must be marked completed
  const sessionsCompleted = totalSessionsCount > 0 && sessionsCount === totalSessionsCount;

  const prayers = getDailyPrayers();
  // STRICT: all 5 prayers completed
  const prayersCompleted = prayers.fajr && prayers.dhuhr && prayers.asr && prayers.maghrib && prayers.isha;

  // STRICT: daily Quran read
  const quranCompleted = getDailyQuranStatus();

  // STRICT: both morning AND evening adhkar completed
  const adhkar = getDailyAdhkarStatus();
  const adhkarCompleted = adhkar.morning && adhkar.evening;

  // STRICT TRIGGER CONDITION: ALL FOUR MUST BE TRUE
  const allCompleted = Boolean(
    sessionsCompleted && prayersCompleted && quranCompleted && adhkarCompleted
  );

  return {
    date: getTodayISO(),
    sessionsCompleted,
    sessionsCount,
    totalSessionsCount,
    prayersCompleted,
    prayersDetails: prayers,
    quranCompleted,
    adhkarCompleted,
    adhkarDetails: adhkar,
    allCompleted,
  };
}

/**
 * Check if certificate has already been automatically awarded today
 */
export function isCertificateAwardedToday(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AWARDED_DATES);
    const today = getTodayISO();
    if (raw) {
      const dates: string[] = JSON.parse(raw);
      return dates.includes(today);
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

/**
 * Mark certificate as awarded today so it doesn't repeatedly auto-popup
 */
export function markCertificateAwardedToday(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AWARDED_DATES);
    const today = getTodayISO();
    const dates: string[] = raw ? JSON.parse(raw) : [];
    if (!dates.includes(today)) {
      dates.push(today);
      localStorage.setItem(STORAGE_KEYS.AWARDED_DATES, JSON.stringify(dates));
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Retrieve all previously earned certificates from localStorage
 */
export function getEarnedCertificates(): DailyCertificateData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Save an earned certificate to the achievement history and award streak points
 */
export function saveEarnedCertificate(cert: DailyCertificateData): void {
  try {
    const current = getEarnedCertificates();
    // Avoid duplicate entry for the same dateKey
    const filtered = current.filter((c) => c.dateKey !== cert.dateKey);
    filtered.unshift(cert); // add newest first
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(filtered));
    markCertificateAwardedToday();
    recordDailyProgressActivity();

    // Award streak & gamification bonus on certificate earning
    try {
      const rawG = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      if (rawG) {
        const gamification: GamificationState = JSON.parse(rawG);
        const today = getTodayISO();
        if (gamification.lastStreakIncrementDate !== today) {
          const nextStreak = (gamification.currentStreak || 0) + 1;
          gamification.currentStreak = nextStreak;
          gamification.bestStreak = Math.max(gamification.bestStreak || 0, nextStreak);
          gamification.lastStreakIncrementDate = today;
          gamification.points = (gamification.points || 0) + 150;
          gamification.lastActiveDate = today;

          // Milestone streak badges
          if (nextStreak >= 3 && !gamification.unlockedBadgeIds.includes('streak_3')) {
            gamification.unlockedBadgeIds.push('streak_3');
          }
          if (nextStreak >= 7 && !gamification.unlockedBadgeIds.includes('streak_7')) {
            gamification.unlockedBadgeIds.push('streak_7');
          }
          if (nextStreak >= 14 && !gamification.unlockedBadgeIds.includes('streak_14')) {
            gamification.unlockedBadgeIds.push('streak_14');
          }

          localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(gamification));
        }
      }
    } catch (e) {
      console.error(e);
    }

    notifyTrackerUpdated();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Generate a DailyCertificateData object with hydrated template and dynamic student details
 */
export function createCertificateData(
  userIdentity: UserIdentity | null,
  conditions: DailyConditionsStatus,
  preferredTemplateIndex?: number
): DailyCertificateData {
  const todayDate = new Date();
  const dateKey = getTodayISO();
  const formattedDate = formatArabicDate(todayDate);

  // Student name resolution
  let studentName = 'بطلنا المثابر';
  if (userIdentity?.name) {
    const title = userIdentity.gender === 'female' ? 'الطالبة المتميزة' : 'الطالب المتميز';
    studentName = `${title} / ${userIdentity.name}`;
  }

  // Pick stable template for today
  const template = getTemplateForDate(todayDate, preferredTemplateIndex);

  const completedTasksCount = conditions.sessionsCount + 5 + 1 + 2; // sessions + 5 prayers + quran + 2 adhkar

  return {
    id: `cert_${dateKey}_${Date.now()}`,
    dateKey,
    formattedDate,
    studentName,
    templateIndex: template.id - 1,
    title: template.title,
    subtitle: template.subtitle,
    paragraphs: [
      template.intro(studentName),
      template.wisdomParagraph,
      template.prideParagraph,
      template.cheerParagraph,
    ],
    praiseCallout: template.cheerParagraph,
    duaText: template.duaParagraph,
    completedTasksCount,
    completedSessionsCount: conditions.sessionsCount,
    earnedAt: new Date().toISOString(),
  };
}

/**
 * Helper to broadcast tracker updates across components
 */
export function notifyTrackerUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DAILY_ACHIEVEMENT_EVENT));
  }
}

export const notifyDailyAchievementChange = notifyTrackerUpdated;

/**
 * Helper to broadcast new day reset events
 */
export function notifyNewDayReset(details: { today: string; previousDate: string | null; newStreak?: number }): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NEW_DAY_RESET_EVENT, { detail: details }));
  }
}
