/**
 * POST /api/generate-report
 * Called by /morning page to generate the morning report.
 * No auth required — internal browser-to-server call.
 * Body: WatchData fields + force?
 */

import { NextRequest, NextResponse } from "next/server";
import { runMorningGuide } from "@/lib/agents/morning-guide";
import type { WatchData } from "@/app/api/parse-watch/route";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: Partial<WatchData> & { force?: boolean; body_feeling?: string; dream?: string } = {};

  try {
    body = await req.json();
  } catch {
    // empty body OK
  }

  try {
    const report = await runMorningGuide({
      hrv: body.hrv_ms ?? undefined,
      rhr: body.heart_rate_bpm ?? undefined,
      sleep_hours: body.total_sleep_hours ?? undefined,
      sleep_start: body.sleep_start ?? undefined,
      sleep_end: body.sleep_end ?? undefined,
      deep_sleep_minutes: body.deep_sleep_minutes ?? undefined,
      core_sleep_minutes: body.core_sleep_minutes ?? undefined,
      rem_sleep_minutes: body.rem_sleep_minutes ?? undefined,
      awake_minutes: body.awake_minutes ?? undefined,
      pulse_diagnosis: body.pulse_diagnosis ?? undefined,
      pulse_description: body.pulse_description ?? undefined,
      body_feeling: body.body_feeling ?? undefined,
      dream: body.dream ?? undefined,
      forceRegenerate: body.force,
    });

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    console.error("[generate-report] agent error:", err);
    return NextResponse.json(
      { error: "Agent failed", detail: String(err) },
      { status: 500 }
    );
  }
}
