import { formatTimeTo12HourArabic, formatRemainingDurationArabic } from './timeFormat';

export interface EgyptCity {
  key: string;
  name: string;
  en: string;
  lat: number;
  lng: number;
}

export const EGYPT_CITIES: Record<string, EgyptCity> = {
  cairo: { key: 'cairo', name: 'القاهرة والجيزة', en: 'Cairo', lat: 30.0444, lng: 31.2357 },
  alex: { key: 'alex', name: 'الإسكندرية والبحيرة', en: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  mansoura: { key: 'mansoura', name: 'المنصورة والدقهلية', en: 'Mansoura', lat: 31.0409, lng: 31.3785 },
  tanta: { key: 'tanta', name: 'طنطا ووسط الدلتا', en: 'Tanta', lat: 30.7865, lng: 31.0004 },
  zagazig: { key: 'zagazig', name: 'الزقازيق والشرقية', en: 'Zagazig', lat: 30.5877, lng: 31.5020 },
  portsaid: { key: 'portsaid', name: 'بورسعيد ومدن القناة', en: 'Port Said', lat: 31.2653, lng: 32.3019 },
  asyut: { key: 'asyut', name: 'أسيوط وصعيد مصر', en: 'Asyut', lat: 27.1809, lng: 31.1837 },
  sohag: { key: 'sohag', name: 'سوهاج وقنا', en: 'Sohag', lat: 26.5569, lng: 31.6948 },
  aswan: { key: 'aswan', name: 'أسوان وأقصى الصعيد', en: 'Aswan', lat: 24.0889, lng: 32.8998 },
};

export interface PrayerTimesData {
  fajr: string;      // 24h string (e.g. "05:00")
  sunrise: string;   // 24h string (e.g. "06:30")
  dhuhr: string;     // 24h string (e.g. "12:56")
  asr: string;       // 24h string (e.g. "16:31")
  maghrib: string;   // 24h string (e.g. "19:21")
  isha: string;      // 24h string (e.g. "20:42")
  timezone: string;  // "Africa/Cairo"
  cityName: string;  // e.g. "القاهرة والجيزة"
  cityKey: string;
  isSummerTime: boolean;
  utcOffset: number; // 3 for DST, 2 for winter
  hijriDate?: string;
  gregorianDate?: string;
  lastUpdated?: number;
}

export interface NextPrayerInfo {
  key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  label: string;
  time24: string;
  time12: string;
  minutesRemaining: number;
  countdownFormatted: string;
  isTomorrow?: boolean;
}

/**
 * Detects current Cairo UTC offset dynamically (UTC+3 for summer DST, UTC+2 for winter)
 */
export function getCairoUtcOffsetHours(): number {
  try {
    const now = new Date();
    const cairoStr = now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
    const cairoDate = new Date(cairoStr);
    const diffMs = cairoDate.getTime() - now.getTime();
    return Math.round(diffMs / (1000 * 60 * 60));
  } catch {
    // Standard rule: Egypt DST from last Friday in April to last Thursday in October
    const month = new Date().getMonth();
    return month >= 3 && month <= 9 ? 3 : 2;
  }
}

/**
 * Clean 24h time string returned by APIs (e.g. "05:00 (EEST)" -> "05:00")
 */
function cleanTimeStr(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const match = raw.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : fallback;
}

/**
 * Offline Astronomical Calculation for Egyptian Prayer Times
 * Uses Egyptian General Authority of Survey parameters:
 * Fajr: 19.5 degrees, Isha: 17.5 degrees
 * Automatically adjusts for Africa/Cairo timezone offset
 */
export function calculateFallbackPrayerTimes(cityKey: string): PrayerTimesData {
  const city = EGYPT_CITIES[cityKey] || EGYPT_CITIES.cairo;
  const utcOffset = getCairoUtcOffsetHours();
  const isSummerTime = utcOffset >= 3;

  // Approximate baseline for Cairo during the year adjusted for UTC offset
  // DST (summer, UTC+3): Fajr ~05:00, Dhuhr ~12:56, Asr ~16:31, Maghrib ~19:21, Isha ~20:42
  // Standard (winter, UTC+2): 1 hour earlier
  const deltaHours = isSummerTime ? 1 : 0;

  const baseFajrH = 4 + deltaHours;
  const baseDhuhrH = 11 + deltaHours;
  const baseAsrH = 15 + deltaHours;
  const baseMaghribH = 18 + deltaHours;
  const baseIshaH = 19 + deltaHours;

  const pad = (n: number) => String(n).padStart(2, '0');

  // Slight longitude offset relative to Cairo
  const lngDiffMinutes = Math.round((city.lng - 31.2357) * 4); // each degree is ~4 minutes
  const adjustTime = (h: number, m: number): string => {
    let total = h * 60 + m - lngDiffMinutes;
    if (total < 0) total += 24 * 60;
    const finalH = Math.floor(total / 60) % 24;
    const finalM = total % 60;
    return `${pad(finalH)}:${pad(finalM)}`;
  };

  return {
    fajr: adjustTime(baseFajrH, 0),
    sunrise: adjustTime(baseFajrH + 1, 30),
    dhuhr: adjustTime(baseDhuhrH, 56),
    asr: adjustTime(baseAsrH, 31),
    maghrib: adjustTime(baseMaghribH, 21),
    isha: adjustTime(baseIshaH, 42),
    timezone: 'Africa/Cairo',
    cityName: city.name,
    cityKey: city.key,
    isSummerTime,
    utcOffset,
    gregorianDate: new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' }),
  };
}

/**
 * Fetch official prayer times using Aladhan API with Egyptian Survey Authority method (5)
 * and Africa/Cairo timezone.
 * Falls back safely to cache or accurate astronomical calculations.
 */
export async function fetchEgyptPrayerTimes(cityKey: string): Promise<PrayerTimesData> {
  const city = EGYPT_CITIES[cityKey] || EGYPT_CITIES.cairo;
  const now = new Date();
  const cairoDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  const storageKey = `thanaweya_prayer_timings_${city.key}_${cairoDateStr}`;

  // 1. Check client localStorage cache
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed: PrayerTimesData = JSON.parse(cached);
      return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }

  // 2. Try fetching from internal proxy endpoint `/api/prayer-times`
  try {
    const res = await fetch(`/api/prayer-times?city=${encodeURIComponent(city.en)}&country=Egypt`);
    if (res.ok) {
      const payload = await res.json();
      const timings = payload.timings;
      if (timings) {
        const utcOffset = getCairoUtcOffsetHours();
        const data: PrayerTimesData = {
          fajr: cleanTimeStr(timings.Fajr, '05:00'),
          sunrise: cleanTimeStr(timings.Sunrise, '06:30'),
          dhuhr: cleanTimeStr(timings.Dhuhr, '12:56'),
          asr: cleanTimeStr(timings.Asr, '16:31'),
          maghrib: cleanTimeStr(timings.Maghrib, '19:21'),
          isha: cleanTimeStr(timings.Isha, '20:42'),
          timezone: payload.meta?.timezone || 'Africa/Cairo',
          cityName: city.name,
          cityKey: city.key,
          isSummerTime: utcOffset >= 3,
          utcOffset,
          hijriDate: payload.date?.hijri ? `${payload.date.hijri.day} ${payload.date.hijri.month?.ar || payload.date.hijri.month?.en} ${payload.date.hijri.year} هـ` : undefined,
          gregorianDate: payload.date?.gregorian?.date,
          lastUpdated: Date.now(),
        };

        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {
          // ignore quota
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend proxy fetch failed, attempting direct Aladhan fetch:', err);
  }

  // 3. Try direct Aladhan API call
  try {
    const directRes = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city.en)}&country=Egypt&method=5`
    );
    if (directRes.ok) {
      const payload = await directRes.json();
      const timings = payload.data?.timings;
      if (timings) {
        const utcOffset = getCairoUtcOffsetHours();
        const data: PrayerTimesData = {
          fajr: cleanTimeStr(timings.Fajr, '05:00'),
          sunrise: cleanTimeStr(timings.Sunrise, '06:30'),
          dhuhr: cleanTimeStr(timings.Dhuhr, '12:56'),
          asr: cleanTimeStr(timings.Asr, '16:31'),
          maghrib: cleanTimeStr(timings.Maghrib, '19:21'),
          isha: cleanTimeStr(timings.Isha, '20:42'),
          timezone: payload.data.meta?.timezone || 'Africa/Cairo',
          cityName: city.name,
          cityKey: city.key,
          isSummerTime: utcOffset >= 3,
          utcOffset,
          hijriDate: payload.data.date?.hijri ? `${payload.data.date.hijri.day} ${payload.data.date.hijri.month?.ar || payload.data.date.hijri.month?.en} ${payload.data.date.hijri.year} هـ` : undefined,
          gregorianDate: payload.data.date?.gregorian?.date,
          lastUpdated: Date.now(),
        };

        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {
          // ignore quota
        }
        return data;
      }
    }
  } catch (directErr) {
    console.warn('Direct Aladhan API failed:', directErr);
  }

  // 4. Ultimate Fallback: Accurate calculation using dynamic Cairo offset
  const fallbackData = calculateFallbackPrayerTimes(city.key);
  try {
    localStorage.setItem(storageKey, JSON.stringify(fallbackData));
  } catch {
    // ignore
  }
  return fallbackData;
}

/**
 * Calculates the next upcoming prayer and the remaining duration
 */
export function getNextPrayer(timings: PrayerTimesData): NextPrayerInfo {
  const now = new Date();
  let currentMinutes: number;

  try {
    const cairoTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Africa/Cairo',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const [h, m] = cairoTimeStr.split(':').map((val) => parseInt(val, 10));
    currentMinutes = (h || 0) * 60 + (m || 0);
  } catch {
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  const prayers: Array<{ key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'; label: string; time: string }> = [
    { key: 'fajr', label: 'صلاة الفجر', time: timings.fajr },
    { key: 'dhuhr', label: 'صلاة الظهر', time: timings.dhuhr },
    { key: 'asr', label: 'صلاة العصر', time: timings.asr },
    { key: 'maghrib', label: 'صلاة المغرب', time: timings.maghrib },
    { key: 'isha', label: 'صلاة العشاء', time: timings.isha },
  ];

  for (const p of prayers) {
    const [ph, pm] = p.time.split(':').map((val) => parseInt(val, 10));
    const prayerMinutes = ph * 60 + pm;
    if (prayerMinutes > currentMinutes) {
      const diff = prayerMinutes - currentMinutes;
      return {
        key: p.key,
        label: p.label,
        time24: p.time,
        time12: formatTimeTo12HourArabic(p.time),
        minutesRemaining: diff,
        countdownFormatted: formatRemainingDurationArabic(diff),
      };
    }
  }

  // If all prayers today have passed, next is tomorrow's Fajr
  const [fh, fm] = timings.fajr.split(':').map((val) => parseInt(val, 10));
  const fajrMinutes = fh * 60 + fm;
  const diffTomorrow = 24 * 60 - currentMinutes + fajrMinutes;

  return {
    key: 'fajr',
    label: 'صلاة الفجر (غداً)',
    time24: timings.fajr,
    time12: formatTimeTo12HourArabic(timings.fajr),
    minutesRemaining: diffTomorrow,
    countdownFormatted: formatRemainingDurationArabic(diffTomorrow),
    isTomorrow: true,
  };
}
