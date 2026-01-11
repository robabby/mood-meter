import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { energyToLevel } from "@/lib/spectrum";
import { createEntrySchema, type ApiResult, type ApiError } from "@/types/api";
import type { MoodEntry } from "@/types/mood";
import { entryRowToMoodEntry, type EntryInsert } from "@/types/database";

function createErrorResponse(
  code: ApiError["code"],
  message: string,
  status: number
): NextResponse<ApiResult<never>> {
  const error: ApiError = { code, message };
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResult<MoodEntry>>> {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return createErrorResponse("INVALID_INPUT", "Invalid request body.", 400);
  }

  const parsed = createEntrySchema.safeParse(body);
  if (!parsed.success) {
    return createErrorResponse(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message || "Invalid request data.",
      400
    );
  }

  const { text, date, color, energy, aiGenerated, reasoning } = parsed.data;

  // 2. Check Supabase session
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return createErrorResponse(
      "UNAUTHORIZED",
      "Please sign in to continue.",
      401
    );
  }

  // 3. Prepare insert data
  const insert: EntryInsert = {
    user_id: user.id,
    text,
    color_h: color.h,
    color_s: color.s,
    color_l: color.l,
    energy_value: energy,
    energy_level: energyToLevel(energy),
    ai_generated: aiGenerated,
    reasoning: reasoning ?? null,
    entry_date: date,
  };

  // 4. Insert into database
  const { data: row, error: dbError } = await supabase
    .from("entries")
    .insert(insert)
    .select()
    .single();

  if (dbError) {
    console.error("Database error:", dbError);
    console.error("Insert data:", insert);
    console.error("User ID:", user.id);
    // In development, show actual error
    const message = process.env.NODE_ENV === "development"
      ? `Database error: ${dbError.message}`
      : "Failed to save entry. Try again?";
    return createErrorResponse("UNKNOWN", message, 500);
  }

  // 5. Return saved entry
  const entry = entryRowToMoodEntry(row);
  return NextResponse.json({ success: true, data: entry });
}
