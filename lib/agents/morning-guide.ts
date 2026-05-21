/**
 * Agent 2 — 晨间引导师
 * 在用户早晨打开 App 或上传手表截图后运行
 * 综合睡眠分期 + 脉象 + 夜间分析，生成「今晨问身报告」
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
  // 基础数据（iOS Shortcut 或手动输入）
  hrv?: number;
  rhr?: number;
  sleep_hours?: number;
  // 睡眠分期（Apple Watch Vision 提取）
  sleep_start?: string;
  sleep_end?: string;
  deep_sleep_minutes?: number;
  core_sleep_minutes?: number;
  rem_sleep_minutes?: number;
  awake_minutes?: number;
  // 中医脉象（脉诊 App 数据）
  pulse_diagnosis?: string;
  pulse_description?: string;
  // 控制
  forceRegenerate?: boolean;
}

/** 分钟 → "X小时Y分" */
function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}分钟`;
  if (min === 0) return `${h}小时`;
  return `${h}小时${min}分钟`;
}

export async function runMorningGuide(
  input: MorningInput = {}
): Promise<MorningReport> {
  const today = todayCST();
  const yesterday = yesterdayCST();
  const h = hourCST();
  const shichen = getShichen(h);

  // 返回缓存报告（除非强制重新生成）
  if (!input.forceRegenerate) {
    const cached = await getMorningReport(today);
    if (cached) return cached;
  }

  // 读取存储的数据（KV 或内存）
  const sleepEntry = await getSleepEntry(yesterday);
  const zishiAnalysis = await getNightAnalysis(today, "zishi");
  const yinshiAnalysis = await getNightAnalysis(today, "yinshi");

  // 合并：传入的新数据优先于存储的旧数据
  const hrv = input.hrv ?? sleepEntry?.hrv;
  const rhr = input.rhr ?? sleepEntry?.rhr;
  const sleep_hours =
    input.sleep_hours ??
    (input.deep_sleep_minutes != null &&
    input.core_sleep_minutes != null &&
    input.rem_sleep_minutes != null
      ? Number(
          (
            (input.deep_sleep_minutes +
              input.core_sleep_minutes +
              input.rem_sleep_minutes) /
            60
          ).toFixed(1)
        )
      : sleepEntry?.sleep_hours);

  // 睡眠分期文本
  const sleepStagesText =
    input.deep_sleep_minutes != null ||
    input.core_sleep_minutes != null ||
    input.rem_sleep_minutes != null
      ? `
睡眠分期（Apple Watch）：
- 深度睡眠: ${input.deep_sleep_minutes != null ? fmtMinutes(input.deep_sleep_minutes) : "未知"} ${input.deep_sleep_minutes != null && input.deep_sleep_minutes < 45 ? "⚠️偏少" : ""}
- 核心睡眠: ${input.core_sleep_minutes != null ? fmtMinutes(input.core_sleep_minutes) : "未知"}
- 快速动眼(REM): ${input.rem_sleep_minutes != null ? fmtMinutes(input.rem_sleep_minutes) : "未知"}
- 清醒时间: ${input.awake_minutes != null ? fmtMinutes(input.awake_minutes) : "未知"} ${input.awake_minutes != null && input.awake_minutes > 45 ? "⚠️睡眠较碎" : ""}
${input.sleep_start ? `- 入睡: ${input.sleep_start} → 起床: ${input.sleep_end ?? "未知"}` : ""}`
      : "（无睡眠分期数据）";

  // 脉象文本
  const pulseText =
    input.pulse_diagnosis
      ? `
中医脉象（脉诊 App）：
- 脉型: ${input.pulse_diagnosis}
- 描述: ${input.pulse_description ?? "无"}
- 意义参考: ${getPulseMeaning(input.pulse_diagnosis)}`
      : "（无脉象数据）";

  const userMessage = `
今日日期：${today}
当前时辰：${shichen.name}（${shichen.hours[0]}:00-${shichen.hours[1]}:00）
时辰养生：${shichen.quality}
${shichen.morningAdvice ? `晨间提示：${shichen.morningAdvice}` : ""}
主脏器：${shichen.organ}（${shichen.meridian}）

昨夜睡眠概况（${yesterday}）：
- 总睡眠: ${sleep_hours != null ? `${sleep_hours}小时` : "未记录"}
- HRV: ${hrv != null ? `${hrv}ms` : "未记录"}
- 静息心率: ${rhr != null ? `${rhr}bpm` : "未记录"}
- 睡前笔记: ${sleepEntry?.notes ?? "（无）"}
${sleepStagesText}
${pulseText}

夜间守夜笔记：
${zishiAnalysis ? `【子时守夜】\n${zishiAnalysis.content}` : "（子时守夜未运行）"}

${yinshiAnalysis ? `【寅时守夜】\n${yinshiAnalysis.content}` : "（寅时守夜未运行）"}

请综合以上所有信息，生成今晨的「问身报告」。
报告中 date 使用：${today}
  `.trim();

  const systemPrompt = loadSystemPrompt();
  const rawContent = await streamText({
    model: MODELS.morningGuide,
    system: systemPrompt,
    userMessage,
    maxTokens: 1400,
  });

  // 防御：如果模型仍然返回了 JSON，自动转为 Markdown 散文
  const content = ensureMarkdown(rawContent, today, shichen.name);

  const report: MorningReport = {
    date: today,
    content,
    model: MODELS.morningGuide,
    generated_at: new Date().toISOString(),
  };

  await saveMorningReport(report);
  return report;
}

/** 常见脉象中医含义速查 */
function getPulseMeaning(pulse: string): string {
  const dict: Record<string, string> = {
    沉脉: "主里证，多见于肾气不足、气血内陷，宜温补",
    浮脉: "主表证，外感初起，或阴虚阳浮",
    数脉: "主热证，心率偏快，宜清热",
    迟脉: "主寒证，阳气不足",
    弦脉: "主肝郁、痛证、痰饮，压力大时常见",
    滑脉: "主痰湿、食积，或妊娠",
    涩脉: "主血虚、气滞血瘀",
    细脉: "主血虚、阴虚，体力消耗过大",
    洪脉: "主热盛，气血亢奋",
    虚脉: "主虚证，气血两虚",
  };
  return dict[pulse] ?? "请结合整体状态综合判断";
}

/**
 * 万能防御：检测模型是否输出了 JSON，自动转为可读 Markdown
 * 正常情况下模型应直接返回 Markdown，此函数作为兜底
 */
function ensureMarkdown(raw: string, date: string, shichen: string): string {
  // 去掉代码块包裹
  const stripped = raw
    .replace(/^```(?:json)?\s*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();

  // 尝试解析 JSON
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(stripped);
  } catch {
    // 不是 JSON，原样返回（正常路径）
    return raw;
  }

  // 是 JSON — 把内容拼成 Markdown 散文
  const lines: string[] = [];
  lines.push("---", "");
  lines.push(`## 今晨问身 · ${date}`, "");

  if (data.greeting) lines.push(`> ${data.greeting}`, "");

  lines.push("### 昨夜身体报告", "");
  const sleep = data.sleep_summary as Record<string, unknown> | undefined;
  if (sleep?.comment) {
    lines.push(String(sleep.comment), "");
  }

  const pulse = data.pulse_summary as Record<string, unknown> | undefined;
  if (pulse?.type) {
    lines.push(`**脉象：${pulse.type}**  `);
    if (pulse.interpretation) lines.push(String(pulse.interpretation), "");
  }

  const focus = data.today_focus as unknown[];
  if (Array.isArray(focus) && focus.length) {
    lines.push("### 今日养生建议", "");
    focus.forEach((item, i) => {
      lines.push(`**建议 ${i + 1}**  `);
      lines.push(String(item), "");
    });
  }

  lines.push("### 今日时辰提醒", "");
  lines.push(
    `> ${shichen} · ${data.zang_focus ?? ""} · ${
      (data as Record<string, unknown>).shichen_advice ?? "顺应时辰，安养身心"
    }`,
    ""
  );

  lines.push("---", "");
  lines.push("*非医疗建议 · 自愿参考 · 身体是你自己的庙*");

  return lines.join("\n");
}
