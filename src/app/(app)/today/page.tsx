"use client";

import { useCallback } from "react";
import { EntryComposer } from "@/components/entry";
import { useJournalStore } from "@/stores/useJournalStore";
import type { HSLColor } from "@/types";

export default function TodayPage() {
  const reset = useJournalStore((s) => s.reset);

  const handleComplete = useCallback(
    async (entry: {
      text: string;
      color: HSLColor;
      energy: number;
      aiGenerated: boolean;
      reasoning?: string;
    }) => {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      try {
        const response = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: entry.text,
            date: today,
            color: entry.color,
            energy: entry.energy,
            aiGenerated: entry.aiGenerated,
            reasoning: entry.reasoning,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Clear the store for the next entry
          reset();
        } else {
          // TODO: Show error to user in a gentle way
          console.error("Failed to save entry:", result.error);
        }
      } catch (error) {
        console.error("Network error saving entry:", error);
      }
    },
    [reset]
  );

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <EntryComposer className="w-full" onComplete={handleComplete} />
    </main>
  );
}
