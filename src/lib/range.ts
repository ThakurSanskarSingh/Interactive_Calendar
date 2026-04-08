import { isSameDay } from "date-fns";
import { DateRange } from "@/types/calendar";
import { formatDateKey, formatRangeKey, normalizeRange } from "./date";

/**
 * Get the notes map key for a given selected range.
 * Single day → "YYYY-MM-DD"
 * Range → "YYYY-MM-DD_YYYY-MM-DD" (always normalized start <= end)
 */
export function getNotesKey(range: DateRange): string | null {
  const { start, end } = range;
  if (!start) return null;
  if (!end || isSameDay(start, end)) return formatDateKey(start);
  const normalized = normalizeRange(start, end);
  return formatRangeKey(normalized.start!, normalized.end!);
}

/**
 * Check if the selected range is a single day (start === end or no end).
 */
export function isSingleDayRange(range: DateRange): boolean {
  const { start, end } = range;
  if (!start) return false;
  if (!end) return true;
  return isSameDay(start, end);
}

/**
 * Get a human-readable label for the selected range.
 * Examples:
 *   "Monday, January 6" (single day)
 *   "Jan 6 – Jan 12, 2025" (range)
 */
export function getRangeLabel(range: DateRange): string {
  const { start, end } = range;
  if (!start) return "No date selected";

  const { start: s, end: e } = normalizeRange(start, end);

  if (!e || isSameDay(s!, e)) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(s!);
  }

  // If same year, omit year from start label
  const sameYear = s!.getFullYear() === e.getFullYear();

  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(s!);

  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(e);

  return `${startLabel} – ${endLabel}`;
}

/**
 * Count the number of days in a range (inclusive).
 * Returns 1 for a single-day selection, 0 if no selection.
 */
export function getRangeDayCount(range: DateRange): number {
  const { start, end } = range;
  if (!start) return 0;
  if (!end || isSameDay(start, end)) return 1;
  const normalized = normalizeRange(start, end);
  const ms = normalized.end!.getTime() - normalized.start!.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}
