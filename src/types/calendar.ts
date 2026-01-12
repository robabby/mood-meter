/**
 * Calendar-specific types
 */

/** Month identifier for navigation */
export interface CalendarMonth {
  year: number;
  month: number; // 0-11 (JavaScript Date convention)
}

/** Direction for month navigation animations */
export type NavigationDirection = -1 | 0 | 1;

/** Format a CalendarMonth to YYYY-MM string */
export function formatCalendarMonth(month: CalendarMonth): string {
  const m = String(month.month + 1).padStart(2, "0");
  return `${month.year}-${m}`;
}

/** Get start date of a month as ISO string */
export function getMonthStart(month: CalendarMonth): string {
  return `${month.year}-${String(month.month + 1).padStart(2, "0")}-01`;
}

/** Get end date of a month as ISO string */
export function getMonthEnd(month: CalendarMonth): string {
  const lastDay = new Date(month.year, month.month + 1, 0).getDate();
  return `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

/** Get current month */
export function getCurrentMonth(): CalendarMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

/** Navigate to previous month */
export function getPreviousMonth(month: CalendarMonth): CalendarMonth {
  if (month.month === 0) {
    return { year: month.year - 1, month: 11 };
  }
  return { year: month.year, month: month.month - 1 };
}

/** Navigate to next month */
export function getNextMonth(month: CalendarMonth): CalendarMonth {
  if (month.month === 11) {
    return { year: month.year + 1, month: 0 };
  }
  return { year: month.year, month: month.month + 1 };
}

/** Format month for display (e.g., "January 2026") */
export function formatMonthDisplay(month: CalendarMonth): string {
  const date = new Date(month.year, month.month, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Check if a date string is today */
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

/** Check if a date string is in the given month */
export function isInMonth(dateStr: string, month: CalendarMonth): boolean {
  const [year, m] = dateStr.split("-").map(Number);
  return year === month.year && m === month.month + 1;
}
