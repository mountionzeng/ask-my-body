import Link from "next/link";
import { getRecentMorningReports, getRecentSleepEntries } from "@/lib/kv";

// Force dynamic — reads KV on every request
export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const [reports, sleepEntries] = await Promise.all([
    getRecentMorningReports(7),
    getRecentSleepEntries(7),
  ]);

  return (
    <div className="space-y-10 py-12">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-400">Ask My Body</p>
        <h1 className="font-serif text-4xl font-light text-ink-900">身体日志</h1>
        <p className="font-serif text-sm text-ink-600">近 7 天的问身记录</p>
      </header>

      <div className="ink-divider" />

      {reports.length === 0 && sleepEntries.length === 0 ? (
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
        <section className="space-y-8">
          {reports.map((r) => {
            const sleep = sleepEntries.find((s) => s.date === r.date);
            return (
              <article key={r.date} className="space-y-3 border-l-2 border-ink-100 pl-4">
                <header className="flex items-baseline gap-3">
                  <time className="font-serif text-sm font-medium text-ink-800">
                    {r.date}
                  </time>
                  {sleep && (
                    <span className="text-xs text-ink-400">
                      {sleep.sleep_hours ? `睡 ${sleep.sleep_hours}h` : ""}
                      {sleep.hrv ? ` · HRV ${sleep.hrv}ms` : ""}
                      {sleep.rhr ? ` · HR ${sleep.rhr}bpm` : ""}
                    </span>
                  )}
                </header>
                <p className="font-serif text-xs leading-relaxed text-ink-600 line-clamp-4">
                  {r.content.replace(/#+\s/g, "").replace(/\*+/g, "").slice(0, 200)}…
                </p>
              </article>
            );
          })}
        </section>
      )}

      <div className="ink-divider" />

      <footer className="flex items-center justify-center gap-6 text-xs text-ink-400">
        <Link href="/morning" className="underline-offset-2 hover:text-ink-600 hover:underline">
          今晨报告
        </Link>
        <span className="text-ink-200">·</span>
        <Link href="/sleep" className="underline-offset-2 hover:text-ink-600 hover:underline">
          睡前记录
        </Link>
        <span className="text-ink-200">·</span>
        <Link href="/" className="underline-offset-2 hover:text-ink-600 hover:underline">
          首页
        </Link>
      </footer>
    </div>
  );
}
