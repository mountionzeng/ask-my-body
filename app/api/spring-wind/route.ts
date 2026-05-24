/**
 * POST /api/spring-wind
 * Called by /chunfeng page to generate daily fortune guide.
 * Body: { bazi: string, city: string, force?: boolean }
 */

import { NextRequest, NextResponse } from "next/server";
import { runSpringWind } from "@/lib/agents/spring-wind";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { bazi?: string; city?: string; question?: string; force?: boolean } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.bazi?.trim()) {
    return NextResponse.json({ error: "请输入你的八字" }, { status: 400 });
  }
  if (!body.city?.trim()) {
    return NextResponse.json({ error: "请输入你的城市" }, { status: 400 });
  }

  try {
    const report = await runSpringWind({
      bazi: body.bazi,
      city: body.city,
      question: body.question,
      forceRegenerate: body.force,
    });

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    console.error("[spring-wind] agent error:", err);
    return NextResponse.json(
      { error: "生成失败，请稍后重试", detail: String(err) },
      { status: 500 }
    );
  }
}
