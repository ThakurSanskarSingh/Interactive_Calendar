"use client";

import { useCallback } from "react";
import { isSameDay } from "date-fns";
import { useCalendarStore } from "@/store/useCalendarStore";
import { DateRange } from "@/types/calendar";
import { normalizeRange } from "@/lib/date";

/**
 * useCalendarRange
 *
 * Encapsulates the full date range selection state machine:
 *
 *   IDLE         → user clicks a day      → SELECTING (start set, end null)
 *   SELECTING    → user hovers a day      → preview range shown
 *   SELECTING    → user clicks same day   → IDLE (single-day selection)
 *   SELECTING    → user clicks other day  → IDLE (range finalized, normalized)
 *   ANY STATE    → clearRange()           → IDLE (full reset)
 *
 * The preview range is derived from selectedRange.start + hoverDate during
 * the SELECTING phase. Components should use getPreviewRange() to determine
 * what to highlight — it falls back gracefully to the finalized range when
 * not in selection mode.
 *
 * All state lives in the Zustand store so it is accessible from any component
 * without prop drilling (e.g., DayCell, NotesPanel, MiniHeatmap all read it).
 */
export function useCalendarRange() {
  const {
    selectedRange,
    hoverDate,
    isSelectingRange,
    setSelectedRange,
    setHoverDate,
    setIsSelectingRange,
    clearRange,
  } = useCalendarStore();

  // ---------------------------------------------------------------------------
  // handleDayClick
  // Called by DayCell on pointer-up (or click). Drives the state machine.
  // ---------------------------------------------------------------------------
  const handleDayClick = useCallback(
    (date: Date) => {
      if (!isSelectingRange) {
        // ── IDLE → SELECTING ────────────────────────────────────────────────
        // First click: anchor the start date and enter selection mode.
        // We intentionally leave `end` null so NotesPanel knows we haven't
        // finalized yet, and DayCell shows only the start highlight.
        setSelectedRange({ start: date, end: null });
        setIsSelectingRange(true);
      } else {
        // ── SELECTING → IDLE ─────────────────────────────────────────────────
        const { start } = selectedRange;

        if (start && isSameDay(date, start)) {
          // Clicked the same start date again → collapse to single-day selection.
          // This is a natural tap-to-confirm gesture on mobile.
          setSelectedRange({ start: date, end: date });
        } else {
          // Clicked a different date → finalize the range.
          // normalizeRange ensures start is always ≤ end regardless of drag
          // direction (backward selection is fully supported).
          const normalized = normalizeRange(start, date);
          setSelectedRange(normalized);
        }

        setIsSelectingRange(false);
        setHoverDate(null);
      }
    },
    [
      isSelectingRange,
      selectedRange,
      setSelectedRange,
      setIsSelectingRange,
      setHoverDate,
    ]
  );

  // ---------------------------------------------------------------------------
  // handleDayHover
  // Called by DayCell on pointer-enter/move. Only has effect during SELECTING.
  // We avoid updating state when not selecting to prevent unnecessary renders
  // across the entire calendar grid.
  // ---------------------------------------------------------------------------
  const handleDayHover = useCallback(
    (date: Date | null) => {
      if (isSelectingRange) {
        setHoverDate(date);
      }
    },
    [isSelectingRange, setHoverDate]
  );

  // ---------------------------------------------------------------------------
  // handleDayLeave
  // Called by DayCell on pointer-leave. Clears the hover preview.
  // Kept as a separate handler (rather than passing null to handleDayHover)
  // so callers are explicit about their intent.
  // ---------------------------------------------------------------------------
  const handleDayLeave = useCallback(() => {
    if (isSelectingRange) {
      setHoverDate(null);
    }
  }, [isSelectingRange, setHoverDate]);

  // ---------------------------------------------------------------------------
  // getPreviewRange
  // Returns the range that should be visually highlighted in the calendar grid.
  //
  // During SELECTING:
  //   → Returns { start, end: hoverDate } (normalized), giving a live preview
  //     of what the range will look like if the user confirms here.
  //
  // During IDLE:
  //   → Returns the finalized selectedRange unchanged.
  //
  // This is the single source of truth for what DayCell and RangeHighlight
  // should render — components don't need to replicate this logic.
  // ---------------------------------------------------------------------------
  const getPreviewRange = useCallback((): DateRange => {
    if (!isSelectingRange || !selectedRange.start) {
      return selectedRange;
    }

    if (!hoverDate) {
      // No hover yet — show only the anchored start date
      return { start: selectedRange.start, end: null };
    }

    // Normalize so the preview always renders left-to-right even when the
    // user is hovering to the left of the anchor (backward drag).
    return normalizeRange(selectedRange.start, hoverDate);
  }, [isSelectingRange, selectedRange, hoverDate]);

  // ---------------------------------------------------------------------------
  // Derived convenience flags
  // Components that just need a quick boolean don't have to recompute these.
  // ---------------------------------------------------------------------------

  /** True when a start date has been anchored but the range is not finalized */
  const isPendingEnd = isSelectingRange && selectedRange.start !== null;

  /** True when a complete range (or single-day) selection exists */
  const hasSelection =
    !isSelectingRange &&
    selectedRange.start !== null &&
    selectedRange.end !== null;

  /** True when the selection is exactly one day */
  const isSingleDay =
    hasSelection &&
    selectedRange.start !== null &&
    selectedRange.end !== null &&
    isSameDay(selectedRange.start, selectedRange.end);

  return {
    // Raw state
    selectedRange,
    hoverDate,
    isSelectingRange,

    // Derived state
    isPendingEnd,
    hasSelection,
    isSingleDay,

    // Actions
    handleDayClick,
    handleDayHover,
    handleDayLeave,
    clearRange,

    // Range resolution
    getPreviewRange,
  };
}
