"use client";

import { useCallback } from "react";
import { useCalendarStore } from "@/store/useCalendarStore";
import { Note, NoteColor } from "@/types/notes";
import { createNote, sortNotes } from "@/lib/notes";
import { getNotesKey } from "@/lib/range";
import { DateRange } from "@/types/calendar";

// ---------------------------------------------------------------------------
// useNotes
// ---------------------------------------------------------------------------

/**
 * useNotes
 *
 * Scoped note operations for a given DateRange.
 *
 * Computes the correct notes map key from the range (single-day or range),
 * reads the notes for that key from the global store, and exposes clean
 * add / remove / update handlers without the caller needing to know about
 * key formatting or store shape.
 *
 * Usage:
 *   const { notes, add, remove, update, hasNotes, key } = useNotes(selectedRange);
 *
 * Notes are returned sorted oldest-first so the UI renders them in a
 * consistent, chronological order.
 *
 * If the range has no start date (nothing selected), all operations are
 * no-ops and `notes` returns an empty array.
 */
export function useNotes(range: DateRange) {
  const { notes: notesMap, addNote, removeNote, updateNote } = useCalendarStore();

  // The storage key for this range. null when nothing is selected.
  const key = getNotesKey(range);

  // Notes for this specific key, sorted oldest → newest.
  const notes: Note[] = key ? sortNotes(notesMap[key] ?? []) : [];

  // ---------------------------------------------------------------------------
  // add
  // Creates a new note with rotating color and appends it to this range's list.
  // Color can be explicitly passed (e.g. from a color picker UI).
  // ---------------------------------------------------------------------------
  const add = useCallback(
    (text: string, color?: NoteColor) => {
      if (!key || !text.trim()) return;
      const note = createNote(text, color);
      addNote(key, note);
    },
    [key, addNote]
  );

  // ---------------------------------------------------------------------------
  // remove
  // Removes a note by ID from this range's list.
  // ---------------------------------------------------------------------------
  const remove = useCallback(
    (id: string) => {
      if (!key) return;
      removeNote(key, id);
    },
    [key, removeNote]
  );

  // ---------------------------------------------------------------------------
  // update
  // Updates the text of an existing note by ID.
  // The store handler also sets `updatedAt` on the note.
  // ---------------------------------------------------------------------------
  const update = useCallback(
    (id: string, text: string) => {
      if (!key || !text.trim()) return;
      updateNote(key, id, text);
    },
    [key, updateNote]
  );

  return {
    /** Notes for the current range, sorted oldest-first */
    notes,
    /** The storage key for this range — useful for debugging or conditional UI */
    key,
    /** Add a new note to this range */
    add,
    /** Remove a note by ID */
    remove,
    /** Update a note's text by ID */
    update,
    /** Whether there are any notes for this range */
    hasNotes: notes.length > 0,
    /** Note count — useful for indicators and badges */
    count: notes.length,
  };
}

// ---------------------------------------------------------------------------
// useNotesMap
// ---------------------------------------------------------------------------

/**
 * useNotesMap
 *
 * Returns the full notes map (all keys → Note[]) from the store.
 *
 * Use this when you need a global view of all notes — for example:
 *   - MiniHeatmap: which days have notes
 *   - CalendarGrid: showing note indicators on day cells
 *
 * Prefer useNotes(range) when you only need notes for a specific selection.
 */
export function useNotesMap() {
  return useCalendarStore((state) => state.notes);
}

// ---------------------------------------------------------------------------
// useNoteCountForDate
// ---------------------------------------------------------------------------

/**
 * useNoteCountForDate
 *
 * Returns the number of notes stored under a specific single-day key.
 * Used by DayCell to render a note count indicator dot.
 *
 * This is a lightweight read — it does not subscribe to the full notes map,
 * only to the specific key, so it avoids unnecessary re-renders in cells
 * that don't have notes.
 */
export function useNoteCountForDate(dateKey: string): number {
  return useCalendarStore(
    (state) => (state.notes[dateKey] ?? []).length
  );
}
