/**
 * Agent 1 — 守夜分析师
 * 在子时 (23:00) 和寅时 (03:00) 由 Vercel Cron 触发
 * 读取当日睡眠数据，生成「夜观笔记」并存回 KV
 */

import { readFileSync } from "fs";
import path from "path";
import { streamText, MODELS } from "@/lib/claude";
import {
  getSleepEntry,
  saveNightAnalysis,
  getNightAnalysis,
  type NightAnalysis,
} from "@/lib/kv";
import { getShichen, todayCST, yesterdayCST, hourCST } from "@/lib/shichen";

function loadSystemPrompt(): string {
  try {
    const p = path.join(process.cwd(), "prompts", "night-watcher.md");
    return readFileSync(p, "utf-8");
  } catch {
    return "你是守夜分析师，分析用户睡眠数据并提供养生建议。";
  }
}

export async function runNightWatcher(
  round: "zishi" | "yinshi"
): Promise<NightAnalysis> {
  // 子时 (23:xx) 属于昨晚开始的那一天；寅时 (03:xx) 属于今天
  const h = hourCST();
  const dataDate = h < 6 ? yesterdayCST() : todayCST();
  const analysisDate = todayCST();

  // 避免重复运行
  const existing = await getNightAnalysis(analysisDate, round);
  if (existing) return existing;

  // 读取睡眠数据
  const sleepEntry = await getSleepEntry(dataDate);
  const shichen = getShichen(h);
  const roundLabel = round === "zishi" ? "子时（23:00）" : "寅时（03:00）";
  const now = new Date();
  const timeStr = `${String(h).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} CST`;

  // 组装用户消息
  const userMessage = `
当前时辰：${shichen.name}（${roundLabel}）
当前时间：${timeStr}
时辰含义：${shichen.quality}
主经络：${shichen.meridian}

睡眠数据（${dataDate}）：
- HRV: ${sleepEntry?.hrv ?? "未记录"} ms
- 静息心率: ${sleepEntry?.rhr ?? "未记录"} bpm
- 睡眠时长: ${sleepEntry?.sleep_hours ?? "未记录"} 小时
- 睡前笔记: ${sleepEntry?.notes ?? "（无）"}

请根据以上信息，写一份今晚的「夜观笔记」。
round 标签使用：${roundLabel}
  `.trim();

  const systemPrompt = loadSystemPrompt();
  const content = await streamText({
    model: MODELS.nightWatcher,
    system: systemPrompt,
    userMessage,
    maxTokens: 800,
  });

  const analysis: NightAnalysis = {
    date: analysisDate,
    round,
    content,
    model: MODELS.nightWatcher,
    generated_at: new Date().toISOString(),
  };

  await saveNightAnalysis(analysis);
  return analysis;
}
