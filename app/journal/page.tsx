"use client";

import { useEffect, useState } from "react";
import { InkCloudDecoration, BottomNav } from "@/components/decorations";
import { getReportsLocal, type StoredReport } from "@/lib/local-store";

export default function JournalPage() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setReports(getReportsLocal());
  }, []);

  const withMetrics = reports.filter(
    (r) => r.hrv != null || r.rhr != null || r.sleep_hours != null
  );

  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      {/* Decorations */}
      <InkCloudDecoration className="left-[-30px] top-[-30px] h-36 w-[200px]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 110% 100%, rgba(232,160,168,0.18), transparent 35%), radial-gradient(ellipse at 0% 5%, rgba(168,196,160,0.20), transparent 40%)",
        }}
      />

      <div className="relative z-10">
        <p className="font-display text-[11px] tracking-super text-ink-400">ASK MY BODY</p>
        <h1 className="mt-3.5 text-[40px] font-light leading-[1.1] tracking-widest text-ink-800">
          身 体<br />日 志
        </h1>
        <p className="mt-3.5 text-[13px] font-light leading-relaxed text-ink-500">
          {reports.length > 0
            ? <>已记录 <span className="font-display italic text-plum-500">{toChinese(reports.length)}</span> 天</>
            : "近 7 天的求诸己记录"}
        </p>

        <div className="ink-divider" />

        {/* Trends */}
        {withMetrics.length >= 2 && (
          <>
            <div className="grid grid-cols-3">
              <TrendCard
                label="HRV"
                unit="ms"
                values={withMetrics.map((r) => r.hrv).filter((v): v is number => v != null)}
                higherIsBetter
              />
              <TrendCard
                label="心率"
                unit="bpm"
                values={withMetrics.map((r) => r.rhr).filter((v): v is number => v != null)}
                higherIsBetter={false}
              />
              <TrendCard
                label="睡眠"
                unit="h"
                values={withMetrics.map((r) => r.sleep_hours).filter((v): v is number => v != null)}
                higherIsBetter
              />
            </div>
            <div className="ink-divider" />
          </>
        )}

        {/* List header */}
        {reports.length > 0 && (
          <div className="field-label mb-4 flex items-baseline text-[12px] font-medium tracking-super text-ink-600">
            最 近 记 录
          </div>
        )}

        {/* Empty state */}
        {reports.length === 0 ? (
          <section className="space-y-4 text-center">
            <p className="text-[13px] text-ink-500">还没有记录。</p>
            <p className="text-[13px] text-ink-400">
              每天早晨用「晨起求诸己」，这里会自动积累你的身体日志。
            </p>
            <a
              href="/morning"
              className="inline-block border-b border-dotted border-ink-400/50 pb-px text-[13px] text-ink-500 hover:text-ink-700"
            >
              去晨起求诸己 →
            </a>
          </section>
        ) : (
          <section className="space-y-3.5">
            {reports.map((r) => {
              const isOpen = expanded === r.date;
              return (
                <article
                  key={r.date}
                  className="relative rounded-[3px] pl-5 pr-4 pt-4 pb-4"
                  style={{
                    background: "linear-gradient(180deg, rgba(247,243,235,0.6), rgba(244,238,228,0.45))",
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute bottom-3.5 left-1.5 top-3.5 w-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(180deg, rgba(232,160,168,0.15), rgba(232,160,168,0.65) 30%, rgba(232,160,168,0.6) 70%, rgba(232,160,168,0.1))",
                    }}
                  />

                  <button
                    onClick={() => setExpanded(isOpen ? null : r.date)}
                    className="w-full text-left"
                  >
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-[14px] font-medium tracking-wider text-ink-800">
                        {formatDate(r.date)}
                      </span>
                      <span className="font-display text-[11px] uppercase tracking-wider text-ink-400">
                        {getDayOfWeek(r.date)}
                      </span>
                    </div>
                    <div className="mt-1.5 font-display text-[11px] tracking-wider text-ink-400">
                      {r.sleep_hours != null && <>睡 {r.sleep_hours}h</>}
                      {r.hrv != null && <> <span className="text-ink-300 mx-1.5">·</span> HRV {r.hrv}ms</>}
                      {r.rhr != null && <> <span className="text-ink-300 mx-1.5">·</span> HR {r.rhr}bpm</>}
                    </div>

                    {!isOpen && (
                      <div className="mt-2.5 flex items-center justify-between">
                        <p className="line-clamp-1 text-[12.5px] italic leading-relaxed text-ink-600">
                          <span className="text-ink-300">「</span>
                          {extractFirstLine(r.content)}
                          <span className="text-ink-300">」</span>
                        </p>
                        <span className="ml-3 flex-shrink-0 text-[10.5px] tracking-wider text-ink-400">
                          展开 ›
                        </span>
                      </div>
                    )}
                  </button>

                  {isOpen && (
                    <div className="mt-3 border-t border-ink-200/30 pt-3">
                      <div
                        className="space-y-3 text-[13px] leading-relaxed text-ink-700"
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(r.content) }}
                      />
                      <p className="mt-4 text-[11px] text-ink-400">
                        {r.model} ·{" "}
                        {new Date(r.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <button
                        onClick={() => setExpanded(null)}
                        className="mt-2 text-[10.5px] tracking-wider text-ink-400 hover:text-ink-600"
                      >
                        收起
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>

      <BottomNav active="journal" />
    </div>
  );
}

function TrendCard({
  label, unit, values, higherIsBetter,
}: {
  label: string; unit: string; values: number[]; higherIsBetter: boolean;
}) {
  if (values.length === 0) return null;
  const latest = values[0];
  const prev = values.length > 1 ? values[1] : null;
  const diff = prev != null ? latest - prev : null;
  const improving = diff != null ? (higherIsBetter ? diff > 0 : diff < 0) : null;

  const color = improving ? "#6e8a66" : diff === 0 ? "#8a8078" : "#c48050";
  const label2 = improving ? "变好" : diff === 0 ? "持平" : "注意";
  const arrow = improving ? "↑" : diff === 0 ? "→" : "↓";

  return (
    <div className="relative px-2 py-1.5">
      <div className="text-[11px] tracking-widest text-ink-400 mb-1.5">{label}</div>
      <div className="font-display text-[28px] font-normal leading-none text-ink-800">
        {latest}<span className="text-[11px] font-light text-ink-400 ml-0.5">{unit}</span>
      </div>
      {diff != null && (
        <div className="mt-2 flex items-center gap-1 text-[10.5px] tracking-wider" style={{ color }}>
          <span className="font-display text-[13px] leading-none">{arrow}</span>
          {Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 1)} · {label2}
        </div>
      )}
    </div>
  );
}

function toChinese(n: number): string {
  const digits = ["零","壹","贰","叁","肆","伍","陆","柒","捌","玖"];
  if (n <= 9) return digits[n];
  return String(n);
}

function formatDate(d: string): string {
  try {
    const date = new Date(d + "T00:00:00");
    const m = date.getMonth() + 1;
    const day = date.getDate();
    const cnMonth = ["","一","二","三","四","五","六","七","八","九","十","十一","十二"];
    const cnDay = (n: number) => {
      if (n <= 10) return ["","一","二","三","四","五","六","七","八","九","十"][n];
      if (n < 20) return `十${["","一","二","三","四","五","六","七","八","九"][n - 10]}`;
      if (n === 20) return "二十";
      if (n < 30) return `廿${["","一","二","三","四","五","六","七","八","九"][n - 20]}`;
      if (n === 30) return "三十";
      return `三十${["","一"][n - 30]}`;
    };
    return `${cnMonth[m]}月${cnDay(day)}`;
  } catch { return d; }
}

function getDayOfWeek(d: string): string {
  try {
    const date = new Date(d + "T00:00:00");
    return ["SUN","MON","TUE","WED","THU","FRI","SAT"][date.getDay()];
  } catch { return ""; }
}

function extractFirstLine(content: string): string {
  const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("---") && !l.startsWith(">"));
  const first = lines[0] ?? "";
  return first.replace(/\*\*/g, "").replace(/\*/g, "").slice(0, 40);
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
