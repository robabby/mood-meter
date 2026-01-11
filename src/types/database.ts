/**
 * Database types for Supabase tables
 * These match the SQL schema exactly
 */

import type { HSLColor, EnergyLevel, MoodEntry } from "./mood";

/** Database row types (snake_case to match Postgres) */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      entries: {
        Row: EntryRow;
        Insert: EntryInsert;
        Update: EntryUpdate;
      };
    };
  };
}

/** Profile table row */
export interface ProfileRow {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

/** Profile insert (id required, rest optional) */
export interface ProfileInsert {
  id: string;
  display_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Profile update (all optional) */
export interface ProfileUpdate {
  display_name?: string | null;
  updated_at?: string;
}

/** Entry table row */
export interface EntryRow {
  id: string;
  user_id: string;
  text: string;
  color_h: number;
  color_s: number;
  color_l: number;
  energy_value: number;
  energy_level: EnergyLevel;
  ai_generated: boolean;
  reasoning: string | null;
  entry_date: string; // ISO date YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

/** Entry insert (id auto-generated, timestamps auto-set) */
export interface EntryInsert {
  id?: string;
  user_id: string;
  text: string;
  color_h: number;
  color_s: number;
  color_l: number;
  energy_value: number;
  energy_level: EnergyLevel;
  ai_generated?: boolean;
  reasoning?: string | null;
  entry_date: string;
  created_at?: string;
  updated_at?: string;
}

/** Entry update (all optional except you can't change id/user_id) */
export interface EntryUpdate {
  text?: string;
  color_h?: number;
  color_s?: number;
  color_l?: number;
  energy_value?: number;
  energy_level?: EnergyLevel;
  ai_generated?: boolean;
  reasoning?: string | null;
  entry_date?: string;
  updated_at?: string;
}

/**
 * Convert database entry row to domain MoodEntry
 */
export function entryRowToMoodEntry(row: EntryRow): MoodEntry {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    color: {
      h: row.color_h,
      s: row.color_s,
      l: row.color_l,
    },
    energyLevel: row.energy_level,
    energyValue: row.energy_value,
    aiGenerated: row.ai_generated,
    reasoning: row.reasoning ?? undefined,
    date: new Date(row.entry_date),
    createdAt: new Date(row.created_at),
  };
}

/**
 * Convert domain MoodEntry to database insert
 */
export function moodEntryToInsert(
  entry: Omit<MoodEntry, "id" | "createdAt">,
  userId: string
): EntryInsert {
  return {
    user_id: userId,
    text: entry.text,
    color_h: entry.color.h,
    color_s: entry.color.s,
    color_l: entry.color.l,
    energy_value: entry.energyValue,
    energy_level: entry.energyLevel,
    ai_generated: entry.aiGenerated,
    reasoning: entry.reasoning ?? null,
    entry_date: formatDate(entry.date),
  };
}

/**
 * Convert color adjustment to database update
 */
export function colorUpdateToEntryUpdate(color: HSLColor): EntryUpdate {
  return {
    color_h: color.h,
    color_s: color.s,
    color_l: color.l,
    ai_generated: false, // User adjusted the color
  };
}

/** Format Date to ISO date string YYYY-MM-DD */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** User profile for app display */
export interface UserProfile {
  id: string;
  displayName: string | null;
}

/** Convert profile row to app type */
export function profileRowToUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
  };
}
