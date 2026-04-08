"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DateRange, ThemePalette } from "@/types/calendar";
import { Note, NotesMap } from "@/types/notes";

export type NavigationDirection = "forward" | "backward";

interface CalendarStore {
  currentMonth: Date;
  selectedRange: DateRange;
  hoverDate: Date | null;
  heroImage: string | null;
  notes: NotesMap;
  extractedPalette: ThemePalette | null;
  isSelectingRange: boolean;
  navigationDirection: NavigationDirection;

  setCurrentMonth: (date: Date) => void;
  setSelectedRange: (range: DateRange) => void;
  setHoverDate: (date: Date | null) => void;
  setHeroImage: (src: string) => void;
  setExtractedPalette: (palette: ThemePalette | null) => void;
  setIsSelectingRange: (val: boolean) => void;
  addNote: (key: string, note: Note) => void;
  removeNote: (key: string, id: string) => void;
  updateNote: (key: string, id: string, text: string) => void;
  clearRange: () => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      currentMonth: new Date(),
      selectedRange: { start: null, end: null },
      hoverDate: null,
      heroImage: null,
      notes: {},
      extractedPalette: null,
      isSelectingRange: false,
      navigationDirection: "forward",

      // Automatically derives navigation direction from old vs new month.
      // This lets CalendarGrid and CalendarHeader share the same direction
      // state without prop-drilling or duplicated local state.
      setCurrentMonth: (date) =>
        set((state) => ({
          currentMonth: date,
          navigationDirection:
            date > state.currentMonth ? "forward" : "backward",
        })),

      setSelectedRange: (range) => set({ selectedRange: range }),
      setHoverDate: (date) => set({ hoverDate: date }),
      setHeroImage: (src) => set({ heroImage: src }),
      setExtractedPalette: (palette) => set({ extractedPalette: palette }),
      setIsSelectingRange: (val) => set({ isSelectingRange: val }),

      addNote: (key, note) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [key]: [...(state.notes[key] ?? []), note],
          },
        })),

      removeNote: (key, id) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [key]: (state.notes[key] ?? []).filter((n) => n.id !== id),
          },
        })),

      updateNote: (key, id, text) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [key]: (state.notes[key] ?? []).map((n) =>
              n.id === id
                ? { ...n, text, updatedAt: new Date().toISOString() }
                : n,
            ),
          },
        })),

      clearRange: () =>
        set({
          selectedRange: { start: null, end: null },
          hoverDate: null,
          isSelectingRange: false,
        }),
    }),
    {
      name: "interactive-calendar-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notes: state.notes }),
    },
  ),
);
