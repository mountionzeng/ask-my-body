/**
 * Vercel KV wrapper — gracefully falls back to an in-memory store
 * when KV_REST_API_URL is not configured (local dev without KV).
 */

// ⚠️  不在顶层 import @vercel/kv — 它会在模块加载时验证 KV_REST_API_URL，
//    URL 为空时抛 SyntaxError。改为按需动态 import，只在真正需要时加载。

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SleepEntry {
  date: string;          // "YYYY-MM-DD" CST
  notes?: string;        // 睡前文字记录
  hrv?: number;          // ms (Apple Watch)
  rhr?: number;          // bpm
  sleep_hours?: number;  // 睡眠时长 h
  submitted_at: string;  // ISO timestamp
}

export interface NightAnalysis {
  date: string;
  round: "zishi" | "yinshi"; // 子时 | 寅时
  content: string;            // Markdown Agent output
  model: string;
  generated_at: string;
}

export interface MorningReport {
  date: string;
  content: string;    // Markdown Agent output
  model: string;
  generated_at: string;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

const memStore = new Map<string, unknown>();

const isKVConfigured =
  Boolean(process.env.KV_REST_API_URL) &&
  Boolean(process.env.KV_REST_API_TOKEN);

async function get<T>(key: string): Promise<T | null> {
  if (isKVConfigured) {
    const { kv } = await import("@vercel/kv");
    return kv.get<T>(key);
  }
  return (memStore.get(key) as T) ?? null;
}

async function set(key: string, value: unknown, ex?: number): Promise<void> {
  if (isKVConfigured) {
    const { kv } = await import("@vercel/kv");
    if (ex) {
      await kv.set(key, value, { ex });
    } else {
      await kv.set(key, value);
    }
  } else {
    memStore.set(key, value);
  }
}

async function keys(pattern: string): Promise<string[]> {
  if (isKVConfigured) {
    const { kv } = await import("@vercel/kv");
    return kv.keys(pattern);
  }
  const prefix = pattern.replace("*", "");
  return Array.from(memStore.keys()).filter((k) => k.startsWith(prefix));
}

// ─── Domain helpers ──────────────────────────────────────────────────────────

/** 睡前记录 */
export async function saveSleepEntry(entry: SleepEntry): Promise<void> {
  await set(`sleep:${entry.date}`, entry, 60 * 60 * 24 * 30); // 30 days
}

export async function getSleepEntry(date: string): Promise<SleepEntry | null> {
  return get<SleepEntry>(`sleep:${date}`);
}

/** 守夜分析 */
export async function saveNightAnalysis(analysis: NightAnalysis): Promise<void> {
  await set(
    `night-analysis:${analysis.date}:${analysis.round}`,
    analysis,
    60 * 60 * 24 * 30
  );
}

export async function getNightAnalysis(
  date: string,
  round: "zishi" | "yinshi"
): Promise<NightAnalysis | null> {
  return get<NightAnalysis>(`night-analysis:${date}:${round}`);
}

/** 晨间报告 */
export async function saveMorningReport(report: MorningReport): Promise<void> {
  await set(`morning:${report.date}`, report, 60 * 60 * 24 * 30);
}

export async function getMorningReport(date: string): Promise<MorningReport | null> {
  return get<MorningReport>(`morning:${date}`);
}

/** 获取最近 N 天的晨间报告 */
export async function getRecentMorningReports(n = 7): Promise<MorningReport[]> {
  const ks = await keys("morning:*");
  const sorted = ks.sort().reverse().slice(0, n);
  const results = await Promise.all(sorted.map((k) => get<MorningReport>(k)));
  return results.filter((r): r is MorningReport => r !== null);
}

/** 获取最近 N 天的睡眠记录 */
export async function getRecentSleepEntries(n = 7): Promise<SleepEntry[]> {
  const ks = await keys("sleep:*");
  const sorted = ks.sort().reverse().slice(0, n);
  const results = await Promise.all(sorted.map((k) => get<SleepEntry>(k)));
  return results.filter((r): r is SleepEntry => r !== null);
}
