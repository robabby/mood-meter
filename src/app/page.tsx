"use client";

import { useState } from "react";
import { MoodOrb } from "@/components/mood";
import { energyToColor, energyToLevel, hslToString } from "@/lib/spectrum";
import type { HSLColor } from "@/types";

export default function Home() {
  const [energy, setEnergy] = useState(0.5);
  const color: HSLColor = energyToColor(energy);
  const level = energyToLevel(energy);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 p-8">
      <h1 className="text-2xl font-serif text-ink">Mood Meter</h1>

      <MoodOrb color={color} size={180} />

      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="flex justify-between w-full text-sm text-ink-secondary">
          <span>Depleted</span>
          <span>Balanced</span>
          <span>Elevated</span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={energy}
          onChange={(e) => setEnergy(parseFloat(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right,
              hsl(250, 45%, 50%) 0%,
              hsl(180, 55%, 50%) 30%,
              hsl(160, 70%, 50%) 50%,
              hsl(50, 65%, 55%) 70%,
              hsl(20, 60%, 55%) 100%
            )`,
          }}
          aria-label="Energy level"
        />

        <div className="text-center">
          <p className="text-lg font-medium text-ink capitalize">{level}</p>
          <p className="text-sm text-ink-tertiary">
            Energy: {Math.round(energy * 100)}% | {hslToString(color)}
          </p>
        </div>
      </div>

      <p className="text-sm text-ink-tertiary max-w-md text-center">
        Drag the slider to see the MoodOrb respond. Notice the 4s breathing
        animation and 2s color transitions.
      </p>
    </div>
  );
}
