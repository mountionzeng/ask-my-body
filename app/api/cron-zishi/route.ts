/**
 * GET /api/cron-zishi
 * Vercel Cron Job — runs at 子时 (CST 23:00 = UTC 15:00)
 * Schedule: "0 15 * * *"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/auth";
import { runNightWatcher } from "@/lib/agents/night-watcher";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analysis = await runNightWatcher("zishi");
    console.log(`[cron-zishi] 守夜完成 ${analysis.date} ${analysis.round}`);
    return NextResponse.json({
      ok: true,
      date: analysis.date,
      round: analysis.round,
      generated_at: analysis.generated_at,
    });
  } catch (err) {
    console.error("[cron-zishi] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
