"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { DayMood, MoodEntry } from "@/types/mood";
import { hslToString } from "@/lib/spectrum";

interface CalendarDaySheetProps {
  /** Selected date (null = closed) */
  date: string | null;
  /** Mood data for the day */
  dayMood: DayMood | null;
  /** Close handler */
  onClose: () => void;
  /** Navigate to entry for editing */
  onEditEntry?: (entryId: string) => void;
}

// Soft easing from design tokens
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

/**
 * CalendarDaySheet - Bottom sheet showing entries for a selected day
 *
 * Slides up from the bottom when a day is selected.
 */
export function CalendarDaySheet({
  date,
  dayMood,
  onClose,
  onEditEntry,
}: CalendarDaySheetProps) {
  const shouldReduceMotion = useReducedMotion();
  const isOpen = date !== null;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Format date for display
  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-ink/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            className="
              fixed bottom-0 left-0 right-0
              bg-canvas rounded-t-softer
              shadow-lg z-50
              max-h-[60vh] overflow-y-auto
            "
            initial={{ y: shouldReduceMotion ? 0 : "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: shouldReduceMotion ? 0 : "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_SOFT }}
            role="dialog"
            aria-label={`Entries for ${formattedDate}`}
            aria-modal="true"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink-tertiary/30" />
            </div>

            {/* Content */}
            <div className="px-5 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-ink">
                  {formattedDate}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    w-8 h-8 rounded-full
                    flex items-center justify-center
                    text-ink-secondary hover:text-ink
                    hover:bg-canvas-subtle
                    transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint
                  "
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Entries list */}
              {dayMood && dayMood.entries.length > 0 ? (
                <ul className="space-y-3">
                  {dayMood.entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={onEditEntry}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-ink-secondary text-center py-8">
                  No entries for this day
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface EntryCardProps {
  entry: MoodEntry;
  onEdit?: (entryId: string) => void;
}

function EntryCard({ entry, onEdit }: EntryCardProps) {
  const colorString = hslToString(entry.color);
  // createdAt may be a string after JSON serialization
  const createdAt = typeof entry.createdAt === "string"
    ? new Date(entry.createdAt)
    : entry.createdAt;
  const timeString = createdAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const handleClick = useCallback(() => {
    onEdit?.(entry.id);
  }, [entry.id, onEdit]);

  return (
    <li
      className="
        flex items-start gap-3 p-3
        bg-canvas-subtle rounded-soft
        cursor-pointer hover:bg-canvas-subtle/80
        transition-colors
      "
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Mini orb */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 shadow-soft"
        style={{ backgroundColor: colorString }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink line-clamp-2">{entry.text}</p>
        <p className="text-xs text-ink-tertiary mt-1">
          {timeString} · {entry.energyLevel}
        </p>
      </div>
    </li>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 4L12 12M12 4L4 12" />
    </svg>
  );
}

export default CalendarDaySheet;
