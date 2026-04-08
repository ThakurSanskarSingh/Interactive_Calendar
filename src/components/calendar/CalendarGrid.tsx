"use client";

import { useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/store/useCalendarStore";
import {
  getCalendarDays,
  WEEK_DAYS_SHORT,
  formatDateKey,
  addDays,
  subDays,
  parseISO,
} from "@/lib/date";
import { DayCell } from "./DayCell";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Page-flip animation variants
//
// The calendar grid animates like a physical wall calendar page:
//   forward: old page exits UP-and-out, new page enters from BELOW (natural
//            for "flipping to the next month")
//   backward: old page exits DOWN-and-out, new page enters from ABOVE
//
// The subtle rotateX gives a 3D "page tilting flat" feel without being gaudy.
// The perspective wrapper on the parent div makes the rotateX visible in 3D.
// ---------------------------------------------------------------------------
const pageFlipVariants = {
  enter: (dir: "forward" | "backward") => ({
    opacity: 0,
    y: dir === "forward" ? 20 : -20,
    rotateX: dir === "forward" ? -5 : 5,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
  },
  exit: (dir: "forward" | "backward") => ({
    opacity: 0,
    y: dir === "forward" ? -20 : 20,
    rotateX: dir === "forward" ? 5 : -5,
    scale: 0.98,
  }),
};

export function CalendarGrid() {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const navigationDirection = useCalendarStore((s) => s.navigationDirection);

  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

  // ── Keyboard navigation ───────────────────────────────────────────────────
  // Grid follows the ARIA "grid" keyboard pattern:
  //   Arrow keys move focus between day cells.
  //   Tab/Shift+Tab exits the grid normally.
  //   Enter/Space on a cell activates it (handled in DayCell).
  //
  // Implementation uses data-date attributes on each cell's wrapper div for
  // O(1) DOM lookups without maintaining a ref array.
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const ARROW_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (!ARROW_KEYS.includes(e.key)) return;

      e.preventDefault(); // prevent page scroll

      // Find which cell is currently focused
      const activeEl = document.activeElement as HTMLElement | null;
      const cellEl = activeEl?.closest<HTMLElement>("[data-date]");
      if (!cellEl) return;

      const dateStr = cellEl.dataset.date;
      if (!dateStr) return;

      const currentDate = parseISO(dateStr);

      // Compute the target date based on arrow direction
      let targetDate: Date;
      switch (e.key) {
        case "ArrowLeft":
          targetDate = subDays(currentDate, 1);
          break;
        case "ArrowRight":
          targetDate = addDays(currentDate, 1);
          break;
        case "ArrowUp":
          targetDate = subDays(currentDate, 7);
          break;
        case "ArrowDown":
          targetDate = addDays(currentDate, 7);
          break;
        default:
          return;
      }

      const targetKey = formatDateKey(targetDate);

      // Look up the button inside the target cell and focus it
      const targetBtn = gridRef.current?.querySelector<HTMLElement>(
        `[data-date="${targetKey}"] button`,
      );
      targetBtn?.focus();
    },
    [],
  );

  return (
    <div
      className="w-full"
      role="grid"
      aria-label={`Calendar grid for ${currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
      onKeyDown={handleKeyDown}
      ref={gridRef}
    >
      {/* ── Day-of-week headers — fixed, do not animate ─────────────────── */}
      <div className="grid grid-cols-7 mb-1" role="row">
        {WEEK_DAYS_SHORT.map((day, i) => (
          <div
            key={day}
            role="columnheader"
            aria-label={day}
            className={cn(
              "h-8 flex items-center justify-center",
              "text-[11px] font-body font-semibold tracking-widest uppercase",
              i === 0 || i === 6
                ? "text-cal-text-muted/50"
                : "text-cal-text-muted",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── Page-flip animation wrapper ─────────────────────────────────── */}
      {/*
        perspective: 1000px — makes the rotateX transform appear 3-dimensional.
        Without perspective, rotateX has no visual depth.
        overflow-hidden: clips any slight overflow during the animation.
      */}
      <div style={{ perspective: "1000px", overflow: "hidden" }}>
        <AnimatePresence
          mode="wait"
          custom={navigationDirection}
          initial={false}
        >
          <motion.div
            key={monthKey}
            custom={navigationDirection}
            variants={pageFlipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.28,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="grid grid-cols-7 gap-y-0.5"
            role="rowgroup"
            // transformOrigin: center — the page flips around its horizontal midline
            style={{ transformOrigin: "center center" }}
          >
            {days.map((date) => (
              <DayCell
                key={date.toISOString()}
                date={date}
                currentMonth={currentMonth}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
