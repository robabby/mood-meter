"use client";

import { create } from "zustand";
import type { HSLColor } from "@/types";

type AnalysisState = "idle" | "analyzing" | "complete" | "error";

interface JournalStore {
  /** Current entry text */
  text: string;
  /** AI-suggested color */
  suggestedColor: HSLColor | null;
  /** AI reasoning for the color */
  reasoning: string | null;
  /** Alternative colors from AI */
  alternatives: HSLColor[];
  /** User-adjusted color (null = accepted AI suggestion) */
  adjustedColor: HSLColor | null;
  /** Energy value from AI (0-1) */
  energy: number | null;
  /** Analysis state machine */
  analysisState: AnalysisState;
  /** Error message if analysis failed */
  error: string | null;

  // Actions
  setText: (text: string) => void;
  setSuggestedColor: (color: HSLColor) => void;
  setReasoning: (reasoning: string) => void;
  setAlternatives: (alternatives: HSLColor[]) => void;
  setAdjustedColor: (color: HSLColor | null) => void;
  setEnergy: (energy: number) => void;
  setAnalysisState: (state: AnalysisState) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  text: "",
  suggestedColor: null,
  reasoning: null,
  alternatives: [],
  adjustedColor: null,
  energy: null,
  analysisState: "idle" as AnalysisState,
  error: null,
};

export const useJournalStore = create<JournalStore>((set) => ({
  ...initialState,

  setText: (text) => set({ text }),
  setSuggestedColor: (color) => set({ suggestedColor: color }),
  setReasoning: (reasoning) => set({ reasoning }),
  setAlternatives: (alternatives) => set({ alternatives }),
  setAdjustedColor: (color) => set({ adjustedColor: color }),
  setEnergy: (energy) => set({ energy }),
  setAnalysisState: (state) => set({ analysisState: state }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

/** Get the final color (adjusted or suggested) */
export function useFinalColor() {
  const { suggestedColor, adjustedColor } = useJournalStore();
  return adjustedColor ?? suggestedColor;
}
