/**
 * POST /api/parse-bazi
 * Accepts an image (photo of BaZi chart, screenshot, handwritten note)
 * Uses Claude Vision to extract the eight characters (八字)
 */

import { NextRequest, NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/claude";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传一张图片" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = (
      file.type?.startsWith("image/") ? file.type : "image/jpeg"
    ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const client = getClaudeClient();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `你是一个从图片中提取八字（四柱）信息的助手。图片可能是：
- 八字排盘截图
- 手写的八字
- 命理App截图
- 任何包含天干地支信息的图片

请仔细识别图中的天干地支信息，以纯 JSON 格式返回（不要任何说明文字）：

{
  "bazi": "完整八字文本，格式如：甲子年 丙寅月 壬午日 辛亥时",
  "year_pillar": "年柱，如 甲子",
  "month_pillar": "月柱，如 丙寅",
  "day_pillar": "日柱，如 壬午",
  "hour_pillar": "时柱，如 辛亥（如果图中没有可为null）",
  "extra_info": "图中其他相关信息（五行、纳音等），没有则为null"
}

只返回 JSON，不要解释，不要 markdown 代码块。如果图片中找不到八字信息，返回 {"bazi": null, "error": "未能识别八字信息，请确认图片内容"}`,
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[parse-bazi] no JSON in response:", text);
      return NextResponse.json({ error: "识别失败，请重试" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    if (!data.bazi) {
      return NextResponse.json(
        { error: data.error ?? "未能识别八字信息" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[parse-bazi] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
