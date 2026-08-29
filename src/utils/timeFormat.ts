/**
 * Time formatting utilities for Arabic 12-hour format with AM/PM (ص / م)
 * and Arabic-Indic numerals as requested:
 * e.g. "23:00" -> "١١:٠٠ م"
 *      "11:00" -> "١١:٠٠ ص"
 *      "05:00" -> "٥:٠٠ ص"
 *      "16:31" -> "٤:٣١ م"
 */

export const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/**
 * Converts Western digits (0-9) to Eastern Arabic-Indic numerals (٠-٩)
 */
export function toArabicDigits(val: string | number): string {
  return String(val).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d, 10)]);
}

/**
 * Converts a 24-hour time string (e.g. "23:00", "04:15", "16:31:00")
 * to a 12-hour Arabic string with AM/PM indicator:
 * e.g. "23:00" -> "١١:٠٠ م"
 *      "09:30" -> "٩:٣٠ ص"
 *      "12:56" -> "١٢:٥٦ م"
 *      "00:15" -> "١٢:١٥ ص"
 */
export function formatTimeTo12HourArabic(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  const match = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;

  const hours24 = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  const isPM = hours24 >= 12;
  const period = isPM ? 'م' : 'ص';

  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const formattedHours = toArabicDigits(hours12);
  const formattedMinutes = toArabicDigits(String(minutes).padStart(2, '0'));

  return `${formattedHours}:${formattedMinutes} ${period}`;
}

/**
 * Formats a JavaScript Date or timestamp into a 12-hour Arabic string
 * e.g. Date representing 23:00 -> "١١:٠٠ م"
 */
export function formatDateTo12HourArabic(dateInput: Date | number | string | undefined | null): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'object' && dateInput instanceof Date
    ? dateInput
    : new Date(dateInput);

  if (isNaN(date.getTime())) return '';

  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours24 >= 12;
  const period = isPM ? 'م' : 'ص';

  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const formattedHours = toArabicDigits(hours12);
  const formattedMinutes = toArabicDigits(String(minutes).padStart(2, '0'));

  return `${formattedHours}:${formattedMinutes} ${period}`;
}

/**
 * Formats a time range in 12-hour Arabic format
 * e.g. ("09:00", "10:30") -> "٩:٠٠ ص – ١٠:٣٠ ص"
 */
export function formatTimeRange12HourArabic(startTime: string, endTime: string): string {
  const start = formatTimeTo12HourArabic(startTime);
  const end = formatTimeTo12HourArabic(endTime);
  return `${start} – ${end}`;
}

/**
 * Human-readable Arabic duration (e.g. for countdowns or remaining time)
 */
export function formatRemainingDurationArabic(diffMinutes: number): string {
  if (diffMinutes <= 0) return 'حان الموعد الآن';

  const hours = Math.floor(diffMinutes / 60);
  const minutes = Math.floor(diffMinutes % 60);

  const parts: string[] = [];

  if (hours === 1) {
    parts.push('ساعة واحدة');
  } else if (hours === 2) {
    parts.push('ساعتان');
  } else if (hours >= 3 && hours <= 10) {
    parts.push(`${toArabicDigits(hours)} ساعات`);
  } else if (hours > 10) {
    parts.push(`${toArabicDigits(hours)} ساعة`);
  }

  if (minutes === 1) {
    parts.push('دقيقة واحدة');
  } else if (minutes === 2) {
    parts.push('دقيقتان');
  } else if (minutes >= 3 && minutes <= 10) {
    parts.push(`${toArabicDigits(minutes)} دقائق`);
  } else if (minutes > 10) {
    parts.push(`${toArabicDigits(minutes)} دقيقة`);
  }

  if (parts.length === 0) return 'أقل من دقيقة';
  return parts.join(' و ');
}
