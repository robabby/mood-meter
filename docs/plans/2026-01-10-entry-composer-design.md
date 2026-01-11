# EntryComposer Design

**Ticket:** SG-179
**Date:** 2026-01-10
**Status:** Ready for implementation

## Overview

EntryComposer is the orchestrator component that ties text input → API analysis → MoodOrb/Spectrum together. It manages the full "today" journaling experience with a staged reveal animation that transforms written words into visual color.

## Design Philosophy

"Feels like exhaling." The interaction should be calm, unhurried, non-judgmental. No word counts, no pressure, no productivity theater. The user decides when their thought is complete.

## States

| State | User Experience |
|-------|-----------------|
| `idle` | Expanded textarea with rotating placeholder, small orb button bottom-right |
| `analyzing` | Textarea shrinks, orb button grows and pulses in neutral gray |
| `complete` | Collapsed text snippet (faded), full MoodOrb + MoodSpectrum revealed |
| `error` | Textarea stays expanded with soft amber border, inline error message |

## File Structure

```
src/components/entry/
├── EntryComposer.tsx      # Main orchestrator
├── EntryTextarea.tsx      # Auto-resize textarea with character glow
├── SubmitOrb.tsx          # Small orb button that transforms
└── CollapsedEntry.tsx     # Faded snippet view (tappable to edit)
```

## Visual Design

### Textarea (`EntryTextarea`)

- **Auto-resize:** min 3 rows, max ~8 before scroll
- **Background:** `canvas-secondary` (warm off-white)
- **Border:** 1px `ink/10`, radius `radius-softer` (16px)
- **Typography:** Lora or Spectral at 18px, `ink-secondary` (soft serif for journaling warmth)
- **Padding:** 20px, with extra 48px bottom-right for orb button
- **Focus:** border shifts to `ink/20`, subtle `shadow-soft`

### Character Limit Glow

Soft amber glow on border as user approaches ~280 chars:

| Chars | Glow |
|-------|------|
| 0-200 | None |
| 240 | `box-shadow: 0 0 20px hsl(40, 80%, 70%, 0.2)` |
| 280 | `box-shadow: 0 0 30px hsl(40, 80%, 65%, 0.35)` |
| 320+ | Plateaus (never alarming) |

### Submit Orb (`SubmitOrb`)

- **Position:** absolute, bottom-right inside textarea (12px inset)
- **Size:** 36px circle
- **Default:** `canvas-tertiary` fill with subtle inner shadow
- **Hover:** fills with spectrum midpoint color (balanced green), scale 1.05
- **Disabled:** 50% opacity when text is empty

The orb echoes the MoodOrb — the button whispers what the words will become.

### Placeholder Whispers

Random selection from pool on mount, stable for session:

```typescript
const PLACEHOLDERS = [
  "What's moving through you?",
  "Where are you right now?",
  "What's on your mind?",
  "How does today feel?",
  "What would you like to say?",
  "What's present for you?",
];
```

Typography: Same serif as input, `ink-tertiary`, slightly italic.

## Animation Choreography

### Analyzing State

- Orb scales from 36px to 48px over 400ms
- Fills with neutral gray `hsl(0, 0%, 75%)`
- Slow pulse animation: scale 1 → 1.08 → 1, 3s loop

### Staged Reveal (analyzing → complete)

Total duration: **1200ms** with 2s color bloom overlay.

**0-400ms: Textarea shrinks**
- Height animates to ~60px (2 lines)
- Text fades to `ink-tertiary` (40% opacity)
- Orb slides out of textarea, begins moving to center
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`

**400-800ms: Orb emerges**
- Orb scales from 48px to 200px (full MoodOrb size)
- Position animates to centered above collapsed text
- Color transition begins (neutral gray → AI color, 2s duration)

**800-1200ms: Context arrives**
- AI reasoning fades in below orb (100ms delay)
- MoodSpectrum fades in below reasoning (200ms delay)
- Collapsed text snippet settles into position (300ms delay)

**Post-sequence:**
- Color continues blooming until 2s mark
- User watches the color arrive — revelation, not flash

### Reduced Motion

All transforms become instant. Only color transitions preserved (2s).

## Complete State Layout

```
┌─────────────────────────────────────┐
│                                     │
│           ┌─────────┐               │
│           │         │               │
│           │ MoodOrb │               │  ← Centered, 200px
│           │         │               │
│           └─────────┘               │
│                                     │
│   "A quiet energy, reflective..."   │  ← Reasoning, 14px, centered
│                                     │
│   ════════════●══════════════════   │  ← MoodSpectrum
│              balanced               │
│                                     │
│   "Had coffee with an old friend... │  ← CollapsedEntry, faded
│                                     │
└─────────────────────────────────────┘
```

### Collapsed Entry (`CollapsedEntry`)

- Shows first ~60 characters + ellipsis
- Typography: 14px serif, `ink-tertiary`
- Hover: text shifts to `ink-secondary`, subtle underline
- Click: expands back to full textarea, returns to `idle` state

## Error Handling

Composer stays in expanded state on error:

- Border shifts to soft amber (same as character limit)
- Gentle message fades in below textarea
- Uses friendly copy from `ERROR_MESSAGES` in `types/api.ts`
- Typography: 14px, `ink-secondary`, with em-dash prefix
- Auto-dismisses after 5s OR when user starts typing

Example:
```
— Taking a breather. Try again in a moment.
```

No modal, no toast, no red. A quiet aside.

## Component API

```typescript
interface EntryComposerProps {
  /** For editing existing entries */
  initialText?: string;
  /** Callback when entry is ready to save */
  onComplete?: (entry: {
    text: string;
    color: HSLColor;
    energy: number
  }) => void;
  /** Additional CSS classes */
  className?: string;
}
```

## Store Integration

Reads from and writes to `useJournalStore`:

**On submit:**
1. Set `analysisState: 'analyzing'`
2. POST to `/api/analyze` with text
3. On success: populate `suggestedColor`, `energy`, `reasoning`, `alternatives`; set `analysisState: 'complete'`
4. On error: set `error` message, set `analysisState: 'error'`

**Re-editing flow:**
- Tapping collapsed snippet returns to `idle` with text preserved
- Submitting again re-analyzes (user may have edited)

**Save flow:**
- `onComplete` fires when user is satisfied with color
- Parent page decides when/how to save to Supabase

## Dependencies

- `framer-motion` for animations
- `useJournalStore` for state
- `MoodOrb` and `MoodSpectrum` components
- `/api/analyze` endpoint

## Font Addition

Add Lora (Google Fonts) to the project for journaling warmth:

```typescript
// src/app/layout.tsx
import { Lora } from 'next/font/google';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});
```

## Implementation Order

1. Add Lora font to layout
2. `EntryTextarea` — auto-resize, character glow, placeholder
3. `SubmitOrb` — orb button with hover/disabled states
4. `CollapsedEntry` — faded snippet with expand interaction
5. `EntryComposer` — orchestrate states and animations
6. Integration with store and API
7. Polish animations and reduced motion support
