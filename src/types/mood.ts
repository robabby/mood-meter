/**
 * Core domain types for Mood Meter
 */

/** HSL color representation - better for mood interpolation than RGB */
export interface HSLColor {
  h: number; // 0-360 (hue)
  s: number; // 0-100 (saturation)
  l: number; // 0-100 (lightness)
}

/** Energy levels map to hue ranges on the spectrum */
export type EnergyLevel =
  | "depleted" // 0-20%  → deep blues, grays
  | "low" // 20-40% → cool teals, purples
  | "balanced" // 40-60% → greens, warm neutrals
  | "elevated" // 60-80% → yellows, oranges
  | "high"; // 80-100% → reds, magentas

/** A single mood entry */
export interface MoodEntry {
  id: string;
  userId: string;
  text: string;
  color: HSLColor;
  energyLevel: EnergyLevel;
  energyValue: number; // 0-1 float for precise positioning
  aiGenerated: boolean;
  reasoning?: string;
  date: Date;
  createdAt: Date;
}

/** Calendar view aggregates entries by day */
export interface DayMood {
  date: string; // ISO date YYYY-MM-DD
  dominantColor: HSLColor;
  energyLevel: EnergyLevel;
  entryCount: number;
  entries: MoodEntry[];
}

/** Pending entry for offline queue */
export interface PendingEntry {
  localId: string;
  text: string;
  date: string;
  color?: HSLColor;
  createdAt: number;
  status: "pending" | "syncing" | "failed";
}
