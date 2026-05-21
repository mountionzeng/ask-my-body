"use client";

import { useState } from "react";
import Link from "next/link";
import ShichenBadge from "@/components/ShichenBadge";

type Status = "idle" | "loading" | "done" | "error";

export default function SleepPage() {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const secret = process.env.NEXT_PUBLIC_SHORTCUT_SECRET ?? "";
      const res = await fetch("/api/sleep-input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-shortcut-secret": secret,
        },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "提交失败");
      setStatus("done");
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  return (
    <div className="space-y-10 py-12">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-400">
          Ask My Body
        </p>
        <h1 className="font-serif text-4xl font-light text-ink-900">睡前问身</h1>
        <p className="font-serif text-sm text-ink-600">
          睡前写几句，守夜分析师今晚读。
        </p>
      </header>

      <div className="flex justify-center">
        <ShichenBadge />
      </div>

      <div className="ink-divider" />

      {status === "done" ? (
        <section className="space-y-6 text-center">
          <div className="text-4xl">🌙</div>
          <p className="font-serif text-base text-ink-800">
            记下来了。
            <br />
            守夜分析师今晚会读的。
          </p>
          <p className="font-serif text-sm text-ink-600">
            明天起床，来看今晨报告。
          </p>
          <Link
            href="/morning"
            className="inline-block font-serif text-sm text-ink-600 underline underline-offset-4"
          >
            去晨起问身 →
          </Link>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-serif text-xs text-ink-600">
              今天身体感觉如何？有什么想留给守夜分析师的？
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="今天有点累，脖子酸。睡前有点焦虑，明天要开大会…"
              className="w-full resize-none border border-ink-200 bg-ink-50 p-4 font-serif text-sm text-ink-900 placeholder:text-ink-400 focus:border-ink-600 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <p className="font-serif text-sm text-red-600">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="font-serif text-xs text-ink-400">
              可选 · Apple Watch 数据由 iOS 快捷指令自动同步
            </p>
            <button
              type="submit"
              disabled={status === "loading" || !notes.trim()}
              className="inline-flex items-center justify-center rounded-none border border-ink-800 px-6 py-2 font-serif text-sm tracking-widest text-ink-900 transition hover:bg-ink-800 hover:text-ink-50 disabled:opacity-40"
            >
              {status === "loading" ? "记录中…" : "记下来"}
            </button>
          </div>
        </form>
      )}

      <div className="ink-divider" />

      <footer className="flex items-center justify-center gap-6 text-xs text-ink-400">
        <Link href="/morning" className="underline-offset-2 hover:text-ink-600 hover:underline">
          晨起报告
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
