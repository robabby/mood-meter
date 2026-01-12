"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DayMood } from "@/types/mood";
import type { CalendarMonth } from "@/types/calendar";
import { getMonthStart, getMonthEnd } from "@/types/calendar";

interface UseCalendarEntriesOptions {
  /** The month to fetch entries for */
  month: CalendarMonth;
  /** Optional initial data from SSR */
  initialData?: DayMood[];
}

interface UseCalendarEntriesResult {
  /** Entries grouped by day */
  dayMoods: Map<string, DayMood>;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch entries */
  refetch: () => void;
}

/**
 * Hook to fetch and cache calendar entries for a month
 */
export function useCalendarEntries({
  month,
  initialData,
}: UseCalendarEntriesOptions): UseCalendarEntriesResult {
  const [dayMoods, setDayMoods] = useState<Map<string, DayMood>>(() => {
    if (initialData) {
      return new Map(initialData.map((d) => [d.date, d]));
    }
    return new Map();
  });
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Simple cache: store fetched months
  const cache = useRef<Map<string, DayMood[]>>(new Map());

  const fetchEntries = useCallback(async () => {
    const start = getMonthStart(month);
    const end = getMonthEnd(month);
    const cacheKey = `${start}-${end}`;

    // Check cache first
    const cached = cache.current.get(cacheKey);
    if (cached) {
      setDayMoods(new Map(cached.map((d) => [d.date, d])));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/entries?start=${start}&end=${end}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch entries");
      }

      const data: DayMood[] = result.data;

      // Cache the result
      cache.current.set(cacheKey, data);

      setDayMoods(new Map(data.map((d) => [d.date, d])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  // Fetch when month changes
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const refetch = useCallback(() => {
    // Clear cache for current month to force refetch
    const start = getMonthStart(month);
    const end = getMonthEnd(month);
    cache.current.delete(`${start}-${end}`);
    fetchEntries();
  }, [month, fetchEntries]);

  return { dayMoods, isLoading, error, refetch };
}
