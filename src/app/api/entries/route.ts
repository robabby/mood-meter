import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { energyToLevel, averageColors } from "@/lib/spectrum";
import { createEntrySchema, type ApiResult, type ApiError } from "@/types/api";
import type { MoodEntry, DayMood, HSLColor } from "@/types/mood";
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

/**
 * GET /api/entries
 * Fetch entries by date range, grouped by day for calendar view
 *
 * Query params:
 * - start: ISO date YYYY-MM-DD (required)
 * - end: ISO date YYYY-MM-DD (required)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResult<DayMood[]>>> {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // Validate date params
  if (!start || !end) {
    return createErrorResponse(
      "INVALID_INPUT",
      "start and end date params required.",
      400
    );
  }

  // Basic date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start) || !dateRegex.test(end)) {
    return createErrorResponse(
      "INVALID_INPUT",
      "Dates must be in YYYY-MM-DD format.",
      400
    );
  }

  // Check auth
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

  // Query entries in date range
  const { data: rows, error: dbError } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: true });

  if (dbError) {
    console.error("Database error:", dbError);
    return createErrorResponse("UNKNOWN", "Failed to fetch entries.", 500);
  }

  // Convert to domain types and group by date
  const entries = (rows || []).map(entryRowToMoodEntry);
  const dayMoods = aggregateEntriesByDay(entries);

  return NextResponse.json({ success: true, data: dayMoods });
}

/**
 * Group entries by date and calculate dominant color
 */
function aggregateEntriesByDay(entries: MoodEntry[]): DayMood[] {
  const byDate = new Map<string, MoodEntry[]>();

  for (const entry of entries) {
    const dateKey = entry.date.toISOString().split("T")[0];
    const existing = byDate.get(dateKey) || [];
    existing.push(entry);
    byDate.set(dateKey, existing);
  }

  const dayMoods: DayMood[] = [];

  for (const [date, dayEntries] of byDate) {
    const colors: HSLColor[] = dayEntries.map((e) => e.color);
    const dominantColor = averageColors(colors);

    // Use the energy level of the most recent entry for the day
    const sortedByTime = [...dayEntries].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const energyLevel = sortedByTime[0].energyLevel;

    dayMoods.push({
      date,
      dominantColor,
      energyLevel,
      entryCount: dayEntries.length,
      entries: dayEntries,
    });
  }

  return dayMoods;
}
