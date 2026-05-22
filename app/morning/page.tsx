"use client";

import { useEffect, useState, useRef } from "react";
import ShichenBadge from "@/components/ShichenBadge";
import { PlumBlossomDecoration, WashBlob, BottomNav } from "@/components/decorations";
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
  const [bodyFeeling, setBodyFeeling] = useState("");
  const [dreamOpen, setDreamOpen] = useState(false);
  const [dreamText, setDreamText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/wake-up")
      .then((res) => res.text())
      .then((text) => {
        try { const json = JSON.parse(text); if (json.ok && json.report) { setReport(json.report); setStep("done"); } } catch { /* ignore non-JSON */ }
      })
      .catch(() => {});
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError("");
    setStep("parsing");
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    const formData = new FormData();
    Array.from(files).slice(0, 3).forEach((f) => formData.append("images", f));
    try {
      const res = await fetch("/api/parse-watch", { method: "POST", body: formData });
      const text = await res.text();
      let json: { data?: WatchData; error?: string };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(res.status === 504 ? "识别超时，请稍后重试" : "服务暂时不可用，请稍后重试");
      }
      if (!res.ok) throw new Error(json.error ?? "识别失败");
      setWatchData(json.data ?? null);
      setStep("ready");
    } catch (e) {
      setError(String(e));
      setStep("idle");
    }
  }

  async function handleGenerate(force = false) {
    setError("");
    setStep("generating");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...watchData, force, body_feeling: bodyFeeling || undefined, dream: dreamText || undefined }),
      });
      const text = await res.text();
      let json: { report?: MorningReport; error?: string };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(res.status === 504 ? "生成超时，请稍后重试" : "服务暂时不可用，请稍后重试");
      }
      if (!res.ok) throw new Error(json.error ?? "生成失败");
      setReport(json.report!);
      setStep("done");
      saveReportLocal({
        ...json.report!,
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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      {/* Decorations */}
      <PlumBlossomDecoration className="right-[-20px] top-[-10px] h-[200px] w-[160px]" />
      <WashBlob color="green" className="bottom-16 left-[-40px] h-40 w-[200px]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 110% 5%, rgba(232,160,168,0.22), transparent 35%), radial-gradient(ellipse at 0% 95%, rgba(168,196,160,0.22), transparent 40%)",
        }}
      />

      <div className="relative z-10">
        <p className="font-display text-[11px] tracking-super text-ink-400">ASK MY BODY</p>
        <h1 className="mt-3.5 font-kai text-4xl font-light leading-tight tracking-widest text-ink-800">
          晨 起<br />求 诸 己
        </h1>
        <p className="mt-3.5 font-kai text-[14px] font-light leading-relaxed text-ink-500">
          醒来第一件事，<br />先问问你的身体。
        </p>

        <div className="mt-6">
          <ShichenBadge />
        </div>

        <div className="ink-divider" />

        {/* Step 1: Upload */}
        {(step === "idle" || step === "parsing") && (
          <section>
            <p className="mb-4 text-[13px] leading-relaxed text-ink-600">
              给我睡眠记录，<br />让 AI 读懂你的昨晚。
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="cursor-pointer rounded border border-dashed py-6 text-center transition hover:border-ink-400"
              style={{
                borderColor: "rgba(138,128,120,0.55)",
                background: "rgba(250,248,243,0.4)",
              }}
            >
              {step === "parsing" ? (
                <>
                  <div className="flex justify-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400" />
                  </div>
                  <p className="mt-2 text-[13px] text-ink-500">正在识别手表数据...</p>
                </>
              ) : (
                <>
                  <svg className="mx-auto mb-2.5 h-9 w-9 opacity-55" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="15" stroke="#8a8078" strokeWidth="0.8" strokeDasharray="2 2"/>
                    <path d="M 18 11 L 18 23 M 12 17 L 18 11 L 24 17" stroke="#6a6058" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  </svg>
                  <div className="text-[13px] tracking-wider text-ink-600">导入 Apple Health 数据</div>
                  <div className="mt-1.5 text-[11px] text-ink-400">点击上传 · 或由快捷指令自动同步</div>
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

            {error && <p className="mt-3 text-center text-[13px] text-red-600">{error}</p>}

            {step === "idle" && (
              <div className="mt-3 space-y-4">
                <p className="text-center text-[11px] tracking-wider text-ink-400">
                  没有手表数据？{" "}
                  <button
                    onClick={() => { setWatchData(null); setStep("ready"); }}
                    className="border-b border-dotted border-ink-400/50 pb-px text-ink-500 hover:text-ink-700"
                  >
                    跳过，直接生成报告
                  </button>
                </p>

                {/* Dream entry */}
                <button
                  onClick={() => setDreamOpen(!dreamOpen)}
                  className="flex w-full items-center justify-center gap-2 rounded-[3px] border px-4 py-2.5 text-[12px] tracking-wider transition"
                  style={{
                    borderColor: dreamOpen ? "rgba(184,80,96,0.45)" : "rgba(138,128,120,0.35)",
                    background: dreamOpen ? "linear-gradient(180deg, #f5dde0, #f0c4c8)" : "rgba(250,248,243,0.6)",
                    color: dreamOpen ? "#4a2528" : "#4a4238",
                  }}
                >
                  <span>🌙</span>
                  <span>{dreamOpen ? "收起解梦" : "昨晚做梦了？点这里解梦"}</span>
                </button>
                {dreamOpen && (
                  <>
                    <textarea
                      value={dreamText}
                      onChange={(e) => setDreamText(e.target.value)}
                      placeholder="描述你的梦境...比如：梦到在一片竹林里迷路了、梦见已故的亲人、梦到考试迟到..."
                      rows={3}
                      className="w-full resize-none rounded-[3px] border px-3.5 py-3 text-[13px] leading-relaxed text-ink-800 outline-none placeholder:text-ink-400"
                      style={{
                        borderColor: "rgba(138,128,120,0.3)",
                        background: "rgba(250,248,243,0.6)",
                      }}
                    />
                    <button
                      onClick={() => { setWatchData(null); handleGenerate(true); }}
                      disabled={!dreamText.trim()}
                      className="btn-glow w-full rounded-[3px] border py-3.5 font-kai text-[14px] tracking-super text-ink-800 disabled:opacity-40"
                      style={{
                        borderColor: "rgba(184,80,96,0.45)",
                        background: "linear-gradient(180deg, rgba(245,221,224,0.5), rgba(240,196,200,0.4))",
                        textIndent: "0.4em",
                      }}
                    >
                      解 梦 · 生 成 报 告
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {/* Step 2: Data confirmed */}
        {step === "ready" && (
          <section className="space-y-5">
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

            {watchData ? (
              <div className="space-y-3 rounded-[3px] p-4" style={{ background: "linear-gradient(180deg, rgba(247,243,235,0.6), rgba(244,238,228,0.45))" }}>
                <p className="text-[12px] font-medium tracking-widest text-ink-500">识别到的数据</p>
                <div className="flex flex-wrap gap-2">
                  {watchData.total_sleep_hours != null && <Chip label="睡眠" value={`${watchData.total_sleep_hours}小时`} />}
                  {watchData.sleep_start && <Chip label="时段" value={`${watchData.sleep_start}→${watchData.sleep_end}`} />}
                  {watchData.deep_sleep_minutes != null && <Chip label="深度睡眠" value={fmtMin(watchData.deep_sleep_minutes)} warn={watchData.deep_sleep_minutes < 45} />}
                  {watchData.rem_sleep_minutes != null && <Chip label="REM" value={fmtMin(watchData.rem_sleep_minutes)} />}
                  {watchData.awake_minutes != null && <Chip label="清醒" value={fmtMin(watchData.awake_minutes)} warn={watchData.awake_minutes > 45} />}
                  {watchData.hrv_ms != null && <Chip label="HRV" value={`${watchData.hrv_ms}ms`} />}
                  {watchData.heart_rate_bpm != null && <Chip label="心率" value={`${watchData.heart_rate_bpm}bpm`} />}
                  {watchData.pulse_diagnosis && <Chip label="脉象" value={`${watchData.pulse_diagnosis} · ${watchData.pulse_description ?? ""}`} highlight />}
                </div>
              </div>
            ) : (
              <p className="text-center text-[13px] text-ink-400">无手表数据，将根据时辰生成基础报告</p>
            )}

            {/* Body feeling */}
            <div>
              <div className="field-label mb-2.5 text-[12px] font-medium tracking-super text-ink-600">身体感受</div>
              <textarea
                value={bodyFeeling}
                onChange={(e) => setBodyFeeling(e.target.value)}
                placeholder="比如：昨晚做梦了、肩膀有点酸、精神不错……"
                rows={2}
                className="w-full resize-none rounded-[3px] border px-3.5 py-3 text-[13px] leading-relaxed text-ink-800 outline-none placeholder:text-ink-400"
                style={{
                  borderColor: "rgba(138,128,120,0.3)",
                  background: "rgba(250,248,243,0.6)",
                }}
              />
            </div>

            {/* Dream entry */}
            <button
              onClick={() => setDreamOpen(!dreamOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-[3px] border px-4 py-2.5 text-[12px] tracking-wider transition"
              style={{
                borderColor: dreamOpen ? "rgba(184,80,96,0.45)" : "rgba(138,128,120,0.35)",
                background: dreamOpen ? "linear-gradient(180deg, #f5dde0, #f0c4c8)" : "rgba(250,248,243,0.6)",
                color: dreamOpen ? "#4a2528" : "#4a4238",
              }}
            >
              <span>🌙</span>
              <span>{dreamOpen ? "收起解梦" : "昨晚做梦了？点这里解梦"}</span>
            </button>
            {dreamOpen && (
              <textarea
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                placeholder="描述你的梦境...比如：梦到在一片竹林里迷路了、梦见已故的亲人、梦到考试迟到..."
                rows={3}
                className="w-full resize-none rounded-[3px] border px-3.5 py-3 text-[13px] leading-relaxed text-ink-800 outline-none placeholder:text-ink-400"
                style={{
                  borderColor: "rgba(138,128,120,0.3)",
                  background: "rgba(250,248,243,0.6)",
                }}
              />
            )}

            {error && <p className="text-[13px] text-red-600">{error}</p>}

            <button
              onClick={() => handleGenerate(false)}
              className="btn-glow w-full rounded-[3px] border py-4 text-[14px] tracking-super text-ink-800"
              style={{
                borderColor: "rgba(42,37,32,0.55)",
                background: "rgba(250,248,243,0.4)",
                textIndent: "0.4em",
              }}
            >
              生 成 今 晨 报 告
            </button>

            <p className="text-center">
              <button
                onClick={() => { setStep("idle"); setPreviews([]); setWatchData(null); }}
                className="text-[11px] tracking-wider text-ink-400 hover:text-ink-600"
              >
                重新上传截图
              </button>
            </p>
          </section>
        )}

        {/* Step 3: Generating */}
        {step === "generating" && (
          <section className="space-y-4 py-10 text-center">
            <div className="flex justify-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-plum-300 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-plum-300 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-plum-300" />
            </div>
            <p className="text-[13px] text-ink-400">晨间引导师正在综合你的昨夜数据...</p>
            {watchData?.pulse_diagnosis && (
              <p className="text-[12px] italic text-ink-400">包含脉象：{watchData.pulse_diagnosis}</p>
            )}
            <p className="text-[11px] text-ink-400">约需 15-30 秒</p>
          </section>
        )}

        {/* Step 4: Report */}
        {step === "done" && report && (
          <article className="space-y-5">
            <div
              className="prose-report space-y-3 text-[13px] leading-relaxed text-ink-700"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(report.content) }}
            />

            {/* Dream interpretation — always visible in done step */}
            <div className="space-y-3 border-t border-ink-200/50 pt-5">
              <button
                onClick={() => setDreamOpen(!dreamOpen)}
                className="flex w-full items-center justify-center gap-2 rounded-[3px] border px-4 py-3 text-[13px] tracking-wider transition"
                style={{
                  borderColor: dreamOpen ? "rgba(184,80,96,0.45)" : "rgba(232,160,168,0.5)",
                  background: dreamOpen ? "linear-gradient(180deg, #f5dde0, #f0c4c8)" : "linear-gradient(180deg, rgba(245,221,224,0.4), rgba(250,248,243,0.2))",
                  color: dreamOpen ? "#4a2528" : "#6b3a40",
                }}
              >
                <span>🌙</span>
                <span className="font-kai">{dreamOpen ? "收起解梦" : "昨晚做梦了？点这里解梦"}</span>
              </button>
              {dreamOpen && (
                <div className="space-y-3">
                  <textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="描述你的梦境...比如：梦到在一片竹林里迷路了、梦见已故的亲人、梦到考试迟到..."
                    rows={3}
                    className="w-full resize-none rounded-[3px] border px-3.5 py-3 text-[13px] leading-relaxed text-ink-800 outline-none placeholder:text-ink-400"
                    style={{
                      borderColor: "rgba(138,128,120,0.3)",
                      background: "rgba(250,248,243,0.6)",
                    }}
                  />
                  <button
                    onClick={() => handleGenerate(true)}
                    disabled={!dreamText.trim()}
                    className="btn-glow w-full rounded-[3px] border py-3 text-[13px] tracking-super text-ink-800 disabled:opacity-40"
                    style={{
                      borderColor: "rgba(42,37,32,0.55)",
                      background: "rgba(250,248,243,0.4)",
                      textIndent: "0.4em",
                    }}
                  >
                    解 梦 · 重 新 生 成 报 告
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-ink-200/50 pt-4 text-[11px] text-ink-400">
              <span>
                {report.model} ·{" "}
                {new Date(report.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <button
                onClick={() => { setStep("idle"); setPreviews([]); setWatchData(null); }}
                className="tracking-wider hover:text-ink-600"
              >
                重新求诸己
              </button>
            </div>
          </article>
        )}
      </div>

      <BottomNav active="morning" />
    </div>
  );
}

function Chip({ label, value, warn = false, highlight = false }: { label: string; value: string; warn?: boolean; highlight?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
      style={{
        background: highlight
          ? "linear-gradient(180deg, rgba(245,221,224,0.5), rgba(240,196,200,0.45))"
          : warn
          ? "rgba(255,245,220,0.6)"
          : "rgba(250,248,243,0.6)",
        border: highlight
          ? "1px solid rgba(184,80,96,0.45)"
          : warn
          ? "1px solid rgba(200,160,80,0.5)"
          : "1px solid rgba(138,128,120,0.35)",
        color: highlight ? "#6b3a40" : warn ? "#8a6020" : "#4a4238",
      }}
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
