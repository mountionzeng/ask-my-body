/**
 * GET /api/cron-yinshi
 * Vercel Cron Job — runs at 寅时 (CST 03:00 = UTC 19:00)
 * Schedule: "0 19 * * *"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/auth";
import { runNightWatcher } from "@/lib/agents/night-watcher";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analysis = await runNightWatcher("yinshi");
    console.log(`[cron-yinshi] 守夜完成 ${analysis.date} ${analysis.round}`);
    return NextResponse.json({
      ok: true,
      date: analysis.date,
      round: analysis.round,
      generated_at: analysis.generated_at,
    });
  } catch (err) {
    console.error("[cron-yinshi] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
