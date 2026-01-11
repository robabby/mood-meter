# EntryComposer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the orchestrator component that ties text input → API analysis → MoodOrb/Spectrum together with a staged reveal animation.

**Architecture:** Four sub-components (EntryTextarea, SubmitOrb, CollapsedEntry, EntryComposer) managed by useJournalStore. State machine: idle → analyzing → complete/error. Staged reveal animation transforms written words into visual color over 1.2s.

**Tech Stack:** React 19, Framer Motion, Zustand, Tailwind CSS 4, Next.js App Router, Lora font (Google Fonts)

---

## Task 1: Add Lora Font

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts` (if exists) or `src/app/globals.css`

**Step 1: Add Lora font import to layout**

```tsx
// src/app/layout.tsx - add import
import { Lora } from "next/font/google";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});
```

**Step 2: Add font variable to body classes**

In the same file, update the `<body>` tag to include `${lora.variable}`.

**Step 3: Add font-family utility to globals.css**

```css
/* src/app/globals.css - add under @theme inline */
--font-lora: var(--font-lora);
```

**Step 4: Verify font loads**

Run: `pnpm dev`
Open browser, inspect element, verify `--font-lora` CSS variable exists.

**Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add Lora font for journaling warmth

SG-179"
```

---

## Task 2: Create EntryTextarea Component

**Files:**
- Create: `src/components/entry/EntryTextarea.tsx`

**Step 1: Create the component with auto-resize**

```tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PLACEHOLDERS = [
  "What's moving through you?",
  "Where are you right now?",
  "What's on your mind?",
  "How does today feel?",
  "What would you like to say?",
  "What's present for you?",
];

interface EntryTextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Character limit thresholds
const SOFT_LIMIT = 280;
const GLOW_START = 200;
const GLOW_FULL = 280;
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

  // Random placeholder on mount
  const placeholder = useRef(
    PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  ).current;

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
      className={`
        w-full resize-none
        bg-canvas-secondary
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
```

**Step 2: Verify component renders**

Run: `pnpm dev`
Temporarily import in a page to verify it renders with placeholder and auto-resizes.

**Step 3: Commit**

```bash
git add src/components/entry/EntryTextarea.tsx
git commit -m "feat(entry): add EntryTextarea with auto-resize and character glow

- Random rotating placeholders
- Amber glow as approaching 280 chars
- Lora font for journaling warmth

SG-179"
```

---

## Task 3: Create SubmitOrb Component

**Files:**
- Create: `src/components/entry/SubmitOrb.tsx`

**Step 1: Create the orb button component**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { energyToColor, hslToString } from "@/lib/spectrum";

interface SubmitOrbProps {
  onClick: () => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
  className?: string;
}

// Easing curve from design tokens
const EASE_SOFT = [0.45, 0, 0.15, 1] as const;

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
      style={{
        width: isAnalyzing ? 48 : 36,
        height: isAnalyzing ? 48 : 36,
      }}
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
            : "var(--color-canvas-tertiary)",
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
```

**Step 2: Verify component renders and animates**

Run: `pnpm dev`
Test hover state and analyzing state visually.

**Step 3: Commit**

```bash
git add src/components/entry/SubmitOrb.tsx
git commit -m "feat(entry): add SubmitOrb button with pulse animation

- Echoes MoodOrb visual language
- Hover fills with balanced green
- Analyzing state: grows and pulses

SG-179"
```

---

## Task 4: Create CollapsedEntry Component

**Files:**
- Create: `src/components/entry/CollapsedEntry.tsx`

**Step 1: Create the collapsed snippet component**

```tsx
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
        delay: shouldReduceMotion ? 0 : 0.3,
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
```

**Step 2: Verify component renders**

Run: `pnpm dev`
Test click and hover states.

**Step 3: Commit**

```bash
git add src/components/entry/CollapsedEntry.tsx
git commit -m "feat(entry): add CollapsedEntry for faded snippet view

- Truncates to 60 chars with ellipsis
- Hover reveals underline, darkens text
- Click to expand back to editing

SG-179"
```

---

## Task 5: Create EntryComposer Component - Part 1 (Structure)

**Files:**
- Create: `src/components/entry/EntryComposer.tsx`
- Create: `src/components/entry/index.ts`

**Step 1: Create the main orchestrator component structure**

```tsx
"use client";

import { useCallback } from "react";
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

  // Initialize with initialText if provided
  if (initialText && !text) {
    setText(initialText);
  }

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
```

**Step 2: Create barrel export**

```tsx
// src/components/entry/index.ts
export { EntryComposer } from "./EntryComposer";
export { EntryTextarea } from "./EntryTextarea";
export { SubmitOrb } from "./SubmitOrb";
export { CollapsedEntry } from "./CollapsedEntry";
```

**Step 3: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds with no type errors.

**Step 4: Commit**

```bash
git add src/components/entry/EntryComposer.tsx src/components/entry/index.ts
git commit -m "feat(entry): add EntryComposer orchestrator component

- Manages idle/analyzing/complete/error states
- Staged reveal animation sequence
- Integrates with useJournalStore and /api/analyze

SG-179"
```

---

## Task 6: Update Store for Initial Text Support

**Files:**
- Modify: `src/stores/useJournalStore.ts`

**Step 1: Check if initialText handling in component causes issues**

The current EntryComposer has a side effect in the render body. Move it to useEffect:

```tsx
// In EntryComposer.tsx, replace the direct setText call with:
import { useEffect } from "react";

// Inside component, replace:
// if (initialText && !text) {
//   setText(initialText);
// }

// With:
useEffect(() => {
  if (initialText && !text) {
    setText(initialText);
  }
}, [initialText]); // Only run on mount or when initialText changes
```

**Step 2: Verify no hydration issues**

Run: `pnpm dev`
Test that the component works with and without initialText.

**Step 3: Commit**

```bash
git add src/components/entry/EntryComposer.tsx
git commit -m "fix(entry): move initialText handling to useEffect

Prevents React hydration warnings from side effects in render.

SG-179"
```

---

## Task 7: Create Demo Page

**Files:**
- Create: `src/app/(app)/today/page.tsx` (or modify if exists)

**Step 1: Check if today page exists**

Run: `ls src/app/`

**Step 2: Create or update the today page**

```tsx
// src/app/(app)/today/page.tsx
import { EntryComposer } from "@/components/entry";

export default function TodayPage() {
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <EntryComposer className="w-full" />
    </main>
  );
}
```

**Step 3: Verify page loads and full flow works**

Run: `pnpm dev`
Navigate to `/today`
Test:
1. Type text, see placeholder disappear
2. See amber glow appear around 200+ chars
3. Click orb button
4. See analyzing state (orb pulses)
5. See reveal animation (orb grows, color fills)
6. See reasoning and spectrum appear
7. Adjust spectrum slider
8. Click collapsed text to edit

**Step 4: Commit**

```bash
git add src/app/\(app\)/today/page.tsx
git commit -m "feat: add today page with EntryComposer

Full journaling flow: write → analyze → visualize → adjust

SG-179"
```

---

## Task 8: Polish and Final Verification

**Step 1: Run full build**

```bash
pnpm build
```

Expected: No errors.

**Step 2: Run lint**

```bash
pnpm lint
```

Fix any lint errors that appear.

**Step 3: Manual testing checklist**

- [ ] Placeholder shows different text on refresh
- [ ] Auto-resize works smoothly
- [ ] Amber glow appears at ~200 chars
- [ ] Submit orb hover shows green
- [ ] Submit orb disabled when empty
- [ ] Analyzing state shows pulse
- [ ] Complete state shows orb, reasoning, spectrum
- [ ] Spectrum slider works
- [ ] Collapsed text shows truncated entry
- [ ] Click collapsed text returns to editing
- [ ] Error state shows friendly message
- [ ] Reduced motion respects preferences

**Step 4: Final commit if any fixes**

```bash
git add -A
git commit -m "polish(entry): address lint and testing feedback

SG-179"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Add Lora font | layout.tsx, globals.css |
| 2 | EntryTextarea | EntryTextarea.tsx |
| 3 | SubmitOrb | SubmitOrb.tsx |
| 4 | CollapsedEntry | CollapsedEntry.tsx |
| 5 | EntryComposer | EntryComposer.tsx, index.ts |
| 6 | Fix initialText | EntryComposer.tsx |
| 7 | Demo page | today/page.tsx |
| 8 | Polish | Various |

**Total commits:** 8
**Estimated implementation time:** 45-60 minutes
