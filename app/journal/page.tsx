"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReportsLocal, type StoredReport } from "@/lib/local-store";

export default function JournalPage() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setReports(getReportsLocal());
  }, []);

  // Extract reports with metrics for trend display
  const withMetrics = reports.filter(
    (r) => r.hrv != null || r.rhr != null || r.sleep_hours != null
  );

  return (
    <div className="space-y-10 py-12">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-400">
          Ask My Body
        </p>
        <h1 className="font-serif text-4xl font-light text-ink-900">
          身体日志
        </h1>
        <p className="font-serif text-sm text-ink-600">
          {reports.length > 0
            ? `已记录 ${reports.length} 天`
            : "近 7 天的问身记录"}
        </p>
      </header>

      <div className="ink-divider" />

      {/* ── Trend Overview ── */}
      {withMetrics.length >= 2 && (
        <section className="space-y-4">
          <h2 className="font-serif text-sm font-medium text-ink-800 text-center">
            身体趋势
          </h2>
          <div className="flex justify-center gap-6">
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
        </section>
      )}

      {/* ── Report List ── */}
      {reports.length === 0 ? (
        <section className="space-y-4 text-center">
          <p className="font-serif text-sm text-ink-600">还没有记录。</p>
          <p className="font-serif text-sm text-ink-400">
            每天早晨用「晨起问身」，这里会自动积累你的身体日志。
          </p>
          <Link
            href="/morning"
            className="inline-block font-serif text-sm text-ink-600 underline underline-offset-4"
          >
            去晨起问身 →
          </Link>
        </section>
      ) : (
        <section className="space-y-6">
          {reports.map((r) => {
            const isOpen = expanded === r.date;
            return (
              <article
                key={r.date}
                className="border border-ink-100 transition-colors hover:border-ink-200"
              >
                {/* Header — always visible */}
                <button
                  onClick={() => setExpanded(isOpen ? null : r.date)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="space-y-1">
                    <time className="font-serif text-sm font-medium text-ink-800">
                      {formatDate(r.date)}
                    </time>
                    <div className="flex gap-3 text-xs text-ink-400">
                      {r.sleep_hours != null && <span>睡 {r.sleep_hours}h</span>}
                      {r.hrv != null && <span>HRV {r.hrv}ms</span>}
                      {r.rhr != null && <span>HR {r.rhr}bpm</span>}
                    </div>
                  </div>
                  <span className="text-ink-400 text-xs">
                    {isOpen ? "收起" : "展开"}
                  </span>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-ink-100 p-4">
                    <div
                      className="space-y-3 font-serif text-sm leading-relaxed text-ink-800"
                      dangerouslySetInnerHTML={{
                        __html: markdownToHtml(r.content),
                      }}
                    />
                    <p className="mt-4 text-xs text-ink-400">
                      {r.model} ·{" "}
                      {new Date(r.generated_at).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      <div className="ink-divider" />

      <footer className="flex items-center justify-center gap-6 text-xs text-ink-400">
        <Link
          href="/morning"
          className="underline-offset-2 hover:text-ink-600 hover:underline"
        >
          今晨报告
        </Link>
        <span className="text-ink-200">·</span>
        <Link
          href="/sleep"
          className="underline-offset-2 hover:text-ink-600 hover:underline"
        >
          睡前记录
        </Link>
        <span className="text-ink-200">·</span>
        <Link
          href="/"
          className="underline-offset-2 hover:text-ink-600 hover:underline"
        >
          首页
        </Link>
      </footer>
    </div>
  );
}

// ── Trend Card ──

function TrendCard({
  label,
  unit,
  values,
  higherIsBetter,
}: {
  label: string;
  unit: string;
  values: number[];
  higherIsBetter: boolean;
}) {
  if (values.length === 0) return null;

  const latest = values[0];
  const prev = values.length > 1 ? values[1] : null;
  const diff = prev != null ? latest - prev : null;
  const improving =
    diff != null ? (higherIsBetter ? diff > 0 : diff < 0) : null;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-ink-400">{label}</span>
      <span className="font-serif text-lg font-medium text-ink-900">
        {latest}
        <span className="text-xs text-ink-400 ml-0.5">{unit}</span>
      </span>
      {diff != null && (
        <span
          className={`text-xs ${
            improving
              ? "text-emerald-600"
              : diff === 0
              ? "text-ink-400"
              : "text-amber-600"
          }`}
        >
          {improving ? "↑" : diff === 0 ? "→" : "↓"}{" "}
          {Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 1)}
          {improving ? " 变好" : diff === 0 ? " 持平" : " 注意"}
        </span>
      )}
    </div>
  );
}

// ── Helpers ──

function formatDate(d: string): string {
  try {
    const date = new Date(d + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return `今天 · ${d}`;
    if (diffDays === 1) return `昨天 · ${d}`;
    return d;
  } catch {
    return d;
  }
}

function markdownToHtml(md: string): string {
  md = md
    .replace(/^```(?:json|markdown)?\s*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();
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
