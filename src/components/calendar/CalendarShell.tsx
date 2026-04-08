"use client";

import { useEffect, useCallback } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { HeroImage } from "@/components/hero/HeroImage";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { useCalendarStore } from "@/store/useCalendarStore";

// ---------------------------------------------------------------------------
// CalendarBinding
// ---------------------------------------------------------------------------
// A narrow decorative strip rendered at the very top of the calendar card.
// The row of small circles suggests spiral wire binding — the physical detail
// that makes a wall calendar feel like a real hanging calendar rather than a
// generic date-picker UI.
//
// Design decisions:
//   • 10 evenly-spaced circles across the full card width
//   • Slight soft background tint (cal-soft at 40%) — distinct from the card
//     surface without being distracting
//   • Inset shadow on each hole gives the illusion of depth / punched paper
//   • h-7 (28px) — tall enough to read as a physical binding but short enough
//     not to compete with the hero image below it
// ---------------------------------------------------------------------------
function CalendarBinding() {
  return (
    <div
      className="h-7 flex-shrink-0 flex items-center justify-around px-5"
      style={{ backgroundColor: "var(--cal-soft)", opacity: 0.85 }}
      aria-hidden="true"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-[14px] h-[14px] rounded-full"
          style={{
            backgroundColor: "var(--cal-bg)",
            border: "1.5px solid var(--cal-border)",
            boxShadow:
              "inset 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalendarShell
// ---------------------------------------------------------------------------

/**
 * CalendarShell
 *
 * Root layout container. Responsibilities:
 *
 *   1. Two-column layout on desktop (calendar left | notes right).
 *      Single-column stacked layout on mobile (< lg breakpoint).
 *
 *   2. Wall calendar aesthetic — the left card begins with a `CalendarBinding`
 *      strip (spiral wire holes) so the UI reads as a physical hanging
 *      calendar, not just a date-picker widget.
 *
 *   3. Global Escape key handler — pressing Escape cancels an in-progress
 *      range selection and resets to idle state. Registered exactly once here
 *      rather than in a shared hook to avoid duplicate listeners.
 *
 *   4. Notes column: lg:w-80 / xl:w-[22rem]. The arbitrary value [22rem]
 *      is intentional — w-88 does not exist in Tailwind's default scale
 *      (the scale stops at w-80 = 320 px).
 */
export function CalendarShell() {
  const isSelectingRange = useCalendarStore((s) => s.isSelectingRange);
  const clearRange = useCalendarStore((s) => s.clearRange);

  // ── Escape to cancel range selection ──────────────────────────────────
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSelectingRange) {
        clearRange();
      }
    },
    [isSelectingRange, clearRange],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <main
      className="min-h-screen bg-cal-bg flex items-start justify-center p-4 sm:p-6 lg:p-8"
      // Announce range selection state changes to screen readers
      aria-live="polite"
      aria-atomic="false"
    >
      <div
        className="w-full max-w-5xl flex flex-col lg:flex-row gap-4 lg:gap-5"
        style={{ paddingTop: "clamp(16px, 3vw, 40px)" }}
      >
        {/* ── LEFT COLUMN: Calendar ──────────────────────────────────── */}
        <div
          className="flex-1 min-w-0 flex flex-col overflow-hidden bg-cal-surface rounded-3xl"
          style={{ boxShadow: "var(--shadow-cal-md)" }}
        >
          {/*
            Spiral binding strip — sits at the very top of the card, above
            the hero image. The parent card's overflow-hidden + rounded-3xl
            clips the top corners cleanly so no extra border-radius needed
            here. The HeroImage below no longer needs rounded-t-3xl for
            the same reason.
          */}
          <CalendarBinding />

          {/* Seasonal hero photo — crossfades on month change */}
          <HeroImage />

          {/* Month navigation + direction-aware slide + selection hint */}
          <CalendarHeader />

          {/* Date grid — page-flip animation on month change */}
          <div className="flex-1 p-4 sm:p-5">
            <CalendarGrid />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Notes ────────────────────────────────────── */}
        <div
          className="w-full lg:w-80 xl:w-[22rem] flex-shrink-0 flex flex-col bg-cal-surface rounded-3xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-cal-md)" }}
        >
          <NotesPanel />
        </div>
      </div>
    </main>
  );
}
