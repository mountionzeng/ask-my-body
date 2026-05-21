"use client";

import { useState } from "react";
import Link from "next/link";
import ShichenBadge from "@/components/ShichenBadge";
import { NightBranchDecoration, WashBlob, BottomNav } from "@/components/decorations";

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
        headers: { "Content-Type": "application/json", "x-shortcut-secret": secret },
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
    <div
      className="relative min-h-[calc(100vh-56px)]"
      style={{ background: "#ece5d8" }}
    >
      {/* Decorations */}
      <NightBranchDecoration className="left-[-20px] top-[-10px] h-[120px] w-[130px]" />
      <WashBlob color="deep-pink" className="bottom-[-60px] right-[-60px] h-56 w-72" />

      {/* Stars */}
      <div className="pointer-events-none absolute right-10 top-10">
        <div className="absolute left-5 top-2.5 h-1 w-1 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,245,220,0.9), transparent 60%)" }} />
        <div className="absolute left-12 top-7 h-[3px] w-[3px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,245,220,0.9), transparent 60%)" }} />
        <div className="absolute left-16 top-1 h-0.5 w-0.5 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,245,220,0.9), transparent 60%)" }} />
        <div className="absolute left-2.5 top-11 h-0.5 w-0.5 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,245,220,0.9), transparent 60%)" }} />
      </div>

      {/* Night background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 100% 0%, rgba(180,100,110,0.25), transparent 45%), radial-gradient(ellipse at 0% 100%, rgba(120,90,100,0.20), transparent 45%)",
        }}
      />

      <div className="relative z-10">
        <p className="font-display text-[11px] tracking-super" style={{ color: "#7a6e64" }}>ASK MY BODY</p>
        <h1 className="mt-3.5 font-kai text-[40px] font-light leading-[1.1] tracking-widest text-ink-800">
          睡 前<br />记 录
        </h1>
        <p className="mt-3.5 font-kai text-[14px] font-light leading-relaxed" style={{ color: "#5a4e44" }}>
          睡前写几句，<span style={{ color: "#b85060" }}>守夜分析师</span>今晚读。
        </p>

        <div className="mt-6">
          <ShichenBadge variant="night" />
        </div>

        <div className="ink-divider" style={{ background: "linear-gradient(to right, transparent, rgba(42,37,32,0.10) 15%, rgba(42,37,32,0.35) 50%, rgba(42,37,32,0.10) 85%, transparent)" }} />

        {status === "done" ? (
          <section className="space-y-6 text-center">
            <p className="text-4xl">🌙</p>
            <p className="text-[14px] leading-relaxed text-ink-700">
              记下来了。<br />守夜分析师今晚会读的。
            </p>
            <p className="text-[13px]" style={{ color: "#5a4e44" }}>
              明天起床，来看今晨报告。
            </p>
            <Link
              href="/morning"
              className="inline-block border-b border-dotted pb-px text-[13px]"
              style={{ borderColor: "rgba(138,128,120,0.5)", color: "#5a4e44" }}
            >
              去晨起求诸己 →
            </Link>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-[13.5px] leading-loose" style={{ color: "#3a3028" }}>
              今天身体感觉如何？<br />有什么想留给<span style={{ color: "#b85060" }}>守夜分析师</span>的？
            </p>

            <div>
              <div className="field-label mb-3 flex items-center text-[12px] font-medium tracking-super" style={{ color: "#3a3028" }}>
                留 言
                <span className="ml-auto font-display text-[11px] tracking-wider" style={{ color: "#8a7e74" }}>
                  {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, "0")}
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder={"今天有点累，脖子酸。\n睡前有点焦虑，明天要开大会……\n\n想到什么就写什么，不用工整。"}
                className="w-full resize-none rounded-[3px] border px-4 py-4 text-[13.5px] leading-loose text-ink-800 outline-none placeholder:leading-loose"
                style={{
                  borderColor: "rgba(120,108,98,0.3)",
                  background: "rgba(248,242,232,0.55)",
                }}
              />
            </div>

            <div className="flex items-center gap-2 text-[11px]" style={{ color: "#7a6e64" }}>
              <div className="h-1 w-1 flex-shrink-0 rounded-full" style={{ background: "radial-gradient(circle, #b85060, transparent 70%)" }} />
              <span>可选 · Apple Watch 数据由 iOS 快捷指令自动同步</span>
            </div>

            {errorMsg && <p className="text-[13px] text-red-600">{errorMsg}</p>}

            <div className="flex items-center gap-3.5">
              <div className="flex-1 text-[11.5px] leading-relaxed" style={{ color: "#7a6e64" }}>
                <strong className="font-medium" style={{ color: "#4a4038" }}>守夜分析师</strong>会在你入睡后<br />翻看你的留言与身体数据。
              </div>
              <button
                type="submit"
                disabled={status === "loading" || !notes.trim()}
                className="btn-glow flex-shrink-0 rounded-[3px] border px-5 py-3.5 text-[14px] tracking-super text-ink-800 disabled:opacity-40"
                style={{
                  borderColor: "rgba(42,37,32,0.6)",
                  background: "rgba(248,242,232,0.5)",
                  textIndent: "0.4em",
                }}
              >
                {status === "loading" ? "记录中…" : "记 下 来"}
              </button>
            </div>
          </form>
        )}
      </div>

      <BottomNav active="sleep" />
    </div>
  );
}
