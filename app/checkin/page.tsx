"use client";

import { useState } from "react";
import Link from "next/link";
import ShichenBadge from "@/components/ShichenBadge";
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
    ]
      .filter(Boolean)
      .join("；");

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
      saveReportLocal({
        ...json.report,
      });
    } catch (e) {
      setError(String(e));
      setStep("input");
    }
  }

  return (
    <div className="space-y-10 py-12">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-400">
          Ask My Body
        </p>
        <h1 className="font-serif text-4xl font-light text-ink-900">
          问身
        </h1>
        <p className="font-serif text-sm text-ink-600">
          此刻，你的身体想说什么？
        </p>
      </header>

      <div className="flex justify-center">
        <ShichenBadge />
      </div>

      <div className="ink-divider" />

      {/* ── Input Step ── */}
      {step === "input" && (
        <section className="space-y-6">
          {/* Mood Tags */}
          <div className="space-y-2">
            <p className="font-serif text-xs text-ink-600">心情</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => toggleTag(m.label, selectedMoods, setSelectedMoods)}
                  className={`flex items-center gap-1 border px-3 py-1.5 font-serif text-xs transition ${
                    selectedMoods.includes(m.label)
                      ? "border-ink-800 bg-ink-800 text-ink-50"
                      : "border-ink-200 text-ink-600 hover:border-ink-400"
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Tags */}
          <div className="space-y-2">
            <p className="font-serif text-xs text-ink-600">身体信号</p>
            <div className="flex flex-wrap gap-2">
              {BODY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag, selectedBody, setSelectedBody)}
                  className={`border px-3 py-1.5 font-serif text-xs transition ${
                    selectedBody.includes(tag)
                      ? "border-ink-800 bg-ink-800 text-ink-50"
                      : "border-ink-200 text-ink-600 hover:border-ink-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Free Text */}
          <div className="space-y-2">
            <p className="font-serif text-xs text-ink-600">还有什么想说的</p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="比如：最近加班多、昨晚喝了酒、月经第三天..."
              rows={3}
              className="w-full resize-none border border-ink-200 bg-ink-50 px-3 py-2 font-serif text-sm text-ink-800 placeholder:text-ink-400 focus:border-ink-400 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-center font-serif text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center justify-center border border-ink-800 px-10 py-3 font-serif text-sm tracking-widest text-ink-900 transition hover:bg-ink-800 hover:text-ink-50"
            >
              问身
            </button>
          </div>
        </section>
      )}

      {/* ── Generating ── */}
      {step === "generating" && (
        <section className="space-y-4 py-10 text-center">
          <div className="flex justify-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300" />
          </div>
          <p className="font-serif text-sm text-ink-400">
            正在为你生成养生建议...
          </p>
          <p className="text-xs text-ink-400">约需 15-30 秒</p>
        </section>
      )}

      {/* ── Report Done ── */}
      {step === "done" && report && (
        <article className="space-y-6">
          <div
            className="space-y-3 font-serif text-sm leading-relaxed text-ink-800"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(report.content) }}
          />
          <div className="flex items-center justify-between border-t border-ink-100 pt-4 text-xs text-ink-400">
            <span>
              {report.model} ·{" "}
              {new Date(report.generated_at).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={() => {
                setStep("input");
                setSelectedMoods([]);
                setSelectedBody([]);
                setFreeText("");
              }}
              className="underline-offset-2 hover:text-ink-600 hover:underline"
            >
              再次问身
            </button>
          </div>
        </article>
      )}

      <div className="ink-divider" />

      <footer className="flex items-center justify-center gap-6 text-xs text-ink-400">
        <Link href="/morning" className="underline-offset-2 hover:text-ink-600 hover:underline">
          晨起问身
        </Link>
        <span className="text-ink-200">·</span>
        <Link href="/journal" className="underline-offset-2 hover:text-ink-600 hover:underline">
          身体日志
        </Link>
        <span className="text-ink-200">·</span>
        <Link href="/" className="underline-offset-2 hover:text-ink-600 hover:underline">
          首页
        </Link>
      </footer>
    </div>
  );
}

function markdownToHtml(md: string): string {
  md = md.replace(/^```(?:json|markdown)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
  return md
    .replace(/^---$/gm, '<hr class="border-ink-100 my-4" />')
    .replace(/^## (.+)$/gm, "<h2 class='font-serif text-base font-medium mt-6 mb-2 text-ink-900'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 class='font-serif text-sm font-medium mt-4 mb-1 text-ink-800'>$1</h3>")
    .replace(/^> (.+)$/gm, "<blockquote class='border-l-2 border-ink-200 pl-4 italic text-ink-600 my-2'>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-ink-700'>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-ink-900'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p class='mb-3 text-ink-700'>")
    .replace(/\n/g, "<br />");
}
