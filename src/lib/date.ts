import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  addMonths,
  subMonths,
} from "date-fns";

/** Format a date for use as a notes key: "YYYY-MM-DD" */
export function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Format a range as a notes key: "YYYY-MM-DD_YYYY-MM-DD" */
export function formatRangeKey(start: Date, end: Date): string {
  return `${formatDateKey(start)}_${formatDateKey(end)}`;
}

/** Get all days to render in a calendar month view (including leading/trailing days) */
export function getCalendarDays(month: Date): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: calStart, end: calEnd });
}

/** Get the display label for a month: "January 2025" */
export function getMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy");
}

/** Get short month name: "Jan" */
export function getShortMonthLabel(date: Date): string {
  return format(date, "MMM");
}

/** Get just the month name: "January" */
export function getMonthName(date: Date): string {
  return format(date, "MMMM");
}

/** Get just the year: "2025" */
export function getYear(date: Date): string {
  return format(date, "yyyy");
}

/** Navigate to next month */
export function nextMonth(date: Date): Date {
  return addMonths(date, 1);
}

/** Navigate to previous month */
export function prevMonth(date: Date): Date {
  return subMonths(date, 1);
}

/**
 * Check if a date is between start and end (inclusive).
 * Handles reversed ranges (start > end) gracefully.
 */
export function isDateInRange(
  date: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) return false;
  const rangeStart = start <= end ? start : end;
  const rangeEnd = start <= end ? end : start;
  return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
}

/** Check if date is the range start (order-normalized) */
export function isRangeStart(
  date: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start) return false;
  const rangeStart = end && start > end ? end : start;
  return isSameDay(date, rangeStart);
}

/** Check if date is the range end (order-normalized) */
export function isRangeEnd(
  date: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) return false;
  const rangeEnd = start > end ? start : end;
  return isSameDay(date, rangeEnd);
}

/** Get normalized range (always start <= end) */
export function normalizeRange(
  start: Date | null,
  end: Date | null,
): { start: Date | null; end: Date | null } {
  if (!start || !end) return { start, end };
  return start <= end ? { start, end } : { start: end, end: start };
}

/** Week day headers, starting Sunday */
export const WEEK_DAYS_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
export const WEEK_DAYS_NARROW = ["S", "M", "T", "W", "T", "F", "S"];

// Re-export date-fns primitives used across components
export { isSameDay, isSameMonth, isToday, format };

// Navigation helpers — used by CalendarGrid keyboard navigation
export { addDays, subDays } from "date-fns";
// ISO string parser — used for keyboard nav date reconstruction
export { parseISO } from "date-fns";
