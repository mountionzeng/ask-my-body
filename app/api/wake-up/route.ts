/**
 * POST /api/wake-up
 * Called by iOS Shortcut when user wakes up, or by /morning page
 * Body: { hrv?, rhr?, sleep_hours?, force?, secret? }
 * Returns the morning report (streams or full JSON)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyShortcutSecret } from "@/lib/auth";
import { runMorningGuide } from "@/lib/agents/morning-guide";

export async function POST(req: NextRequest) {
  if (!verifyShortcutSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    hrv?: number;
    rhr?: number;
    sleep_hours?: number;
    force?: boolean;
  } = {};

  try {
    body = await req.json();
  } catch {
    // empty body OK
  }

  try {
    const report = await runMorningGuide({
      hrv: body.hrv,
      rhr: body.rhr,
      sleep_hours: body.sleep_hours,
      forceRegenerate: body.force,
    });

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    console.error("[wake-up] agent error:", err);
    return NextResponse.json(
      { error: "Agent failed", detail: String(err) },
      { status: 500 }
    );
  }
}

// Also allow GET from /morning page (simpler, no body needed)
export async function GET(req: NextRequest) {
  // GET is not authenticated — only reads cached report
  const { getMorningReport } = await import("@/lib/kv");
  const { todayCST } = await import("@/lib/shichen");

  const today = todayCST();
  const report = await getMorningReport(today);

  if (!report) {
    return NextResponse.json({ ok: false, report: null }, { status: 200 });
  }

  return NextResponse.json({ ok: true, report });
}
