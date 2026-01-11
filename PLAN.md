# Mood Meter Development Plan

Current sprint: **MVP Core Components**

## Active Work Items

All tickets live in Linear under the **Mood Meter** project in the Sherpa workspace.

| Order | Issue | Title | Branch | Status |
|-------|-------|-------|--------|--------|
| 1 | [SG-182](https://linear.app/sherpagg/issue/SG-182) | Supabase Schema: entries table | `sg-182-supabase-schema-entries-table` | Backlog |
| 2 | [SG-180](https://linear.app/sherpagg/issue/SG-180) | AI Sentiment Analysis Prompt | `sg-180-ai-sentiment-analysis-prompt-design` | Backlog |
| 3 | [SG-177](https://linear.app/sherpagg/issue/SG-177) | MoodOrb Component | `sg-177-moodorb-component` | Done |
| 4 | [SG-178](https://linear.app/sherpagg/issue/SG-178) | MoodSpectrum Component | `sg-178-moodspectrum-component` | Done |
| 5 | [SG-181](https://linear.app/sherpagg/issue/SG-181) | API Route: /api/analyze | `sg-181-api-route-apianalyze` | Done |
| 6 | [SG-179](https://linear.app/sherpagg/issue/SG-179) | EntryComposer Component | `sg-179-entrycomposer-component` | Backlog |

## Recommended Order Rationale

### Phase 1: Foundation
1. **SG-182 (Supabase Schema)** — Database first. Defines the shape of persisted data. No code dependencies.
2. **SG-180 (AI Prompt)** — Can design and test in isolation. Informs the API route structure.

### Phase 2: Visual Core
3. **SG-177 (MoodOrb)** — The emotional heart of the app. Pure presentational component, easy to build and iterate on visually.
4. **SG-178 (MoodSpectrum)** — Pairs naturally with MoodOrb. Together they form the mood visualization system.

### Phase 3: Integration
5. **SG-181 (API Route)** — Connects AI prompt to frontend. Depends on prompt design and schema understanding.
6. **SG-179 (EntryComposer)** — The orchestrator. Ties text input → API → MoodOrb/Spectrum together.

## Parallel Work Opportunities

These can be worked on simultaneously by different contributors:
- **SG-182 + SG-180** — Backend/AI work, no overlap
- **SG-177 + SG-178** — Both are presentational components

## Definition of Done

Each ticket is complete when:
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged to main
- [ ] Linear ticket moved to Done
- [ ] Any follow-up issues created if needed

## Future Work (Not Yet Ticketed)

- Calendar view components
- Voice input integration
- Offline sync implementation
- User preferences/settings
- Onboarding flow
