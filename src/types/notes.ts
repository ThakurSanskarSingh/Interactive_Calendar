export type NoteColor = "yellow" | "blue" | "pink";

export type Note = {
  id: string;
  text: string;
  color: NoteColor;
  createdAt: string; // ISO string
  updatedAt?: string;
};

export type NotesMap = Record<string, Note[]>;

// Format: "YYYY-MM-DD" for single day, "YYYY-MM-DD_YYYY-MM-DD" for range
export type NoteKey = string;
