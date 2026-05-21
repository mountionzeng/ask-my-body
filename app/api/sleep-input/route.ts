/**
 * POST /api/sleep-input
 * Called by iOS Shortcut or /sleep page
 * Body: { notes?, hrv?, rhr?, sleep_hours?, secret? }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyShortcutSecret } from "@/lib/auth";
import { saveSleepEntry } from "@/lib/kv";
import { todayCST } from "@/lib/shichen";

export async function POST(req: NextRequest) {
  if (!verifyShortcutSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    notes?: string;
    hrv?: number;
    rhr?: number;
    sleep_hours?: number;
    date?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const date = body.date ?? todayCST();

  await saveSleepEntry({
    date,
    notes: body.notes,
    hrv: body.hrv,
    rhr: body.rhr,
    sleep_hours: body.sleep_hours,
    submitted_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, date });
}
