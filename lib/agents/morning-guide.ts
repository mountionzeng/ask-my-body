/**
 * Agent 2 — 晨间引导师
 * 在用户早晨打开 App 或 iOS Shortcut 触发时运行
 * 综合夜间分析 + 睡眠数据，生成「今晨问身报告」
 */

import { readFileSync } from "fs";
import path from "path";
import { streamText, MODELS } from "@/lib/claude";
import {
  getSleepEntry,
  getNightAnalysis,
  getMorningReport,
  saveMorningReport,
  type MorningReport,
} from "@/lib/kv";
import { getShichen, todayCST, yesterdayCST, hourCST } from "@/lib/shichen";

function loadSystemPrompt(): string {
  try {
    const p = path.join(process.cwd(), "prompts", "morning-guide.md");
    return readFileSync(p, "utf-8");
  } catch {
    return "你是晨间引导师，综合昨晚睡眠数据生成今晨养生报告。";
  }
}

export interface MorningInput {
  /** Optional fresh data from iOS Shortcut (overrides stored) */
  hrv?: number;
  rhr?: number;
  sleep_hours?: number;
  forceRegenerate?: boolean;
}

export async function runMorningGuide(
  input: MorningInput = {}
): Promise<MorningReport> {
  const today = todayCST();
  const yesterday = yesterdayCST();
  const h = hourCST();
  const shichen = getShichen(h);

  // Return cached report unless forced to regenerate
  if (!input.forceRegenerate) {
    const cached = await getMorningReport(today);
    if (cached) return cached;
  }

  // Gather all available data
  const sleepEntry = await getSleepEntry(yesterday);
  const zishiAnalysis = await getNightAnalysis(today, "zishi");
  const yinshiAnalysis = await getNightAnalysis(today, "yinshi");

  // Fresh data from Shortcut takes priority
  const hrv = input.hrv ?? sleepEntry?.hrv;
  const rhr = input.rhr ?? sleepEntry?.rhr;
  const sleep_hours = input.sleep_hours ?? sleepEntry?.sleep_hours;

  const userMessage = `
今日日期：${today}
当前时辰：${shichen.name}（${shichen.hours[0]}:00-${shichen.hours[1]}:00）
时辰养生：${shichen.quality}
${shichen.morningAdvice ? `晨间提示：${shichen.morningAdvice}` : ""}
主脏器：${shichen.organ}（${shichen.meridian}）

昨夜睡眠数据（${yesterday}）：
- HRV: ${hrv ?? "未记录"} ms
- 静息心率: ${rhr ?? "未记录"} bpm
- 睡眠时长: ${sleep_hours ?? "未记录"} 小时
- 睡前笔记: ${sleepEntry?.notes ?? "（无记录）"}

夜间守夜笔记：
${zishiAnalysis ? `【子时守夜】\n${zishiAnalysis.content}` : "（子时守夜未运行）"}

${yinshiAnalysis ? `【寅时守夜】\n${yinshiAnalysis.content}` : "（寅时守夜未运行）"}

请综合以上所有信息，生成今晨的「问身报告」。
报告中 date 使用：${today}
  `.trim();

  const systemPrompt = loadSystemPrompt();
  const content = await streamText({
    model: MODELS.morningGuide,
    system: systemPrompt,
    userMessage,
    maxTokens: 1200,
  });

  const report: MorningReport = {
    date: today,
    content,
    model: MODELS.morningGuide,
    generated_at: new Date().toISOString(),
  };

  await saveMorningReport(report);
  return report;
}
