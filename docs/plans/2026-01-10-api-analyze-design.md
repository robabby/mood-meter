# API Route: /api/analyze

**Ticket:** [SG-181](https://linear.app/sherpagg/issue/SG-181/api-route-apianalyze)
**Status:** Design complete, ready for implementation

## Overview

POST endpoint that analyzes journal entry text and returns emotional energy level with color mapping.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI returns | `energy` (0-1) + `reasoning` only | Color computed via `energyToColor()` — single source of truth |
| Prompt tone | Warm, therapeutic | Matches app's "quiet room" philosophy |
| Examples in prompt | None | Trust Claude's interpretation; add later if calibration drifts |
| Response format | `tool_use` | Guarantees valid JSON schema |
| Invalid input | Always return something | Default toward 0.5; reasoning explains uncertainty |
| Auth | Require Supabase session | Token-consuming endpoint needs protection |
| Error handling | Map to our error codes | `RATE_LIMITED`, `AI_UNAVAILABLE`, etc. |
| Model | Haiku 3.5 (configurable) | Cost-effective for short, structured task |

## Schema Changes

Update `src/types/api.ts`:

```typescript
/** Schema for validating Claude API response (via tool_use) */
export const moodAnalysisSchema = z.object({
  energy: z.number().min(0).max(1),
  reasoning: z.string().max(200),
});

export type MoodAnalysisResponse = z.infer<typeof moodAnalysisSchema>;

/** Full response from /api/analyze (after we compute color) */
export interface AnalyzeResponse {
  energy: number;
  reasoning: string;
  color: {
    h: number;
    s: number;
    l: number;
  };
  level: EnergyLevel;
  alternatives: Array<{ h: number; s: number; l: number }>;
}
```

## Claude Prompt

**System:**

```
You are helping someone understand the emotional energy in their journal entry.

Read their words with care. Your job is to sense the energy level — not whether
they're happy or sad, but how much activation is present.

Think of energy as a spectrum:
- Depleted (0.0-0.2): exhausted, numb, withdrawn, can barely move
- Low (0.2-0.4): melancholy, calm, reflective, quiet
- Balanced (0.4-0.6): steady, present, okay, neutral
- Elevated (0.6-0.8): energized, anxious, excited, restless
- High (0.8-1.0): buzzing, intense, passionate, overwhelmed

Note: Anxiety and excitement both live in the elevated/high range. Grief and
peaceful solitude both live in the low range. Energy isn't about good or bad.

Use the record_mood tool to share what you sense.
```

**Tool definition:**

```json
{
  "name": "record_mood",
  "description": "Record the emotional energy level sensed in the journal entry",
  "input_schema": {
    "type": "object",
    "properties": {
      "energy": {
        "type": "number",
        "description": "Energy level from 0 (depleted) to 1 (high activation)"
      },
      "reasoning": {
        "type": "string",
        "description": "Brief, gentle explanation of what you sensed (1-2 sentences, under 200 chars)"
      }
    },
    "required": ["energy", "reasoning"]
  }
}
```

**User message:** The journal entry text (no wrapper).

## Route Implementation

**File:** `src/app/api/analyze/route.ts`

**Flow:**

1. Parse request body, validate `text` exists
2. Check Supabase session — return 401 if unauthenticated
3. Call Claude API with `tool_use`
4. Validate response with Zod schema
5. Compute `color`, `level`, `alternatives` from energy
6. Return `AnalyzeResponse`

**Error mapping:**

| Anthropic Error | Our Code | Notes |
|-----------------|----------|-------|
| 429 | `RATE_LIMITED` | Include `retryAfter` if provided |
| 529 (overloaded) | `AI_UNAVAILABLE` | |
| 400 | `INVALID_INPUT` | |
| Auth/key errors | `AI_UNAVAILABLE` | Hide implementation details |
| Network/timeout | `NETWORK` | |
| Other | `UNKNOWN` | |

**Response shape:**

```typescript
// Success
{ success: true, data: AnalyzeResponse }

// Failure
{ success: false, error: { code: ErrorCode, message: string, retryAfter?: number } }
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-haiku-latest  # optional, defaults to haiku
```

## Dependencies

- `@anthropic-ai/sdk` — Claude API client (needs to be added)
- `createClient()` from `src/lib/supabase/server.ts`
- `energyToColor()`, `energyToLevel()`, `generateAlternatives()` from `src/lib/spectrum.ts`

## Related Issues

- **SG-188:** Client-side entry validation (10-280 chars, 2+ words)

## Implementation Checklist

- [ ] Add `@anthropic-ai/sdk` dependency
- [ ] Simplify `moodAnalysisSchema` in `src/types/api.ts`
- [ ] Add `AnalyzeResponse` type
- [ ] Create `src/app/api/analyze/route.ts`
- [ ] Add `ANTHROPIC_API_KEY` to `.env.local`
- [ ] Test with sample entries
