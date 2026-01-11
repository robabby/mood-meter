"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  energyToColor,
  energyToLevel,
  getSpectrumGradient,
  hslToString,
} from "@/lib/spectrum";
import { useJournalStore } from "@/stores/useJournalStore";

interface MoodSpectrumProps {
  /** Controlled energy value (0-1). Falls back to store if omitted */
  value?: number;
  /** Controlled change handler. Falls back to store if omitted */
  onChange?: (energy: number) => void;
  /** Additional CSS classes */
  className?: string;
}

// Easing curve matching MoodOrb
const EASE_SOFT = [0.45, 0, 0.15, 1] as const;

// Keyboard step size
const STEP = 0.05;

/**
 * MoodSpectrum - Energy slider for adjusting mood color
 *
 * A horizontal slider with the full energy spectrum gradient.
 * Users drag the mini orb thumb to adjust their energy level,
 * teaching the system their personal emotional vocabulary.
 */
export function MoodSpectrum({
  value,
  onChange,
  className = "",
}: MoodSpectrumProps) {
  const shouldReduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Hybrid API: use props if provided, otherwise fall back to store
  const storeEnergy = useJournalStore((s) => s.energy);
  const setAdjustedColor = useJournalStore((s) => s.setAdjustedColor);

  const energy = value ?? storeEnergy ?? 0.5;

  const handleChange = useCallback(
    (newEnergy: number) => {
      const clamped = Math.max(0, Math.min(1, newEnergy));
      if (onChange) {
        onChange(clamped);
      } else {
        setAdjustedColor(energyToColor(clamped));
      }
    },
    [onChange, setAdjustedColor]
  );

  // Calculate energy from pointer position
  const getEnergyFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return energy;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(1, x / rect.width));
    },
    [energy]
  );

  // Pointer event handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleChange(getEnergyFromPointer(e.clientX));
    },
    [getEnergyFromPointer, handleChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      handleChange(getEnergyFromPointer(e.clientX));
    },
    [isDragging, getEnergyFromPointer, handleChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    []
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newEnergy = energy;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          newEnergy = energy - STEP;
          break;
        case "ArrowRight":
        case "ArrowUp":
          newEnergy = energy + STEP;
          break;
        case "Home":
          newEnergy = 0;
          break;
        case "End":
          newEnergy = 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      handleChange(newEnergy);
    },
    [energy, handleChange]
  );

  const color = energyToColor(energy);
  const colorString = hslToString(color);
  const level = energyToLevel(energy);
  const percent = Math.round(energy * 100);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Track */}
      <div
        ref={trackRef}
        className="relative w-full h-3 rounded-softer cursor-pointer select-none touch-none"
        style={{
          background: getSpectrumGradient(),
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        }}
        role="slider"
        tabIndex={0}
        aria-label="Energy level"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={energy}
        aria-valuetext={`${level}, ${percent}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {/* Thumb container - positioned by energy */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `calc(${energy * 100}% - 14px)`,
          }}
        >
          {/* Glow layer */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm"
            style={{
              width: 40,
              height: 40,
            }}
            animate={{
              backgroundColor: colorString,
              opacity: 0.4,
              scale:
                shouldReduceMotion || isDragging ? 1 : [1, 1.15, 1],
            }}
            transition={{
              backgroundColor: {
                duration: 0.4,
                ease: EASE_SOFT,
              },
              scale: {
                duration: 3,
                ease: "easeInOut",
                repeat: shouldReduceMotion || isDragging ? 0 : Infinity,
                repeatType: "loop",
              },
            }}
          />

          {/* Core */}
          <motion.div
            className="relative rounded-full shadow-soft"
            style={{
              width: 28,
              height: 28,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            animate={{
              backgroundColor: colorString,
            }}
            transition={{
              backgroundColor: {
                duration: 0.4,
                ease: EASE_SOFT,
              },
            }}
          >
            {/* Inner highlight */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, transparent 50%)",
              }}
            />
          </motion.div>
        </div>

        {/* Focus ring - shown when keyboard focused */}
        <div className="absolute inset-0 rounded-softer ring-2 ring-ink/20 ring-offset-2 opacity-0 focus-within:opacity-100 pointer-events-none transition-opacity" />
      </div>

      {/* Label */}
      <motion.span
        className="text-sm text-ink-secondary capitalize"
        animate={{ color: colorString }}
        transition={{
          duration: 0.4,
          ease: EASE_SOFT,
        }}
      >
        {level}
      </motion.span>
    </div>
  );
}

export default MoodSpectrum;
