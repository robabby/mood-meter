"use client";

import { motion, useReducedMotion } from "framer-motion";
import { energyToColor, hslToString } from "@/lib/spectrum";

interface SubmitOrbProps {
  onClick: () => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
  className?: string;
}

// Easing curve from design tokens (--ease-out-soft)
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

// Balanced green (midpoint of spectrum)
const HOVER_COLOR = energyToColor(0.5);

export function SubmitOrb({
  onClick,
  disabled = false,
  isAnalyzing = false,
  className = "",
}: SubmitOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || isAnalyzing}
      className={`
        relative rounded-full
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${className}
      `}
      initial={false}
      animate={{
        scale: isAnalyzing ? [1, 1.08, 1] : 1,
        width: isAnalyzing ? 48 : 36,
        height: isAnalyzing ? 48 : 36,
      }}
      whileHover={
        disabled || isAnalyzing
          ? {}
          : { scale: 1.05, backgroundColor: hslToString(HOVER_COLOR) }
      }
      transition={{
        scale: {
          duration: isAnalyzing ? 3 : 0.2,
          ease: "easeInOut",
          repeat: isAnalyzing && !shouldReduceMotion ? Infinity : 0,
        },
        width: { duration: 0.4, ease: EASE_SOFT },
        height: { duration: 0.4, ease: EASE_SOFT },
        backgroundColor: { duration: 0.3, ease: EASE_SOFT },
      }}
      aria-label={isAnalyzing ? "Analyzing..." : "Reflect on this entry"}
    >
      {/* Background fill */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          backgroundColor: isAnalyzing
            ? "hsl(0, 0%, 75%)"
            : "var(--color-canvas-muted)",
          opacity: disabled && !isAnalyzing ? 0.5 : 1,
        }}
        transition={{
          duration: 0.3,
          ease: EASE_SOFT,
        }}
      />

      {/* Inner shadow for depth */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
        }}
      />

      {/* Subtle highlight */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, transparent 50%)",
        }}
      />
    </motion.button>
  );
}

export default SubmitOrb;
