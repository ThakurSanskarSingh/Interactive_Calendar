import { Note, NoteColor } from "@/types/notes";

// ---------------------------------------------------------------------------
// Color rotation — new notes cycle through colors automatically so a set of
// notes on the same day feels visually varied without requiring user input.
// ---------------------------------------------------------------------------

const NOTE_COLORS: NoteColor[] = ["yellow", "blue", "pink"];
let colorCursor = 0;

/**
 * Create a new Note object with a generated ID and timestamp.
 * Color rotates automatically if not explicitly provided.
 */
export function createNote(text: string, color?: NoteColor): Note {
  const assignedColor = color ?? NOTE_COLORS[colorCursor % NOTE_COLORS.length];
  colorCursor++;
  return {
    id: generateNoteId(),
    text: text.trim(),
    color: assignedColor,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate a collision-resistant unique ID for a note.
 * Uses timestamp + random suffix — no external dep needed at this scale.
 */
export function generateNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Color utilities — map NoteColor token to concrete values
// ---------------------------------------------------------------------------

const NOTE_COLOR_HEX: Record<NoteColor, string> = {
  yellow: "#FFF2B8",
  blue:   "#DDEFFF",
  pink:   "#FFE3EC",
};

const NOTE_COLOR_BORDER: Record<NoteColor, string> = {
  yellow: "#F5D97A",
  blue:   "#A8CFEF",
  pink:   "#F5A8C0",
};

const NOTE_COLOR_TEXT: Record<NoteColor, string> = {
  yellow: "#5C4A00",
  blue:   "#0A3A5C",
  pink:   "#5C0A2A",
};

/**
 * Get the background hex value for a note color.
 * Use this for inline styles when Tailwind classes aren't sufficient
 * (e.g., dynamic CSS variable updates from the theme extractor).
 */
export function getNoteColorHex(color: NoteColor): string {
  return NOTE_COLOR_HEX[color];
}

/**
 * Get the border hex for a note color — slightly darker than the fill.
 */
export function getNoteColorBorder(color: NoteColor): string {
  return NOTE_COLOR_BORDER[color];
}

/**
 * Get the text color for a note — dark tint of the note hue for contrast.
 */
export function getNoteColorText(color: NoteColor): string {
  return NOTE_COLOR_TEXT[color];
}

/**
 * Get the Tailwind background utility class for a note color.
 * Requires that `bg-note-yellow`, `bg-note-blue`, `bg-note-pink`
 * are registered in globals.css @theme as CSS var references.
 */
export function getNoteColorClass(color: NoteColor): string {
  const map: Record<NoteColor, string> = {
    yellow: "bg-note-yellow",
    blue:   "bg-note-blue",
    pink:   "bg-note-pink",
  };
  return map[color];
}

/**
 * Return all three note color options — used to render the color picker
 * in the AddNote UI.
 */
export function getAllNoteColors(): NoteColor[] {
  return [...NOTE_COLORS];
}

// ---------------------------------------------------------------------------
// Sorting / filtering
// ---------------------------------------------------------------------------

/**
 * Sort notes by createdAt ascending (oldest first).
 * Returns a new array — does not mutate the input.
 */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Filter notes to only those matching a specific color.
 */
export function filterNotesByColor(notes: Note[], color: NoteColor): Note[] {
  return notes.filter((n) => n.color === color);
}

/**
 * Truncate note text for preview display (e.g. heatmap tooltip, mini indicators).
 */
export function truncateNoteText(text: string, maxLength = 60): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Check whether a note has been edited since creation.
 */
export function isNoteEdited(note: Note): boolean {
  return !!note.updatedAt && note.updatedAt !== note.createdAt;
}
