/**
 * API types with Zod runtime validation
 */

import { z } from "zod";

/** Schema for validating Claude API response */
export const moodAnalysisSchema = z.object({
  energy: z.number().min(0).max(1),
  hue: z.number().min(0).max(360),
  saturation: z.number().min(20).max(80),
  lightness: z.number().min(35).max(65),
  reasoning: z.string().max(200),
  keywords: z.array(z.string()).optional(),
});

export type MoodAnalysisResponse = z.infer<typeof moodAnalysisSchema>;

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

export interface AnalyzeResponse extends MoodAnalysisResponse {
  alternatives: string[]; // 5 nearby HSL color strings
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
