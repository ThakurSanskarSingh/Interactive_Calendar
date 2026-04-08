"use client";

import { useCallback, memo } from "react";
import { useCalendarStore } from "@/store/useCalendarStore";
import { useCalendarRange } from "@/hooks/useCalendarRange";
import {
  formatDateKey,
  isDateInRange,
  isRangeStart,
  isRangeEnd,
  isSameDay,
  isSameMonth,
  isToday,
  format,
} from "@/lib/date";
import { getHoliday, getHolidayTypeColor } from "@/lib/holidays";
import { cn } from "@/lib/utils";

interface DayCellProps {
  date: Date;
  currentMonth: Date;
}

export const DayCell = memo(function DayCell({
  date,
  currentMonth,
}: DayCellProps) {
  const {
    handleDayClick,
    handleDayHover,
    handleDayLeave,
    getPreviewRange,
    isSelectingRange,
  } = useCalendarRange();

  const setCurrentMonth = useCalendarStore((s) => s.setCurrentMonth);
  const notes = useCalendarStore((s) => s.notes);

  // ── Resolve the preview range (live during hover, finalized when idle) ──
  const previewRange = getPreviewRange();
  const { start, end } = previewRange;

  // ── Derived date state ──────────────────────────────────────────────────
  const isOutOfMonth = !isSameMonth(date, currentMonth);
  const isTodayDate = isToday(date);
  const dayKey = formatDateKey(date);
  const hasNotes = (notes[dayKey] ?? []).length > 0;

  // ── Range membership ────────────────────────────────────────────────────
  const isStart = isRangeStart(date, start, end);
  const isEnd = isRangeEnd(date, start, end);
  // isInRange is true only for days strictly BETWEEN start and end
  const isInRange = !isStart && !isEnd && isDateInRange(date, start, end);
  // Single-day: start === end (user clicked same day twice, or tapped to confirm)
  const isSingleDay = !!(start && end && isSameDay(start, end) && isStart);
  const isSelected = isStart || isEnd;

  // ── Holiday ─────────────────────────────────────────────────────────────
  // Keep as HolidayEntry | null — use truthiness checks for TS narrowing
  const holiday = getHoliday(date);

  // ── Computed display values ─────────────────────────────────────────────
  const dayNumber = format(date, "d");

  const ariaLabel = [
    format(date, "EEEE, MMMM d, yyyy"),
    // Use truthiness — TS narrows holiday to HolidayEntry inside ternary
    holiday ? `— ${holiday.name}` : "",
    hasNotes ? "— has notes" : "",
    isTodayDate ? "(today)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // ── Event handlers ───────────────────────────────────────────────────────
  // Out-of-month click navigates to that month instead of selecting
  const handleClick = useCallback(() => {
    if (isOutOfMonth) {
      setCurrentMonth(date);
      return;
    }
    handleDayClick(date);
  }, [date, isOutOfMonth, setCurrentMonth, handleDayClick]);

  const handlePointerEnter = useCallback(() => {
    handleDayHover(date);
  }, [date, handleDayHover]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <div
      data-date={dayKey}
      className="relative flex items-center justify-center h-11 select-none"
      style={{ touchAction: "manipulation" }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handleDayLeave}
    >
      {/* ── Range background layer ─────────────────────────────────────────
          These absolutely-positioned divs sit behind the circle button.
          They create the continuous horizontal strip that visually connects
          adjacent selected cells. inset-y-1 gives a 4px vertical margin so
          the strip doesn't bleed to the cell edge (looks cleaner).
      ─────────────────────────────────────────────────────────────────── */}

      {/* Full-width strip for days strictly inside the range */}
      {isInRange && (
        <div
          className="absolute inset-y-1 inset-x-0 bg-cal-range pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Right-half strip on the start cell — bridges to the next day */}
      {isStart && !isSingleDay && end && (
        <div
          className="absolute inset-y-1 left-1/2 right-0 bg-cal-range pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Left-half strip on the end cell — bridges from the previous day */}
      {isEnd && !isSingleDay && (
        <div
          className="absolute inset-y-1 right-1/2 left-0 bg-cal-range pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* ── Date number button ─────────────────────────────────────────────
          A circular button that sits on top of the range background layer.
          z-10 ensures it's always above the strip divs above.
      ─────────────────────────────────────────────────────────────────── */}
      <button
        tabIndex={isOutOfMonth ? -1 : 0}
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        // title provides a native tooltip with the full holiday name on hover
        title={holiday ? holiday.name : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // ── Base layout — always a circle ──
          "relative z-10 w-9 h-9 flex items-center justify-center rounded-full",
          "text-sm font-body leading-none transition-all duration-150",
          // Focus ring — uses outline-none to suppress browser default, then
          // applies our on-brand ring via ring utilities
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-cal-primary focus-visible:ring-offset-1",

          // ── Default in-month day ──
          !isSelected &&
            !isInRange &&
            !isOutOfMonth && [
              "cursor-pointer text-cal-text",
              "hover:bg-cal-soft hover:text-cal-primary",
            ],

          // ── Today (when not selected) — ring around the circle ──
          isTodayDate &&
            !isSelected && [
              "ring-2 ring-cal-primary ring-offset-1",
              "text-cal-primary font-semibold",
            ],

          // ── In-range day — inherits strip background, normal text ──
          isInRange && [
            "cursor-pointer text-cal-text font-medium",
            "hover:bg-cal-soft/60",
          ],

          // ── Selected start or end — filled primary circle ──
          isSelected && [
            "cursor-pointer bg-cal-primary text-white font-semibold",
            "shadow-[0_2px_8px_rgba(40,114,161,0.30)]",
            "hover:bg-cal-primary-hover",
          ],

          // ── Out-of-month — very faded, navigates on click ──
          isOutOfMonth && [
            "cursor-pointer text-cal-text-muted/35",
            "hover:bg-cal-soft/40 hover:text-cal-text-muted/50",
          ],

          // ── Crosshair cursor while actively selecting a range ──
          isSelectingRange && !isOutOfMonth && "cursor-crosshair",
        )}
      >
        {dayNumber}
      </button>

      {/* ── Note indicator ─────────────────────────────────────────────────
          A small dot anchored to the bottom of the 44px cell (just below
          the 36px circle). Priority: notes > holidays — if a day has notes,
          we show the note dot; the holiday dot is suppressed to avoid clutter.
          On selected days the dot flips to white/70 so it reads against the
          primary fill.
      ─────────────────────────────────────────────────────────────────── */}
      {hasNotes && !isOutOfMonth && (
        <span
          className={cn(
            "absolute bottom-0.5 left-1/2 -translate-x-1/2",
            "w-[5px] h-[5px] rounded-full pointer-events-none",
            isSelected ? "bg-white/70" : "bg-cal-primary",
          )}
          aria-hidden="true"
        />
      )}

      {/* ── Holiday marker ─────────────────────────────────────────────────
          Shown only when no note dot is already occupying the bottom space.
          Color comes from getHolidayTypeColor — federal/observance/seasonal
          each have their own hue. Slightly transparent so it's tasteful.
          Hover tooltip (holiday name) is on the parent <button> via `title`.
      ─────────────────────────────────────────────────────────────────── */}
      {holiday && !isOutOfMonth && !hasNotes && (
        <span
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full pointer-events-none"
          style={{
            backgroundColor: getHolidayTypeColor(holiday.type),
            opacity: 0.75,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
});
