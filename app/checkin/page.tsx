"use client";

import { useState } from "react";
import ShichenBadge from "@/components/ShichenBadge";
import { BambooDecoration, WashBlob, BottomNav } from "@/components/decorations";
import { saveReportLocal } from "@/lib/local-store";

const MOOD_TAGS = [
  { emoji: "\u{1F60C}", label: "平静" },
  { emoji: "\u{1F60A}", label: "愉悦" },
  { emoji: "\u{1F614}", label: "疲惫" },
  { emoji: "\u{1F620}", label: "烦躁" },
  { emoji: "\u{1F630}", label: "焦虑" },
  { emoji: "\u{1F622}", label: "低落" },
  { emoji: "\u{1F914}", label: "迷糊" },
  { emoji: "\u{1F4AA}", label: "精力充沛" },
];

const BODY_TAGS = [
  "头疼", "肩颈酸", "腰酸", "胃胀", "喉咙干",
  "眼睛累", "手脚凉", "出汗多", "失眠", "多梦",
  "食欲差", "便秘", "上火", "怕冷", "皮肤痒",
];

type Step = "input" | "generating" | "done";

interface CheckinReport {
  date: string;
  content: string;
  model: string;
  generated_at: string;
}

export default function CheckinPage() {
  const [step, setStep] = useState<Step>("input");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedBody, setSelectedBody] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [report, setReport] = useState<CheckinReport | null>(null);
  const [error, setError] = useState("");

  function toggleTag(tag: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  }

  async function handleSubmit() {
    const feeling = [
      selectedMoods.length ? `心情：${selectedMoods.join("、")}` : "",
      selectedBody.length ? `身体：${selectedBody.join("、")}` : "",
      freeText,
    ].filter(Boolean).join("；");

    if (!feeling.trim()) {
      setError("至少选一个标签或写几个字吧");
      return;
    }
    setError("");
    setStep("generating");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body_feeling: feeling, force: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "生成失败");
      setReport(json.report);
      setStep("done");
      saveReportLocal({ ...json.report });
    } catch (e) {
      setError(String(e));
      setStep("input");
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      {/* Decorations */}
      <BambooDecoration className="right-[-30px] top-28 h-56 w-24 opacity-50" />
      <WashBlob color="pink" className="bottom-[-30px] left-[-40px] right-[-40px] h-44" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 100% 20%, rgba(168,196,160,0.20), transparent 35%), radial-gradient(ellipse at 0% 110%, rgba(232,160,168,0.22), transparent 40%)",
        }}
      />

      <div className="relative z-10">
        <p className="font-display text-[11px] tracking-super text-ink-400">ASK MY BODY</p>
        <h1 className="mt-3.5 font-kai text-[44px] font-light leading-[1.1] tracking-widest text-ink-800">
          求 诸 己
        </h1>
        <p className="mt-3.5 font-kai text-[14px] font-light leading-relaxed text-ink-500">
          此刻，你的身体想说什么？
        </p>

        <div className="mt-6">
          <ShichenBadge />
        </div>

        <div className="ink-divider" />

        {/* Input */}
        {step === "input" && (
          <section className="space-y-5">
            {/* Mood */}
            <div>
              <div className="field-label mb-3.5 flex items-center text-[12px] font-medium tracking-super text-ink-600">
                心 情
                <span className="ml-auto font-display text-[11px] tracking-wider text-ink-300">i.</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOOD_TAGS.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => toggleTag(m.label, selectedMoods, setSelectedMoods)}
                    className="rounded-full border px-3.5 py-2 text-[12px] leading-snug tracking-wide transition"
                    style={{
                      background: selectedMoods.includes(m.label)
                        ? "linear-gradient(180deg, #f5dde0, #f0c4c8)"
                        : "rgba(250,248,243,0.6)",
                      borderColor: selectedMoods.includes(m.label)
                        ? "rgba(184,80,96,0.45)"
                        : "rgba(138,128,120,0.35)",
                      color: selectedMoods.includes(m.label) ? "#4a2528" : "#4a4238",
                      boxShadow: selectedMoods.includes(m.label) ? "0 1px 0 rgba(232,160,168,0.3)" : "none",
                    }}
                  >
                    <span className="mr-0.5 text-[13px]">{m.emoji}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body signals */}
            <div>
              <div className="field-label mb-3.5 flex items-center text-[12px] font-medium tracking-super text-ink-600">
                身 体 信 号
                <span className="ml-auto font-display text-[11px] tracking-wider text-ink-300">ii.</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {BODY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag, selectedBody, setSelectedBody)}
                    className="rounded-full border px-3.5 py-2 text-[12px] leading-snug tracking-wide transition"
                    style={{
                      background: selectedBody.includes(tag)
                        ? "linear-gradient(180deg, rgba(168,196,160,0.5), rgba(140,176,130,0.45))"
                        : "rgba(250,248,243,0.6)",
                      borderColor: selectedBody.includes(tag)
                        ? "rgba(110,138,102,0.55)"
                        : "rgba(138,128,120,0.35)",
                      color: selectedBody.includes(tag) ? "#2a3528" : "#4a4238",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Free text */}
            <div>
              <div className="field-label mb-3 flex items-center text-[12px] font-medium tracking-super text-ink-600">
                还 有 什 么 想 说 的
                <span className="ml-auto font-display text-[11px] tracking-wider text-ink-300">iii.</span>
              </div>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="开会开了一下午，眼睛胀，想喝杯热的……"
                rows={3}
                className="w-full resize-none rounded-[3px] border px-3.5 py-3 text-[13px] leading-relaxed text-ink-800 outline-none placeholder:text-ink-400"
                style={{
                  borderColor: "rgba(138,128,120,0.3)",
                  background: "rgba(250,248,243,0.6)",
                }}
              />
            </div>

            {error && <p className="text-center text-[13px] text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              className="btn-glow w-full rounded-[3px] border py-4 text-[14px] tracking-super text-ink-800"
              style={{
                borderColor: "rgba(42,37,32,0.55)",
                background: "rgba(250,248,243,0.4)",
                textIndent: "0.5em",
              }}
            >
              求 诸 己
            </button>
          </section>
        )}

        {/* Generating */}
        {step === "generating" && (
          <section className="space-y-4 py-10 text-center">
            <div className="flex justify-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-plum-300 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-plum-300 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-plum-300" />
            </div>
            <p className="text-[13px] text-ink-400">正在为你生成养生建议...</p>
            <p className="text-[11px] text-ink-400">约需 15-30 秒</p>
          </section>
        )}

        {/* Done */}
        {step === "done" && report && (
          <article className="space-y-5">
            <div
              className="space-y-3 text-[13px] leading-relaxed text-ink-700"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(report.content) }}
            />
            <div className="flex items-center justify-between border-t border-ink-200/50 pt-4 text-[11px] text-ink-400">
              <span>
                {report.model} ·{" "}
                {new Date(report.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <button
                onClick={() => { setStep("input"); setSelectedMoods([]); setSelectedBody([]); setFreeText(""); }}
                className="tracking-wider hover:text-ink-600"
              >
                再次求诸己
              </button>
            </div>
          </article>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

function markdownToHtml(md: string): string {
  md = md.replace(/^```(?:json|markdown)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
  return md
    .replace(/^---$/gm, '<hr class="my-5" style="height:1px;background:linear-gradient(to right,transparent,rgba(42,37,32,0.15) 30%,rgba(42,37,32,0.15) 70%,transparent)" />')
    .replace(/^## (.+)$/gm, "<h2 class='text-[15px] font-medium mt-6 mb-2 tracking-wider text-ink-800'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 class='text-[13px] font-medium mt-4 mb-1 tracking-wider text-ink-700'>$1</h3>")
    .replace(/^> (.+)$/gm, "<blockquote class='border-l-2 pl-4 italic my-2' style='border-color:rgba(232,160,168,0.5);color:#6a6058'>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-ink-600'>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-ink-800'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p class='mb-3 text-ink-600'>")
    .replace(/\n/g, "<br />");
}
