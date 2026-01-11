/**
 * API types with Zod runtime validation
 */

import { z } from "zod";
import type { HSLColor, EnergyLevel } from "./mood";

/** Schema for validating Claude API response (via tool_use) */
export const moodAnalysisSchema = z.object({
  energy: z.number().min(0).max(1),
  reasoning: z.string().max(200),
});

export type MoodAnalysisResponse = z.infer<typeof moodAnalysisSchema>;

/** Schema for validating entry creation request */
export const createEntrySchema = z.object({
  text: z.string().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  color: z.object({
    h: z.number().min(0).max(360),
    s: z.number().min(0).max(100),
    l: z.number().min(0).max(100),
  }),
  energy: z.number().min(0).max(1),
  aiGenerated: z.boolean(),
  reasoning: z.string().max(200).optional(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;

/** Wrapper for API responses */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export interface ApiError {
  code:
    | "RATE_LIMITED"
    | "AI_UNAVAILABLE"
    | "INVALID_INPUT"
    | "NETWORK"
    | "UNAUTHORIZED"
    | "UNKNOWN";
  message: string;
  retryAfter?: number;
}

/** User-friendly messages for each error code */
export const ERROR_MESSAGES: Record<ApiError["code"], string> = {
  RATE_LIMITED: "Taking a breather. Try again in a moment.",
  AI_UNAVAILABLE: "Our AI is resting. Your entry is saved locally.",
  INVALID_INPUT: "Something doesn't look right. Try rephrasing.",
  NETWORK: "Connection lost. We'll sync when you're back online.",
  UNAUTHORIZED: "Please sign in to continue.",
  UNKNOWN: "Something unexpected happened. Try again?",
};

/** Request/response types for API routes */
export interface AnalyzeRequest {
  text: string;
}

/** Full response from /api/analyze (after we compute color from energy) */
export interface AnalyzeResponse {
  energy: number;
  reasoning: string;
  color: HSLColor;
  level: EnergyLevel;
  alternatives: HSLColor[];
}

export interface CreateEntryRequest {
  text: string;
  date: string;
  hue: number;
  saturation: number;
  lightness: number;
  energy: number;
  aiGenerated: boolean;
  reasoning?: string;
}

export interface SyncRequest {
  entries: Array<{
    localId: string;
    text: string;
    date: string;
    hue: number;
    saturation: number;
    lightness: number;
    energy: number;
    aiGenerated: boolean;
  }>;
}

export interface SyncResponse {
  synced: string[];
  failed: Array<{ id: string; error: string }>;
}
