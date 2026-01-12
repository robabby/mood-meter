"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { DayMood } from "@/types/mood";
import type { CalendarMonth, NavigationDirection } from "@/types/calendar";
import {
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  isToday,
} from "@/types/calendar";
import { useCalendarEntries } from "@/hooks/useCalendarEntries";
import { CalendarDay } from "./CalendarDay";
import { CalendarNav } from "./CalendarNav";
import { CalendarDaySheet } from "./CalendarDaySheet";

interface CalendarGridProps {
  /** Initial month (defaults to current) */
  initialMonth?: CalendarMonth;
  /** Pre-fetched entries for SSR */
  initialEntries?: DayMood[];
  /** Additional CSS classes */
  className?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Soft easing from design tokens
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

/**
 * CalendarGrid - Monthly calendar view showing mood patterns
 *
 * Displays a 7-column grid with day cells colored by mood entries.
 */
export function CalendarGrid({
  initialMonth,
  initialEntries,
  className = "",
}: CalendarGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const [month, setMonth] = useState<CalendarMonth>(
    initialMonth ?? getCurrentMonth()
  );
  const [direction, setDirection] = useState<NavigationDirection>(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { dayMoods, isLoading } = useCalendarEntries({
    month,
    initialData: initialEntries,
  });

  // Generate the calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(month.year, month.month, 1);
    const lastDayOfMonth = new Date(month.year, month.month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Days from previous month to fill the first row
    const prevMonth = getPreviousMonth(month);
    const daysInPrevMonth = new Date(prevMonth.year, prevMonth.month + 1, 0).getDate();

    const days: Array<{
      date: string;
      dayNumber: number;
      isCurrentMonth: boolean;
    }> = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateStr = formatDateString(prevMonth.year, prevMonth.month, day);
      days.push({ date: dateStr, dayNumber: day, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(month.year, month.month, day);
      days.push({ date: dateStr, dayNumber: day, isCurrentMonth: true });
    }

    // Next month days to fill remaining cells (6 rows x 7 days = 42)
    const nextMonth = getNextMonth(month);
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const dateStr = formatDateString(nextMonth.year, nextMonth.month, day);
      days.push({ date: dateStr, dayNumber: day, isCurrentMonth: false });
    }

    return days;
  }, [month]);

  const handlePreviousMonth = useCallback(() => {
    setDirection(-1);
    setMonth(getPreviousMonth(month));
  }, [month]);

  const handleNextMonth = useCallback(() => {
    setDirection(1);
    setMonth(getNextMonth(month));
  }, [month]);

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedDate(null);
  }, []);

  // Get entries for selected date
  const selectedDayMood = selectedDate ? dayMoods.get(selectedDate) : null;

  // Animation variants for month transitions
  const variants = {
    enter: (dir: NavigationDirection) => ({
      x: shouldReduceMotion ? 0 : dir * 30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: NavigationDirection) => ({
      x: shouldReduceMotion ? 0 : dir * -30,
      opacity: 0,
    }),
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <CalendarNav
        currentMonth={month}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
      />

      {/* Weekday headers */}
      <div
        className="grid grid-cols-7 gap-1 text-center"
        role="row"
        aria-label="Days of the week"
      >
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-ink-secondary py-2"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${month.year}-${month.month}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: EASE_SOFT }}
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label="Calendar"
        >
          {calendarDays.map((day) => (
            <CalendarDay
              key={day.date}
              date={day.date}
              dayNumber={day.dayNumber}
              dayMood={dayMoods.get(day.date) ?? null}
              isToday={isToday(day.date)}
              isCurrentMonth={day.isCurrentMonth}
              isSelected={selectedDate === day.date}
              onClick={() => handleDayClick(day.date)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center text-ink-secondary text-sm py-2">
          Loading entries...
        </div>
      )}

      {/* Day detail sheet */}
      <CalendarDaySheet
        date={selectedDate}
        dayMood={selectedDayMood ?? null}
        onClose={handleSheetClose}
      />
    </div>
  );
}

/** Format a date as YYYY-MM-DD */
function formatDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export default CalendarGrid;
