import Link from "next/link";
import { BambooDecoration, WashBlob, SealStamp, BottomNav } from "@/components/decorations";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-56px)] flex-col">
      {/* Decorations */}
      <BambooDecoration className="right-[-10px] top-7 h-40 w-28" />
      <WashBlob color="pink" className="bottom-[-40px] left-[-60px] h-56 w-56" />

      {/* Background washes */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 15% 110%, rgba(232,160,168,0.18), transparent 45%), radial-gradient(ellipse at 90% 8%, rgba(168,196,160,0.14), transparent 40%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        <p className="font-display text-[11px] tracking-super text-ink-400">ASK MY BODY</p>
        <h1 className="mt-3.5 font-kai text-[56px] font-light leading-[1.05] tracking-wider text-ink-800">
          求<br />诸己
        </h1>
        <p className="mt-4 font-kai text-[14px] font-light leading-relaxed tracking-wide text-ink-500">
          身体会知道答案。<br />静下来，听她说。
        </p>

        {/* Season chip */}
        <div className="mt-5 flex items-center gap-2 text-[11px] tracking-super text-ink-400">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "radial-gradient(circle at 30% 30%, #e8a0a8, #b86068)" }}
          />
          <span>小满 · 夏之始</span>
        </div>

        <div className="ink-divider" />

        <div className="space-y-3.5">
          <Link
            href="/morning"
            className="btn-glow block w-full rounded-[3px] border py-4 text-center text-[15px] tracking-super text-ink-800"
            style={{
              borderColor: "rgba(42,37,32,0.55)",
              background: "rgba(250,248,243,0.4)",
              textIndent: "0.32em",
            }}
          >
            晨 起 求 诸 己
          </Link>
          <Link
            href="/checkin"
            className="block w-full rounded-[3px] border py-4 text-center text-[15px] tracking-super"
            style={{
              borderColor: "rgba(232,160,168,0.5)",
              background: "linear-gradient(180deg, #f5dde0 0%, #f0c4c8 100%)",
              color: "#6b3a40",
              textIndent: "0.32em",
            }}
          >
            随 时 求 诸 己
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3.5 text-[12px] tracking-wider text-ink-400">
          <Link
            href="/sleep"
            className="border-b border-dotted border-ink-300/40 pb-0.5 text-ink-500 hover:text-ink-800"
          >
            睡前记录
          </Link>
          <span className="text-ink-300">·</span>
          <Link
            href="/journal"
            className="border-b border-dotted border-ink-300/40 pb-0.5 text-ink-500 hover:text-ink-800"
          >
            身体日志
          </Link>
        </div>

        {/* Seal stamp */}
        <SealStamp className="absolute bottom-24 right-0" />

        {/* Footer */}
        <div className="mt-auto pt-9 text-center text-[10px] leading-loose tracking-widest text-ink-400">
          非医疗产品 <span className="text-ink-300 mx-2">·</span> 不诊断疾病<br />
          自愿提交健康数据
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
