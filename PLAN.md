# Mood Meter Development Plan

Current sprint: **MVP Core Components**

## Active Work Items

All tickets live in Linear under the **Mood Meter** project in the Sherpa workspace.

| Order | Issue | Title | Branch | Status |
|-------|-------|-------|--------|--------|
| 1 | [SG-182](https://linear.app/sherpagg/issue/SG-182) | Supabase Schema: entries table | `sg-182-supabase-schema-entries-table` | Done |
| 2 | [SG-177](https://linear.app/sherpagg/issue/SG-177) | MoodOrb Component | `sg-177-moodorb-component` | Done |
| 3 | [SG-178](https://linear.app/sherpagg/issue/SG-178) | MoodSpectrum Component | `sg-178-moodspectrum-component` | Done |
| 4 | [SG-181](https://linear.app/sherpagg/issue/SG-181) | API Route: /api/analyze | `sg-181-api-route-apianalyze` | Done |
| 5 | [SG-179](https://linear.app/sherpagg/issue/SG-179) | EntryComposer Component | `sg-179-entrycomposer-component` | Done |
| 6 | [SG-190](https://linear.app/sherpagg/issue/SG-190) | Wire up full entry save flow | `sg-190-wire-up-full-entry-save-flow` | Done |
| 7 | [SG-191](https://linear.app/sherpagg/issue/SG-191) | Auth UI: Login and Signup pages | `sg-191-auth-ui-login-and-signup-pages` | Done |

## Completed This Sprint

- **Supabase schema** for profiles and entries tables
- **MoodOrb** breathing, glowing color visualization
- **MoodSpectrum** energy slider for adjusting colors
- **/api/analyze** Claude API integration for sentiment analysis
- **EntryComposer** text input → analysis → visualization flow
- **/api/entries** save entries to database
- **Auth UI** login/signup pages with email confirmation flow

## Backlog

| Issue | Title | Notes |
|-------|-------|-------|
| [SG-188](https://linear.app/sherpagg/issue/SG-188) | Client-side entry validation | 10-280 chars, 2+ words |
| [SG-192](https://linear.app/sherpagg/issue/SG-192) | Calendar view components | Monthly grid, day cells with mood colors |
| [SG-193](https://linear.app/sherpagg/issue/SG-193) | Voice input for EntryComposer | Web Speech API, tap to record |
| [SG-194](https://linear.app/sherpagg/issue/SG-194) | Offline sync implementation | Queue locally, sync when online |
| [SG-195](https://linear.app/sherpagg/issue/SG-195) | User preferences and settings | Display name, theme, export data |
| [SG-196](https://linear.app/sherpagg/issue/SG-196) | Onboarding flow | Welcome, spectrum explainer, first entry |

## Definition of Done

Each ticket is complete when:
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged to main
- [ ] Linear ticket moved to Done
- [ ] Any follow-up issues created if needed
