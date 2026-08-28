import { DailyConditionsStatus, DailyCertificateData, StudySession, UserIdentity, DiagnosisResult } from '../types';
import { CERTIFICATE_TEMPLATES, formatArabicDate, getTemplateForDate } from '../data/certificateTemplates';

const STORAGE_KEYS = {
  DATE: 'thanaweya_daily_tracker_date',
  PRAYERS: 'thanaweya_daily_prayers',
  QURAN: 'thanaweya_daily_quran',
  ADHKAR: 'thanaweya_daily_adhkar',
  CERTIFICATES: 'thanaweya_earned_certificates',
  AWARDED_DATES: 'thanaweya_daily_cert_awarded_dates',
  CURRENT_PLAN: 'thanaweya_current_plan',
};

export const DAILY_ACHIEVEMENT_EVENT = 'thanaweya_daily_achievement_updated';

function getTodayString(): string {
  return new Date().toDateString();
}

function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ensures daily state resets when a new day arrives
 */
export function ensureDailyStateReset(): void {
  try {
    const lastDate = localStorage.getItem(STORAGE_KEYS.DATE);
    const today = getTodayString();
    if (lastDate !== today) {
      localStorage.setItem(STORAGE_KEYS.DATE, today);
      // Reset prayers
      localStorage.setItem(
        STORAGE_KEYS.PRAYERS,
        JSON.stringify({ date: today, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false })
      );
      // Reset Quran
      localStorage.setItem(
        STORAGE_KEYS.QURAN,
        JSON.stringify({ date: today, completed: false })
      );
      // Reset Adhkar
      localStorage.setItem(
        STORAGE_KEYS.ADHKAR,
        JSON.stringify({ date: today, morning: false, evening: false })
      );
    }
  } catch (e) {
    console.error('Error during daily state reset:', e);
  }
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
      if (parsed.date === getTodayString()) {
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
  const updated = { ...current, [prayer]: completed, date: getTodayString() };
  localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(updated));
  notifyTrackerUpdated();
}

/**
 * Mark all 5 prayers as completed or not
 */
export function setAllPrayersStatus(completed: boolean): void {
  const updated = {
    date: getTodayString(),
    fajr: completed,
    dhuhr: completed,
    asr: completed,
    maghrib: completed,
    isha: completed,
  };
  localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(updated));
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
      if (parsed.date === getTodayString()) {
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
    JSON.stringify({ date: getTodayString(), completed })
  );
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
      if (parsed.date === getTodayString()) {
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
  const updated = { ...current, [type]: completed, date: getTodayString() };
  localStorage.setItem(STORAGE_KEYS.ADHKAR, JSON.stringify(updated));
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
 * Save an earned certificate to the achievement history
 */
export function saveEarnedCertificate(cert: DailyCertificateData): void {
  try {
    const current = getEarnedCertificates();
    // Avoid duplicate entry for the same dateKey
    const filtered = current.filter((c) => c.dateKey !== cert.dateKey);
    filtered.unshift(cert); // add newest first
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(filtered));
    markCertificateAwardedToday();
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
