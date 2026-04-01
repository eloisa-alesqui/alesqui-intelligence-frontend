import { format, isToday, isYesterday, isThisWeek, isThisYear, parseISO } from 'date-fns';

/**
 * Formats a timestamp into a user-friendly, context-aware string,
 * mimicking the style of Google Chat.
 *
 * - Today: "15:45"
 * - Yesterday: "Yesterday 17:19"
 * - This week: "Thu 13:25"
 * - This year: "Sep 9, 8:47"
 * - Older: "Mar 5 2019, 8:32"
 *
 * @param date The Date object or a string representation of the date to format.
 * @returns A formatted, user-friendly date string in English.
 */
export const formatSmartTimestamp = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    // Format: 15:45
    return format(dateObj, 'HH:mm');
  }
  if (isYesterday(dateObj)) {
    // Format: Yesterday 17:19
    return `Yesterday ${format(dateObj, 'HH:mm')}`;
  }
  if (isThisWeek(dateObj, { weekStartsOn: 1 })) { // weekStartsOn: 1 for Monday
    // Format: Thu 13:25 (use 'eee' for the abbreviated day)
    return format(dateObj, 'eee HH:mm');
  }
  if (isThisYear(dateObj)) {
    // Format: Sep 9, 8:47 (use 'MMM d' for abbreviated month and day)
    return format(dateObj, 'MMM d, HH:mm');
  }
  
  // Format: Mar 5 2019, 8:32
  return format(dateObj, 'MMM d yyyy, HH:mm');
};