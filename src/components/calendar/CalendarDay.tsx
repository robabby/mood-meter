"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { DayMood } from "@/types/mood";
import { hslToString } from "@/lib/spectrum";

interface CalendarDayProps {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Day of month (1-31) */
  dayNumber: number;
  /** Aggregated mood data (null if no entries) */
  dayMood: DayMood | null;
  /** Is this today? */
  isToday: boolean;
  /** Is this day in the currently displayed month? */
  isCurrentMonth: boolean;
  /** Is this day selected? */
  isSelected: boolean;
  /** Click handler */
  onClick: () => void;
}

// Soft easing from design tokens
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

/**
 * CalendarDay - Individual day cell in the calendar grid
 *
 * Shows the day number and a colored orb representing the mood.
 * Empty days have a subtle neutral appearance.
 */
export function CalendarDay({
  dayNumber,
  dayMood,
  isToday,
  isCurrentMonth,
  isSelected,
  onClick,
}: CalendarDayProps) {
  const shouldReduceMotion = useReducedMotion();

  const hasEntries = dayMood !== null;
  const colorString = hasEntries ? hslToString(dayMood.dominantColor) : "";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        w-11 h-11 rounded-soft
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint
        ${isCurrentMonth ? "cursor-pointer" : "cursor-default"}
        ${isSelected ? "ring-2 ring-ink" : ""}
        ${isToday && !isSelected ? "ring-2 ring-ink-faint" : ""}
      `}
      whileHover={
        isCurrentMonth && !shouldReduceMotion
          ? { scale: 1.05, y: -1 }
          : undefined
      }
      whileTap={isCurrentMonth && !shouldReduceMotion ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: EASE_SOFT }}
      role="gridcell"
      aria-selected={isSelected}
      aria-label={`${isToday ? "Today, " : ""}${dayNumber}${hasEntries ? `, ${dayMood.entryCount} ${dayMood.entryCount === 1 ? "entry" : "entries"}, ${dayMood.energyLevel} mood` : ""}`}
      tabIndex={isCurrentMonth ? 0 : -1}
    >
      {/* Day number */}
      <span
        className={`
          text-sm font-medium z-10
          ${isCurrentMonth ? "text-ink" : "text-ink-tertiary"}
          ${hasEntries ? "text-white mix-blend-difference" : ""}
        `}
      >
        {dayNumber}
      </span>

      {/* Mood orb background */}
      {hasEntries && (
        <motion.div
          className="absolute inset-1 rounded-full shadow-soft"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            backgroundColor: colorString,
          }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { duration: 0.3, ease: EASE_SOFT },
            backgroundColor: { duration: 0.6, ease: EASE_SOFT },
          }}
        />
      )}

      {/* Entry count badge */}
      {hasEntries && dayMood.entryCount > 1 && (
        <span
          className="
            absolute -bottom-0.5 -right-0.5
            min-w-4 h-4 px-1
            flex items-center justify-center
            text-[10px] font-semibold
            bg-ink text-canvas
            rounded-full
            z-20
          "
        >
          {dayMood.entryCount}
        </span>
      )}
    </motion.button>
  );
}

export default CalendarDay;
