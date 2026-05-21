"use client";

import { useEffect, useState } from "react";

interface ShichenInfo {
  name: string;
  organ: string;
  quality: string;
  emoji: string;
  hours: [number, number];
  morningAdvice?: string;
}

export default function ShichenBadge({ variant = "day" }: { variant?: "day" | "night" }) {
  const [info, setInfo] = useState<ShichenInfo | null>(null);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    setTimeStr(`${h}:${m.toString().padStart(2, "0")}`);
    import("@/lib/shichen").then(({ getShichen }) => {
      const s = getShichen(h);
      setInfo({
        name: s.name,
        organ: s.organ,
        quality: s.quality,
        emoji: s.emoji,
        hours: s.hours,
        morningAdvice: s.morningAdvice,
      });
    });
  }, []);

  if (!info) return null;

  const isNight = variant === "night";

  return (
    <div
      className="flex items-center gap-3.5 rounded px-4 py-3"
      style={{
        background: isNight
          ? "linear-gradient(135deg, rgba(42,37,32,0.06), rgba(232,222,206,0.4))"
          : "linear-gradient(135deg, rgba(245,221,224,0.4), rgba(250,248,243,0.2))",
        border: isNight
          ? "1px solid rgba(120,108,98,0.25)"
          : "1px solid rgba(232,160,168,0.25)",
      }}
    >
      {/* Circle orb / moon */}
      {isNight ? (
        <div
          className="relative h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #fdf6e3 0%, #e8dfc8 50%, #b8a890 100%)",
            boxShadow: "inset -8px -6px 10px rgba(60,50,40,0.25), 0 0 18px rgba(253,246,227,0.4)",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: 8, left: 22, width: 6, height: 6,
              background: "rgba(140,120,100,0.4)",
              boxShadow: "6px 8px 0 -2px rgba(140,120,100,0.3), -4px 14px 0 -1px rgba(140,120,100,0.35)",
            }}
          />
        </div>
      ) : (
        <div
          className="relative h-12 w-12 flex-shrink-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #fff5f6 0%, #f5dde0 40%, #e8a0a8 100%)",
            boxShadow: "inset -4px -4px 8px rgba(180,80,90,0.18)",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: 6, right: 8, width: 14, height: 14,
              background: "rgba(250,248,243,0.65)",
              filter: "blur(2px)",
            }}
          />
        </div>
      )}

      <div className="flex-1">
        <div className="text-[13px] font-medium tracking-widest text-ink-800">
          {info.name} · {info.organ}
        </div>
        <div className="mt-0.5 text-[10.5px] tracking-wide text-ink-400">
          {info.hours[0]}至{info.hours[1]}时 · {info.quality}
        </div>
      </div>

      <div className="font-display text-[13px] tracking-wider text-ink-400">
        {timeStr}
      </div>
    </div>
  );
}
