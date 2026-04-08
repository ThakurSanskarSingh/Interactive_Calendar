"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NoteColor } from "@/types/notes";
import { getNoteColorHex, getAllNoteColors } from "@/lib/notes";
import { cn } from "@/lib/utils";

interface AddNoteButtonProps {
  onAdd: (text: string, color: NoteColor) => void;
  disabled?: boolean;
}

export function AddNoteButton({ onAdd, disabled = false }: AddNoteButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState("");
  const [selectedColor, setSelectedColor] = useState<NoteColor>("yellow");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    onAdd(text.trim(), selectedColor);
    setText("");
    setIsExpanded(false);
  }, [text, selectedColor, onAdd]);

  const handleCancel = useCallback(() => {
    setText("");
    setIsExpanded(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSubmit, handleCancel]
  );

  const colors = getAllNoteColors();

  return (
    <div className="mt-3">
      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <motion.button
            key="trigger"
            onClick={() => !disabled && setIsExpanded(true)}
            disabled={disabled}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "w-full flex items-center gap-2 px-4 py-3 rounded-2xl",
              "text-sm font-body font-medium text-cal-text-muted",
              "border border-dashed border-cal-border",
              "hover:border-cal-primary hover:text-cal-primary",
              "transition-all duration-150 cursor-pointer",
              disabled && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Add a note"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            Add a note
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-2xl border border-cal-border overflow-hidden"
            style={{ backgroundColor: getNoteColorHex(selectedColor) }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Write your note… (Enter to save, Esc to cancel)"
              className="w-full p-3 bg-transparent resize-none outline-none text-sm font-body text-cal-text leading-relaxed placeholder:text-cal-text-muted/60"
              maxLength={500}
            />

            <div className="flex items-center justify-between px-3 pb-3">
              {/* Color swatches */}
              <div className="flex gap-1.5" role="group" aria-label="Note color">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`${color} note`}
                    aria-pressed={selectedColor === color}
                    className={cn(
                      "w-5 h-5 rounded-full transition-all duration-100 cursor-pointer",
                      "ring-offset-1",
                      selectedColor === color
                        ? "ring-2 ring-cal-primary scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: getNoteColorHex(color) }}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-xs font-body font-medium text-cal-text-muted hover:text-cal-text rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className={cn(
                    "px-3 py-1 text-xs font-body font-semibold rounded-lg transition-all cursor-pointer",
                    text.trim()
                      ? "bg-cal-primary text-white hover:opacity-90"
                      : "bg-cal-soft text-cal-text-muted cursor-not-allowed"
                  )}
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
