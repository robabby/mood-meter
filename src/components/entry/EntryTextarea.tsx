"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PLACEHOLDERS = [
  "What's moving through you?",
  "Where are you right now?",
  "What's on your mind?",
  "How does today feel?",
  "What would you like to say?",
  "What's present for you?",
];

function getRandomPlaceholder(): string {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}

interface EntryTextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Character limit thresholds
// SOFT_LIMIT documents the intended ~280 char limit for journal entries
const GLOW_START = 200;
const GLOW_FULL = 280; // Soft limit - glow reaches full intensity
const GLOW_MAX = 320;

function getGlowIntensity(length: number): number {
  if (length <= GLOW_START) return 0;
  if (length >= GLOW_MAX) return 0.35;
  if (length <= GLOW_FULL) {
    // 200-280: 0 -> 0.35
    return ((length - GLOW_START) / (GLOW_FULL - GLOW_START)) * 0.35;
  }
  // 280-320: stay at 0.35
  return 0.35;
}

export function EntryTextarea({
  value,
  onChange,
  disabled = false,
  className = "",
}: EntryTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Random placeholder on mount (lazy initialization avoids impure render)
  const [placeholder] = useState(getRandomPlaceholder);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 96; // ~3 rows
    const maxHeight = 256; // ~8 rows
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const glowIntensity = getGlowIntensity(value.length);
  const glowStyle = glowIntensity > 0
    ? { boxShadow: `0 0 ${20 + glowIntensity * 30}px hsla(40, 80%, 68%, ${glowIntensity})` }
    : {};

  return (
    <motion.textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      aria-label="Journal entry"
      className={`
        w-full resize-none
        bg-canvas-subtle
        border border-ink/10 rounded-softer
        px-5 py-5 pb-14
        font-[family-name:var(--font-lora)] text-lg text-ink-secondary
        placeholder:text-ink-tertiary placeholder:italic
        focus:outline-none focus:border-ink/20 focus:shadow-soft
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-shadow duration-300
        ${className}
      `}
      style={{
        minHeight: 96,
        ...glowStyle,
      }}
      animate={{
        opacity: disabled ? 0.5 : 1,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
      }}
    />
  );
}

export default EntryTextarea;
