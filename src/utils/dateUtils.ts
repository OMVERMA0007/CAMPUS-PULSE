import { format, parseISO, isToday, isTomorrow, isPast, differenceInHours, differenceInMinutes, parse, isValid } from 'date-fns';
import { PriorityLevel } from '../types';

/**
 * Returns today's formatted date string (YYYY-MM-DD).
 */
export function getTodayDateString(): string {
  const now = new Date();
  return format(now, 'yyyy-MM-dd');
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into a human friendly format
 * e.g. "Tomorrow, Nov 1", "Today", "Sat, Nov 15, 2026", or "Not specified"
 */
export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr || dateStr === 'Not specified') {
    return 'Not specified';
  }

  try {
    const cleaned = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const d = parseISO(cleaned);
    if (!isValid(d)) return dateStr;

    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEE, MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Formats deadline string for badges with relative urgency
 */
export function formatDeadlineDisplay(deadlineStr?: string | null): { text: string; isUrgent: boolean; isExpired: boolean } {
  if (!deadlineStr || deadlineStr === 'Not specified') {
    return { text: 'No deadline', isUrgent: false, isExpired: false };
  }

  try {
    const d = parseISO(deadlineStr.includes('T') ? deadlineStr : `${deadlineStr}T23:59:59`);
    if (!isValid(d)) return { text: deadlineStr, isUrgent: false, isExpired: false };

    const now = new Date();
    if (d < now) {
      return { text: `Expired (${format(d, 'MMM d')})`, isUrgent: false, isExpired: true };
    }

    const hours = differenceInHours(d, now);
    if (hours < 24) {
      const mins = differenceInMinutes(d, now) % 60;
      return {
        text: `Closes in ${hours}h ${mins}m`,
        isUrgent: true,
        isExpired: false,
      };
    }

    if (hours < 48) {
      return { text: 'Closes tomorrow', isUrgent: true, isExpired: false };
    }

    return {
      text: `Deadline: ${format(d, 'MMM d, h:mm a')}`,
      isUrgent: false,
      isExpired: false,
    };
  } catch {
    return { text: deadlineStr, isUrgent: false, isExpired: false };
  }
}

/**
 * Calculates countdown details for an approaching deadline
 */
export function getCountdown(deadlineStr?: string | null): {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  if (!deadlineStr || deadlineStr === 'Not specified') {
    return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: 'None' };
  }

  try {
    const d = parseISO(deadlineStr.includes('T') ? deadlineStr : `${deadlineStr}T23:59:59`);
    if (!isValid(d)) {
      return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: 'Invalid' };
    }

    const diff = d.getTime() - Date.now();
    if (diff <= 0) {
      return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: 'Expired' };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (days > 0) formatted += `${days}d `;
    formatted += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

    return { totalSeconds, days, hours, minutes, seconds, isExpired: false, formatted };
  } catch {
    return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: 'Error' };
  }
}

/**
 * Computes dynamic priority based on event date and deadline proximity:
 * - URGENT: deadline within 24 hours or marked critical
 * - TODAY: event is happening today
 * - UPCOMING: event or deadline is in the future
 * - EXPIRED: both event and deadline have passed
 * - NORMAL: other notices
 */
export function computeDynamicPriority(notice: {
  date?: string;
  registrationDeadline?: string;
  priority?: PriorityLevel;
}): PriorityLevel {
  const now = new Date();

  // Check deadline first
  if (notice.registrationDeadline && notice.registrationDeadline !== 'Not specified') {
    try {
      const dl = parseISO(
        notice.registrationDeadline.includes('T')
          ? notice.registrationDeadline
          : `${notice.registrationDeadline}T23:59:59`
      );
      if (isValid(dl)) {
        if (dl > now) {
          const hoursUntilDeadline = differenceInHours(dl, now);
          if (hoursUntilDeadline <= 24) {
            return 'URGENT';
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Check event date
  if (notice.date && notice.date !== 'Not specified') {
    try {
      const d = parseISO(notice.date.includes('T') ? notice.date : `${notice.date}T00:00:00`);
      if (isValid(d)) {
        if (isToday(d)) {
          return 'TODAY';
        }
        if (d > now) {
          // If within 24 hours
          if (differenceInHours(d, now) <= 24) {
            return 'URGENT';
          }
          return 'UPCOMING';
        }
        if (isPast(d) && !isToday(d)) {
          // If deadline is also past or not specified
          return 'EXPIRED';
        }
      }
    } catch {
      // ignore
    }
  }

  return notice.priority || 'NORMAL';
}

