"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/store/useCalendarStore";
import {
  getMonthName,
  getYear,
  nextMonth,
  prevMonth,
  isSameMonth,
} from "@/lib/date";

export function CalendarHeader() {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const setCurrentMonth = useCalendarStore((s) => s.setCurrentMonth);
  const navigationDirection = useCalendarStore((s) => s.navigationDirection);
  const isSelectingRange = useCalendarStore((s) => s.isSelectingRange);

  const goNext = useCallback(() => {
    setCurrentMonth(nextMonth(currentMonth));
  }, [currentMonth, setCurrentMonth]);

  const goPrev = useCallback(() => {
    setCurrentMonth(prevMonth(currentMonth));
  }, [currentMonth, setCurrentMonth]);

  const goToday = useCallback(() => {
    const today = new Date();
    if (!isSameMonth(currentMonth, today)) {
      setCurrentMonth(today);
    }
  }, [currentMonth, setCurrentMonth]);

  const isCurrentMonth = isSameMonth(currentMonth, new Date());
  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

  // Direction-aware slide variants for the month name text.
  // "forward" = new month is later → old name exits left, new enters right.
  // "backward" = new month is earlier → old name exits right, new enters left.
  const slideVariants = {
    enter: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? 28 : -28,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? -28 : 28,
      opacity: 0,
    }),
  };

  return (
    <div>
      {/* ── Main header row ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cal-border">
        {/* Month + Year */}
        <div className="relative flex items-baseline gap-2 min-w-0 overflow-hidden">
          <AnimatePresence
            mode="wait"
            custom={navigationDirection}
            initial={false}
          >
            <motion.span
              key={monthKey}
              custom={navigationDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="text-2xl font-display font-semibold text-cal-text leading-none tracking-tight whitespace-nowrap"
              style={{ display: "inline-block" }}
            >
              {getMonthName(currentMonth)}
            </motion.span>
          </AnimatePresence>
          <span className="text-base font-body text-cal-text-muted font-medium leading-none flex-shrink-0">
            {getYear(currentMonth)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <AnimatePresence>
            {!isCurrentMonth && (
              <motion.button
                key="today-btn"
                onClick={goToday}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.16 }}
                className="mr-1 px-3 py-1 text-xs font-body font-medium text-cal-primary bg-cal-primary-soft rounded-full border border-cal-primary/20 hover:bg-cal-primary hover:text-white transition-colors duration-150 cursor-pointer"
                aria-label="Jump to current month"
              >
                Today
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full text-cal-text-muted hover:text-cal-primary hover:bg-cal-soft transition-colors duration-150 cursor-pointer"
            aria-label="Previous month"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full text-cal-text-muted hover:text-cal-primary hover:bg-cal-soft transition-colors duration-150 cursor-pointer"
            aria-label="Next month"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Selection mode indicator ──────────────────────────────────── */}
      {/*
        Appears below the header bar when the user has clicked a start date
        and is waiting to click an end date. On mobile (no hover feedback),
        this is the primary indicator that a range selection is in progress.
      */}
      <AnimatePresence initial={false}>
        {isSelectingRange && (
          <motion.div
            key="selection-hint"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-cal-primary-soft border-b border-cal-primary/15">
              {/* Animated pulse dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cal-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cal-primary" />
              </span>
              <p className="text-xs font-body font-medium text-cal-primary">
                Click a second date to complete the range — or click the same
                date again
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
