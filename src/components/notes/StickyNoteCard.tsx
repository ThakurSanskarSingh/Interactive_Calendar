"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { parseISO } from "date-fns";
import { Note } from "@/types/notes";
import {
  getNoteColorHex,
  getNoteColorBorder,
  getNoteColorText,
  isNoteEdited,
} from "@/lib/notes";
import { cn } from "@/lib/utils";
import { format } from "@/lib/date";

interface StickyNoteCardProps {
  note: Note;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

/**
 * Derive a consistent slight rotation from the note ID.
 * Range: -2.5deg to +2.5deg — subtle, not silly.
 */
function getNoteRotation(id: string): number {
  const hash = id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ((hash % 11) - 5) * 0.5; // -2.5 to +2.5 degrees
}

export function StickyNoteCard({ note, onRemove, onUpdate }: StickyNoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const rotation = getNoteRotation(note.id);
  const bgColor = getNoteColorHex(note.color);
  const borderColor = getNoteColorBorder(note.color);
  const textColor = getNoteColorText(note.color);

  // Focus textarea and move cursor to end when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // Sync editText if note.text changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditText(note.text);
    }
  }, [note.text, isEditing]);

  const handleStartEdit = useCallback(() => {
    setEditText(note.text);
    setIsEditing(true);
  }, [note.text]);

  const handleSave = useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== note.text) {
      onUpdate(note.id, trimmed);
    } else if (!trimmed) {
      // Empty text → delete the note
      onRemove(note.id);
    }
    setIsEditing(false);
  }, [editText, note.id, note.text, onUpdate, onRemove]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        setEditText(note.text);
        setIsEditing(false);
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleSave();
      }
    },
    [note.text, handleSave]
  );

  const timeLabel = isNoteEdited(note)
    ? `Edited ${format(parseISO(note.updatedAt!), "MMM d, h:mm a")}`
    : format(parseISO(note.createdAt), "MMM d, h:mm a");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative rounded-xl p-3 cursor-pointer group"
      style={{
        backgroundColor: bgColor,
        borderBottom: `2px solid ${borderColor}`,
        transform: `rotate(${rotation}deg)`,
        boxShadow: isHovered
          ? "0 6px 20px rgba(0,0,0,0.12)"
          : "0 2px 8px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Delete button — appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(note.id);
        }}
        aria-label="Delete note"
        className={cn(
          "absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full",
          "text-xs font-bold transition-opacity duration-150",
          "hover:bg-black/10 cursor-pointer"
        )}
        style={{ color: textColor, opacity: isHovered ? 0.6 : 0 }}
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

      {/* Note text — click to edit */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          rows={3}
          className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed font-body"
          style={{ color: textColor, caretColor: textColor }}
          placeholder="Write something…"
          maxLength={500}
        />
      ) : (
        <p
          onClick={handleStartEdit}
          className="text-sm leading-relaxed font-body whitespace-pre-wrap break-words pr-4"
          style={{ color: textColor }}
        >
          {note.text}
        </p>
      )}

      {/* Timestamp */}
      <p
        className="mt-2 text-[10px] font-body opacity-50 tracking-wide"
        style={{ color: textColor }}
      >
        {timeLabel}
      </p>
    </motion.div>
  );
}
