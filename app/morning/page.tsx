"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ShichenBadge from "@/components/ShichenBadge";
import { saveReportLocal } from "@/lib/local-store";
import type { WatchData } from "@/app/api/parse-watch/route";

interface MorningReport {
  date: string;
  content: string;
  model: string;
  generated_at: string;
}

type Step = "idle" | "parsing" | "ready" | "generating" | "done";

export default function MorningPage() {
  const [step, setStep] = useState<Step>("idle");
  const [watchData, setWatchData] = useState<WatchData | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [report, setReport] = useState<MorningReport | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 启动时检查今日缓存报告
  useEffect(() => {
    fetch("/api/wake-up")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.report) { setReport(json.report); setStep("done"); }
      })
      .catch(() => {});
  }, []);

  // 上传并解析截图
  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError("");
    setStep("parsing");

    // 生成预览
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    const formData = new FormData();
    Array.from(files).slice(0, 3).forEach((f) => formData.append("images", f));

    try {
      const res = await fetch("/api/parse-watch", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "识别失败");
      setWatchData(json.data);
      setStep("ready");
    } catch (e) {
      setError(String(e));
      setStep("idle");
    }
  }

  // 生成今晨报告
  async function handleGenerate(force = false) {
    setError("");
    setStep("generating");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...watchData, force }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "生成失败");
      setReport(json.report);
      setStep("done");
      // Save to localStorage for journal history
      saveReportLocal({
        ...json.report,
        hrv: watchData?.hrv_ms ?? undefined,
        rhr: watchData?.heart_rate_bpm ?? undefined,
        sleep_hours: watchData?.total_sleep_hours ?? undefined,
        deep_sleep_minutes: watchData?.deep_sleep_minutes ?? undefined,
        rem_sleep_minutes: watchData?.rem_sleep_minutes ?? undefined,
      });
    } catch (e) {
      setError(String(e));
      setStep("ready");
    }
  }

  // 拖拽支持
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-10 py-12">
      {/* Header */}
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-400">Ask My Body</p>
        <h1 className="font-serif text-4xl font-light text-ink-900">晨起问身</h1>
        <p className="font-serif text-sm text-ink-600">醒来第一件事，先问问你的身体。</p>
      </header>

      <div className="flex justify-center">
        <ShichenBadge />
      </div>

      <div className="ink-divider" />

      {/* ── 步骤 1：上传截图 ── */}
      {(step === "idle" || step === "parsing") && (
        <section className="space-y-6">
          <p className="text-center font-serif text-sm text-ink-600">
            拍一下手表，让 AI 读懂你的昨晚。
          </p>

          {/* 上传区域 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-ink-400 p-10 transition hover:border-ink-800 hover:bg-ink-100"
          >
            {step === "parsing" ? (
              <>
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400" />
                </div>
                <p className="font-serif text-sm text-ink-600">正在识别手表数据…</p>
              </>
            ) : (
              <>
                <span className="text-3xl">⌚</span>
                <p className="font-serif text-sm text-ink-800">
                  点击上传手表截图
                </p>
                <p className="text-xs text-ink-400">
                  支持睡眠阶段图 + 表盘，最多 3 张
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {error && (
            <p className="text-center font-serif text-sm text-red-600">{error}</p>
          )}

          {/* 跳过按钮 */}
          {step === "idle" && (
            <p className="text-center text-xs text-ink-400">
              没有手表数据？{" "}
              <button
                onClick={() => { setWatchData(null); setStep("ready"); }}
                className="underline underline-offset-2 hover:text-ink-600"
              >
                跳过，直接生成报告
              </button>
            </p>
          )}
        </section>
      )}

      {/* ── 步骤 2：数据确认 ── */}
      {step === "ready" && (
        <section className="space-y-6">
          {/* 缩略图 */}
          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {previews.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`手表截图 ${i + 1}`}
                  className="h-20 w-auto rounded border border-ink-200 object-cover"
                />
              ))}
            </div>
          )}

          {/* 提取的数据 */}
          {watchData ? (
            <div className="space-y-3 border border-ink-100 bg-ink-50 p-4">
              <p className="font-serif text-xs font-medium text-ink-600">识别到的数据</p>
              <div className="flex flex-wrap gap-2">
                {watchData.total_sleep_hours != null && (
                  <Chip label="睡眠" value={`${watchData.total_sleep_hours}小时`} />
                )}
                {watchData.sleep_start && (
                  <Chip label="时段" value={`${watchData.sleep_start}→${watchData.sleep_end}`} />
                )}
                {watchData.deep_sleep_minutes != null && (
                  <Chip
                    label="深度睡眠"
                    value={fmtMin(watchData.deep_sleep_minutes)}
                    warn={watchData.deep_sleep_minutes < 45}
                  />
                )}
                {watchData.rem_sleep_minutes != null && (
                  <Chip label="REM" value={fmtMin(watchData.rem_sleep_minutes)} />
                )}
                {watchData.awake_minutes != null && (
                  <Chip
                    label="清醒"
                    value={fmtMin(watchData.awake_minutes)}
                    warn={watchData.awake_minutes > 45}
                  />
                )}
                {watchData.hrv_ms != null && (
                  <Chip label="HRV" value={`${watchData.hrv_ms}ms`} />
                )}
                {watchData.heart_rate_bpm != null && (
                  <Chip label="心率" value={`${watchData.heart_rate_bpm}bpm`} />
                )}
                {watchData.pulse_diagnosis && (
                  <Chip
                    label="脉象"
                    value={`${watchData.pulse_diagnosis} · ${watchData.pulse_description ?? ""}`}
                    highlight
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="text-center font-serif text-sm text-ink-400">
              无手表数据，将根据时辰生成基础报告
            </p>
          )}

          {error && (
            <p className="font-serif text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => handleGenerate(false)}
              disabled={false}
              className="inline-flex items-center justify-center rounded-none border border-ink-800 px-10 py-3 font-serif text-sm tracking-widest text-ink-900 transition hover:bg-ink-800 hover:text-ink-50 disabled:opacity-40"
            >
              生成今晨报告
            </button>
            <button
              onClick={() => { setStep("idle"); setPreviews([]); setWatchData(null); }}
              className="text-xs text-ink-400 underline-offset-2 hover:text-ink-600 hover:underline"
            >
              重新上传截图
            </button>
          </div>
        </section>
      )}

      {/* ── 步骤 3：生成中 ── */}
      {step === "generating" && (
        <section className="space-y-4 py-10 text-center">
          <div className="flex justify-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300" />
          </div>
          <p className="font-serif text-sm text-ink-400">
            晨间引导师正在综合你的昨夜数据…
          </p>
          {watchData?.pulse_diagnosis && (
            <p className="font-serif text-xs italic text-ink-400">
              包含脉象：{watchData.pulse_diagnosis}
            </p>
          )}
          <p className="text-xs text-ink-400">约需 15-30 秒</p>
        </section>
      )}

      {/* ── 步骤 4：报告已生成 ── */}
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
              onClick={() => { setStep("idle"); setPreviews([]); setWatchData(null); }}
              className="underline-offset-2 hover:text-ink-600 hover:underline"
            >
              重新问身
            </button>
          </div>
        </article>
      )}

      <div className="ink-divider" />

      <footer className="flex items-center justify-center gap-6 text-xs text-ink-400">
        <Link href="/sleep" className="underline-offset-2 hover:text-ink-600 hover:underline">
          睡前记录
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

// ── 小组件 ──────────────────────────────────────────────────────────────────

function Chip({
  label,
  value,
  warn = false,
  highlight = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-1 font-serif text-xs ${
        highlight
          ? "border-ink-600 bg-ink-100 text-ink-800"
          : warn
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-ink-200 text-ink-600"
      }`}
    >
      <span className="text-ink-400">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

function fmtMin(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}分`;
  if (min === 0) return `${h}小时`;
  return `${h}h${min}m`;
}

function markdownToHtml(md: string): string {
  // 剥掉可能残留的代码块包裹
  md = md.replace(/^```(?:json|markdown)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
  return md
    .replace(/^---$/gm, '<hr class="border-ink-100 my-4" />')
    .replace(
      /^## (.+)$/gm,
      "<h2 class='font-serif text-base font-medium mt-6 mb-2 text-ink-900'>$1</h2>"
    )
    .replace(
      /^### (.+)$/gm,
      "<h3 class='font-serif text-sm font-medium mt-4 mb-1 text-ink-800'>$1</h3>"
    )
    .replace(
      /^> (.+)$/gm,
      "<blockquote class='border-l-2 border-ink-200 pl-4 italic text-ink-600 my-2'>$1</blockquote>"
    )
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-ink-700'>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-ink-900'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p class='mb-3 text-ink-700'>")
    .replace(/\n/g, "<br />");
}
