import { HolidayEntry } from "@/types/calendar";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Static holiday data — keyed by "MM-DD" for recurring annual holidays.
// For floating holidays (e.g. Thanksgiving = 4th Thursday of November),
// we approximate with a fixed date and note the approximation.
// Phase 4 can replace these with a proper floating-date calculator if needed.
// ---------------------------------------------------------------------------

const HOLIDAYS: HolidayEntry[] = [
  // January
  { name: "New Year's Day", date: "01-01", type: "federal" },
  { name: "Martin Luther King Jr. Day", date: "01-20", type: "federal" }, // 3rd Monday approx

  // February
  { name: "Valentine's Day", date: "02-14", type: "observance" },
  { name: "Presidents' Day", date: "02-17", type: "federal" }, // 3rd Monday approx

  // March
  { name: "St. Patrick's Day", date: "03-17", type: "observance" },
  { name: "First Day of Spring", date: "03-20", type: "seasonal" },

  // April
  { name: "Earth Day", date: "04-22", type: "observance" },

  // May
  { name: "Mother's Day", date: "05-11", type: "observance" }, // 2nd Sunday approx
  { name: "Armed Forces Day", date: "05-17", type: "observance" },
  { name: "Memorial Day", date: "05-26", type: "federal" }, // last Monday approx
  { name: "First Day of Summer", date: "06-21", type: "seasonal" },

  // June
  { name: "Father's Day", date: "06-15", type: "observance" }, // 3rd Sunday approx
  { name: "Juneteenth", date: "06-19", type: "federal" },

  // July
  { name: "Independence Day", date: "07-04", type: "federal" },

  // August
  // (no major federal holidays)

  // September
  { name: "Labor Day", date: "09-01", type: "federal" }, // 1st Monday approx
  { name: "First Day of Autumn", date: "09-22", type: "seasonal" },

  // October
  { name: "Columbus Day", date: "10-13", type: "federal" }, // 2nd Monday approx
  { name: "Halloween", date: "10-31", type: "observance" },

  // November
  { name: "Veterans Day", date: "11-11", type: "federal" },
  { name: "Thanksgiving", date: "11-27", type: "federal" }, // 4th Thursday approx
  { name: "Black Friday", date: "11-28", type: "observance" },

  // December
  { name: "First Day of Winter", date: "12-21", type: "seasonal" },
  { name: "Christmas Eve", date: "12-24", type: "observance" },
  { name: "Christmas Day", date: "12-25", type: "federal" },
  { name: "Kwanzaa", date: "12-26", type: "observance" },
  { name: "New Year's Eve", date: "12-31", type: "observance" },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get holiday info for a given date, if any exists.
 * Matches by "MM-DD" to support any year.
 */
export function getHoliday(date: Date): HolidayEntry | null {
  const key = format(date, "MM-dd");
  return HOLIDAYS.find((h) => h.date === key) ?? null;
}

/**
 * Check if a given date falls on a holiday.
 */
export function isHoliday(date: Date): boolean {
  return getHoliday(date) !== null;
}

/**
 * Get all holidays for a given month number (1–12).
 */
export function getHolidaysForMonth(month: number): HolidayEntry[] {
  const monthStr = String(month).padStart(2, "0");
  return HOLIDAYS.filter((h) => h.date.startsWith(monthStr));
}

/**
 * Get a map of "MM-DD" → HolidayEntry for quick lookups in the calendar grid.
 * Useful to avoid O(n) scans per day cell during render.
 */
export function getHolidayMap(): Record<string, HolidayEntry> {
  return HOLIDAYS.reduce<Record<string, HolidayEntry>>((acc, holiday) => {
    acc[holiday.date] = holiday;
    return acc;
  }, {});
}

/**
 * Returns a short badge label for display inside a day cell.
 * Truncates long names to keep the calendar clean.
 */
export function getHolidayShortName(entry: HolidayEntry): string {
  const shortNames: Record<string, string> = {
    "New Year's Day": "New Year",
    "Martin Luther King Jr. Day": "MLK Day",
    "Valentine's Day": "Valentine's",
    "Presidents' Day": "Presidents'",
    "St. Patrick's Day": "St. Patrick's",
    "First Day of Spring": "Spring",
    "Mother's Day": "Mother's Day",
    "Armed Forces Day": "Armed Forces",
    "Memorial Day": "Memorial",
    "First Day of Summer": "Summer",
    "Father's Day": "Father's Day",
    "Independence Day": "July 4th",
    "Labor Day": "Labor Day",
    "First Day of Autumn": "Autumn",
    "Columbus Day": "Columbus",
    "Thanksgiving": "Thanksgiving",
    "Black Friday": "Black Friday",
    "First Day of Winter": "Winter",
    "Christmas Eve": "Christmas Eve",
    "Christmas Day": "Christmas",
    "New Year's Eve": "New Year's Eve",
  };
  return shortNames[entry.name] ?? entry.name;
}

/**
 * Get the accent color class for a holiday type.
 * Used to tint the holiday marker dot in DayCell.
 */
export function getHolidayTypeColor(type: HolidayEntry["type"]): string {
  const map: Record<HolidayEntry["type"], string> = {
    federal: "#2872A1",     // brand primary — important federal days
    observance: "#7BA7C4",  // softer blue — cultural observances
    seasonal: "#5A9E6F",    // green — seasonal markers
  };
  return map[type];
}
