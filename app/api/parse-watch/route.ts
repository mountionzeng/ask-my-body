/**
 * POST /api/parse-watch
 * 接收 Apple Watch 截图（1-3 张），用 Claude Vision 提取健康数据
 * 返回结构化 JSON，无需鉴权（本地处理，不存储图片）
 */

import { NextRequest, NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/claude";

export interface WatchData {
  total_sleep_hours: number | null;
  sleep_start: string | null;
  sleep_end: string | null;
  deep_sleep_minutes: number | null;
  core_sleep_minutes: number | null;
  rem_sleep_minutes: number | null;
  awake_minutes: number | null;
  hrv_ms: number | null;
  heart_rate_bpm: number | null;
  pulse_diagnosis: string | null;   // 中医脉象名称，如"沉脉"
  pulse_description: string | null; // 脉象描述，如"轻取不应"
}

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "请上传至少一张截图" }, { status: 400 });
    }

    // 转 base64 — Claude Vision 格式
    const imageBlocks = await Promise.all(
      files.slice(0, 3).map(async (file) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mediaType = (
          file.type?.startsWith("image/") ? file.type : "image/jpeg"
        ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        return {
          type: "image" as const,
          source: { type: "base64" as const, media_type: mediaType, data: base64 },
        };
      })
    );

    const client = getClaudeClient();

    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: `你是一个从 Apple Watch 截图中精确提取健康数据的助手。
仔细看这些截图，提取所有可见的数据，以纯 JSON 格式返回（不要任何说明文字）：

{
  "total_sleep_hours": 数字或null（总睡眠小时数，如 6.7），
  "sleep_start": 字符串或null（入睡时间，如 "02:56"），
  "sleep_end": 字符串或null（起床时间，如 "11:08"），
  "deep_sleep_minutes": 数字或null（深度睡眠分钟数），
  "core_sleep_minutes": 数字或null（核心睡眠分钟数），
  "rem_sleep_minutes": 数字或null（快速动眼睡眠分钟数），
  "awake_minutes": 数字或null（清醒时间分钟数），
  "hrv_ms": 数字或null（HRV毫秒数），
  "heart_rate_bpm": 数字或null（心率BPM），
  "pulse_diagnosis": 字符串或null（中医脉象名称，如"沉脉"、"浮脉"等，仅当截图中有脉诊App数据时填写），
  "pulse_description": 字符串或null（脉象描述文字，如"轻取不应"）
}

只返回 JSON，不要解释，不要 markdown 代码块。`,
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    // 提取 JSON（防止模型多输出文字）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[parse-watch] no JSON in response:", text);
      return NextResponse.json({ error: "识别失败，请重试" }, { status: 500 });
    }

    const data: WatchData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[parse-watch] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
