"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useJournalStore, useFinalColor } from "@/stores/useJournalStore";
import { MoodOrb } from "@/components/mood/MoodOrb";
import { MoodSpectrum } from "@/components/mood/MoodSpectrum";
import { EntryTextarea } from "./EntryTextarea";
import { SubmitOrb } from "./SubmitOrb";
import { CollapsedEntry } from "./CollapsedEntry";
import { ERROR_MESSAGES, type AnalyzeResponse, type ApiError } from "@/types/api";
import type { HSLColor } from "@/types";

interface EntryComposerProps {
  /** For editing existing entries */
  initialText?: string;
  /** Callback when entry is ready to save */
  onComplete?: (entry: {
    text: string;
    color: HSLColor;
    energy: number;
  }) => void;
  /** Additional CSS classes */
  className?: string;
}

// Animation easing
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

export function EntryComposer({
  initialText = "",
  onComplete,
  className = "",
}: EntryComposerProps) {
  const shouldReduceMotion = useReducedMotion();

  // Store state
  const text = useJournalStore((s) => s.text);
  const setText = useJournalStore((s) => s.setText);
  const analysisState = useJournalStore((s) => s.analysisState);
  const setAnalysisState = useJournalStore((s) => s.setAnalysisState);
  const reasoning = useJournalStore((s) => s.reasoning);
  const setReasoning = useJournalStore((s) => s.setReasoning);
  const setSuggestedColor = useJournalStore((s) => s.setSuggestedColor);
  const setAlternatives = useJournalStore((s) => s.setAlternatives);
  const setEnergy = useJournalStore((s) => s.setEnergy);
  const error = useJournalStore((s) => s.error);
  const setError = useJournalStore((s) => s.setError);
  const reset = useJournalStore((s) => s.reset);

  const finalColor = useFinalColor();

  // Initialize with initialText if provided (on mount or when initialText changes)
  useEffect(() => {
    if (initialText && !text) {
      setText(initialText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit text/setText to only run on initialText change
  }, [initialText]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) return;

    setAnalysisState("analyzing");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        const apiError = result.error as ApiError;
        setError(ERROR_MESSAGES[apiError.code] || ERROR_MESSAGES.UNKNOWN);
        setAnalysisState("error");
        return;
      }

      const data = result.data as AnalyzeResponse;
      setSuggestedColor(data.color);
      setReasoning(data.reasoning);
      setAlternatives(data.alternatives);
      setEnergy(data.energy);
      setAnalysisState("complete");
    } catch {
      setError(ERROR_MESSAGES.NETWORK);
      setAnalysisState("error");
    }
  }, [
    text,
    setAnalysisState,
    setError,
    setSuggestedColor,
    setReasoning,
    setAlternatives,
    setEnergy,
  ]);

  const handleEdit = useCallback(() => {
    setAnalysisState("idle");
  }, [setAnalysisState]);

  const handleTextChange = useCallback(
    (newText: string) => {
      setText(newText);
      // Clear error when user starts typing
      if (error) setError(null);
    },
    [setText, error, setError]
  );

  const isIdle = analysisState === "idle";
  const isAnalyzing = analysisState === "analyzing";
  const isComplete = analysisState === "complete";
  const isError = analysisState === "error";

  const animationDuration = shouldReduceMotion ? 0 : 0.4;

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <AnimatePresence mode="wait">
        {/* Idle / Error / Analyzing: Show textarea */}
        {(isIdle || isError || isAnalyzing) && (
          <motion.div
            key="textarea-container"
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isAnalyzing ? 0.7 : 1,
              scale: 1,
              height: isAnalyzing ? 80 : "auto",
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              height: 60,
            }}
            transition={{
              duration: animationDuration,
              ease: EASE_SOFT,
            }}
          >
            <EntryTextarea
              value={text}
              onChange={handleTextChange}
              disabled={isAnalyzing}
            />

            {/* Submit orb - positioned inside textarea */}
            <div className="absolute bottom-3 right-3">
              <SubmitOrb
                onClick={handleSubmit}
                disabled={!text.trim()}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Error message */}
            <AnimatePresence>
              {isError && error && (
                <motion.p
                  className="mt-3 text-sm text-ink-secondary"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  — {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Complete: Show orb, reasoning, spectrum, collapsed entry */}
        {isComplete && finalColor && (
          <motion.div
            key="complete-container"
            className="flex flex-col items-center gap-6 w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
          >
            {/* MoodOrb */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.6,
                delay: shouldReduceMotion ? 0 : 0.2,
                ease: EASE_SOFT,
              }}
            >
              <MoodOrb color={finalColor} size={200} />
            </motion.div>

            {/* Reasoning */}
            {reasoning && (
              <motion.p
                className="text-sm text-ink-secondary text-center max-w-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.4,
                  delay: shouldReduceMotion ? 0 : 0.5,
                  ease: EASE_SOFT,
                }}
              >
                {reasoning}
              </motion.p>
            )}

            {/* MoodSpectrum */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
                delay: shouldReduceMotion ? 0 : 0.6,
                ease: EASE_SOFT,
              }}
            >
              <MoodSpectrum />
            </motion.div>

            {/* Collapsed entry */}
            <CollapsedEntry text={text} onClick={handleEdit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EntryComposer;
