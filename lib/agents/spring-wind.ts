/**
 * 问春风 Agent — 每日运势引导师
 * 根据用户八字 + 当日天干地支 + 节气 + 地理位置
 * 生成带古籍引用的每日指南
 */

import { readFileSync } from "fs";
import path from "path";
import { streamText, MODELS } from "@/lib/claude";
import { todayCST } from "@/lib/shichen";
import {
  parseBaZi,
  getTodayContext,
  getDirectionAdvice,
  WUXING_COLORS,
  WUXING_SHENG,
  WUXING_KE,
} from "@/lib/bazi";

function loadSystemPrompt(): string {
  try {
    const p = path.join(process.cwd(), "prompts", "spring-wind.md");
    return readFileSync(p, "utf-8");
  } catch {
    return "你是问春风运势引导师，根据八字和天干地支为用户提供每日指南。";
  }
}

export interface SpringWindInput {
  bazi: string;       // 八字原文
  city: string;       // 城市
  forceRegenerate?: boolean;
}

export interface SpringWindReport {
  date: string;
  content: string;
  model: string;
  generated_at: string;
  bazi: string;
  city: string;
}

export async function runSpringWind(
  input: SpringWindInput
): Promise<SpringWindReport> {
  const today = todayCST();

  // 解析八字
  const baziParsed = parseBaZi(input.bazi);
  const todayCtx = getTodayContext(today);

  // 日主五行（从八字日柱取，若无则从当日天干取）
  const dayMasterWuxing = baziParsed.dayMasterWuxing ?? todayCtx.dayGanZhi.wuxingGan;
  const dayMaster = baziParsed.dayMaster ?? todayCtx.dayGanZhi.gan;

  // 方位建议
  const directions = getDirectionAdvice(dayMasterWuxing);

  // 宜穿颜色（生我者+同我者）
  const shengWo = Object.entries(WUXING_SHENG).find(([, v]) => v === dayMasterWuxing)?.[0] ?? dayMasterWuxing;
  const luckyColors = [
    ...(WUXING_COLORS[shengWo]?.colors ?? []),
    ...(WUXING_COLORS[dayMasterWuxing]?.colors ?? []),
  ];
  // 忌穿颜色（克我者）
  const keWo = WUXING_KE[dayMasterWuxing];
  const avoidColors = WUXING_COLORS[keWo]?.colors ?? [];

  // 八字柱位文本
  const pillarsText = baziParsed.pillars.length > 0
    ? baziParsed.pillars.map((p, i) => {
        const names = ["年柱", "月柱", "日柱", "时柱"];
        return `${names[i] ?? `柱${i + 1}`}: ${p.gan}${p.zhi}`;
      }).join("、")
    : "（八字未完整提供）";

  const userMessage = `
今日日期：${today}
当日天干地支（日柱）：${todayCtx.dayGanZhi.gan}${todayCtx.dayGanZhi.zhi}（${todayCtx.dayGanZhi.wuxingGan}${todayCtx.dayGanZhi.wuxingZhi}）
当月干支：${todayCtx.monthGanZhi.gan}${todayCtx.monthGanZhi.zhi}
当前节气：${todayCtx.jieQi.name}
节气五行：${todayCtx.jieQi.element}
节气养生：${todayCtx.jieQi.advice}
节气古籍：${todayCtx.jieQi.classic}

用户八字：${input.bazi}
八字解析：${pillarsText}
日主天干：${dayMaster}（五行属${dayMasterWuxing}）
${baziParsed.valid ? "" : "⚠️ 八字解析不完整，请基于可用信息分析，并提醒用户补全。"}

用户城市：${input.city}

五行预算参考：
- 生日主（${dayMasterWuxing}）的五行：${shengWo}
- 克日主（${dayMasterWuxing}）的五行：${keWo}
- 宜穿颜色参考：${luckyColors.join("、")}
- 忌穿颜色参考：${avoidColors.join("、")}
- ${directions.detail}
- 吉方：${directions.lucky.join("、")}
- 凶方：${directions.avoid.join("、")}

请综合以上信息，生成「问春风」今日指南。
注意：
1. 每个建议都要有古籍引用出处
2. 写出五行推演过程
3. 结合${input.city}的气候特点给出接地气的建议
4. 语气温润自然，如春风拂面
5. 报告 date 使用：${today}
  `.trim();

  const systemPrompt = loadSystemPrompt();
  const rawContent = await streamText({
    model: MODELS.morningGuide,
    system: systemPrompt,
    userMessage,
    maxTokens: 2000,
  });

  // 防御 JSON 输出
  const content = ensureMarkdown(rawContent);

  const report: SpringWindReport = {
    date: today,
    content,
    model: MODELS.morningGuide,
    generated_at: new Date().toISOString(),
    bazi: input.bazi,
    city: input.city,
  };

  return report;
}

function ensureMarkdown(raw: string): string {
  const stripped = raw
    .replace(/^```(?:json|markdown)?\s*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();
  try {
    JSON.parse(stripped);
    // If it parses as JSON, wrap it
    return `## 问春风\n\n${stripped}`;
  } catch {
    return raw;
  }
}
