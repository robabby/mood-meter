"use client";

import Link from "next/link";
import { CalendarGrid } from "@/components/calendar";

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-canvas p-6">
      <div className="max-w-md mx-auto">
        {/* Header with back link */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-ink">Your Journey</h1>
          <Link
            href="/today"
            className="
              px-4 py-2 rounded-soft
              text-sm font-medium
              bg-canvas-subtle text-ink-secondary
              hover:text-ink hover:bg-canvas-subtle/80
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint
            "
          >
            + New Entry
          </Link>
        </header>

        {/* Calendar */}
        <CalendarGrid />
      </div>
    </main>
  );
}
