"use client";

import { motion, useReducedMotion } from "framer-motion";

interface CollapsedEntryProps {
  text: string;
  onClick: () => void;
  className?: string;
}

const MAX_CHARS = 60;

export function CollapsedEntry({
  text,
  onClick,
  className = "",
}: CollapsedEntryProps) {
  const shouldReduceMotion = useReducedMotion();

  const displayText =
    text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}...` : text;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        text-left w-full
        font-[family-name:var(--font-lora)] text-sm
        text-ink-tertiary hover:text-ink-secondary
        cursor-pointer
        transition-colors duration-300
        group
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.4,
        delay: shouldReduceMotion ? 0 : 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      aria-label="Edit entry"
    >
      <span className="group-hover:underline decoration-ink-tertiary/50 underline-offset-2">
        {displayText}
      </span>
    </motion.button>
  );
}

export default CollapsedEntry;
