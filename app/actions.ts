"use server";

import { runMorningGuide } from "@/lib/agents/morning-guide";
import { getMorningReport } from "@/lib/kv";
import { todayCST } from "@/lib/shichen";
import type { WatchData } from "@/app/api/parse-watch/route";

export async function fetchTodayReport() {
  const today = todayCST();
  return getMorningReport(today);
}

export async function generateMorningReport(
  watchData?: WatchData | null,
  forceRegenerate = false
) {
  return runMorningGuide({
    hrv: watchData?.hrv_ms ?? undefined,
    rhr: watchData?.heart_rate_bpm ?? undefined,
    sleep_hours: watchData?.total_sleep_hours ?? undefined,
    sleep_start: watchData?.sleep_start ?? undefined,
    sleep_end: watchData?.sleep_end ?? undefined,
    deep_sleep_minutes: watchData?.deep_sleep_minutes ?? undefined,
    core_sleep_minutes: watchData?.core_sleep_minutes ?? undefined,
    rem_sleep_minutes: watchData?.rem_sleep_minutes ?? undefined,
    awake_minutes: watchData?.awake_minutes ?? undefined,
    pulse_diagnosis: watchData?.pulse_diagnosis ?? undefined,
    pulse_description: watchData?.pulse_description ?? undefined,
    forceRegenerate,
  });
}
