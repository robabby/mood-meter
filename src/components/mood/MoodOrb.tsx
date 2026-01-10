"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HSLColor } from "@/types";
import { hslToString } from "@/lib/spectrum";

interface MoodOrbProps {
  /** The current mood color */
  color: HSLColor;
  /** Size of the orb in pixels (default: 200) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

// Easing curve from design tokens: --ease-in-out-soft
const EASE_SOFT = [0.45, 0, 0.15, 1] as const;

// Glow layers with decreasing opacity for soft radiance
const GLOW_LAYERS = [
  { scale: 1.3, opacity: 0.15 },
  { scale: 1.6, opacity: 0.08 },
  { scale: 2.0, opacity: 0.04 },
];

/**
 * MoodOrb - The emotional heart of the app
 *
 * A breathing, luminous orb that reflects the user's current emotional state
 * through color. Should feel like exhaling: calm, unhurried, non-judgmental.
 */
export function MoodOrb({ color, size = 200, className = "" }: MoodOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  const colorString = hslToString(color);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size * 2, height: size * 2 }}
      role="img"
      aria-label="Mood visualization orb"
    >
      {/* Glow layers - radiate outward from center */}
      {GLOW_LAYERS.map((layer, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: size * layer.scale,
            height: size * layer.scale,
            opacity: layer.opacity,
          }}
          animate={{
            backgroundColor: colorString,
            scale: shouldReduceMotion ? 1 : [1, 1.02, 1],
          }}
          transition={{
            backgroundColor: {
              duration: 2,
              ease: EASE_SOFT,
            },
            scale: {
              duration: 4,
              ease: "easeInOut",
              repeat: shouldReduceMotion ? 0 : Infinity,
              repeatType: "loop",
              delay: index * 0.15,
            },
          }}
        />
      ))}

      {/* Main orb */}
      <motion.div
        className="relative rounded-full shadow-medium"
        style={{
          width: size,
          height: size,
        }}
        animate={{
          backgroundColor: colorString,
          scale: shouldReduceMotion ? 1 : [1, 1.02, 1],
        }}
        transition={{
          backgroundColor: {
            duration: 2,
            ease: EASE_SOFT,
          },
          scale: {
            duration: 4,
            ease: "easeInOut",
            repeat: shouldReduceMotion ? 0 : Infinity,
            repeatType: "loop",
          },
        }}
      />

      {/* Inner highlight for depth */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
        }}
      />
    </div>
  );
}

export default MoodOrb;
