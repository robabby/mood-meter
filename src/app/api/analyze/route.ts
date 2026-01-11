import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { energyToColor, energyToLevel, generateAlternatives } from "@/lib/spectrum";
import { moodAnalysisSchema, type ApiResult, type AnalyzeResponse, type ApiError } from "@/types/api";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are helping someone understand the emotional energy in their journal entry.

Read their words with care. Your job is to sense the energy level — not whether they're happy or sad, but how much activation is present.

Think of energy as a spectrum:
- Depleted (0.0-0.2): exhausted, numb, withdrawn, can barely move
- Low (0.2-0.4): melancholy, calm, reflective, quiet
- Balanced (0.4-0.6): steady, present, okay, neutral
- Elevated (0.6-0.8): energized, anxious, excited, restless
- High (0.8-1.0): buzzing, intense, passionate, overwhelmed

Note: Anxiety and excitement both live in the elevated/high range. Grief and peaceful solitude both live in the low range. Energy isn't about good or bad.

Use the record_mood tool to share what you sense.`;

const RECORD_MOOD_TOOL: Anthropic.Tool = {
  name: "record_mood",
  description: "Record the emotional energy level sensed in the journal entry",
  input_schema: {
    type: "object" as const,
    properties: {
      energy: {
        type: "number",
        description: "Energy level from 0 (depleted) to 1 (high activation)",
      },
      reasoning: {
        type: "string",
        description: "Brief, gentle explanation of what you sensed (1-2 sentences, under 200 chars)",
      },
    },
    required: ["energy", "reasoning"],
  },
};

function createErrorResponse(
  code: ApiError["code"],
  message: string,
  status: number,
  retryAfter?: number
): NextResponse<ApiResult<never>> {
  const error: ApiError = { code, message };
  if (retryAfter) error.retryAfter = retryAfter;
  return NextResponse.json({ success: false, error }, { status });
}

function mapAnthropicError(error: unknown): NextResponse<ApiResult<never>> {
  if (error instanceof Anthropic.RateLimitError) {
    const retryAfter = error.headers?.get("retry-after");
    return createErrorResponse(
      "RATE_LIMITED",
      "Taking a breather. Try again in a moment.",
      429,
      retryAfter ? parseInt(retryAfter, 10) : undefined
    );
  }

  if (error instanceof Anthropic.APIError) {
    if (error.status === 529) {
      return createErrorResponse(
        "AI_UNAVAILABLE",
        "Our AI is resting. Your entry is saved locally.",
        503
      );
    }
    if (error.status === 400) {
      return createErrorResponse(
        "INVALID_INPUT",
        "Something doesn't look right. Try rephrasing.",
        400
      );
    }
    // Auth errors - hide implementation details
    if (error.status === 401 || error.status === 403) {
      return createErrorResponse(
        "AI_UNAVAILABLE",
        "Our AI is resting. Your entry is saved locally.",
        503
      );
    }
  }

  // Network or unknown errors
  if (error instanceof Error && error.message.includes("fetch")) {
    return createErrorResponse(
      "NETWORK",
      "Connection lost. We'll sync when you're back online.",
      503
    );
  }

  return createErrorResponse(
    "UNKNOWN",
    "Something unexpected happened. Try again?",
    500
  );
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResult<AnalyzeResponse>>> {
  // 1. Parse request body
  let text: string;
  try {
    const body = await request.json();
    text = body.text;
  } catch {
    return createErrorResponse("INVALID_INPUT", "Invalid request body.", 400);
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return createErrorResponse("INVALID_INPUT", "Please write something first.", 400);
  }

  // 2. Check Supabase session
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return createErrorResponse("UNAUTHORIZED", "Please sign in to continue.", 401);
  }

  // 3. Call Claude API with tool_use
  const model = process.env.CLAUDE_MODEL || "claude-3-5-haiku-latest";

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      tools: [RECORD_MOOD_TOOL],
      tool_choice: { type: "tool", name: "record_mood" },
      messages: [{ role: "user", content: text.trim() }],
    });
  } catch (error) {
    return mapAnthropicError(error);
  }

  // 4. Extract tool use result
  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    return createErrorResponse(
      "UNKNOWN",
      "Something unexpected happened. Try again?",
      500
    );
  }

  // 5. Validate response with Zod schema
  const parsed = moodAnalysisSchema.safeParse(toolUse.input);

  if (!parsed.success) {
    return createErrorResponse(
      "UNKNOWN",
      "Something unexpected happened. Try again?",
      500
    );
  }

  const { energy, reasoning } = parsed.data;

  // 6. Compute color, level, alternatives from energy
  const color = energyToColor(energy);
  const level = energyToLevel(energy);
  const alternatives = generateAlternatives(energy, 5);

  // 7. Return AnalyzeResponse
  const data: AnalyzeResponse = {
    energy,
    reasoning,
    color,
    level,
    alternatives,
  };

  return NextResponse.json({ success: true, data });
}
