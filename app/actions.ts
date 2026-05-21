"use server";

import { runMorningGuide } from "@/lib/agents/morning-guide";
import { getMorningReport } from "@/lib/kv";
import { todayCST } from "@/lib/shichen";

export async function fetchTodayReport() {
  const today = todayCST();
  const report = await getMorningReport(today);
  return report;
}

export async function generateMorningReport(forceRegenerate = false) {
  const report = await runMorningGuide({ forceRegenerate });
  return report;
}
