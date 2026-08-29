import { StudySession } from '../types';
import { formatTimeTo12HourArabic, toArabicDigits } from './timeFormat';

export interface TimedSession extends StudySession {
  startTime: string;                  // e.g. "10:00"
  endTime: string;                    // e.g. "11:00"
  startTimeFormatted: string;         // e.g. "١٠:٠٠ ص"
  endTimeFormatted: string;           // e.g. "١١:٠٠ ص"
  breakDuration: number;              // e.g. 15
  breakStartTime: string;             // e.g. "11:00"
  breakEndTime: string;               // e.g. "11:15"
  breakStartTimeFormatted: string;    // e.g. "١١:٠٠ ص"
  breakEndTimeFormatted: string;      // e.g. "١١:١٥ ص"
  computedStatus: 'completed' | 'current' | 'upcoming' | 'missed';
  cumulativeStudyMinutes: number;
  cumulativeBreakMinutes: number;
  cumulativeTotalMinutes: number;
}

/**
 * Parses "HH:MM" (or number of hours) into total minutes from midnight (00:00)
 */
export function parseTimeToMinutes(timeInput: string | number = '10:00'): number {
  if (typeof timeInput === 'number') {
    return Math.floor(timeInput) * 60;
  }
  const match = String(timeInput).trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return 600; // default 10:00 AM (10 * 60)
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return (h % 24) * 60 + (m % 60);
}

/**
 * Converts total minutes from midnight to "HH:MM" (24h format)
 */
export function minutesToTimeStr(totalMinutes: number): string {
  const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculates start and end times sequentially across the entire day's schedule.
 * Crucially, each session's start time properly accounts for the cumulative time
 * of ALL previous sessions AND ALL previous breaks.
 *
 * Example:
 * Start: 10:00
 * Session 1: 10:00 -> 11:00 (60 min)
 * Break 1:   11:00 -> 11:15 (15 min)
 * Session 2: 11:15 -> 12:15 (60 min)
 * Break 2:   12:15 -> 12:30 (15 min)
 * Session 3: 12:30 -> 01:30 (60 min)
 */
export function calculateTimedSessions(
  sessions: StudySession[],
  startTimeInput: string | number = '10:00'
): TimedSession[] {
  let currentTotalMinutes = parseTimeToMinutes(startTimeInput);
  const firstUncompletedIndex = sessions.findIndex((s) => !s.completed);

  let cumulativeStudy = 0;
  let cumulativeBreak = 0;

  return sessions.map((session, idx) => {
    const duration = Math.max(1, Number(session.durationMinutes) || 60);
    const breakDuration =
      session.breakMinutes !== undefined && session.breakMinutes !== null
        ? Math.max(0, Number(session.breakMinutes))
        : 15;

    // 1. Current session start
    const sessionStartMinutes = currentTotalMinutes;
    const startTimeStr = minutesToTimeStr(sessionStartMinutes);

    // 2. Current session end
    const sessionEndMinutes = sessionStartMinutes + duration;
    const endTimeStr = minutesToTimeStr(sessionEndMinutes);

    // 3. Break start and end
    const breakStartMinutes = sessionEndMinutes;
    const breakEndMinutes = breakStartMinutes + breakDuration;
    const breakEndTimeStr = minutesToTimeStr(breakEndMinutes);

    // 4. Advance clock for NEXT session:
    // The next session starts strictly AFTER this session AND this session's break!
    currentTotalMinutes = breakEndMinutes;

    cumulativeStudy += duration;
    cumulativeBreak += breakDuration;

    // Determine session status
    let status: 'completed' | 'current' | 'upcoming' | 'missed' = 'upcoming';
    if (session.completed) {
      status = 'completed';
    } else if (idx === firstUncompletedIndex) {
      status = 'current';
    } else if (firstUncompletedIndex !== -1 && idx < firstUncompletedIndex) {
      status = 'completed';
    }

    return {
      ...session,
      durationMinutes: duration,
      breakMinutes: breakDuration,
      startTime: startTimeStr,
      endTime: endTimeStr,
      startTimeFormatted: formatTimeTo12HourArabic(startTimeStr),
      endTimeFormatted: formatTimeTo12HourArabic(endTimeStr),
      breakDuration,
      breakStartTime: endTimeStr,
      breakEndTime: breakEndTimeStr,
      breakStartTimeFormatted: formatTimeTo12HourArabic(endTimeStr),
      breakEndTimeFormatted: formatTimeTo12HourArabic(breakEndTimeStr),
      computedStatus: status,
      cumulativeStudyMinutes: cumulativeStudy,
      cumulativeBreakMinutes: cumulativeBreak,
      cumulativeTotalMinutes: cumulativeStudy + cumulativeBreak,
    };
  });
}
