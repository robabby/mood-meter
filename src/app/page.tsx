"use client";

import { useState } from "react";
import { MoodOrb, MoodSpectrum } from "@/components/mood";
import { energyToColor, hslToString } from "@/lib/spectrum";
import type { HSLColor } from "@/types";

export default function Home() {
  const [energy, setEnergy] = useState(0.5);
  const color: HSLColor = energyToColor(energy);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 p-8">
      <h1 className="text-2xl font-serif text-ink">Mood Meter</h1>

      <MoodOrb color={color} size={180} />

      <div className="w-full max-w-md">
        <MoodSpectrum value={energy} onChange={setEnergy} />
        <p className="text-sm text-ink-tertiary text-center mt-4">
          Energy: {Math.round(energy * 100)}% | {hslToString(color)}
        </p>
      </div>

      <p className="text-sm text-ink-tertiary max-w-md text-center">
        Drag the slider to see the MoodOrb respond. Notice the 4s breathing
        animation and 2s color transitions.
      </p>
    </div>
  );
}
