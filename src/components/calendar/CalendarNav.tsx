"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CalendarMonth, NavigationDirection } from "@/types/calendar";
import { formatMonthDisplay } from "@/types/calendar";

interface CalendarNavProps {
  /** Current month being displayed */
  currentMonth: CalendarMonth;
  /** Navigate to previous month */
  onPrevious: () => void;
  /** Navigate to next month */
  onNext: () => void;
  /** Optional: called when navigation direction changes (for animations) */
  onDirectionChange?: (direction: NavigationDirection) => void;
  /** Additional CSS classes */
  className?: string;
}

// Soft easing from design tokens
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

/**
 * CalendarNav - Month/year navigation controls
 *
 * Shows current month and year with prev/next buttons.
 */
export function CalendarNav({
  currentMonth,
  onPrevious,
  onNext,
  className = "",
}: CalendarNavProps) {
  const shouldReduceMotion = useReducedMotion();

  const handlePrevious = () => {
    onPrevious();
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <nav
      className={`flex items-center justify-between gap-4 ${className}`}
      aria-label="Calendar navigation"
    >
      {/* Previous month button */}
      <motion.button
        type="button"
        onClick={handlePrevious}
        className="
          w-10 h-10 rounded-full
          flex items-center justify-center
          text-ink-secondary hover:text-ink
          hover:bg-canvas-subtle
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint
        "
        whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
        whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.15, ease: EASE_SOFT }}
        aria-label="Previous month"
      >
        <ChevronLeftIcon />
      </motion.button>

      {/* Current month display */}
      <h2 className="text-lg font-semibold text-ink min-w-[160px] text-center">
        {formatMonthDisplay(currentMonth)}
      </h2>

      {/* Next month button */}
      <motion.button
        type="button"
        onClick={handleNext}
        className="
          w-10 h-10 rounded-full
          flex items-center justify-center
          text-ink-secondary hover:text-ink
          hover:bg-canvas-subtle
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint
        "
        whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
        whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.15, ease: EASE_SOFT }}
        aria-label="Next month"
      >
        <ChevronRightIcon />
      </motion.button>
    </nav>
  );
}

// Simple chevron icons (no external dependencies)
function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5L7 10L12 15" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 5L13 10L8 15" />
    </svg>
  );
}

export default CalendarNav;
