"use client";

import { useMemo } from "react";
import { useCalendarStore } from "@/store/useCalendarStore";
import { useCalendarRange } from "@/hooks/useCalendarRange";
import { getCalendarDays, formatDateKey, isSameMonth, format } from "@/lib/date";
import { useNotesMap } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";

export function MiniHeatmap() {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const notesMap = useNotesMap();
  const { handleDayClick } = useCalendarRange();

  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  // Only days belonging to the current month — used for the hasAnyNotes check
  const monthDays = days.filter((d) => isSameMonth(d, currentMonth));

  // Don't render at all when no notes exist this month
  const hasAnyNotes = monthDays.some(
    (d) => (notesMap[formatDateKey(d)] ?? []).length > 0
  );
  if (!hasAnyNotes) return null;

  return (
    <div className="mt-4 pt-4 border-t border-cal-border">
      <p className="text-[10px] font-body font-semibold text-cal-text-muted uppercase tracking-widest mb-2">
        Notes this month
      </p>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date) => {
          const key = formatDateKey(date);
          const count = (notesMap[key] ?? []).length;
          const isInMonth = isSameMonth(date, currentMonth);

          if (!isInMonth) {
            // Leading / trailing padding cells — keep grid aligned
            return <div key={key} className="w-4 h-4 rounded-sm" />;
          }

          // Opacity steps by density
          const opacity =
            count === 0 ? 0 : count === 1 ? 0.3 : count === 2 ? 0.55 : 0.8;

          const label = `${format(date, "MMMM d")}: ${count} note${count !== 1 ? "s" : ""}`;
          const titleLabel = `${format(date, "MMM d")}: ${count} note${count !== 1 ? "s" : ""}`;

          return (
            <button
              key={key}
              onClick={() => handleDayClick(date)}
              title={titleLabel}
              aria-label={label}
              className={cn(
                "w-4 h-4 rounded-sm transition-all duration-100 cursor-pointer",
                count === 0
                  ? "bg-cal-border/40 hover:bg-cal-soft"
                  : "hover:scale-110"
              )}
              style={
                count > 0
                  ? { backgroundColor: `rgba(40, 114, 161, ${opacity})` }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
