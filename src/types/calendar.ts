export type DateRange = {
  start: Date | null;
  end: Date | null;
};

export type DayCellState =
  | "default"
  | "today"
  | "hover"
  | "selected-start"
  | "selected-end"
  | "in-range"
  | "out-of-month"
  | "disabled";

export type DayCellMeta = {
  date: Date;
  state: DayCellState;
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isToday: boolean;
  isHovered: boolean;
  isSingleDay: boolean;
  isOutOfMonth: boolean;
  hasNotes: boolean;
  isHoliday: boolean;
  holidayName?: string;
};

export type HolidayEntry = {
  name: string;
  date: string; // "MM-DD" format for recurring, or "YYYY-MM-DD" for specific year
  type: "federal" | "observance" | "seasonal";
};

export type SeasonalImage = {
  month: number; // 1-12
  src: string;
  alt: string;
  credit?: string;
};

export type ThemePalette = {
  primary: string;
  soft: string;
  text: string;
};
