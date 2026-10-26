/**
 * Deterministic timezone conversion using native Intl.DateTimeFormat.
 * Converts local wall-clock date and time in an IANA timezone into UTC timestamps,
 * and extracts localized components without any external runtime dependencies.
 */

export interface LocalDateInput {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export interface LocalTimeInput {
  hour: number;   // 0-23
  minute: number; // 0-59
  second?: number;// 0-59 (default 0)
}

export interface LocalizedDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timeDecimal: number;
  formattedDate: string; // YYYY-MM-DD
  formattedTime: string; // HH:mm
  ianaTimezone: string;
  tzOffsetMinutes: number; // minutes to add to UTC to get local time (e.g. -420 for PDT)
  utcIso: string;
}

/**
 * Validates whether an IANA timezone string is recognized by the runtime environment.
 */
export function isValidTimezone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts a local wall-clock date and time in an IANA timezone to a UTC Date.
 * Handles daylight saving transitions and variable offsets deterministically via iterative refinement.
 */
export function localToUtc(
  date: LocalDateInput,
  time: LocalTimeInput,
  ianaTimezone: string = 'UTC'
): Date {
  const hour = time.hour ?? 0;
  const minute = time.minute ?? 0;
  const second = time.second ?? 0;

  // Initial estimate in UTC
  let guessMs = Date.UTC(date.year, date.month - 1, date.day, hour, minute, second);

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });

  // Fast convergence (typically 1 or 2 iterations)
  for (let i = 0; i < 4; i++) {
    const parts = dtf.formatToParts(new Date(guessMs));
    let pYear = date.year;
    let pMonth = date.month;
    let pDay = date.day;
    let pHour = hour;
    let pMinute = minute;
    let pSecond = second;

    for (const part of parts) {
      const val = parseInt(part.value, 10);
      if (part.type === 'year') pYear = val;
      else if (part.type === 'month') pMonth = val;
      else if (part.type === 'day') pDay = val;
      else if (part.type === 'hour') pHour = val;
      else if (part.type === 'minute') pMinute = val;
      else if (part.type === 'second') pSecond = val;
    }

    const targetWallClockMs = Date.UTC(date.year, date.month - 1, date.day, hour, minute, second);
    const formattedWallClockMs = Date.UTC(pYear, pMonth - 1, pDay, pHour, pMinute, pSecond);
    const diff = formattedWallClockMs - targetWallClockMs;

    if (diff === 0) {
      break;
    }
    guessMs -= diff;
  }

  return new Date(guessMs);
}

/**
 * Decomposes a UTC Date or Unix millisecond timestamp into local components for an IANA timezone.
 */
export function utcToLocal(
  utcDateOrMs: Date | number,
  ianaTimezone: string = 'UTC'
): LocalizedDateTime {
  const date = typeof utcDateOrMs === 'number' ? new Date(utcDateOrMs) : utcDateOrMs;

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });

  const parts = dtf.formatToParts(date);
  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;

  for (const part of parts) {
    const val = parseInt(part.value, 10);
    if (part.type === 'year') year = val;
    else if (part.type === 'month') month = val;
    else if (part.type === 'day') day = val;
    else if (part.type === 'hour') hour = val;
    else if (part.type === 'minute') minute = val;
    else if (part.type === 'second') second = val;
  }

  // Calculate local time offset in minutes relative to UTC at this specific moment
  const localWallClockMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const tzOffsetMinutes = Math.round((localWallClockMs - date.getTime()) / 60000);

  const timeDecimal = hour + minute / 60 + second / 3600;
  const formattedDate = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    timeDecimal,
    formattedDate,
    formattedTime,
    ianaTimezone,
    tzOffsetMinutes,
    utcIso: date.toISOString(),
  };
}

/**
 * Returns the timezone offset in minutes at a given UTC moment.
 * Positive for timezones East of UTC (e.g. +60 for CET), negative for West (e.g. -480 for PST).
 */
export function getTimezoneOffsetMinutes(date: Date, ianaTimezone: string): number {
  return utcToLocal(date, ianaTimezone).tzOffsetMinutes;
}

/**
 * Formats a decimal hour (e.g. 14.5) into "14:30".
 */
export function formatDecimalTime(timeDecimal: number): string {
  const clamped = Math.max(0, Math.min(24, timeDecimal));
  const hours = Math.floor(clamped) % 24;
  const minutes = Math.floor((clamped - Math.floor(clamped)) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats minutes from midnight into "HH:mm". Returns null if minutes is null.
 */
export function formatMinutesToTime(totalMinutes: number | null): string | null {
  if (totalMinutes === null || Number.isNaN(totalMinutes)) {
    return null;
  }
  let normalized = Math.round(totalMinutes) % 1440;
  if (normalized < 0) normalized += 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Parses "HH:mm" string into hour and minute integers.
 */
export function parseTimeString(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(':');
  const hour = Math.max(0, Math.min(23, parseInt(parts[0] || '12', 10)));
  const minute = Math.max(0, Math.min(59, parseInt(parts[1] || '0', 10)));
  return { hour, minute };
}
