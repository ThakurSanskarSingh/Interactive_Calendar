"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalendarRange } from "@/hooks/useCalendarRange";
import { useNotes } from "@/hooks/useNotes";
import { getRangeLabel, getRangeDayCount } from "@/lib/range";
import { StickyNoteCard } from "./StickyNoteCard";
import { AddNoteButton } from "./AddNoteButton";
import { MiniHeatmap } from "@/components/calendar/MiniHeatmap";

export function NotesPanel() {
  const { selectedRange, hasSelection, isSingleDay, clearRange } =
    useCalendarRange();
  const { notes, add, remove, update } = useNotes(selectedRange);

  const rangeLabel = getRangeLabel(selectedRange);
  const dayCount = getRangeDayCount(selectedRange);
  const showDayCount = !isSingleDay && dayCount > 1;

  return (
    <div className="flex flex-col h-full min-h-[400px] p-5">
      {/* ── Panel Header ─────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-[11px] font-body font-semibold text-cal-text-muted uppercase tracking-widest mb-1">
          Notes
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {hasSelection ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-start justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-semibold text-cal-text leading-tight">
                  {rangeLabel}
                </h2>
                {showDayCount && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-body font-semibold text-cal-primary bg-cal-soft rounded-full">
                    {dayCount} days
                  </span>
                )}
              </div>

              {/* Clear selection button */}
              <button
                onClick={clearRange}
                aria-label="Clear selection"
                className="mt-0.5 w-6 h-6 flex items-center justify-center rounded-full text-cal-text-muted hover:text-cal-text hover:bg-cal-soft transition-colors duration-150 flex-shrink-0 cursor-pointer"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 2l6 6M8 2l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-display text-lg font-medium text-cal-text-muted italic">
                Select a date
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Notes content area ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {!hasSelection ? (
            /* No-selection empty state */
            <motion.div
              key="no-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center py-12 px-4 text-center"
            >
              {/* Calendar icon illustration */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--cal-soft-muted)" }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="22"
                    height="20"
                    rx="3"
                    stroke="var(--cal-primary)"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.4"
                  />
                  <path
                    d="M3 11h22"
                    stroke="var(--cal-primary)"
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                  <rect
                    x="8"
                    y="3"
                    width="2"
                    height="4"
                    rx="1"
                    fill="var(--cal-primary)"
                    opacity="0.5"
                  />
                  <rect
                    x="18"
                    y="3"
                    width="2"
                    height="4"
                    rx="1"
                    fill="var(--cal-primary)"
                    opacity="0.5"
                  />
                  <rect
                    x="8"
                    y="15"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="var(--cal-primary)"
                    opacity="0.3"
                  />
                  <rect
                    x="13"
                    y="15"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="var(--cal-primary)"
                    opacity="0.3"
                  />
                  <rect
                    x="18"
                    y="15"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="var(--cal-primary)"
                    opacity="0.3"
                  />
                </svg>
              </div>
              <p className="text-sm font-body font-medium text-cal-text-muted leading-relaxed max-w-[160px]">
                Click a date or drag to select a range
              </p>
            </motion.div>
          ) : (
            /* Selected state — notes list */
            <motion.div
              key="notes-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {notes.length === 0 ? (
                /* Selected but no notes yet */
                <div className="py-8 text-center">
                  <p className="text-sm font-body text-cal-text-muted/70 italic">
                    No notes yet for this {isSingleDay ? "day" : "range"}
                  </p>
                </div>
              ) : (
                /* Notes list */
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {notes.map((note) => (
                      <StickyNoteCard
                        key={note.id}
                        note={note}
                        onRemove={remove}
                        onUpdate={update}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Add note form */}
              <AddNoteButton onAdd={add} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mini Heatmap ─────────────────────────────────────────────── */}
      <MiniHeatmap />
    </div>
  );
}
