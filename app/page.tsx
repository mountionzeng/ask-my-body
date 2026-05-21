import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16 py-12">
      <header className="space-y-6 text-center">
        <p className="text-xs uppercase tracking-widest text-ink-400">
          Ask My Body
        </p>
        <h1 className="font-serif text-5xl font-light leading-tight text-ink-900">
          问身
        </h1>
        <p className="font-serif text-base text-ink-600">
          一个人就是一座庙。
        </p>
      </header>

      <div className="ink-divider" />

      <section className="space-y-6 text-center">
        <p className="font-serif text-base leading-relaxed text-ink-800">
          睡醒第一件事——
          <br />
          问问你的身体昨晚过得怎么样。
        </p>

        <Link
          href="/morning"
          className="inline-flex items-center justify-center rounded-none border border-ink-800 px-8 py-3 font-serif text-sm tracking-widest text-ink-900 transition hover:bg-ink-800 hover:text-ink-50"
        >
          晨起问身
        </Link>

        <p className="pt-6 text-xs text-ink-400">
          它不替你住进庙里 — 它只是替你守夜，让你回家的时候，灯还亮着。
        </p>

        <Link
          href="/checkin"
          className="inline-flex items-center justify-center rounded-none border border-ink-400 px-6 py-2 font-serif text-xs tracking-widest text-ink-600 transition hover:border-ink-800 hover:text-ink-900"
        >
          随时问身
        </Link>

        <div className="flex items-center justify-center gap-6 pt-2">
          <Link href="/sleep" className="text-xs text-ink-400 underline-offset-4 hover:text-ink-600 hover:underline">
            睡前记录
          </Link>
          <span className="text-ink-200">·</span>
          <Link href="/journal" className="text-xs text-ink-400 underline-offset-4 hover:text-ink-600 hover:underline">
            身体日志
          </Link>
        </div>
      </section>

      <div className="ink-divider" />

      <footer className="text-center text-xs text-ink-400">
        非医疗产品 · 不诊断疾病 · 自愿提交健康数据
      </footer>
    </div>
  );
}
