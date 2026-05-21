"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import ShichenBadge from "@/components/ShichenBadge";
import { fetchTodayReport, generateMorningReport } from "@/app/actions";

interface MorningReport {
  date: string;
  content: string;
  model: string;
  generated_at: string;
}

export default function MorningPage() {
  const [report, setReport] = useState<MorningReport | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Load cached report on mount
  useEffect(() => {
    fetchTodayReport().then((r) => {
      if (r) setReport(r);
    });
  }, []);

  function handleGenerate(force = false) {
    setError("");
    startTransition(async () => {
      try {
        const r = await generateMorningReport(force);
        setReport(r);
      } catch (e) {
        setError(String(e));
      }
    });
  }

  return (
    <div className="space-y-10 py-12">
      {/* Header */}
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-400">
          Ask My Body
        </p>
        <h1 className="font-serif text-4xl font-light text-ink-900">晨起问身</h1>
        <p className="font-serif text-sm text-ink-600">
          醒来第一件事，先问问你的身体。
        </p>
      </header>

      {/* 时辰 badge */}
      <div className="flex justify-center">
        <ShichenBadge />
      </div>

      <div className="ink-divider" />

      {/* Report / Generate area */}
      {report ? (
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
              onClick={() => handleGenerate(true)}
              disabled={isPending}
              className="underline-offset-2 hover:text-ink-600 hover:underline disabled:opacity-40"
            >
              {isPending ? "重新生成中…" : "重新生成"}
            </button>
          </div>
        </article>
      ) : (
        <section className="space-y-6 text-center">
          {error && (
            <p className="font-serif text-sm text-red-600">{error}</p>
          )}

          {isPending ? (
            <div className="space-y-4 py-8">
              <div className="mx-auto flex gap-1 justify-center">
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300" />
              </div>
              <p className="font-serif text-sm text-ink-400">
                晨间引导师正在综合昨夜的守夜笔记…
              </p>
              <p className="text-xs text-ink-400">约需 15-30 秒</p>
            </div>
          ) : (
            <div className="space-y-5 py-4">
              <p className="font-serif text-sm leading-relaxed text-ink-600">
                今晨的问身报告还没有生成。
                <br />
                点击下方，让晨间引导师为你整理昨晚。
              </p>
              <button
                onClick={() => handleGenerate(false)}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-none border border-ink-800 px-8 py-3 font-serif text-sm tracking-widest text-ink-900 transition hover:bg-ink-800 hover:text-ink-50 disabled:opacity-40"
              >
                生成今晨报告
              </button>
              <p className="text-xs text-ink-400">
                由 Claude Opus 4.7 生成 · 综合 Apple Watch 数据 + 守夜笔记
              </p>
            </div>
          )}
        </section>
      )}

      <div className="ink-divider" />

      <footer className="flex items-center justify-center gap-6 text-xs text-ink-400">
        <Link
          href="/sleep"
          className="underline-offset-2 hover:text-ink-600 hover:underline"
        >
          睡前记录
        </Link>
        <span className="text-ink-200">·</span>
        <Link
          href="/journal"
          className="underline-offset-2 hover:text-ink-600 hover:underline"
        >
          身体日志
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

/** Minimal Markdown → HTML renderer (no deps) */
function markdownToHtml(md: string): string {
  return (
    md
      // HR
      .replace(/^---$/gm, '<hr class="border-ink-100 my-4" />')
      // H2
      .replace(
        /^## (.+)$/gm,
        "<h2 class='font-serif text-base font-medium mt-6 mb-2 text-ink-900'>$1</h2>"
      )
      // H3
      .replace(
        /^### (.+)$/gm,
        "<h3 class='font-serif text-sm font-medium mt-4 mb-1 text-ink-800'>$1</h3>"
      )
      // blockquote
      .replace(
        /^> (.+)$/gm,
        "<blockquote class='border-l-2 border-ink-200 pl-4 italic text-ink-600 my-2'>$1</blockquote>"
      )
      // list items
      .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-ink-700'>$1</li>")
      // bold
      .replace(/\*\*(.+?)\*\*/g, "<strong class='text-ink-900'>$1</strong>")
      // italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // paragraph breaks
      .replace(/\n\n/g, "</p><p class='mb-3 text-ink-700'>")
      // line breaks
      .replace(/\n/g, "<br />")
  );
}
