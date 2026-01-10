# Mood Meter

AI-powered emotional wellness PWA. Users write brief journal entries, AI analyzes sentiment and maps to a color on an energy spectrum, users can adjust the color—teaching the system their personal emotional vocabulary over time.

## Design Philosophy

**This app should feel like exhaling.** Calm, unhurried, non-judgmental. Not clinical, not gamified. A quiet room with good light.

**No streaks, no guilt, no productivity theater.** Users come when they want a mirror, not when an app demands attention.

## The Energy Spectrum

Colors represent **energy states**, not moral judgments:

| Energy | Range | Colors | Examples |
|--------|-------|--------|----------|
| Depleted | 0-20% | Deep blues, grays | exhausted, numb, withdrawn |
| Low | 20-40% | Teals, purples | melancholy, calm, reflective |
| Balanced | 40-60% | Greens, neutrals | content, steady, present |
| Elevated | 60-80% | Yellows, oranges | excited, anxious, energized |
| High | 80-100% | Reds, corals | joy, anger, passion |

**Key insight:** Anxiety and excitement live in the same color neighborhood (both high-energy). So do grief and peaceful solitude. The color shows energy; the journal entry provides context.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS 4 + Framer Motion
- **State**: Zustand (journal state, offline queue)
- **Database**: Supabase (Postgres + Auth)
- **AI**: Claude API for sentiment analysis
- **Validation**: Zod for runtime type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, signup (unauthenticated)
│   ├── (app)/             # Today, calendar, entry (authenticated)
│   └── api/               # analyze, entries, sync
├── components/
│   ├── mood/              # MoodOrb, MoodSpectrum, MoodSuggestion
│   ├── entry/             # EntryComposer, VoiceInput
│   ├── calendar/          # CalendarGrid, CalendarDay
│   └── ui/                # Primitives (Button, Sheet, etc.)
├── hooks/                 # useMoodAnalysis, useVoiceInput, etc.
├── lib/
│   ├── spectrum.ts        # Energy→color mapping (core algorithm)
│   ├── supabase/          # Client, server, middleware
│   └── cn.ts              # Class name utility
├── stores/                # Zustand stores
└── types/                 # Domain types + API schemas
```

## Core Interaction Flow

1. User writes brief entry (~280 chars) or uses voice input
2. AI analyzes → returns energy level, color, reasoning
3. User sees color + explanation + 5 alternative shades
4. User accepts or adjusts (spectrum slider or full color wheel)
5. Entry saved with final color
6. Over time: calendar shows patterns, AI learns preferences

## Key Files

- `src/lib/spectrum.ts` — Energy→color mapping. The algorithm that converts 0-1 energy to HSL.
- `src/types/mood.ts` — Core domain types (HSLColor, EnergyLevel, MoodEntry)
- `src/stores/useJournalStore.ts` — Current entry composition state
- `src/stores/useOfflineQueue.ts` — Offline-first sync queue

## Animation Principles

- **Slow defaults**: 400-600ms transitions
- **Soft easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Breathing, not pulsing**: MoodOrb has 4s subtle scale cycle
- **Color transitions**: 2s with easeInOut (never jump between colors)
- **Respect reduced motion**: Disable animations but keep color transitions

## Design Tokens

Defined in `src/app/globals.css` via `@theme inline`:
- `--color-canvas-*` — Warm paper whites
- `--color-ink-*` — Warm blacks/grays
- `--color-spectrum-*` — Energy spectrum colors
- `--radius-soft`, `--radius-softer` — Soft, not sharp
- `--shadow-soft`, `--shadow-medium` — Subtle, diffuse

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
```

## External Services

- **Supabase**: Database + Auth (project already created)
- **Linear**: Project management (project already created)
- **Claude API**: Sentiment analysis (key in .env.local)

## Documentation

Full design doc and architecture in Obsidian vault:
`Projects/Active/Mood Meter/`

## What's Next

1. MoodOrb component (breathing animation, glow effect)
2. MoodSpectrum component (energy slider)
3. EntryComposer component (text + voice input)
4. AI prompt for sentiment → color mapping
5. /api/analyze route implementation
6. Supabase entries table schema
